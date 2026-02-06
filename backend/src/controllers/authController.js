const authService = require("../services/authService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");
const fileService = require("../services/fileService");

class AuthController {
  register = Helpers.asyncHandler(async (req, res) => {
    const userData = req.body;
    const result = await authService.register(userData);

    const response = ApiResponse.created(
      "Registration successful. Welcome to Keychain Shop!",
      result,
    );
    response.send(res);
  });

  login = Helpers.asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    const response = ApiResponse.success("Login successful", result);
    response.send(res);
  });

  getProfile = Helpers.asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);

    const response = ApiResponse.success("Profile retrieved successfully", {
      user,
    });
    response.send(res);
  });

  updateProfile = Helpers.asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);

    const response = ApiResponse.success("Profile updated successfully", {
      user,
    });
    response.send(res);
  });

  changePassword = Helpers.asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, oldPassword, newPassword);

    const response = ApiResponse.success("Password changed successfully");
    response.send(res);
  });

  updateAvatar = Helpers.asyncHandler(async (req, res) => {
    if (!req.file) {
      const response = ApiResponse.badRequest("No image file provided");
      return response.send(res);
    }

    // Upload avatar
    const uploadedFile = await fileService.uploadImage(req.file, "avatar");

    // Update user avatar in database
    const user = await authService.updateAvatar(req.user.id, uploadedFile.path);

    const response = ApiResponse.success("Avatar updated successfully", {
      user,
    });
    response.send(res);
  });

  logout = Helpers.asyncHandler(async (req, res) => {
    // JWT is stateless, so we just respond success
    // In a real application, you might want to implement token blacklisting

    const response = ApiResponse.success("Logged out successfully");
    response.send(res);
  });

  // Admin only: Impersonate user (for support purposes)
  adminImpersonate = Helpers.asyncHandler(async (req, res) => {
    const { userId } = req.body;

    // In a real application, this would generate a special token
    // For now, we'll just return the user info

    const user = await authService.getProfile(userId);

    const response = ApiResponse.success("Impersonation token generated", {
      user,
    });
    response.send(res);
  });
}

module.exports = new AuthController();
