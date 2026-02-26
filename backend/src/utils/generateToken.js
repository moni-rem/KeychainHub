const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("./apiError");

// Original generateToken function for backward compatibility
const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // set secure flag in production
    sameSite: "strict", // use "strict" to prevent CSRF attacks, or "lax" if you need to allow some cross-site requests
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

class JWTUtils {
  static generateToken(
    payload,
    secret = env.JWT_SECRET,
    expiresIn = env.JWT_EXPIRE,
  ) {
    try {
      return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
      throw new ApiError(500, "Error generating token");
    }
  }

  static generateUserToken(userId, isAdmin = false) {
    const payload = {
      userId,
      isAdmin,
      type: "user",
    };

    return this.generateToken(payload);
  }

  static generateAdminToken(userId) {
    const payload = {
      userId,
      isAdmin: true,
      type: "admin",
    };

    return this.generateToken(payload, env.ADMIN_JWT_SECRET, "24h");
  }

  static verifyToken(token, secret = env.JWT_SECRET) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Token expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw new ApiError(401, "Invalid token");
      }
      throw new ApiError(401, "Token verification failed");
    }
  }

  static verifyUserToken(token) {
    const decoded = this.verifyToken(token);

    if (decoded.type !== "user") {
      throw new ApiError(401, "Invalid token type");
    }

    return decoded;
  }

  static verifyAdminToken(token) {
    const decoded = this.verifyToken(token, env.ADMIN_JWT_SECRET);

    if (decoded.type !== "admin" || !decoded.isAdmin) {
      throw new ApiError(401, "Invalid admin token");
    }

    return decoded;
  }

  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  static getUserIdFromToken(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded?.userId || null;
    } catch (error) {
      return null;
    }
  }
}

// Export both the original function and the JWTUtils class
module.exports = generateToken;
module.exports.JWTUtils = JWTUtils;
