// controllers/adminSettingsController.js
import Settings from "../models/Settings.js";
import AdminLog from "../models/AdminLog.js";

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}

export async function getSettings(req, res) {
  const settings = await getOrCreateSettings();
  res.json(settings);
}

export async function updateSettings(req, res) {
  const updates = req.body;
  const settings = await getOrCreateSettings();

  Object.assign(settings, updates);
  await settings.save();

  await AdminLog.create({
    admin: req.session.admin.username,
    action: "updated settings",
    ip: req.ip
  });

  res.json({ success: true });
}