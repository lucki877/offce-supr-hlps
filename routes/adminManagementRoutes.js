// routes/adminManagementRoutes.js
import { Router } from "express";
import { listAdmins, addAdmin, removeAdmin } from "../controllers/adminManagementController.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

router.get("/api/admins", requireRole("superadmin"), listAdmins);
router.post("/api/admins/add", requireRole("superadmin"), addAdmin);
router.post("/api/admins/remove", requireRole("superadmin"), removeAdmin);

export default router;