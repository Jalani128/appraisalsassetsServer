import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/google.js"; // Initialize Google strategy
import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import testimonialRoutes from "./routes/testimonial.routes.js";
import inquiryRoutes from "./routes/inquiry.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import contentRoutes from "./routes/content.routes.js";
import subscriberRoutes from "./routes/subscriber.routes.js";
import developerRoutes from "./routes/developer.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

const app = express();

// Passport middleware
app.use(passport.initialize());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const FRONTEND_URL = process.env.FRONTEND_URL;

const allowedOrigins = [
  FRONTEND_URL,
  "https://www.assetsappraisals.com",
  "https://assetsappraisals.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin.includes("localhost")) {
      return callback(null, true);
    }

    callback(new Error("CORS policy: Origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight with same origin policy

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "🚀API is working fine",
    time: new Date().toUTCString(),
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/developers", developerRoutes);
app.use("/api/settings", settingsRoutes);

export default app;
