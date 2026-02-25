import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaCheckCircle,
  FaCircle,
  FaQrcode,
  FaSpinner,
  FaTruck,
} from "react-icons/fa";
import productService from "../../services/productService";
import khqrService from "../../services/khqrService";
import { useCart } from "../../context/CartContext";
import { useUserAuth } from "../../context/UserAuthContext";

const DELIVERY_STEPS = [
  { key: "confirmed", label: "Order Confirmed", hint: "Payment verified" },
  { key: "packed", label: "Packed", hint: "Prepared for shipping" },
  { key: "shipping", label: "In Transit", hint: "On the way to your city" },
  { key: "delivered", label: "Delivered", hint: "Package delivered" },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useUserAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [paymentError, setPaymentError] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [khqrInfo, setKhqrInfo] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [deliveryStep, setDeliveryStep] = useState(-1);
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const checkingPaymentRef = useRef(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch main product
        const response = await productService.getProduct(id);
        console.log("Product detail response:", response);

        if (response.success && response.data) {
          const productData = {
            ...response.data,
            imageUrl: response.data.image_url || "/no-image.png",
            stock: response.data.stock_quantity || 0,
          };
          setProduct(productData);

          // Fetch related products (same category)
          if (productData.category) {
            const relatedResponse = await productService.getProductsByCategory(
              productData.category,
              { limit: 3 },
            );

            if (relatedResponse.success) {
              const related = (relatedResponse.data || [])
                .filter((p) => p.id !== productData.id)
                .slice(0, 3)
                .map((p) => ({
                  ...p,
                  imageUrl: p.image_url || "/no-image.png",
                }));
              setRelatedProducts(related);
            }
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(
          err?.response?.status === 404
            ? "Product not found"
            : err?.response?.data?.message || "Failed to load product",
        );
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addToCart({ ...product, quantity });
      // Show success message or update cart count
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    if (!showPaymentModal) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showPaymentModal]);

  useEffect(() => {
    if (!showPaymentModal || !khqrInfo?.qrExpiration) {
      setTimeLeftSec(0);
      return undefined;
    }

    const expiryTime = new Date(khqrInfo.qrExpiration).getTime();

    const tick = () => {
      const diff = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
      setTimeLeftSec(diff);

      if (diff <= 0) {
        setPaymentStatus("expired");
        setPaymentError("QR code expired. Please generate a new one.");
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [showPaymentModal, khqrInfo]);

  useEffect(() => {
    if (deliveryStep < 0 || deliveryStep >= DELIVERY_STEPS.length - 1) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setDeliveryStep((prev) => prev + 1);
    }, 3500);

    return () => clearTimeout(timer);
  }, [deliveryStep]);

  const getApiErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0]?.message || fallback;
    }
    return data?.message || data?.error || err?.message || fallback;
  };

  const getPaymentFriendlyMessage = (message) => {
    const normalized = String(message || "").toLowerCase();

    if (
      normalized.includes("live payment verification is unavailable") ||
      normalized.includes("bakong api error") ||
      normalized.includes("invalid token") ||
      normalized.includes("forbidden") ||
      normalized.includes("unauthorized")
    ) {
      return "Payment verification is temporarily unavailable. Please try again.";
    }

    if (
      normalized.includes("payment not found") ||
      normalized.includes("not found in bakong system")
    ) {
      return "Waiting for payment confirmation...";
    }

    if (normalized.includes("expired")) {
      return "QR code expired. Please generate a new one.";
    }

    return "Unable to verify payment right now. Please try again.";
  };

  const finishPayment = useCallback((apiData) => {
    const order = {
      id: khqrInfo?.id || apiData?.id || `ORD-${Date.now().toString(36).toUpperCase()}`,
      reference: khqrInfo?.qrMd5 || paymentRef,
      productId: product.id,
      productName: product.name,
      quantity,
      amount: Number(khqrInfo?.amount || product.price || 0),
      customerEmail: user?.email || "unknown",
      paidAt: apiData?.paid_at || new Date().toISOString(),
      bakongHash: apiData?.bakongHash || null,
    };

    localStorage.setItem("paychain_last_order", JSON.stringify(order));

    setPaymentOrder(order);
    setShowPaymentModal(false);
    setPaymentStatus("success");
    setShowSuccessPopup(true);
    setDeliveryStep(0);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 4500);
  }, [khqrInfo, paymentRef, product, quantity, user]);

  const checkKhqrPayment = useCallback(async (silent = false) => {
    if (
      checkingPaymentRef.current ||
      !isAuthenticated ||
      !user?.id ||
      !khqrInfo?.qrMd5 ||
      paymentStatus === "success"
    ) {
      return;
    }

    checkingPaymentRef.current = true;
    if (!silent) {
      setPaymentStatus("checking");
      setPaymentError("");
    }

    try {
      const res = await khqrService.checkPayment(null, khqrInfo.qrMd5);

      if (res?.success) {
        finishPayment(res?.data || {});
        return;
      }

      if (!silent) {
        setPaymentStatus("pending");
      }
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Unable to verify payment right now.",
      );
      const normalized = message.toLowerCase();
      const friendlyMessage = getPaymentFriendlyMessage(message);

      if (
        normalized.includes("payment not found") ||
        normalized.includes("not found in bakong system")
      ) {
        if (!silent) setPaymentStatus("pending");
      } else if (
        normalized.includes("live payment verification is unavailable") ||
        normalized.includes("bakong api error") ||
        normalized.includes("invalid token") ||
        normalized.includes("forbidden") ||
        normalized.includes("unauthorized")
      ) {
        setPaymentStatus("error");
        setPaymentError(friendlyMessage);
      } else if (normalized.includes("expired")) {
        setPaymentStatus("expired");
        setPaymentError(friendlyMessage);
      } else {
        setPaymentStatus("error");
        setPaymentError(friendlyMessage);
      }
    } finally {
      checkingPaymentRef.current = false;
    }
  }, [isAuthenticated, user, khqrInfo, paymentStatus, finishPayment]);

  useEffect(() => {
    if (
      !showPaymentModal ||
      !isAuthenticated ||
      !user?.id ||
      !khqrInfo?.qrMd5 ||
      paymentStatus === "success" ||
      paymentStatus === "expired" ||
      paymentStatus === "generating"
    ) {
      return undefined;
    }

    const timer = setInterval(() => {
      checkKhqrPayment(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [
    showPaymentModal,
    isAuthenticated,
    user,
    khqrInfo,
    paymentStatus,
    checkKhqrPayment,
  ]);

  // Trigger a first automatic verification quickly after QR is generated.
  useEffect(() => {
    if (
      showPaymentModal &&
      isAuthenticated &&
      user?.id &&
      khqrInfo?.qrMd5 &&
      paymentStatus === "pending"
    ) {
      const timer = setTimeout(() => {
        checkKhqrPayment(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    showPaymentModal,
    isAuthenticated,
    user,
    khqrInfo,
    paymentStatus,
    checkKhqrPayment,
  ]);

  const handleOpenPayment = async () => {
    if (!product || product.stock <= 0) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!user?.id) {
      setPaymentError("User information missing. Please login again.");
      return;
    }

    setPaymentStatus("generating");
    setPaymentError("");
    setKhqrInfo(null);
    setPaymentRef("");
    setShowPaymentModal(true);

    try {
      const amount = Number((Number(product.price || 0) * quantity).toFixed(2));
      const res = await khqrService.generateKhqr(null, amount);

      if (!res?.success) {
        throw new Error(res?.message || "Failed to generate KHQR");
      }

      const data = res?.data || {};
      setKhqrInfo({
        id: data.id,
        qrCode: data.qr_code,
        qrMd5: data.qr_md5,
        amount: Number(data.amount || amount),
        currency: data.currency || "USD",
        qrExpiration: data.qr_expiration,
      });
      setPaymentRef(data.qr_md5 || `PC-${Date.now().toString(36).toUpperCase()}`);
      setPaymentStatus("pending");
      setPaymentError("");
    } catch (err) {
      setPaymentStatus("error");
      setPaymentError("Unable to generate QR right now. Please try again.");
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span className="ml-3 text-gray-600">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto mt-24 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error || "Product not found"}
        </h1>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span aria-hidden="true">←</span>
          Back to Shop
        </Link>
      </div>
    );
  }

  const isInStock = product.stock > 0;
  const stockStatus = isInStock
    ? product.stock > 20
      ? "In Stock"
      : "Low Stock"
    : "Out of Stock";
  const stockStatusColor = isInStock
    ? product.stock > 20
      ? "text-green-600"
      : "text-yellow-600"
    : "text-red-600";
  const paymentAmount = Number(product.price || 0) * quantity;
  const displayAmount = Number(khqrInfo?.amount || paymentAmount);
  const deliveryProgress =
    deliveryStep < 0
      ? 0
      : (deliveryStep / (DELIVERY_STEPS.length - 1)) * 100;
  const fallbackPayload = `PAYCHAIN|ref:${paymentRef}|product:${product.id}|qty:${quantity}|amount:${paymentAmount.toFixed(2)}`;
  const qrContent = khqrInfo?.qrCode || fallbackPayload;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrContent)}`;

  return (
    <div className="max-w-6xl mx-auto mt-24 px-4">
      {/* Back button */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <span aria-hidden="true">←</span>
        Back to Shop
      </Link>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-[500px] object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/no-image.png";
              }}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-blue-600">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className={`text-sm font-medium ${stockStatusColor}`}>
              {stockStatus}
            </span>
          </div>

          {/* Category tags */}
          {product.category && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {product.category}
              </span>
              {product.material && (
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm ml-2">
                  {product.material}
                </span>
              )}
            </div>
          )}

          <p className="text-gray-700 mb-6">
            {product.description || "No description available."}
          </p>

          {/* Additional details */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {product.color && (
              <div>
                <span className="text-sm text-gray-500">Color:</span>
                <span className="ml-2 font-medium">{product.color}</span>
              </div>
            )}
            {product.sku && (
              <div>
                <span className="text-sm text-gray-500">SKU:</span>
                <span className="ml-2 font-medium">{product.sku}</span>
              </div>
            )}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-700">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button
                onClick={increaseQuantity}
                disabled={!isInStock || quantity >= product.stock}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            {product.stock > 0 && (
              <span className="text-sm text-gray-500">
                {product.stock} available
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!isInStock || addingToCart}
              className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {addingToCart ? (
                <>
                  <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <span aria-hidden="true">🛒</span>
                  {isInStock ? "Add to Cart" : "Out of Stock"}
                </>
              )}
            </button>

            <button
              onClick={handleOpenPayment}
              disabled={!isInStock}
              className="w-full md:w-auto px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaQrcode className="h-5 w-5" />
              Pay with QR
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            PayChain checkout: scan QR, confirm payment, then track delivery in
            real-time.
          </div>

          {paymentOrder && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
              Payment successful for order <b>#{paymentOrder.id}</b> (
              {paymentOrder.quantity} item
              {paymentOrder.quantity > 1 ? "s" : ""}, $
              {paymentOrder.amount.toFixed(2)})
            </div>
          )}
        </div>
      </div>

      {paymentOrder && (
        <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Delivery Progress
              </h2>
              <p className="text-sm text-gray-500">
                Tracking for order #{paymentOrder.id}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
              <FaTruck className="h-4 w-4" />
              {DELIVERY_STEPS[Math.max(deliveryStep, 0)]?.label}
            </div>
          </div>

          <div className="relative mt-8">
            <div className="absolute top-4 left-0 h-1 w-full rounded-full bg-gray-200" />
            <div
              className="absolute top-4 left-0 h-1 rounded-full bg-blue-600 transition-all duration-700"
              style={{ width: `${deliveryProgress}%` }}
            />
            <div className="relative grid grid-cols-2 gap-4 md:grid-cols-4">
              {DELIVERY_STEPS.map((step, index) => {
                const active = index <= deliveryStep;
                return (
                  <div key={step.key} className="text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white">
                      {active ? (
                        <FaCheckCircle className="h-7 w-7 text-blue-600" />
                      ) : (
                        <FaCircle className="h-7 w-7 text-gray-300" />
                      )}
                    </div>
                    <p
                      className={`text-sm font-medium ${active ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {step.label}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{step.hint}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You might also like
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="border rounded-lg hover:shadow-lg overflow-hidden transition-shadow"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no-image.png";
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {p.name}
                  </h3>
                  <p className="text-blue-600 font-bold">
                    ${Number(p.price).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">
              PayChain QR Payment
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Scan with your banking app. Payment status checks automatically.
            </p>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              {paymentStatus === "generating" ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-center text-gray-600">
                    <FaSpinner className="mx-auto h-6 w-6 animate-spin" />
                    <p className="mt-2 text-sm">Generating KHQR...</p>
                  </div>
                </div>
              ) : (
                <div className="mx-auto w-fit rounded-lg border border-gray-200 p-3">
                  <img
                    src={qrImageUrl}
                    alt="PayChain QR Code"
                    className="h-56 w-56"
                  />
                </div>
              )}
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div>
                  Reference: <b>{paymentRef}</b>
                </div>
                <div>
                  Amount: <b>${displayAmount.toFixed(2)}</b>
                </div>
                <div>
                  Product: <b>{product.name}</b> x {quantity}
                </div>
                <div>
                  Status:{" "}
                  <b className="capitalize">
                    {paymentStatus === "pending" ? "waiting payment" : paymentStatus}
                  </b>
                </div>
                {paymentStatus === "pending" && (
                  <div className="text-emerald-700">
                    Auto-checking payment confirmation...
                  </div>
                )}
                {timeLeftSec > 0 && (
                  <div>
                    Expires in:{" "}
                    <b>
                      {Math.floor(timeLeftSec / 60)}:
                      {String(timeLeftSec % 60).padStart(2, "0")}
                    </b>
                  </div>
                )}
              </div>
            </div>

            {paymentError && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {paymentError}
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                disabled={paymentStatus === "checking" || paymentStatus === "generating"}
                className="rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (paymentStatus === "expired" || paymentStatus === "error") {
                    handleOpenPayment();
                    return;
                  }
                }}
                disabled={paymentStatus === "generating" || paymentStatus === "pending" || paymentStatus === "checking"}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {paymentStatus === "checking" || paymentStatus === "pending" ? (
                  <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    Auto Checking...
                  </>
                ) : paymentStatus === "expired" || paymentStatus === "error" ? (
                  "Generate New QR"
                ) : (
                  "Waiting..."
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <FaCheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h4 className="mt-3 text-xl font-bold text-gray-900">
              Payment Successful
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              Your PayChain payment was confirmed. Delivery tracking is now
              active.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
