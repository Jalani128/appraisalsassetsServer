import mongoose from "mongoose";
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Increase from default 10000ms to 30000ms
      socketTimeoutMS: 45000,
      retryWrites: true,
      directConnection: false
    });
    console.log("Database Connected");
  } catch (error) {
    console.log("Error in connection:", error);
  }
};
export default connectDB;