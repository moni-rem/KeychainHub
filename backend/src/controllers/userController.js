const userService = require("../services/userService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");

class UserController {
  getUsers = Helpers.asyncHandler(async (req, res) => {
    const result = await userService.getUsers(req.query);

    const response = ApiResponse.success(
      "Users retrieved successfully",
      result,
    );
    response.send(res);
  });

  getUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    const response = ApiResponse.success("User retrieved successfully", {
      user,
    });
    response.send(res);
  });

  updateUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);

    const response = ApiResponse.success("User updated successfully", { user });
    response.send(res);
  });

  deleteUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    await userService.deleteUser(id);

    const response = ApiResponse.success("User deleted successfully");
    response.send(res);
  });

  updateUserRole = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isAdmin } = req.body;

    const user = await userService.updateUserRole(id, isAdmin);

    const response = ApiResponse.success("User role updated successfully", {
      user,
    });
    response.send(res);
  });

  resetUserPassword = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await userService.resetPassword(id);

    const response = ApiResponse.success(
      result.message,
      { newPassword: result.newPassword }, // Note: In production, send via email only
    );
    response.send(res);
  });

  getUserStats = Helpers.asyncHandler(async (req, res) => {
    const stats = await userService.getUserStats();

    const response = ApiResponse.success("User statistics retrieved", stats);
    response.send(res);
  });

  // Get current user's orders
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
