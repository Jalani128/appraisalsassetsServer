import app from "../app.js";
import connectDB from "../src/config/db.js";

let isConnected = false;

export default async function handler(req, res) {
  
  // ✅ CORS SABSE PEHLE - kuch bhi crash ho, yeh headers zaroor jayenge
  const allowedOrigins = [
    "https://appraisalsassets-client-delta.vercel.app",
    "https://www.assetsappraisals.com",
    "https://assetsappraisals.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
  ];

  const origin = req.headers.origin;
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,Origin,X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");

  // ✅ OPTIONS preflight yahan khatam
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ DB connect (sirf ek baar)
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ success: false, message: "Database connection failed" });
    }
  }

  // ✅ Express app ko request do
  return app(req, res);
}