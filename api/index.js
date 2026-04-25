export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,Origin,X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Test route
  if (req.url?.includes("/api/test")) {
    return res.status(200).json({ success: true, message: "Handler working!" });
  }

  try {
    const { default: connectDB } = await import("../src/config/db.js");
    const { default: app } = await import("../app.js");
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("CRASH:", err.message, err.stack);
    return res.status(500).json({ success: false, message: err.message });
  }
}