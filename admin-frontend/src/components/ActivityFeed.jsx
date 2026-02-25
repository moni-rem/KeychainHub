import React from "react";
import { motion } from "framer-motion";
import { User, ShoppingCart, Star, Zap } from "lucide-react";

const activities = [
  {
    id: 1,
    user: "Alex Morgan",
    action: "subscribed to",
    target: "Pro Plan",
    time: "2 min ago",
    icon: Star,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 2,
    user: "Sarah Chen",
    action: "purchased",
    target: "UI Kit Bundle",
    time: "15 min ago",
    icon: ShoppingCart,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    user: "Mike Ross",
    action: "triggered",
    target: "Automation #4",
    time: "1 hour ago",
    icon: Zap,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 4,
    user: "Emma Wilson",
    action: "updated",
    target: "Profile Settings",
    time: "2 hours ago",
    icon: User,
    color: "bg-green-100 text-green-600",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export function ActivityFeed() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Live Activity</h2>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            variants={item}
            className="flex items-center space-x-4 group"
          >
            <div
              className={`p-3 rounded-2xl ${activity.color} transition-transform group-hover:scale-110 duration-300`}
            >
              <activity.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {activity.user}
              </p>
              <p className="text-sm text-slate-500 truncate">
                {activity.action}{" "}
                <span className="text-slate-700 font-medium">
                  {activity.target}
                </span>
              </p>
            </div>
            <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
              {activity.time}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
