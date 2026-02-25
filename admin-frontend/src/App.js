import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "react-query";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import LineDueAdmin from "./pages/LineDueAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import DebugAuth from "./pages/DebugAuth";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

// Create Query Client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function App() {
  console.log("🔐 App: Rendering with AuthProvider");
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "8px",
              },
              success: {
                icon: "✅",
                style: {
                  background: "#10b981",
                },
              },
              error: {
                icon: "❌",
                style: {
                  background: "#ef4444",
                },
              },
              loading: {
                icon: "⏳",
                style: {
                  background: "#3b82f6",
                },
              },
            }}
          />

          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              {/* Protected routes - wrapped in Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="customers" element={<Customers />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              {/* Catch all - redirect to dashboard if authenticated, otherwise to login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
