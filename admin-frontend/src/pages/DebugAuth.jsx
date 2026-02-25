import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DebugAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔍 DEBUG: Checking localStorage");

    // Check all possible token locations
    const adminToken = localStorage.getItem("adminToken");
    const token = localStorage.getItem("token");
    const jwt = localStorage.getItem("jwt");
    const userStr = localStorage.getItem("adminUser");

    console.log("adminToken:", adminToken ? "✅ Present" : "❌ Missing");
    console.log("token:", token ? "✅ Present" : "❌ Missing");
    console.log("jwt:", jwt ? "✅ Present" : "❌ Missing");
    console.log("adminUser:", userStr ? "✅ Present" : "❌ Missing");

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("User data:", user);
        console.log("isAdmin:", user.isAdmin);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }

    // Try to get the actual token values (first 20 chars only for security)
    if (adminToken)
      console.log("adminToken preview:", adminToken.substring(0, 20) + "...");
    if (token) console.log("token preview:", token.substring(0, 20) + "...");
    if (jwt) console.log("jwt preview:", jwt.substring(0, 20) + "...");
  }, []);

  const handleLogin = () => {
    // Simulate login with test data
    const mockUser = {
      id: "test-id",
      email: "user1@example.com",
      name: "Test User",
      isAdmin: true,
    };

    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtaWQiLCJpYXQiOjE3MTkzMjQ4MDB9.test";

    localStorage.setItem("adminToken", mockToken);
    localStorage.setItem("token", mockToken);
    localStorage.setItem("jwt", mockToken);
    localStorage.setItem("adminUser", JSON.stringify(mockUser));

    console.log("✅ Mock login data stored");
    window.location.reload();
  };

  const handleClear = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    localStorage.removeItem("adminUser");
    console.log("✅ LocalStorage cleared");
    window.location.reload();
  };

  const handleGoToProducts = () => {
    navigate("/products");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔐 Authentication Debugger</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">LocalStorage Contents:</h2>
        <pre className="bg-white p-3 rounded text-sm overflow-auto">
          {JSON.stringify(
            {
              adminToken: localStorage.getItem("adminToken")
                ? "✅ Present"
                : "❌ Missing",
              token: localStorage.getItem("token")
                ? "✅ Present"
                : "❌ Missing",
              jwt: localStorage.getItem("jwt") ? "✅ Present" : "❌ Missing",
              adminUser: localStorage.getItem("adminUser")
                ? "✅ Present"
                : "❌ Missing",
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Set Mock Login Data
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Clear All Data
        </button>
        <button
          onClick={handleGoToProducts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Products
        </button>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal ml-5 space-y-1 text-sm">
          <li>First, login normally through the login page</li>
          <li>Then come to this debug page to see if your data is stored</li>
          <li>If data is missing, click "Set Mock Login Data"</li>
          <li>Then try going to Products page</li>
          <li>Check the browser console (F12) for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugAuth;
