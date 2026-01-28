import { useEffect, useMemo, useState } from "react";
import { getProducts, getOrders } from "../../data/store";

export default function Dashboard() {
  const [products, setProducts] = useState(() => getProducts());
  const [orders, setOrders] = useState(() => getOrders());

  // Refresh numbers when localStorage changes (another tab or after edits)
  useEffect(() => {
    const onStorage = () => {
      setProducts(getProducts());
      setOrders(getOrders());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Also refresh when you come back to tab (common in dev)
  useEffect(() => {
    const onFocus = () => {
      setProducts(getProducts());
      setOrders(getOrders());
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === "active").length;
    const lowStock = products.filter((p) => Number(p.stock) <= 5).length;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    const revenue = orders
      .filter((o) => ["paid", "shipped", "completed"].includes(o.status))
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    return {
      totalProducts,
      activeProducts,
      lowStock,
      totalOrders,
      pendingOrders,
      revenue,
    };
  }, [products, orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Live numbers from localStorage (Admin changes update here).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Orders" value={stats.totalOrders} sub={`Pending: ${stats.pendingOrders}`} />
        <Card title="Revenue (Paid/Shipped/Completed)" value={`$${stats.revenue.toFixed(2)}`} sub="Excludes pending/cancelled" />
        <Card title="Products" value={stats.totalProducts} sub={`Active: ${stats.activeProducts} • Low stock: ${stats.lowStock}`} />
      </div>

      <div className="bg-white rounded-2xl shadow border p-4">
        <div className="font-semibold mb-3">Recent Orders</div>

        {recentOrders.length === 0 ? (
          <div className="text-gray-500 text-sm">No orders found.</div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between border rounded-xl p-3">
                <div>
                  <div className="font-semibold">{o.id}</div>
                  <div className="text-xs text-gray-500">
                    {o.customer} • {o.date} • {o.payment}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${Number(o.total).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, sub }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}
