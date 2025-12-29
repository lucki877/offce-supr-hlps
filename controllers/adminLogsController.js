// controllers/adminLogsController.js
import AdminLog from "../models/AdminLog.js";

export async function getLogs(req, res) {
  const { limit = 200 } = req.query;
  const logs = await AdminLog.find()
    .sort({ time: -1 })
    .limit(parseInt(limit))
    .lean();
  res.json(logs);
}