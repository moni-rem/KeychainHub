import React from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaTelegramPlane } from "react-icons/fa";

export default function Footer() {
  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-blue-400 text-white relative z-10">
      {/* Main Footer Content */}
      <div className="p-4 md:p-8 shadow-md z-10 md:px-8 py-16 grid md:grid-cols-4 gap-10">
        {/* Logo / Brand */}
        <motion.div
          className="space-y-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold">KeychainHub</h2>
          <p className="text-gray-200 text-sm max-w-xs">
            Sharing insights and stories about products and technology.
          </p>

          {/* Social Links */}
          <div className="flex gap-6 text-xl mt-4">
            <motion.a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.3, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="hover:text-gray-300"
            >
              <FaFacebookF />
            </motion.a>
            <motion.a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.3, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="hover:text-gray-300"
            >
              <FaInstagram />
            </motion.a>
            <motion.a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.3, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="hover:text-gray-300"
            >
              <FaTelegramPlane />
            </motion.a>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
          <ul className="space-y-3 text-gray-200 text-sm">
            <li>
              <a href="#" className="hover:text-white transition">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Shop
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Contact
              </a>
            </li>
          </ul>
        </motion.div>

        {/* Resources */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="font-semibold mb-4 text-lg">Resources</h3>
          <ul className="space-y-3 text-gray-200 text-sm">
            <li>
              <a href="#" className="hover:text-white transition">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Privacy Policy
              </a>
            </li>
          </ul>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="font-semibold mb-4 text-lg">Subscribe</h3>
          <p className="text-gray-200 text-sm mb-4 max-w-sm">
            Get the latest updates and offers delivered directly to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 w-full">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-md text-gray-900 w-full focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        className="bg-blue-700 text-gray-300 text-center text-sm py-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          © 2026 KeychainHub. All rights reserved. Designed with ❤️ by You
        </div>
      </motion.div>
    </footer>
  );
}
