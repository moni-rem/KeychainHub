import React from "react";
import { motion } from "framer-motion";

export function MetricCard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  gradient,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      transition={{
        duration: 0.4,
        delay,
        ease: "easeOut",
      }}
      className={`relative overflow-hidden rounded-2xl p-6 shadow-lg ${gradient} text-white hover:shadow-xl transition-shadow duration-300`}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

      {/* Animated border */}
      <motion.div
        className="absolute inset-0 border-2 border-white/20 rounded-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <motion.div
            className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-md border ${
              trendUp
                ? "bg-white/20 text-white border-white/30"
                : "bg-black/20 text-white border-white/10"
            }`}
          >
            <span className="font-bold">{trend}</span>
            <motion.svg
              animate={{ y: trendUp ? [0, -2, 0] : [0, 2, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`w-4 h-4 ${trendUp ? "" : "rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </motion.svg>
          </motion.div>
        </div>

        <div className="mt-8">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.1 }}
            className="text-sm font-medium uppercase tracking-wider opacity-90 mb-2"
          >
            {title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
            className="text-3xl md:text-4xl font-bold tracking-tight leading-tight"
          >
            {value}
          </motion.p>
        </div>

        {/* Progress indicator (optional) */}
        <motion.div
          className="mt-6 h-1 w-full bg-white/20 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: delay + 0.4, duration: 0.8 }}
        >
          <div
            className={`h-full ${trendUp ? "bg-white/60" : "bg-white/30"}`}
            style={{ width: trendUp ? "75%" : "40%" }}
          ></div>
        </motion.div>
      </div>

      {/* Decorative background pattern */}
      <motion.div
        className="absolute -right-6 -bottom-6 opacity-10 transform rotate-12"
        animate={{ rotate: [12, 15, 12] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Icon className="w-48 h-48" />
      </motion.div>

      {/* Floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          initial={{
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: 0,
          }}
          animate={{
            y: [null, -20, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            delay: delay + i * 0.3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      ))}
    </motion.div>
  );
}
