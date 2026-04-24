import express from "express";
import * as content from "../controllers/content.controller.js";
import { adminAuth, requirePermission } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", content.getSiteContent);

// Admin only
router.put("/hero", adminAuth, requirePermission("content"), content.updateHero);
router.put("/about", adminAuth, requirePermission("content"), content.updateAbout);
router.put(
  "/contact",
  adminAuth,
  requirePermission("content"),
  content.updateContact,
);

export default router;
