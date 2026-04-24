import Admin from "../models/Admin.js";
import AppSettings from "../models/AppSettings.js";
import { hashPassword } from "../utils/hash.js";
import {
  FULL_ACCESS_PERMISSIONS,
  LIMITED_DEFAULT_PERMISSIONS,
  PERMISSION_KEYS,
} from "../constants/permissions.js";

async function getOrCreateSettings() {
  let settings = await AppSettings.findOne({ singletonKey: "default" });
  if (!settings) {
    settings = await AppSettings.create({ singletonKey: "default" });
  }
  return settings;
}

function normalizePermissions(rawPermissions = {}) {
  return PERMISSION_KEYS.reduce((acc, key) => {
    acc[key] = Boolean(rawPermissions[key]);
    return acc;
  }, {});
}

export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const { general = {}, security = {} } = req.body;

    settings.general = {
      ...settings.general,
      ...general,
    };
    settings.security = {
      ...settings.security,
      ...security,
    };
    settings.updatedBy = req.admin._id;
    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

export const getAdminAccounts = async (req, res) => {
  try {
    const admins = await Admin.find({})
      .select("-password -refreshToken -otp -otpExpiresAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin accounts",
      error: error.message,
    });
  }
};

export const createAdminAccount = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    if (!settings.security.allowNewAdminCreation) {
      return res.status(403).json({
        success: false,
        message: "New admin creation is disabled in settings",
      });
    }

    const { name, email, password, accessLevel = "limited", permissions = {} } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email, and password are required",
      });
    }

    const exists = await Admin.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    const hashedPassword = await hashPassword(password);
    const finalPermissions =
      accessLevel === "full"
        ? FULL_ACCESS_PERMISSIONS
        : {
            ...LIMITED_DEFAULT_PERMISSIONS,
            ...normalizePermissions(permissions),
          };

    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isEmailVerified: true,
      authProvider: "local",
      role: "admin",
      accessLevel,
      permissions: finalPermissions,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        accessLevel: admin.accessLevel,
        permissions: admin.permissions,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create admin account",
      error: error.message,
    });
  }
};

export const updateAdminAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, accessLevel, permissions = {}, isActive } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (name !== undefined) admin.name = name;
    if (accessLevel !== undefined) {
      admin.accessLevel = accessLevel;
      admin.permissions =
        accessLevel === "full"
          ? FULL_ACCESS_PERMISSIONS
          : {
              ...LIMITED_DEFAULT_PERMISSIONS,
              ...normalizePermissions(permissions),
            };
    } else if (admin.accessLevel === "limited" && permissions) {
      admin.permissions = {
        ...LIMITED_DEFAULT_PERMISSIONS,
        ...normalizePermissions(permissions),
      };
    }

    if (isActive !== undefined) {
      if (String(req.admin._id) === String(admin._id) && !isActive) {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate your own account",
        });
      }
      admin.isActive = Boolean(isActive);
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin account updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        accessLevel: admin.accessLevel,
        permissions: admin.permissions,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update admin account",
      error: error.message,
    });
  }
};

export const deleteAdminAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.admin._id) === String(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const fullAdminCount = await Admin.countDocuments({ accessLevel: "full" });
    if (admin.accessLevel === "full" && fullAdminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "At least one full-access admin must remain",
      });
    }

    await Admin.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Admin account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete admin account",
      error: error.message,
    });
  }
};
