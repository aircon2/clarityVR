const { ElevenLabsClient } = require("elevenlabs");
const fs = require("fs");
require("dotenv").config();

const elevenlabs = new ElevenLabsClient();

async function transcribe(localWavPath) {
    const audioBuffer = fs.readFileSync(localWavPath);
    const audioBlob = new Blob([audioBuffer], { type: "audio/wav" });

    const transcription = await elevenlabs.speechToText.convert({
        file: audioBlob,
        modelId: "scribe_v1",
        tagAudioEvents: true,
        languageCode: "eng",
        diarize: false,
    });

    return { text: transcription.text };
}

module.exports = { transcribe };