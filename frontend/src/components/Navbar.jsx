import { CgProfile } from "react-icons/cg";
import { FaSun, FaMoon } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import React from "react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { cartItems } = useCart();

  const totalItems = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <div className="
      flex flex-col md:flex-row justify-between items-center
      bg-blue-200 dark:bg-gray-900
      text-gray-800 dark:text-white
      font-sans p-4 md:p-8 shadow-md z-10
    ">
      <div className="text-2xl font-bold mb-2 md:mb-0 font-serif">
        <Link to="/">KeychainHub</Link>
      </div>

      <nav>
        <ul className="flex flex-col md:flex-row gap-4 md:gap-8 font-semibold">
          <li><Link to="/" className="hover:text-blue-800 dark:hover:text-blue-400">Home</Link></li>
          <li><Link to="/shop" className="hover:text-blue-800 dark:hover:text-blue-400">Shop</Link></li>
          <li><a href="#blog" className="hover:text-blue-800 dark:hover:text-blue-400">Blog</a></li>
          <li><Link to="/contact" className="hover:text-blue-800 dark:hover:text-blue-400">Contact</Link></li>
        </ul>
      </nav>

      {/* Icons */}
      <div className="flex items-center gap-6 mt-2 md:mt-0">
        
        <Link to="/cart" className="relative">
          <FaShoppingCart size={20} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>

        <Link to="/profile">
          <CgProfile size={20} />
        </Link>

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
