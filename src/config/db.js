import mongoose from "mongoose";
import { createAdminIfNotExists } from "../scripts/setupAdmin.js";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    console.log(`MongoDB connected`);

    if (mongoose.connection.readyState === 1) {
      const coll = mongoose.connection.collection("properties");
      try {
        const indexes = await coll.indexes();
        const contactKeys = ["phone", "whatsAppNumber", "email", "contactEmail"];
        for (const idx of indexes) {
          const isContactIndex =
            idx.unique &&
            idx.key &&
            Object.keys(idx.key).some((k) => contactKeys.includes(k));
          if (isContactIndex) {
            await coll.dropIndex(idx.name);
            console.log(`Dropped unique index ${idx.name} on properties`);
          }
        }
      } catch (e) {}

      try {
        await createAdminIfNotExists();
      } catch (e) {
        // Don't crash if admin setup fails
      }
    }
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    if (error.message.includes("Atlas")) {
      console.error(
        "Ensure your IP is whitelisted in MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/",
      );
    }
    throw error;
  }
};

export default connectDB;

