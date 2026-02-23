import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../layouts/Adminlayout";
import api from "../api/axios"; // ✅ IMPORTANT: uses interceptor token
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const API = "http://localhost:5000"; // only for images

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
  });

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", image: "" });

  // Analytics
  const [salesTimeline, setSalesTimeline] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const fetchStats = async () => {
    const res = await api.get("/admin/dashboard"); // ✅ token included
    // your backend returns ApiResponse.success(..., dashboardData)
    // so data is likely res.data.data
    const data = res.data?.data ?? {};
    // adapt to your UI needs
    setStats({
      totalProducts: data?.overview?.totalProducts ?? 0,
      totalUsers: data?.overview?.totalUsers ?? 0,
      totalOrders: data?.overview?.totalOrders ?? 0,
    });
  };

  const fetchProducts = async () => {
    const res = await api.get("/products"); // ✅ token included
    const data = res.data?.data ?? {};
    // productService.getProducts usually returns { products, pagination }
    setProducts(data.products ?? []);
  };

  const fetchAnalytics = async () => {
    // Your backend requires startDate/endDate for analytics (you coded that)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const params = {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };

    const res = await api.get("/admin/analytics", { params }); // ✅ token included
    const data = res.data?.data ?? {};

    // Make it safe even if backend shape is different
    setSalesTimeline(data.salesTimeline ?? data.timeline ?? []);
    setRecentOrders(data.recentOrders ?? []);
    setTopProducts(data.topProducts ?? []);
  };

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        await Promise.all([fetchStats(), fetchProducts(), fetchAnalytics()]);
      } catch (err) {
        // If token missing/expired/admin false -> 401/403
        const msg = err.response?.data?.message || err.message;

        // optional: if unauthorized, go to login
        if (alive && (err.response?.status === 401 || err.response?.status === 403)) {
          // clear bad token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // you can navigate here if you want, but keep it simple:
          console.error("Admin auth error:", msg);
        } else {
          console.error("Dashboard load error:", msg);
        }
      }
    };

    load();
    const interval = setInterval(load, 5000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // KPI helpers
  const revenueToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const row = salesTimeline.find((r) => String(r.day).slice(0, 10) === today);
    return row ? Number(row.revenue || 0) : 0;
  }, [salesTimeline]);

  const ordersToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const row = salesTimeline.find((r) => String(r.day).slice(0, 10) === today);
    return row ? Number(row.orders || 0) : 0;
  }, [salesTimeline]);

  // Add product (public /api/products in your backend)
  const handleAddProduct = async () => {
    const { name, price, image } = newProduct;
    if (!name || !price || !image) return;

    try {
      await api.post("/products", { name, price, image }); // ✅ still uses baseURL /api
      setNewProduct({ name: "", price: "", image: "" });
      await Promise.all([fetchProducts(), fetchStats()]);
    } catch (err) {
      alert(err.response?.data?.message || "Add product failed");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-gray-500">Auto-updates every 5 seconds</p>
        </div>

        <div className="text-sm text-gray-500">
          API: <span className="font-mono">{API}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-5 border">
          <div className="text-gray-500 text-sm">Revenue (Today)</div>
          <div className="text-3xl font-bold mt-2">${revenueToday.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">From timeline</div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border">
          <div className="text-gray-500 text-sm">Orders (Today)</div>
          <div className="text-3xl font-bold mt-2">{ordersToday}</div>
          <div className="text-xs text-gray-400 mt-1">Last 7 days</div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border">
          <div className="text-gray-500 text-sm">Total Products</div>
          <div className="text-3xl font-bold mt-2">{stats.totalProducts}</div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border">
          <div className="text-gray-500 text-sm">Total Users</div>
          <div className="text-3xl font-bold mt-2">{stats.totalUsers}</div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border">
          <div className="text-gray-500 text-sm">Total Orders</div>
          <div className="text-3xl font-bold mt-2">{stats.totalOrders}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-6 border">
          <h3 className="text-xl font-bold mb-4">Orders (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border">
          <h3 className="text-xl font-bold mb-4">Revenue (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-6 border">
          <h3 className="text-xl font-bold mb-4">Recent Orders</h3>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2">Order</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-t">
                      <td className="py-2 font-medium">#{o.id}</td>
                      <td className="py-2">${Number(o.total || 0).toFixed(2)}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded bg-gray-100">{o.status}</span>
                      </td>
                      <td className="py-2">{o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border">
          <h3 className="text-xl font-bold mb-4">Top Products</h3>

          {topProducts.length === 0 ? (
            <p className="text-gray-500">No top products yet.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between border rounded-xl p-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-gray-600">{p.unitsSold} sold</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Product Add + List */}
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="text-xl font-bold mb-4">Products</h3>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={newProduct.image}
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
            className="border p-2 rounded"
          />
          <button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded py-2">
            Add Product
          </button>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((p) => (
            <li key={p.id} className="border rounded-xl p-3 flex items-center gap-3">
              <img
                src={p.images?.[0] ? `${API}${p.images[0]}` : "/no-image.png"}
                alt={p.name}
                className="w-14 h-14 rounded-lg object-cover border"
                onError={(e) => {
                  e.currentTarget.src = "/no-image.png";
                }}
              />

              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-gray-500 text-sm">${p.price}</div>
              </div>
              <span className="text-xs text-gray-400">ID: {p.id}</span>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}
