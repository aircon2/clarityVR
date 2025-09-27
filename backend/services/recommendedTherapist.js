import OpenAI from "openai";
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function recommendTherapists(therapistList) {
  try {
    console.log("📨 Sending therapist list to OpenAI:", therapistList);

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      input: `Here is a list of therapists with their ratings and addresses:\n\n${JSON.stringify(
            therapistList,
            null,
            2
          )}\n\nPlease pick the best 5 recommendations, prioritizing higher ratings and closer locations. Return them in a clean JSON array with fields: name, rating, address.`,
       
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