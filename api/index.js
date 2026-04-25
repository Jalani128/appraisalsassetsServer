import app from "../app.js";
import connectDB from "../src/config/db.js";

// Connect to database once for Vercel serverless
connectDB().catch((err) => {
  console.error("Database connection failed:", err.message);
});

// Export the Express app for Vercel serverless
export default app;
