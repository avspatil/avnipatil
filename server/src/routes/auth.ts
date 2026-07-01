import { Router } from "express";
import bcrypt from "bcrypt";

const router = Router();

router.post("/login", async (req: any, res) => {
  const { username, password } = req.body;

  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ error: "Invalid username" });
  }

  const match = await bcrypt.compare(
    password,
    process.env.ADMIN_PASSWORD_HASH!
  );

  if (!match) {
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