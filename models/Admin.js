// models/Admin.js
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // hashed
  role: {
    type: String,
    enum: ["superadmin", "admin", "viewer"],
    default: "admin"
  }
});

export default mongoose.model("Admin", AdminSchema);