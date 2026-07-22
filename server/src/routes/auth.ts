import { Router } from "express";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({ authenticated: true });
});

router.post("/login", async (req: any, res) => {
  const { username, passwordHash } = req.body;

  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ error: "Invalid username" });
  }

  if (passwordHash !== process.env.ADMIN_PASSWORD_HASH) {
    return res.status(401).json({ error: "Invalid password" });
  }

  req.session.user = "admin";

  res.json({ message: "Logged in" });
});

router.post("/logout", (req: any, res) => {
  req.session.destroy(() => {});
  res.json({ message: "Logged out" });
});

export default router;
