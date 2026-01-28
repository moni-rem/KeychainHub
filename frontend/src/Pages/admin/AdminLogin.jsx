import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setErr("");

    // DEMO login (replace later with real backend)
    if (email === "admin@keychainhub.com" && password === "123456") {
      localStorage.setItem("admin_token", "demo-token");
      navigate("/admin");
    } else {
      setErr("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
        <p className="text-gray-500 mb-6">Sign in to manage products & orders.</p>

        {err && <div className="mb-4 text-red-600 text-sm">{err}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@keychainhub.com"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
            />
          </div>

          <button className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
