require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const stt = require("./services/stt");
const chat = require("./services/chat");
const context = require("./services/context");
const tts = require("./services/tts");

const app = express();
app.use(express.json());

// Custom storage configuration for .wav files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "tmp"));
    },
    filename: function (req, file, cb) {
        // Generate unique filename with .wav extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + '.wav');
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        // Optional: Only accept audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    }
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

// TEST ENDPOINT: just transcription text
app.post("/api/test-stt", upload.single("audio"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file uploaded" });
        }

        // Call your ElevenLabs STT service
        const result = await stt.transcribe(req.file.path);

        // Return only the transcription text
        res.json({ text: result.text });

    } catch (err) {
        next(err);
    }
});

// GET context endpoint
app.get("/api/get-context", (req, res) => {
    try {
        const transcript = context.getTranscript();
        res.json({
            transcript: transcript,
            messageCount: transcript.length
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to get context", message: err.message });
    }
});

// UPDATE context endpoint (add message)
app.post("/api/post-context", (req, res) => {
    try {
        const { role, content } = req.body;

        context.addMessage(role, content);

        res.json({
            success: true,
            message: "Message added to context",
            transcript: context.getTranscript()
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to update context", message: err.message });
    }
});

// CLEAR context endpoint
app.delete("/api/clear-context", (req, res) => {
    try {
        context.clearTranscript();

        res.json({
            success: true,
            message: "Context cleared successfully",
            transcript: context.getTranscript() // Should return empty array
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to clear context", message: err.message });
    }
});

// TEST ENDPOINT: Chat service
app.get("/api/test-chat", async (req, res, next) => {
    try {

        const therapistResponse = await chat.chatGPT();

        res.json({
            success: true,
            contextLength: context.getTranscript().length,
            currentContext: context.getTranscript(),
            content: therapistResponse
        });

    } catch (err) {
        next(err);
    }
});

// TEST ENDPOINT: TTS service
app.post("/api/test-tts", async (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const audioBuffer = await tts.synthesizeSpeech(text);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length
        });
        res.send(audioBuffer);

    } catch (err) {
        next(err);
    }
});

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "internal_error", message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});
