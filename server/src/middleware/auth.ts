import { Request, Response, NextFunction } from "express";
import { getSql } from "../utils/db";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const rows = await getSql`SELECT token FROM auth_tokens WHERE token = ${token}`;
    if (rows.length === 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  } catch {
    return res.status(500).json({ error: "Auth check failed" });
  }
}
