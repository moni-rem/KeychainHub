const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      // Zod validation
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Query validation error",
          errors,
        });
      }

      // Replace with validated values
      req.query = result.data;
      next();
    } catch (err) {
      console.error("Validation middleware error:", err);
      next(err);
    }
  };
};

module.exports = { validateQuery };
