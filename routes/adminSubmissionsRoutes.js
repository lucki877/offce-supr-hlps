// routes/adminSubmissionsRoutes.js
import { Router } from "express";
import { getSubmissions, exportSubmissionsCSV } from "../controllers/adminSubmissionsController.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

router.get("/api/submissions", requireRole("admin"), getSubmissions);
router.get("/export", requireRole("admin"), exportSubmissionsCSV);

export default router;