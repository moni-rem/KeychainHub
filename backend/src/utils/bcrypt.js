const bcrypt = require("bcryptjs");
const ApiError = require("./apiError");

class BcryptUtils {
  static async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new ApiError(500, "Error hashing password");
    }
  }

  static async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new ApiError(500, "Error comparing passwords");
    }
  }

  static validatePassword(password) {
    const errors = [];

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (password.length > 50) {
      errors.push("Password cannot exceed 50 characters");
    }

    // Optional: Add more validations
    // if (!/[A-Z]/.test(password)) {
    //   errors.push('Password must contain at least one uppercase letter');
    // }
    // if (!/[0-9]/.test(password)) {
    //   errors.push('Password must contain at least one number');
    // }
    // if (!/[!@#$%^&*]/.test(password)) {
    //   errors.push('Password must contain at least one special character');
    // }

    return errors;
  }

  static generateRandomPassword(length = 12) {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
}

module.exports = BcryptUtils;
