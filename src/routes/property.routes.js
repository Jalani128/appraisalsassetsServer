import express from "express";
import * as property from "../controllers/property.controller.js";
import { adminAuth, requirePermission } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
  "/",
  adminAuth,
  requirePermission("properties"),
  upload.array("images"),
  property.createProperty,
);

router.get("/", property.getProperties);
router.get("/form-options", property.getPropertyFormOptions);

router.get("/:id", property.getProperty);

router.put(
  "/:id",
  adminAuth,
  requirePermission("properties"),
  upload.array("images"),
  property.updateProperty,
);

router.delete("/:id", adminAuth, requirePermission("properties"), property.deleteProperty);

export default router;
