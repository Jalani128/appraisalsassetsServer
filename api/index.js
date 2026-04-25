import app from "../app.js";
import connectDB from "../src/config/db.js";

// Connect to database on startup (serverless function)
const dbConnected = connectDB().catch((err) => {
  console.error("Database connection failed:", err.message);
  // Don't throw, just log - middleware will handle unavailable DB
  return Promise.reject(err); // Keep as rejected promise
});

// Ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await dbConnected;
    next();
  } catch (error) {
    console.error("Database unavailable:", error.message);
    res.status(503).json({
      success: false,
      message: "Service unavailable: database connection failed.",
    });
  }
});

// Export the Express app for Vercel serverless
export default app;
