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
          Return recommendations **only** as a JSON array of top 5 therapist objects.
          Each object should have these fields: name, clinicName, rating, address, matchedWords.
          **Do not include any summary or extra text.**
          **Important:** if the therapist name and clinic name are the same, disregard the clinicName entirely (leave it empty "").`
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
              ]
            }
          `
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    return parsed; // { recommendations: [...] }

  } catch (err) {
    console.error("Error generating therapist recommendations:", err);
    throw err;
  }
}