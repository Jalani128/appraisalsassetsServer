import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";



export const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }
    if (admin.isActive === false) {
      return res.status(403).json({ message: "Admin account is inactive" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.admin.accessLevel !== "limited") {
      return next();
    }

    const hasPermission = Boolean(req.admin.permissions?.[permissionKey]);
    if (!hasPermission) {
      return res.status(403).json({
        message: `Forbidden: Missing ${permissionKey} permission`,
      });
    }

    return next();
  };
};

export const requireFullAccess = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.admin.accessLevel === "limited") {
    return res.status(403).json({ message: "Forbidden: Full access required" });
  }
  return next();
};
