import app from "../app.js";
import connectDB from "../src/config/db.js";

// Connect to database on startup (serverless function)
connectDB().catch((err) => {
  console.error("Database connection failed:", err.message);
});

// Export the Express app for Vercel serverless
export default app;
