import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import { useUserAuth } from "../../context/UserAuthContext";
import api from "../../api/axios";

export default function UserRegister() {
  const navigate = useNavigate();
  const { login } = useUserAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getApiErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0]?.message || fallback;
    }
    return data?.message || data?.error || fallback;
  };

  const validate = () => {
    if (!name || !email || !password || !confirm) return "Please fill in all fields.";
    if (name.length < 2) return "Name must be at least 2 characters.";
    if (!email.includes("@")) return "Please enter a valid email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    try {
      setLoading(true);
      const payloadInput = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      // Register
      const registerRes = await api.post("/auth/register", payloadInput);
      const registerPayload =
        registerRes?.data?.user && registerRes?.data?.token
          ? registerRes.data
          : registerRes?.data || {};
      const registerToken = registerPayload?.token;
      const registerUser = registerPayload?.user;

      // Prefer token returned by register response for instant login.
      if (registerToken && registerUser) {
        login({ user: registerUser, token: registerToken });
        navigate("/", { replace: true });
        return;
      }

      // Fallback: login call if register response didn't contain auth payload.
      const resLogin = await api.post("/auth/login", {
        email: payloadInput.email,
        password,
      });

      const payload =
        resLogin?.data?.user && resLogin?.data?.token
          ? resLogin.data
          : resLogin?.data || {};
      const token = payload?.token;
      const user = payload?.user;

      if (token && user) {
        login({ user, token }); // uses your updated context
        navigate("/", { replace: true });
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Register failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl">
              <FaUserPlus />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create account</h1>
              <p className="text-sm opacity-90">Join KeychainHub today</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
