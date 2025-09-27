import OpenAI from "openai";
import 'dotenv/config';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractPatientKeywords(transcript) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o", 
    messages: [
      {
        role: "system",
        content: "You are an assistant that extracts relevant keywords from patient messages in order to match them with a therapist. Return JSON only."
      },
      {
        role: "user",
        content: `
Given the following conversation transcript:
${JSON.stringify(transcript, null, 2)}

Extract the patient's main concerns, therapy needs, and key descriptive words. Return as JSON:
{
  "keywords": ["...", "..."],
  "therapyType": "marriage/family/general/etc.",
} 
`
      }
    ],
    temperature: 0
  });

  const raw = completion.choices[0].message.content
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse patient keywords:", err);
    return { keywords: [], therapyType: "general"};
  }
}