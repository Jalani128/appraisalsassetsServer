import express from "express";
import * as auth from "../controllers/auth.controller.js";
import passport from "passport";
import AppSettings from "../models/AppSettings.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

const router = express.Router();

// Helper for cookie options - Ensures no crash if env variables are missing
const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax", // 'strict' is safer for auth
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

// Helper for Token Expiry - Fixed potential crash if DB is not ready
const getAccessTokenExpiry = async () => {
  try {
    const settings = await AppSettings.findOne({ singletonKey: "default" })
      .select("security.sessionTimeoutMinutes")
      .lean(); // .lean() improves performance and prevents hydration errors

    const timeoutMinutes = settings?.security?.sessionTimeoutMinutes;
    if (
      timeoutMinutes &&
      Number.isFinite(Number(timeoutMinutes)) &&
      timeoutMinutes >= 5 &&
      timeoutMinutes <= 1440
    ) {
      return `${timeoutMinutes}m`;
    }
  } catch (error) {
    console.error("DB Error in getAccessTokenExpiry:", error.message);
  }
  return process.env.JWT_ACCESS_SECRET_EXPIRY || "15m";
};

// --- AUTH ROUTES ---

// 1. Fixed Signup Logic
router.post("/signup", (req, res) => {
  console.warn("Blocked signup attempt from IP:", req.ip);
  return res.status(403).json({
    success: false,
    message: "Registration is currently disabled. Contact the system administrator.",
  });
});

// 2. Public Login & Recovery
router.post("/login", auth.login);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);

// 3. Protected Actions
router.post("/verify-email", auth.verifyEmail);
router.post("/logout", auth.logout);
router.post("/refresh-token", auth.refreshToken);
router.get("/verify-token", auth.verifyToken);

// 4. Google OAuth with added Error Handling
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["email", "profile"] }),
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: '/admin/auth/signin' }),
    async (req, res) => {
      try {
        const admin = req.user;
        if (!admin) throw new Error("OAuth Authentication Failed");

        const accessTokenExpiry = await getAccessTokenExpiry();
        const accessToken = generateAccessToken(admin, {
          expiresIn: accessTokenExpiry,
        });
        const refreshToken = generateRefreshToken(admin);

        admin.refreshToken = refreshToken;
        await admin.save();

        res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

        // Ensure FRONTEND_URL is set or fallback to origin
        const redirectUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/admin` : "/admin";
        res.redirect(redirectUrl);
      } catch (error) {
        console.error("OAuth Callback Crash:", error);
        res.status(500).send("Authentication Server Error");
      }
    },
  );
}

export default router;
