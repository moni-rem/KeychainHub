require("dotenv").config();

const config = {
  // App
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5001,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,

  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  ADMIN_URL: process.env.ADMIN_URL || "http://localhost:3001",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,

  // Upload limits
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
};

// Backward-compatible aliases for existing lowercase usages.
config.nodeEnv = config.NODE_ENV;
config.port = config.PORT;
config.jwtSecret = config.JWT_SECRET;

module.exports = config;
