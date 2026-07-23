"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/me", auth_1.requireAuth, (req, res) => {
    res.json({ authenticated: true });
});
router.post("/login", async (req, res) => {
    const { username, passwordHash } = req.body;
    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedHash = process.env.ADMIN_PASSWORD_HASH || "3724cc3ec590b6bace45c87db054f85e80c409234f5f1a2ccdd55204a9767b85";
    if (username !== expectedUsername) {
        return res.status(401).json({ error: "Invalid username" });
    }
    if (passwordHash !== expectedHash) {
        return res.status(401).json({ error: "Invalid password" });
    }
    req.session.user = "admin";
    res.json({ message: "Logged in" });
});
router.post("/logout", (req, res) => {
    req.session.destroy(() => { });
    res.json({ message: "Logged out" });
});
exports.default = router;
