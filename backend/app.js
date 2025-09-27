require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const stt = require("./services/stt");

const app = express();

const upload = multer({
    dest: path.join(__dirname, "tmp"),
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.post("/api/stt", upload.single("audio"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file uploaded" });
        }

        // Call your STT service (you’ll implement logic later)
        // It should return { text: "...", ... }
        const result = await stt.transcribe(req.file.path);

        res.json(result);
    } catch (err) {
        next(err);
    }
});

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "internal_error", message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});
