import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { fileURLToPath } from "url";
import "./src/config/google.js"; // Initialize Google strategy
import authRoutes from "./src/routes/auth.routes.js";
import propertyRoutes from "./src/routes/property.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import testimonialRoutes from "./src/routes/testimonial.routes.js";
import inquiryRoutes from "./src/routes/inquiry.routes.js";
import blogRoutes from "./src/routes/blog.routes.js";
import contentRoutes from "./src/routes/content.routes.js";
import subscriberRoutes from "./src/routes/subscriber.routes.js";
import developerRoutes from "./src/routes/developer.routes.js";
import settingsRoutes from "./src/routes/settings.routes.js";
import connectDB from "./src/config/db.js";

const app = express();

// CORS Configuration - Simple and explicit
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://appraisalsassets-client-delta.vercel.app",
    "https://www.assetsappraisals.com",
    "https://assetsappraisals.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ];

  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

// Passport middleware
app.use(passport.initialize());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database (non-blocking)
connectDB().catch(err => {
  console.error("Database connection failed:", err.message);
});

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

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
