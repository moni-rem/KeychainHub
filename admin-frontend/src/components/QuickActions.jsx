import React from "react";
import { motion } from "framer-motion";
import { Plus, Download, Share2, Settings } from "lucide-react";

const actions = [
  {
    label: "New Campaign",
    icon: Plus,
    color: "bg-slate-900 text-white hover:bg-slate-800",
  },
  {
    label: "Export Data",
    icon: Download,
    color:
      "bg-white text-slate-700 border-2 border-slate-100 hover:border-slate-300",
  },
  {
    label: "Share Report",
    icon: Share2,
    color:
      "bg-white text-slate-700 border-2 border-slate-100 hover:border-slate-300",
  },
  {
    label: "Settings",
    icon: Settings,
    color:
      "bg-white text-slate-700 border-2 border-slate-100 hover:border-slate-300",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.6 + index * 0.1,
          }}
          whileHover={{
            scale: 1.05,
            y: -2,
          }}
          whileTap={{
            scale: 0.95,
          }}
          className={`flex flex-col items-center justify-center p-6 rounded-3xl shadow-sm transition-colors ${action.color}`}
        >
          <action.icon className="w-8 h-8 mb-3" />
          <span className="font-bold text-sm">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
