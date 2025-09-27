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
          content: "You are a helpful assistant that outputs valid JSON only. Do not include any text outside JSON."
        },
        {
          role: "user",
          content: `Patient keywords/needs: ${JSON.stringify(patientKeywords, null, 2)}
          
          Therapists data (each has name, rating, address, reviews, and types): 
        ${JSON.stringify(therapistList, null, 2)}

        Instructions:
        - Use therapist reviews to extract specialties or strengths.
        - Use therapist types to help match patient needs.
        - Prioritize higher rating and closer location.
        - Return **top 5 therapists** that best match the patient.
        - Only return JSON array with keys: name, rating, address, matched words/specialties/strenghts.

        Example:
        [
        {
            "name": "Therapist Name",
            "rating": 4.9,
            "address": "123 Main St"
            "matched words:" "marriage resolution, stress, depression"
        },
        ...
        ]`
        }
      ],
       
      temperature: 0.3,
    });

    

  
    const raw = completion.choices[0].message.content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();


    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse patient keywords:", err, raw);
    return { keywords: [], therapyType: "general" };
  }
}