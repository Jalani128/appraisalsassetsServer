import mongoose from "mongoose";
import {
  FULL_ACCESS_PERMISSIONS,
  LIMITED_DEFAULT_PERMISSIONS,
  PERMISSION_KEYS,
} from "../constants/permissions.js";

const permissionSchema = new mongoose.Schema(
  PERMISSION_KEYS.reduce((acc, key) => {
    acc[key] = { type: Boolean, default: false };
    return acc;
  }, {}),
  { _id: false },
);

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    accessLevel: {
      type: String,
      enum: ["full", "limited"],
      default: "full",
      index: true,
    },
    permissions: {
      type: permissionSchema,
      default: () => FULL_ACCESS_PERMISSIONS,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // OTP (used for verify email & reset password)
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

adminSchema.pre("save", function () {
  if (!this.permissions) {
    this.permissions =
      this.accessLevel === "full"
        ? { ...FULL_ACCESS_PERMISSIONS }
        : { ...LIMITED_DEFAULT_PERMISSIONS };
  }

  if (this.accessLevel === "full") {
    this.permissions = { ...FULL_ACCESS_PERMISSIONS };
  } else {
    this.permissions = {
      ...LIMITED_DEFAULT_PERMISSIONS,
      ...this.permissions,
    };
  }
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
