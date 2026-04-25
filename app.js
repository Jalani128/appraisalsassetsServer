import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
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
import { createAdminIfNotExists } from "./src/scripts/setupAdmin.js";

const app = express();

// Passport middleware
app.use(passport.initialize());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const FRONTEND_URL = process.env.FRONTEND_URL;

const allowedOrigins = [
  "https://appraisalsassets-client-delta.vercel.app",
  "https://www.assetsappraisals.com",
  "https://assetsappraisals.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
].filter(Boolean);

const corsOptions = {
  origin: true, // 
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight with same origin policy

connectDB().then(() => {
  createAdminIfNotExists();
}).catch((err) => {
  console.error("DB connection failed:", err.message);
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

app.listen(4001,()=>{
  console.log("Server is running on port 4001");
})

export default app;
