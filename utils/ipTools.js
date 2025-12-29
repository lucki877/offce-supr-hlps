// utils/ipTools.js
export function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.ip ||
    ""
  );
}