class ApiResponse {
  constructor(success, message, data = null, statusCode = 200) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  static success(message, data = null, statusCode = 200) {
    return new ApiResponse(true, message, data, statusCode);
  }

  static error(message, statusCode = 400, errors = null) {
    const response = new ApiResponse(false, message, null, statusCode);
    if (errors) {
      response.errors = errors;
    }
    return response;
  }

  static created(message, data = null) {
    return new ApiResponse(true, message, data, 201);
  }

  static notFound(message = "Resource not found") {
    return new ApiResponse(false, message, null, 404);
  }

  static unauthorized(message = "Unauthorized access") {
    return new ApiResponse(false, message, null, 401);
  }

  static forbidden(message = "Forbidden access") {
    return new ApiResponse(false, message, null, 403);
  }

  static badRequest(message = "Bad request") {
    return new ApiResponse(false, message, null, 400);
  }

  static internalError(message = "Internal server error") {
    return new ApiResponse(false, message, null, 500);
  }

  // Convert to JSON for response
  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };
  }

  // Send response directly
  send(res) {
    return res.status(this.statusCode).json(this.toJSON());
  }
}

module.exports = ApiResponse;
