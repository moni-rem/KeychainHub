const bcrypt = require("bcryptjs");
const prisma = require("../config/database");
const JWTUtils = require("../utils/jwt");
const ApiError = require("../utils/apiError");
const Helpers = require("../utils/helpers");
const BcryptUtils = require("../utils/bcrypt");

class AuthService {
  async register(userData) {
    const { email, password, name, phone, address } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(400, "Email already registered");
    }

    // Hash password
    const hashedPassword = await BcryptUtils.hashPassword(password);

    // Create user with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          address,
        },
      });

      // Create cart for user
      await tx.cart.create({
        data: {
          userId: user.id,
        },
      });

      return user;
    });

    // Generate token
    const token = JWTUtils.generateUserToken(result.id, result.isAdmin);

    // Sanitize user data
    const sanitizedUser = Helpers.sanitizeUser(result);

    return {
      user: sanitizedUser,
      token,
    };
  }

  async login(email, password) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Check password
    const isPasswordValid = await BcryptUtils.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Generate token based on user role
    const token = user.isAdmin
      ? JWTUtils.generateAdminToken(user.id)
      : JWTUtils.generateUserToken(user.id);

    // Sanitize user data
    const sanitizedUser = Helpers.sanitizeUser(user);

    return {
      user: sanitizedUser,
      token,
    };
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        address: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        address: true,
        isAdmin: true,
      },
    });

    return user;
  }

  async changePassword(userId, oldPassword, newPassword) {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Verify old password
    const isPasswordValid = await BcryptUtils.comparePassword(
      oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ApiError(400, "Old password is incorrect");
    }

    // Hash new password
    const hashedPassword = await BcryptUtils.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
  }

  async updateAvatar(userId, avatarUrl) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        address: true,
        isAdmin: true,
      },
    });

    return user;
  }
}

module.exports = new AuthService();
