const fs = require("fs").promises;
const path = require("path");
const env = require("../config/env");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

class FileService {
  async uploadImage(file, type = "product") {
    try {
      if (!file) {
        throw new ApiError(400, "No file provided");
      }

      // Validate file type
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "image/gif",
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new ApiError(400, "Invalid file type. Only images are allowed.");
      }

      // Validate file size
      const maxSize = env.MAX_FILE_SIZE;
      if (file.size > maxSize) {
        throw new ApiError(
          400,
          `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
        );
      }

      // Determine upload directory
      let uploadDir = "uploads/";
      if (type === "avatar") {
        uploadDir = path.join(uploadDir, "avatars");
      } else if (type === "product") {
        uploadDir = path.join(uploadDir, "products");
      }

      // Ensure directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const filename = `${type}-${uniqueSuffix}${ext}`;
      const filepath = path.join(uploadDir, filename);

      // Save file
      await fs.writeFile(filepath, file.buffer);

      // Return relative path
      const relativePath = `/${path.relative(process.cwd(), filepath).replace(/\\/g, "/")}`;

      logger.info(`File uploaded: ${relativePath}`);
      return {
        filename,
        path: relativePath,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error uploading file:", error);
      throw new ApiError(500, "Error uploading file");
    }
  }

  async deleteFile(filepath) {
    try {
      if (!filepath) {
        return;
      }

      // Convert URL to filesystem path
      let fsPath = filepath;
      if (filepath.startsWith("/uploads/")) {
        fsPath = path.join(process.cwd(), filepath);
      } else if (filepath.startsWith("uploads/")) {
        fsPath = path.join(process.cwd(), filepath);
      }

      // Check if file exists
      try {
        await fs.access(fsPath);
      } catch {
        // File doesn't exist, that's okay
        return;
      }

      // Delete file
      await fs.unlink(fsPath);
      logger.info(`File deleted: ${filepath}`);
    } catch (error) {
      logger.error("Error deleting file:", error);
      // Don't throw error for file deletion failures
    }
  }

  async deleteMultipleFiles(filepaths) {
    try {
      const deletePromises = filepaths.map((filepath) =>
        this.deleteFile(filepath),
      );
      await Promise.all(deletePromises);
    } catch (error) {
      logger.error("Error deleting multiple files:", error);
    }
  }

  async validateImage(file) {
    if (!file) {
      return { valid: false, error: "No file provided" };
    }

    // Check file type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error:
          "Invalid file type. Only JPEG, PNG, JPG, WEBP, and GIF are allowed.",
      };
    }

    // Check file size
    const maxSize = env.MAX_FILE_SIZE;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
      };
    }

    // Check file extension
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return { valid: false, error: "Invalid file extension." };
    }

    return { valid: true };
  }

  async getFileInfo(filepath) {
    try {
      const fullPath = path.join(process.cwd(), filepath);

      try {
        await fs.access(fullPath);
      } catch {
        return null;
      }

      const stats = await fs.stat(fullPath);
      const ext = path.extname(fullPath).toLowerCase();

      return {
        path: filepath,
        filename: path.basename(filepath),
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        modified: stats.mtime,
        extension: ext.replace(".", ""),
        isImage: [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext),
      };
    } catch (error) {
      logger.error("Error getting file info:", error);
      return null;
    }
  }

  async cleanupOrphanedFiles(directory, validFilepaths) {
    try {
      const dirPath = path.join(process.cwd(), directory);
      let files;

      try {
        files = await fs.readdir(dirPath);
      } catch {
        // Directory doesn't exist
        return;
      }

      const deletePromises = files.map(async (filename) => {
        const filepath = path.join(directory, filename);

        // Check if file is in the valid list
        if (!validFilepaths.includes(filepath)) {
          await this.deleteFile(filepath);
        }
      });

      await Promise.all(deletePromises);
    } catch (error) {
      logger.error("Error cleaning up orphaned files:", error);
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  async copyFile(sourcePath, destinationDir, newFilename = null) {
    try {
      const sourceFullPath = path.join(process.cwd(), sourcePath);

      // Check if source exists
      try {
        await fs.access(sourceFullPath);
      } catch {
        throw new ApiError(404, "Source file not found");
      }

      // Ensure destination directory exists
      const destFullDir = path.join(process.cwd(), destinationDir);
      await fs.mkdir(destFullDir, { recursive: true });

      // Generate new filename if not provided
      const filename = newFilename || path.basename(sourcePath);
      const destFullPath = path.join(destFullDir, filename);

      // Copy file
      await fs.copyFile(sourceFullPath, destFullPath);

      // Return relative path
      return `/${path.relative(process.cwd(), destFullPath).replace(/\\/g, "/")}`;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error copying file:", error);
      throw new ApiError(500, "Error copying file");
    }
  }
}

module.exports = new FileService();
