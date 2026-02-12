const jwt = require("jsonwebtoken");
const env = require("../config/env");
const prisma = require("../config/database");
const ApiError = require("../utils/apiError");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required. No token provided.");
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        address: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(401, "User not found. Please authenticate again.");
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    next(); // use next(); for middleware to pass control to the next middleware or route handler
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, "Invalid token. Please log in again."));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, "Token expired. Please log in again."));
    }
    next(error);
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required. No token provided.");
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token with admin secret
    const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET);

    // Find admin user
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isAdmin: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        address: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(403, "Admin access required. Invalid admin token.");
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, "Invalid admin token."));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, "Admin token expired."));
    }
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true,
          },
        });

        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but that's okay for optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { auth, adminAuth, optionalAuth };
