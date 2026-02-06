const path = require("path");
const fs = require("fs");
const constants = require("../config/constants");

class Helpers {
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  static paginate(data, page, limit, total) {
    const currentPage = parseInt(page);
    const pageSize = parseInt(limit);
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    };
  }

  static calculateCartTotal(items) {
    return items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }

  static formatPrice(price) {
    return parseFloat(price).toFixed(2);
  }

  static generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD-${timestamp}-${random}`;
  }

  static sanitizeUser(user) {
    if (!user) return null;

    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  static validateCategory(category) {
    return constants.CATEGORIES.includes(category);
  }

  static getImageUrl(filename, type = "product") {
    if (!filename) return null;

    if (filename.startsWith("http")) {
      return filename;
    }

    const baseUrl = process.env.APP_URL || "http://localhost:5000";

    if (type === "avatar") {
      return `${baseUrl}/uploads/avatars/${filename}`;
    } else if (type === "product") {
      return `${baseUrl}/uploads/products/${filename}`;
    }

    return `${baseUrl}/${filename}`;
  }

  static deleteFile(filepath) {
    if (!filepath) return;

    const fullPath = path.join(process.cwd(), filepath);

    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (error) {
        console.error("Error deleting file:", error.message);
      }
    }
  }

  static generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  static formatDate(date, format = "YYYY-MM-DD HH:mm:ss") {
    const d = new Date(date);

    const replacements = {
      YYYY: d.getFullYear(),
      MM: String(d.getMonth() + 1).padStart(2, "0"),
      DD: String(d.getDate()).padStart(2, "0"),
      HH: String(d.getHours()).padStart(2, "0"),
      mm: String(d.getMinutes()).padStart(2, "0"),
      ss: String(d.getSeconds()).padStart(2, "0"),
    };

    return format.replace(
      /YYYY|MM|DD|HH|mm|ss/g,
      (match) => replacements[match],
    );
  }
}

module.exports = Helpers;
