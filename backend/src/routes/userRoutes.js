const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { userQuerySchema } = require("../validators/userValidator");

// All user routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// User management routes
router.get(
  "/",
  validateRequest(userQuerySchema, "query"),
  userController.getUsers,
);
router.get("/stats", userController.getUserStats);
router.get("/customers", userController.getCustomers);
router.get("/search", userController.searchUsers);
router.get("/:id", userController.getUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.put("/:id/role", userController.updateUserRole);
router.post("/:id/reset-password", userController.resetUserPassword);
router.get("/:id/activity", userController.getUserActivity);

module.exports = router;
