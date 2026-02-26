const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    try {
      // Zod validation
      const result = schema.safeParse(req[property]);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      // Replace with validated values
      req[property] = result.data;
      next();
    } catch (err) {
      console.error("Validation middleware error:", err);
      next(err);
    }
  };
};

module.exports = { validateRequest };
