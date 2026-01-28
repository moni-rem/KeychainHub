export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow">Total Orders: 0</div>
        <div className="bg-white p-4 rounded-2xl shadow">Revenue: $0</div>
        <div className="bg-white p-4 rounded-2xl shadow">Products: 0</div>
        <div className="bg-white p-4 rounded-2xl shadow">Low Stock: 0</div>
      </div>
    </div>
  );
}
