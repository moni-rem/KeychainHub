const morgan = require("morgan");
const winston = require("winston");
const env = require("../config/env");

// Create Winston logger
const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: "keychain-shop-api" },
  transports: [
    // Write all logs with importance level of 'error' or less to error.log
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    // Write all logs with importance level of 'info' or less to combined.log
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// If we're not in production, also log to console
if (env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

// Morgan middleware for HTTP request logging
const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  },
);

module.exports = { logger, morganMiddleware };
