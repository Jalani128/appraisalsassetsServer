import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Generate Access Token
export const generateAccessToken = (admin, options = {}) => {
  const expiresIn =
    options.expiresIn || process.env.JWT_ACCESS_SECRET_EXPIRY || "15m";
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn },
  );
};

// Generate Refresh Token
export const generateRefreshToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRY },
  );
};
