// models/AdminLog.js
import mongoose from "mongoose";

const AdminLogSchema = new mongoose.Schema({
  admin: String,
  action: String,
  ip: String,
  time: { type: Date, default: Date.now }
});

export default mongoose.model("AdminLog", AdminLogSchema);