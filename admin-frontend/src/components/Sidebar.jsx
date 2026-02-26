import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  UserCircle,
  Users,
  FileText,
  Moon,
  Sun,
  ChevronDown,
  User,
  CreditCard,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const safeUser = user || {};
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Apply dark mode class to document when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // In your Sidebar.jsx, update the navItems paths:

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard", // This should match your route
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/products", // This should match your route
      icon: Package,
    },
    {
      name: "Orders",
      path: "/orders", // This should match your route
      icon: ShoppingCart,
    },
    {
      name: "Analytics",
      path: "/analytics", // This should match your route
      icon: BarChart3,
    },
    {
      name: "Customers",
      path: "/customers", // This should match your route
      icon: Users,
    },
    {
      name: "Reports",
      path: "/reports", // This should match your route
      icon: FileText,
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (safeUser.name) {
      return safeUser.name.charAt(0).toUpperCase();
    }
    return safeUser.email?.charAt(0).toUpperCase() || "A";
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col h-screen border-r border-slate-200 dark:border-slate-800 transition-colors duration-200 fixed left-0 top-0">
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">K</span>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight dark:text-white">
              KeychainHub
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Admin Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
          Main
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                }
              `}
            >
              <Icon
                size={20}
                className={`
                  transition-colors
                  ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
                  }
                `}
              />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
              )}
            </Link>
          );
        })}

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">
          System
        </p>

        {/* Settings */}
        <Link
          to="/settings"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
        >
          <Settings
            size={20}
            className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
          />
          <span className="font-medium">Settings</span>
        </Link>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
        >
          {darkMode ? (
            <Sun
              size={20}
              className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
            />
          ) : (
            <Moon
              size={20}
              className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
            />
          )}
          <span className="font-medium">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
              {getUserInitials()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {safeUser.name || "Admin User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {safeUser.email || "admin@example.com"}
            </p>
          </div>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Profile menu"
          >
            <ChevronDown
              size={20}
              className={`text-slate-500 dark:text-slate-400 transition-transform ${
                showProfileMenu ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-20 left-4 w-56 bg-white dark:bg-slate-800 rounded-lg p-2 space-y-1 shadow-lg border border-slate-200 dark:border-slate-700 z-50">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-2">
              <p className="font-medium text-slate-900 dark:text-white">
                {safeUser.name || "Admin User"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {safeUser.email || "admin@example.com"}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                Admin
              </span>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              onClick={() => setShowProfileMenu(false)}
            >
              <User size={16} />
              My Profile
            </Link>

            <Link
              to="/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              onClick={() => setShowProfileMenu(false)}
            >
              <Settings size={16} />
              Account Settings
            </Link>

            <div className="border-t border-slate-200 dark:border-slate-700 my-1 pt-1">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
