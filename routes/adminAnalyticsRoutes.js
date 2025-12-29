// routes/adminAnalyticsRoutes.js
import { Router } from "express";
import { getAnalytics } from "../controllers/adminAnalyticsController.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

router.get("/api/analytics", requireRole("admin"), getAnalytics);

export default router;