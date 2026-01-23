import { FaShoppingCart } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-blue-200 text-gray-800 font-sans p-4 md:p-8 shadow-md z-10">
      
      {/* Logo */}
      <div className="text-2xl font-bold mb-2 md:mb-0">
        <Link to="/">KeychainHub</Link>
      </div>

      {/* Navigation Links */}
      <nav>
        <ul className="flex flex-col md:flex-row gap-4 md:gap-8 font-semibold">
          <li><Link to="/" className="hover:text-blue-800">Home</Link></li>
          <li><Link to="/shop" className="hover:text-blue-800">Shop</Link></li>
          <li><Link to="/blog" className="hover:text-blue-800">Blog</Link></li>
          <li><Link to="/contact" className="hover:text-blue-800">Contact</Link></li>
        </ul>
      </nav>

      {/* Icons */}
      <div className="flex flex-col md:flex-row gap-4 mt-2 md:mt-0">
        <Link to="/cart" className="flex items-center gap-1 hover:text-blue-800">
          <FaShoppingCart size={20} />
        </Link>
        <Link to="/profile" className="flex items-center gap-1 hover:text-blue-800">
          <CgProfile size={20} />
        </Link>
      </div>
    </div>
  );
}
