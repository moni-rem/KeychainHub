const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const formatted = result.error.format();

      const flatErrors = Object.values(formatted)
        .flat()
        .filter(Boolean)
        .map((err) => err._errors)
        .flat();

      return res.status(400).json({ message: flatErrors.join(", ") });
    }

    // Update req.query with transformed values
    req.query = result.data;
    next();
  };
};

module.exports = { validateQuery };
