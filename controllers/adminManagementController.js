// controllers/adminManagementController.js
import Admin from "../models/Admin.js";
import AdminLog from "../models/AdminLog.js";
import { hashPassword } from "../utils/passwordHash.js";

export async function listAdmins(req, res) {
  const admins = await Admin.find({}, { password: 0 }).lean();
  res.json(admins);
}

export async function addAdmin(req, res) {
  const { username, password, role } = req.body;

  const existing = await Admin.findOne({ username });
  if (existing) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const hashed = await hashPassword(password);

  await Admin.create({
    username,
    password: hashed,
    role: role || "admin"
  });

  await AdminLog.create({
    admin: req.session.admin.username,
    action: `added admin ${username} (${role})`,
    ip: req.ip
  });

  res.json({ success: true });
}

export async function removeAdmin(req, res) {
  const { username } = req.body;

  if (username === req.session.admin.username) {
    return res.status(400).json({ error: "Cannot delete yourself" });
  }

  await Admin.deleteOne({ username });

  await AdminLog.create({
    admin: req.session.admin.username,
    action: `removed admin ${username}`,
    ip: req.ip
  });

  res.json({ success: true });
}