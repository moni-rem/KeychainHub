import { CgProfile } from "react-icons/cg";
import { FaSun, FaMoon, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useUserAuth } from "../context/UserAuthContext";
import React, { useState } from "react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { cartItems } = useCart();
  const { user, logout } = useUserAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
  };

  return (
    <div className="
      flex flex-col md:flex-row justify-between items-center
      bg-blue-200 dark:bg-gray-900
      text-gray-800 dark:text-white
      font-sans p-4 md:p-8 shadow-md z-10
    ">
      {/* Logo */}
      <div className="text-2xl font-bold mb-2 md:mb-0 font-serif">
        <Link to="/">KeychainHub</Link>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="flex flex-col md:flex-row gap-4 md:gap-8 font-semibold">
          <li><Link to="/" className="hover:text-blue-800 dark:hover:text-blue-400">Home</Link></li>
          <li><Link to="/shop" className="hover:text-blue-800 dark:hover:text-blue-400">Shop</Link></li>
          <li><a href="#blog" className="hover:text-blue-800 dark:hover:text-blue-400">Blog</a></li>
          <li><Link to="/contact" className="hover:text-blue-800 dark:hover:text-blue-400">Contact</Link></li>
        </ul>
      </nav>

      {/* Icons */}
      <div className="flex items-center gap-6 mt-2 md:mt-0 relative">
        
        {/* Cart */}
        <Link to="/cart" className="relative">
          <FaShoppingCart size={20} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            <CgProfile size={20} />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              {user ? (
                <>
                  <div className="px-4 py-2 text-gray-800 dark:text-white border-b dark:border-gray-700">
                    Hello, {user.email.split("@")[0]}
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setProfileOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setProfileOpen(false)}
                  >
                    Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setProfileOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
        </button>
      </div>
    </div>
  );
}
