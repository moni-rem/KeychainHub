import express from "express";
import { getAdminStats, getAdminAnalytics } from "../controller/adminController";

const router = express.Router();

// DB-based endpoints
router.get("/stats", getAdminStats);
router.get("/analytics", getAdminAnalytics);

export default router;
