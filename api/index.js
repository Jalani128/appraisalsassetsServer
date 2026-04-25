// export default async function handler(req, res) {
  
//   // CORS sabse pehle
//   res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,Origin,X-Requested-With");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Vary", "Origin");

//   if (req.method === "OPTIONS") return res.status(200).end();

//   try {
//     // Dotenv andar load karo
//     const { default: dotenv } = await import("dotenv");
//     dotenv.config();
    
//     const { default: connectDB } = await import("../src/config/db.js");
//     const { default: app } = await import("../app.js");
    
//     await connectDB();
//     return app(req, res);
    
//   } catch (err) {
//     console.error("CRASH:", err.message, err.stack);
//     return res.status(500).json({ 
//       success: false, 
//       message: err.message,
//       stack: err.stack  // temporarily show stack
//     });
//   }
// }

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({ ok: true });
}