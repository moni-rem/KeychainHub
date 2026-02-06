const multer = require("multer");
const path = require("path");
const fs = require("fs");
const env = require("./env");
const constants = require("./constants");

// Ensure upload directories exist
const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, "../../uploads"),
    path.join(__dirname, "../../uploads/products"),
    path.join(__dirname, "../../uploads/avatars"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureDirectories();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = "uploads/";

    if (file.fieldname === "avatar") {
      uploadDir = path.join(uploadDir, "avatars");
    } else if (file.fieldname === "images") {
      uploadDir = path.join(uploadDir, "products");
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/gif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files (jpeg, png, jpg, webp, gif) are allowed"),
      false,
    );
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: constants.UPLOAD_LIMITS.MAX_FILES,
  },
  fileFilter: fileFilter,
});

// Export specific upload configurations
module.exports = {
  upload,
  uploadAvatar: upload.single("avatar"),
  uploadProductImages: upload.array(
    "images",
    constants.UPLOAD_LIMITS.MAX_FILES,
  ),
  uploadSingleImage: upload.single("image"),
};
