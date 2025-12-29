// routes/adminAuthRoutes.js
import { Router } from "express";
import {
  showLoginPage,
  loginAdmin,
  logoutAdmin
} from "../controllers/adminAuthController.js";

const router = Router();

router.get("/login", showLoginPage);
router.post("/login", loginAdmin);
router.get("/logout", logoutAdmin);

export default router;