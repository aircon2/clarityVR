import OpenAI from "openai";
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function recommendTherapists(therapistList) {
  try {
    


    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that outputs valid JSON only. Do not include any text outside JSON."
        },
        {
          role: "user",
          content: `Here is a list of therapists:\n${JSON.stringify(therapistList, null, 2)}
Pick the best 5 based on rating and location. Return them as a JSON array with keys: name, rating, address only. like this: [{
    "name": "Therapist Name",
    "rating": 4.9,
    "address": "123 Main St"
  },
  ...]`
        }
      ],
       
      temperature: 0.3,
    });

    console.log("📝 Raw OpenAI response:", completion.choices[0].message.content);

    const result = JSON.parse(completion.choices[0].message.content);

    console.log("✅ Parsed OpenAI recommendations:", result);

    return result.recommendations;
  } catch (err) {
    console.error(err);
    return null;
  }
}