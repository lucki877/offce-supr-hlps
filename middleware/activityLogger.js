// middleware/activityLogger.js
import AdminLog from "../models/AdminLog.js";

export function logAction(action) {
  return async (req, res, next) => {
    try {
      if (req.session?.admin) {
        await AdminLog.create({
          admin: req.session.admin.username,
          action,
          ip: req.ip
        });
      }
    } catch (e) {
      console.error("Admin log error:", e.message);
    }
    next();
  };
}