import express from "express";
import * as testimonial from "../controllers/testimonial.controller.js";
import { adminAuth, requirePermission } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Public routes
router.get("/", testimonial.getTestimonials);
router.get("/:id", testimonial.getTestimonial);

// Admin only routes
router.post(
  "/",
  adminAuth,
  requirePermission("testimonials"),
  upload.single("clientImage"),
  testimonial.createTestimonial,
);
router.put(
  "/:id",
  adminAuth,
  requirePermission("testimonials"),
  upload.single("clientImage"),
  testimonial.updateTestimonial,
);
router.delete(
  "/:id",
  adminAuth,
  requirePermission("testimonials"),
  testimonial.deleteTestimonial,
);

// Toggle endpoints
router.patch(
  "/:id/toggle-status",
  adminAuth,
  requirePermission("testimonials"),
  testimonial.toggleTestimonialStatus,
);
router.patch(
  "/:id/toggle-featured",
  adminAuth,
  requirePermission("testimonials"),
  testimonial.toggleFeaturedStatus,
);

export default router;
