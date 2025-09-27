import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
const elevenlabs = new ElevenLabsClient();

async function transcribe(localWavPath) {
    const response = await fetch(localWavPath);
    const audioBlob = new Blob([await response.arrayBuffer()], { type: "audio/wav" });
    const transcription = await elevenlabs.speechToText.convert({
        file: audioBlob,
        modelId: "scribe_v1",
        tagAudioEvents: true,
        languageCode: "eng",
        diarize: false,
    });

    return transcription;
}

module.exports = { transcribe };






