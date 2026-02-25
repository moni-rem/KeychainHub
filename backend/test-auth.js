const jwt = require("jsonwebtoken");
require("dotenv").config();

console.log("=== JWT SECRET TEST ===");
console.log(
  "JWT_SECRET from process.env:",
  process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing",
);
console.log("JWT_SECRET value:", process.env.JWT_SECRET);
console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);

// Your token from login
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFjMmZkNDVjLWU4ZWYtNDcwOC04YTFiLTYyNzQ1ZDU5MDE4ZSIsImlhdCI6MTc3MTkxNDI0MSwiZXhwIjoxNzcyNTE5MDQxfQ.sYsTqZdGhHwGAVUshxM8ukGOe_9kKbVmFcf7sOQfkIY";

console.log("\n=== TOKEN VERIFICATION ===");
console.log("Token (first 20 chars):", token.substring(0, 20) + "...");

try {
  // Try to verify with the secret from env
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("✅ Token verified successfully!");
  console.log("Decoded:", decoded);
} catch (error) {
  console.log("❌ Verification failed with env secret:", error.message);

  // Try without quotes (in case quotes are in the secret)
  try {
    const secretWithoutQuotes = process.env.JWT_SECRET.replace(/"/g, "");
    console.log(
      "\nTrying without quotes:",
      secretWithoutQuotes.substring(0, 10) + "...",
    );
    const decoded = jwt.verify(token, secretWithoutQuotes);
    console.log("✅ Token verified without quotes!");
    console.log("Decoded:", decoded);
  } catch (error2) {
    console.log("❌ Still failed:", error2.message);
  }

  // Try with ADMIN_JWT_SECRET
  try {
    console.log("\nTrying with ADMIN_JWT_SECRET...");
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    console.log("✅ Token verified with ADMIN_JWT_SECRET!");
    console.log("Decoded:", decoded);
  } catch (error3) {
    console.log("❌ Failed with ADMIN_JWT_SECRET:", error3.message);
  }
}

// Try to decode without verification to see payload
const decoded = jwt.decode(token);
console.log("\n=== DECODED WITHOUT VERIFICATION ===");
console.log("Decoded payload:", decoded);
