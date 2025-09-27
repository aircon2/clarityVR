const { ElevenLabsClient } = require("elevenlabs");
require("dotenv").config();

async function synthesizeSpeech(text) {
  const elevenlabs = new ElevenLabsClient();
  const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
    text: `${text}`,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  return audio;
}

module.exports = { synthesizeSpeech };