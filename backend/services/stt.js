// services/stt.js
const { ElevenLabsClient } = require("elevenlabs");
const fs = require("fs");

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
});

async function transcribe(localWavPath) {
    try {
        // Use a ReadStream; safest for multipart in Node
        const fileStream = fs.createReadStream(localWavPath);

        const resp = await elevenlabs.speechToText.convert({
            file: fileStream,        // <-- stream, not Blob
            model_id: "scribe_v1",   // valid values: scribe_v1, scribe_v1_experimental
            language_code: "eng",
            tag_audio_events: true,
            diarize: false
        });

        // SDK returns an object; we only need text
        return { text: resp.text || "" };
    } catch (e) {
        // Log useful context so you can see the real cause
        console.error("ElevenLabs STT failed:", {
            status: e?.status,
            message: e?.message,
            body: e?.response?.data
        });
        // Re-throw so your error middleware returns 500
        throw e;
    }
}

module.exports = { transcribe };
