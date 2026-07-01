"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileStorage_1 = require("../utils/fileStorage");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.json((0, fileStorage_1.readTable)());
});
router.post("/", auth_1.requireAuth, (req, res) => {
    const table = (0, fileStorage_1.readTable)();
    const newRow = {
        id: Date.now(),
        ...req.body
    };
    table.push(newRow);
    (0, fileStorage_1.writeTable)(table);
    res.json(newRow);
});
router.put("/:id", auth_1.requireAuth, (req, res) => {
    let table = (0, fileStorage_1.readTable)();
    table = table.map((row) => row.id == req.params.id ? { ...row, ...req.body } : row);
    (0, fileStorage_1.writeTable)(table);
    res.json({ success: true });
});
router.delete("/:id", auth_1.requireAuth, (req, res) => {
    let table = (0, fileStorage_1.readTable)();
    table = table.filter((r) => r.id != req.params.id);
    (0, fileStorage_1.writeTable)(table);
    res.json({ success: true });
});
exports.default = router;
