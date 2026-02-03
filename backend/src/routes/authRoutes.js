const express = require("express");
const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

// Register route (placeholder)
router.post("/register", (req, res) => {
  // Will implement later
  res.json({ message: "Registration endpoint" });
});

module.exports = router;
