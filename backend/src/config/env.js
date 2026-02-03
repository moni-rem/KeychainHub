require("dotenv").config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // CORS
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

  // File Uploads
  UPLOAD_LIMIT: process.env.UPLOAD_LIMIT || "5mb",
};
