"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (username !== process.env.ADMIN_USERNAME) {
        return res.status(401).json({ error: "Invalid username" });
    }
    const match = await bcrypt_1.default.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!match) {
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
