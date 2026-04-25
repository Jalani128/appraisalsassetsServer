import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import { fileURLToPath } from "url";
import "./src/config/google.js";
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

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.get("/", (req, res) => res.status(200).json({ success: true, message: "API is working" }));
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

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    success: false, 
    message: err.message || "Internal Server Error" 
  });
});

// Local development
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  const PORT = process.env.PORT || 4001;
  connectDB().then(() => 
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  );
}

export default app;