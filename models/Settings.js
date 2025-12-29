// models/Settings.js
import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  telegramEnabled: { type: Boolean, default: true },
  emailEnabled: { type: Boolean, default: true },
  autoRefresh: { type: Number, default: 10 },
  rateLimit: { type: Number, default: 20 },
  blockedIPs: [String],
  darkMode: { type: Boolean, default: false }
});

export default mongoose.model("Settings", SettingsSchema);