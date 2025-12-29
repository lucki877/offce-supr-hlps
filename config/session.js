// config/session.js
import session from "express-session";

export function createSessionMiddleware() {
  return session({
    secret: process.env.SESSION_SECRET || "",
    resave: false,
    saveUninitialized: true, // so every visitor gets a session
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    }
  });
}