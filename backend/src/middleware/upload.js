const multer = require("multer");
const path = require("path");
const fs = require("fs");
const env = require("../config/env");

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    path.join(process.cwd(), "uploads"),
    path.join(process.cwd(), "uploads/products"),
    path.join(process.cwd(), "uploads/avatars"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureUploadDirs();

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
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Create upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
  fileFilter: fileFilter,
});

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${env.MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded",
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

module.exports = {
  upload,
  uploadAvatar: upload.single("avatar"),
  uploadProductImages: upload.array("images", 5),
  handleUploadError,
};
