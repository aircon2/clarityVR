import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';
import 'dotenv/config';

async function synthesizeSpeech(text) {
  const elevenlabs = new ElevenLabsClient();
  const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
    text: `${text}`,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  await play(audio);
  return audio;
}
}


await play(audio);

