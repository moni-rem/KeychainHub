const userService = require("../services/userService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");

// UserController handles all user-related operations
// Workflow:
// 1. Validate input parameters
// 2. Call appropriate service for business logic
// 3. Handle errors with appropriate status codes
// 4. Return consistent response format with status and data/message
class UserController {
  // Get all users with optional filtering
  // Workflow:
  // 1. Extract query parameters for filtering
  // 2. Call userService to get users
  // 3. Return success response with users data
  getUsers = Helpers.asyncHandler(async (req, res) => {
    const result = await userService.getUsers(req.query);

    const response = ApiResponse.success(
      "Users retrieved successfully",
      result,
    );
    response.send(res);
  });

  // Get a specific user by ID
  // Workflow:
  // 1. Extract user ID from params
  // 2. Call userService to get the user
  // 3. Return success response with user data
  getUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    const response = ApiResponse.success("User retrieved successfully", {
      user,
    });
    response.send(res);
  });

  // Update user information
  // Workflow:
  // 1. Extract user ID from params and update data from body
  // 2. Call userService to update the user
  // 3. Return success response with updated user data
  updateUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);

    const response = ApiResponse.success("User updated successfully", { user });
    response.send(res);
  });

  // Delete a user
  // Workflow:
  // 1. Extract user ID from params
  // 2. Call userService to delete the user
  // 3. Return success response with confirmation message
  deleteUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    await userService.deleteUser(id);

    const response = ApiResponse.success("User deleted successfully");
    response.send(res);
  });

  // Update user role (admin status)
  // Workflow:
  // 1. Extract user ID from params and admin status from body
  // 2. Call userService to update the user role
  // 3. Return success response with updated user data
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
  // Workflow:
  // 1. Extract user ID from params
  // 2. Call userService to reset the password
  // 3. Return success response with new password (Note: In production, send via email only)
  resetUserPassword = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await userService.resetPassword(id);

    const response = ApiResponse.success(
      result.message,
      { newPassword: result.newPassword }, // Note: In production, send via email only
    );
    response.send(res);
  });

  // Get user statistics
  // Workflow:
  // 1. Call userService to get user statistics
  // 2. Return success response with statistics data
  getUserStats = Helpers.asyncHandler(async (req, res) => {
    const stats = await userService.getUserStats();

    const response = ApiResponse.success("User statistics retrieved", stats);
    response.send(res);
  });

  // Get current user's orders
  // Get current user's orders
  // Workflow:
  // 1. Note: This feature is implemented in orderController
  // 2. Return success response with implementation note
  getMyOrders = Helpers.asyncHandler(async (req, res) => {
    // This would use orderService.getUserOrders(req.user.id, req.query)
    // Implemented in orderController

    const response = ApiResponse.success(
      "Feature implemented in order controller",
    );
    response.send(res);
  });
}

module.exports = new UserController();
