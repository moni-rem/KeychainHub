// UserController handles all user-related operations
// Workflow:
// 1. Validate input parameters
// 2. Call appropriate service for business logic
// 3. Handle errors with appropriate status codes
// 4. Return consistent response format with status and data/message

// Get all users with optional filtering
// Workflow:
// 1. Extract query parameters for filtering
// 2. Call userService to get users
// 3. Return success response with users data
const userService = require("../services/userService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");

class UserController {
  // Get all users with filtering
  getUsers = Helpers.asyncHandler(async (req, res) => {
    const result = await userService.getUsers(req.query);
    const response = ApiResponse.success(
      "Users retrieved successfully",
      result,
    );
    response.send(res);
  });

  // Get customers (users with orders)
  getCustomers = Helpers.asyncHandler(async (req, res) => {
    const result = await userService.getCustomers(req.query);
    const response = ApiResponse.success(
      "Customers retrieved successfully",
      result,
    );
    response.send(res);
  });

  // Get single user
  getUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    const response = ApiResponse.success("User retrieved successfully", {
      user,
    });
    response.send(res);
  });

  // Update user
  updateUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    const response = ApiResponse.success("User updated successfully", { user });
    response.send(res);
  });

  // Delete user
  deleteUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    await userService.deleteUser(id);
    const response = ApiResponse.success("User deleted successfully");
    response.send(res);
  });

  // Update user role
  updateUserRole = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isAdmin } = req.body;
    const user = await userService.updateUserRole(id, isAdmin);
    const response = ApiResponse.success("User role updated successfully", {
      user,
    });
    response.send(res);
  });

  // Reset user password
  resetUserPassword = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await userService.resetPassword(id);
    const response = ApiResponse.success(result.message, {
      newPassword: result.newPassword,
    });
    response.send(res);
  });

  // Get user statistics
  getUserStats = Helpers.asyncHandler(async (req, res) => {
    const stats = await userService.getUserStats();
    const response = ApiResponse.success("User statistics retrieved", stats);
    response.send(res);
  });

  // Search users
  searchUsers = Helpers.asyncHandler(async (req, res) => {
    const { q } = req.query;
    const users = await userService.searchUsers(q);
    const response = ApiResponse.success("Users found", { users });
    response.send(res);
  });

  // Get user activity
  getUserActivity = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit = 50 } = req.query;
    const activity = await userService.getUserActivity(id, limit);
    const response = ApiResponse.success("User activity retrieved", {
      activity,
    });
    response.send(res);
  });
}

module.exports = new UserController();
