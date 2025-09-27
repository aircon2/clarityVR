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
          content: "You are a helpful assistant. Output therapist recommendations as a **human-readable string**, not JSON."
        },
        {
          role: "user",
          content: `
            Patient keywords/needs: ${JSON.stringify(patientKeywords)}
            Therapists data: ${JSON.stringify(therapistList)}

            Instructions:
            - Output like a human speaking.
            - Introduce each therapist with their name, clinic (if different), rating, and address.
            - Mention matched patient keywords.
            - Return the top 5 therapists in a single short paragraph.
            - shouldnt be longer than 50 words
            - explain the rating and the city its located in. 
            
            FORMAT EXAMPLE (NOT ACTUAL DATA DONT USE):
            "For someone feeling overwhelmed with work anxiety, sleep issues, and stress, consider these top therapists: Taryn Bush at Greenpoint Psychotherapy  who has a 4.8 rating located in Brooklyn, NY...)"

          `
        }
      ],
       
      temperature: 0.3,
    });

    

  
    const raw = completion.choices[0].message.content
      .replace(/```/g, "")
      .trim();

    return raw;

  } catch (err) {
    console.error("Failed to parse patient keywords:", err, raw);
    return { keywords: [], therapyType: "general" };
  }
}












