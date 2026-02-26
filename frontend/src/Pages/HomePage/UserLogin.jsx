import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuLoaderCircle,
  LuPalette,
  LuUsers,
  LuCloud,
  LuShieldCheck,
} from "react-icons/lu";
import { FaGithub } from "react-icons/fa";
import { useUserAuth } from "../../context/UserAuthContext";
import api from "../../api/axios";

export default function UserLogin() {
  const { login } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getApiErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0]?.message || fallback;
    }
    return data?.message || data?.error || fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payloadInput = {
        email: email.trim().toLowerCase(),
        password,
      };
      const res = await api.post("/auth/login", payloadInput);

      const payload =
        res?.data?.user && res?.data?.token ? res.data : res?.data || {};
      const token = payload?.token;
      const user = payload?.user;

      if (!token || !user) {
        setError("Login failed: invalid response from server.");
        return;
      }

      login({ user, token });
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Account not found or password is incorrect. Please register first.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <LuPalette size={16} />,
      title: "Advanced Design Tools",
      desc: "Professional-grade tools for every project",
    },
    {
      icon: <LuUsers size={16} />,
      title: "Team Collaboration",
      desc: "Work together seamlessly in real-time",
    },
    {
      icon: <LuCloud size={16} />,
      title: "Cloud Storage",
      desc: "Access your projects from anywhere",
    },
    {
      icon: <LuShieldCheck size={16} />,
      title: "Enterprise Security",
      desc: "Bank-level security for your data",
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 bg-slate-100">
      <style>{`
        .login-btn {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          position: relative;
          overflow: hidden;
        }
        .login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s;
        }
        .login-btn:hover::before {
          left: 100%;
        }
      `}</style>

      <div className="z-10 w-full max-w-6xl">
        <div className="overflow-hidden rounded-[40px] bg-white/90 shadow-2xl backdrop-blur-sm">
          <div className="grid min-h-[720px] lg:grid-cols-2">
            <div
              className="relative m-4 rounded-3xl bg-cover bg-center p-10 text-white"
              style={{
                backgroundImage:
                  "url('https://p0.piqsels.com/preview/862/657/214/yolk-lazy-cafe-mascot.jpg')",
              }}
            >
              <div className="absolute inset-0 rounded-3xl bg-black/45" />
              <div className="relative">
                <div className="mb-12 text-lg font-semibold uppercase">
                  PixelForge Studio
                </div>
                <h1 className="mb-4 text-4xl font-semibold lg:text-5xl">
                  Create, Design, and Innovate
                </h1>
                <p className="mb-12 text-lg opacity-90">
                  Join thousands of creators who trust PixelForge Studio to
                  bring their vision to life
                </p>

                <div className="space-y-5">
                  {features.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm opacity-75">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-12">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-light uppercase text-slate-900">
                    Welcome back
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Sign in to continue your creative journey
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium uppercase text-slate-800"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <LuMail size={18} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pr-3 pl-10 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium uppercase text-slate-800"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <LuLock size={18} />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pr-12 pl-10 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <LuEyeOff size={18} />
                        ) : (
                          <LuEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-sm text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                      />
                      <span className="ml-2">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="login-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-80"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <LuLoaderCircle className="h-5 w-5 animate-spin" />
                        <span className="ml-2">Signing in...</span>
                      </>
                    ) : (
                      "Sign in to your account"
                    )}
                  </button>

                  <div className="relative text-center text-sm text-slate-500">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300" />
                    </div>
                    <span className="relative bg-white px-3">
                      Or continue with
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm shadow-sm transition hover:bg-slate-100"
                    >
                      <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        className="h-5 w-5"
                        alt="Google"
                      />
                      <span className="ml-2">Google</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm shadow-sm transition hover:bg-slate-100"
                    >
                      <FaGithub className="h-5 w-5" />
                      <span className="ml-2">GitHub</span>
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center text-sm text-slate-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Sign up for free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
