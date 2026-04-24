import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();

const startServer = async () => {
  await connectDB();
  const startPort = parseInt(process.env.PORT) || 4001;

  const tryPort = (port) => {
    return new Promise((resolve, reject) => {
      const server = app.listen(port, () => {
        console.log(`Server is running on PORT:${port}`);
        resolve(server);
      });
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is in use, trying ${port + 1}...`);
          server.close();
          resolve(tryPort(port + 1));
        } else {
          reject(err);
        }
      });
    });
  };

  try {
    await tryPort(startPort);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
