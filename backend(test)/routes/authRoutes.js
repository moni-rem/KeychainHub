import express from "express";
import { login } from "../controller/authController.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
// router.get("/admin", protect(["admin"]), (req, res) => {
//   res.json({ message: "Admin access granted" });
// });

export default router;
