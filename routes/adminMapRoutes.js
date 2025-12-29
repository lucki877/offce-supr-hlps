// routes/adminMapRoutes.js
import { Router } from "express";
import { getMapData } from "../controllers/adminMapController.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

router.get("/api/map", requireRole("admin"), getMapData);

export default router;