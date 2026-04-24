import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Admin from "../models/Admin.js";

// Only initialize Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;

        let admin = await Admin.findOne({ email });

        if (!admin) {
          return done(null, false); // block unknown emails
        }

        if (admin.authProvider !== "google") {
          admin.authProvider = "google";
          admin.isEmailVerified = true;
          await admin.save();
        }

        done(null, admin);
      },
    ),
  );

  console.log("Google OAuth strategy initialized");
} else {
  console.log(
    "Google OAuth credentials not provided - skipping Google OAuth initialization",
  );
}
