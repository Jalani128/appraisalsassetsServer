import express from "express";
import * as subscriber from "../controllers/subscriber.controller.js";
import { adminAuth, requirePermission } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/subscribe", subscriber.subscribe);
router.post("/unsubscribe", subscriber.unsubscribe);

// Admin routes
router.get("/", adminAuth, requirePermission("users"), subscriber.getSubscribers);
router.get("/:id", adminAuth, requirePermission("users"), subscriber.getSubscriber);
router.post("/", adminAuth, requirePermission("users"), subscriber.createSubscriber);
router.put("/:id", adminAuth, requirePermission("users"), subscriber.updateSubscriber);
router.delete("/:id", adminAuth, requirePermission("users"), subscriber.deleteSubscriber);
router.patch(
  "/:id/toggle-status",
  adminAuth,
  requirePermission("users"),
  subscriber.toggleStatus,
);

export default router;
