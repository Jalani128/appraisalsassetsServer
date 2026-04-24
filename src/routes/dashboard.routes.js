import express from "express";
import * as dashboard from "../controllers/dashboard.controller.js";
import { adminAuth, requirePermission } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get dashboard statistics
router.get("/stats", adminAuth, requirePermission("dashboard"), dashboard.getDashboardStats);

// Get recent properties
router.get(
  "/recent-properties",
  adminAuth,
  requirePermission("dashboard"),
  dashboard.getRecentProperties,
);

// Get recent inquiries
router.get(
  "/recent-inquiries",
  adminAuth,
  requirePermission("dashboard"),
  dashboard.getRecentInquiries,
);

export default router;
