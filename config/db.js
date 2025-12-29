// config/db.js
import mongoose from "mongoose";

export async function connectDB(mongoUri) {
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  }
}