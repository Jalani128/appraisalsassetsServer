import express from "express";
import * as settings from "../controllers/settings.controller.js";
import {
  adminAuth,
  requireFullAccess,
  requirePermission,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", adminAuth, requirePermission("settings"), settings.getSettings);
router.put("/", adminAuth, requirePermission("settings"), settings.updateSettings);

router.get(
  "/admins",
  adminAuth,
  requirePermission("settings"),
  settings.getAdminAccounts,
);
router.post(
  "/admins",
  adminAuth,
  requireFullAccess,
  settings.createAdminAccount,
);
router.patch(
  "/admins/:id",
  adminAuth,
  requireFullAccess,
  settings.updateAdminAccess,
);
router.delete(
  "/admins/:id",
  adminAuth,
  requireFullAccess,
  settings.deleteAdminAccount,
);

export default router;
