import { useEffect, useState } from "react";
import mockOrders from "../../data/mockOrders";
import { load, save } from "../../components/admin/storage";

const LS_KEY = "admin_orders_v1";

export default function Orders() {
  const [orders, setOrders] = useState(() => load(LS_KEY, mockOrders));
  const [selected, setSelected] = useState(null);

  useEffect(() => save(LS_KEY, orders), [orders]);

  function setStatus(id, status) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">
                  <div className="font-semibold">{o.id}</div>
                  <div className="text-xs text-gray-500">{o.date}</div>
                </td>
                <td className="p-3">{o.customer}</td>
                <td className="p-3">${Number(o.total).toFixed(2)}</td>
                <td className="p-3">{o.payment}</td>
                <td className="p-3">
                  <select
                    className="border rounded-lg px-2 py-1"
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="shipped">shipped</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setSelected(o)}
                    className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Order {selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-900">
                ✕
              </button>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <div><b>Customer:</b> {selected.customer}</div>
              <div><b>Date:</b> {selected.date}</div>
              <div><b>Payment:</b> {selected.payment}</div>
              <div><b>Status:</b> {selected.status}</div>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 p-3 text-sm font-semibold">Items</div>
              <div className="p-3 space-y-2">
                {selected.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>{it.name} × {it.qty}</div>
                    <div>${(it.price * it.qty).toFixed(2)}</div>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <div>Total</div>
                  <div>${Number(selected.total).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg border">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
