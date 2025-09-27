require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const stt = require("./services/stt");
const chat = require("./services/chat");
const context = require("./services/context");

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

        // Transcribe step
        const result = await stt.transcribe(req.file.path);

        // Update Context
        context.addMessage("PATIENT", result.text);

        // get therapist stuff
        const therapistResponse = await chat.chatGPT(result.text);

        // Update Context
        context.addMessage("THERAPIST", therapistResponse.content);

        // Audio response step
        const audio = tts.synthesizeSpeech(therapistResponse.content);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audio.length
        });
        res.send(audio);

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
