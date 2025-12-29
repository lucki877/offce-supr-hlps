// routes/adminSettingsRoutes.js
import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/adminSettingsController.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

router.get("/api/settings", requireRole("admin"), getSettings);
router.post("/api/settings/update", requireRole("superadmin"), updateSettings);

export default router;