import OpenAI from "openai";
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function recommendTherapists(therapistList, patientKeywords) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. 
          Return recommendations in **two parts**:
          1. A JSON array of top 5 therapist objects (fields: name, clinicName, rating, address, matchedWords).
          2. A short human-readable summary string (max 50 words) describing the top therapists.`
        },
        {
          role: "user",
          content: `
            Patient keywords/needs: ${JSON.stringify(patientKeywords)}
            Therapists data: ${JSON.stringify(therapistList)}

            Output format (important!):

            {
              "recommendations": [
                {
                  "name": "string",
                  "clinicName": "string",
                  "rating": number,
                  "address": "string",
                  "matchedWords": "string"
                }
              ],
              "summary": "string"
            }
          `
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }, // Forces valid JSON
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    return parsed; // { recommendations: [...], summary: "..." }

  } catch (err) {
    console.error("Error generating therapist recommendations:", err);
    throw err;
  }
}