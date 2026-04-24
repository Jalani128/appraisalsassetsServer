import express from "express";
import * as blog from "../controllers/blog.controller.js";
import { adminAuth, requirePermission } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Public routes
router.get("/", blog.getBlogPosts);
router.get("/:id", blog.getBlogPost);

// Admin only routes
router.post(
  "/",
  adminAuth,
  requirePermission("blog"),
  upload.single("featuredImage"),
  blog.createBlogPost,
);
router.put(
  "/:id",
  adminAuth,
  requirePermission("blog"),
  upload.single("featuredImage"),
  blog.updateBlogPost,
);
router.delete("/:id", adminAuth, requirePermission("blog"), blog.deleteBlogPost);

// Toggle endpoints
router.patch(
  "/:id/toggle-status",
  adminAuth,
  requirePermission("blog"),
  blog.toggleBlogPostStatus,
);
router.patch(
  "/:id/toggle-featured",
  adminAuth,
  requirePermission("blog"),
  blog.toggleFeatured,
);

export default router;
