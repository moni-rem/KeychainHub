import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "../layouts/Adminlayout";
import StatCard from "../components/StatCard";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar
} from "recharts";

const API = "http://localhost:5000";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0, totalOrders: 0 });
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", image: "" });

  // Analytics
  const [salesTimeline, setSalesTimeline] = useState([]); // [{day, orders, revenue}]
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const fetchStats = async () => {
    const res = await axios.get(`${API}/api/admin/stats`);
    setStats(res.data);
  };

  const fetchProducts = async () => {
    const res = await axios.get(`${API}/api/products`);
    setProducts(res.data);
  };

  const fetchAnalytics = async () => {
    const res = await axios.get(`${API}/api/admin/analytics`);
    setSalesTimeline(res.data.salesTimeline || []);
    setRecentOrders(res.data.recentOrders || []);
    setTopProducts(res.data.topProducts || []);
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchStats(), fetchProducts(), fetchAnalytics()]);
    };

    load();

    const interval = setInterval(() => {
      load();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // KPI helpers
  const revenueToday = useMemo(() => {
    // if backend returns last 7 days, we can compute today's revenue
    const today = new Date().toISOString().slice(0, 10);
    const row = salesTimeline.find((r) => String(r.day).slice(0, 10) === today);
    return row ? Number(row.revenue || 0) : 0;
  }, [salesTimeline]);

  const ordersToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const row = salesTimeline.find((r) => String(r.day).slice(0, 10) === today);
    return row ? Number(row.orders || 0) : 0;
  }, [salesTimeline]);

  // Add product
  const handleAddProduct = async () => {
    const { name, price, image } = newProduct;
    if (!name || !price || !image) return;

    try {
      await axios.post(`${API}/api/products`, { name, price, image });
      setNewProduct({ name: "", price: "", image: "" });
      await Promise.all([fetchProducts(), fetchStats()]);
    } catch (err) {
      console.error("Failed to add product:", err);
      alert("Add product failed. Check backend console.");
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
          <div className="text-xs text-gray-400 mt-1">From orders table</div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border">
          <div className="text-gray-500 text-sm">Orders (Today)</div>
          <div className="text-3xl font-bold mt-2">{ordersToday}</div>
          <div className="text-xs text-gray-400 mt-1">Last 7 days timeline</div>
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
                        <span className="px-2 py-1 rounded bg-gray-100">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2">
                        {new Date(o.created_at).toLocaleString()}
                      </td>
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
            <p className="text-gray-500">
              No top products yet (needs <span className="font-mono">order_items</span>).
            </p>
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
          <button
            onClick={handleAddProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded py-2"
          >
            Add Product
          </button>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((p) => (
            <li key={p.id} className="border rounded-xl p-3 flex items-center gap-3">
              <img
                src={p.image}
                alt={p.name}
                className="w-14 h-14 rounded-lg object-cover border"
                onError={(e) => (e.currentTarget.style.display = "none")}
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
