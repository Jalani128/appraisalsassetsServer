export default async function handler(req, res) {
  const allowedOrigins = [
    "https://appraisalsassets-client-delta.vercel.app",
    "https://www.assetsappraisals.com",
    "https://assetsappraisals.com",
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  const origin = req.headers.origin;
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,Origin,X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { default: connectDB } = await import("../src/config/db.js");
    const { default: app } = await import("../app.js");
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("CRASH:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}