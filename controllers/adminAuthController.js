// controllers/adminAuthController.js
import Admin from "../models/Admin.js";
import AdminLog from "../models/AdminLog.js";
import { hashPassword, comparePassword } from "../utils/passwordHash.js";

export async function showLoginPage(req, res) {
  res.sendFile("admin-login.html", { root: "public" });
}

export async function loginAdmin(req, res) {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) return res.redirect("/admin/login?error=1");

  const match = await comparePassword(password, admin.password);
  if (!match) return res.redirect("/admin/login?error=1");

  req.session.admin = {
    username: admin.username,
    role: admin.role
  };

  await AdminLog.create({
    admin: admin.username,
    action: "login",
    ip: req.ip
  });

  res.redirect("/admin/dashboard");
}

export async function logoutAdmin(req, res) {
  if (req.session?.admin) {
    await AdminLog.create({
      admin: req.session.admin.username,
      action: "logout",
      ip: req.ip
    });
  }
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
}

export async function ensureInitialSuperadmin() {
  const count = await Admin.countDocuments();
  if (count === 0) {
    const defaultUser = process.env.ADMIN_USERNAME || "admin";
    const defaultPass = process.env.ADMIN_PASSWORD || "admin123";
    const hashed = await hashPassword(defaultPass);
    await Admin.create({
      username: defaultUser,
      password: hashed,
      role: "superadmin"
    });
    console.log(`✅ Initial superadmin created: ${defaultUser}/${defaultPass}`);
  }
}