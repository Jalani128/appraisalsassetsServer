import express from "express";
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
} from "../controllers/inquiry.controller.js";
import { adminAuth, requirePermission } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/", createInquiry); // Submit inquiry from contact page

// Admin protected routes
router.get("/", adminAuth, requirePermission("inquiries"), getInquiries); // Get all inquiries
router.get("/:id", adminAuth, requirePermission("inquiries"), getInquiryById); // Get single inquiry
router.put("/:id", adminAuth, requirePermission("inquiries"), updateInquiry); // Update inquiry
router.delete("/:id", adminAuth, requirePermission("inquiries"), deleteInquiry); // Delete inquiry

export default router;
