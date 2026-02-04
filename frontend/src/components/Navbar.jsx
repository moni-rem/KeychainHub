import { CgProfile } from "react-icons/cg";
import {
  FaSun,
  FaMoon,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useUserAuth } from "../context/UserAuthContext";
import React, { useState } from "react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { cartItems } = useCart();
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ NEW: search state
  const [searchTerm, setSearchTerm] = useState("");

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAll();
  };

  // ✅ NEW: submit search -> go to shop with query
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    // go to shop even if empty (shows all products)
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
    closeAll();
  };

  return (
    <header className="bg-blue-200 dark:bg-gray-900 text-gray-800 dark:text-white shadow-md z-10">
      <div className="flex items-center justify-between p-4 md:p-8 gap-4">
        {/* Logo */}
        <div className="text-2xl font-bold font-serif shrink-0">
          <Link to="/" onClick={closeAll}>
            KeychainHub
          </Link>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center bg-white dark:bg-gray-800 rounded-full px-3 py-2 w-full max-w-md border border-gray-200 dark:border-gray-700"
        >
          <FaSearch className="mr-2 opacity-70" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="bg-transparent outline-none w-full text-sm"
          />
          <button
            type="submit"
            className="ml-2 text-sm font-semibold hover:opacity-80"
          >
            Search
          </button>
        </form>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex gap-8 font-semibold">
            <li>
              <Link
                to="/"
                className="hover:text-blue-800 dark:hover:text-blue-400"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                className="hover:text-blue-800 dark:hover:text-blue-400"
              >
                Shop
              </Link>
            </li>
            <li>

              <Link
                to="/Blogpage"
                className="hover:text-blue-800 dark:hover:text-blue-400"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-blue-800 dark:hover:text-blue-400"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-4 relative shrink-0">
          {/* Cart */}
          <Link to="/cart" className="relative" onClick={closeAll}>
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
              onClick={() => setProfileOpen((p) => !p)}
              className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              <CgProfile size={20} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                      Hello, {user.email.split("@")[0]}
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
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

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen((m) => !m)}
            className="md:hidden p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Menu + Mobile Search */}
      {menuOpen && (
        <nav className="md:hidden border-t border-gray-300 dark:border-gray-700 px-4 pb-4">
          {/* Mobile Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white dark:bg-gray-800 rounded-full px-3 py-2 mt-4 border border-gray-200 dark:border-gray-700"
          >
            <FaSearch className="mr-2 opacity-70" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent outline-none w-full text-sm"
            />
            <button type="submit" className="ml-2 text-sm font-semibold">
              Go
            </button>
          </form>

          <ul className="flex flex-col gap-3 font-semibold pt-4">
            <li>
              <Link to="/" onClick={closeAll}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop" onClick={closeAll}>
                Shop
              </Link>
            </li>
            <li>
              <a href="#blog" onClick={closeAll}>
                Blog
              </a>
            </li>
            <li>
              <Link to="/contact" onClick={closeAll}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
