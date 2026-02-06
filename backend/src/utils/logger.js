const winston = require("winston");
const path = require("path");
const fs = require("fs");
const env = require("../config/env");

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Create logger instance
const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: logFormat,
  defaultMeta: { service: "keychain-shop-api" },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // File transports
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If not in development, remove console transport
if (env.NODE_ENV === "production") {
  logger.remove(winston.transports.Console);
}

// Custom logging methods
const log = {
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  error: (message, meta = {}) => {
    logger.error(message, meta);
  },

  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  http: (message, meta = {}) => {
    logger.http(message, meta);
  },
};

module.exports = log;
