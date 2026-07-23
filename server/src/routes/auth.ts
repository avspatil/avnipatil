import { Router } from "express";
import crypto from "crypto";
import { getSql } from "../utils/db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({ authenticated: true });
});

router.post("/login", async (req: any, res) => {
  const { username, passwordHash } = req.body;
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedHash = process.env.ADMIN_PASSWORD_HASH || "3724cc3ec590b6bace45c87db054f85e80c409234f5f1a2ccdd55204a9767b85";

  if (username !== expectedUsername) {
    return res.status(401).json({ error: "Invalid username" });
  }

  if (passwordHash !== expectedHash) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  await getSql`INSERT INTO auth_tokens (token) VALUES (${token})`;

  res.json({ token });
});

router.post("/logout", requireAuth, async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    await getSql`DELETE FROM auth_tokens WHERE token = ${token}`;
  }
  res.json({ message: "Logged out" });
});

export default router;
