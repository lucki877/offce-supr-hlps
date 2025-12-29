// routes/adminLogsRoutes.js
import { Router } from "express";
import { getLogs } from "../controllers/adminLogsController.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

router.get("/api/logs", requireRole("admin"), getLogs);

export default router;