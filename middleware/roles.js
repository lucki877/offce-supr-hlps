// middleware/roles.js
const ROLE_LEVEL = {
  viewer: 1,
  admin: 2,
  superadmin: 3
};

export function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.session.admin) {
      return res.redirect("/admin/login");
    }
    const currentRole = req.session.admin.role;
    if (ROLE_LEVEL[currentRole] < ROLE_LEVEL[minRole]) {
      return res.status(403).send("Access denied");
    }
    next();
  };
}