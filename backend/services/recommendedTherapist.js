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
            content: `
          Patient keywords/needs: ${JSON.stringify(patientKeywords, null, 2)}
          
          Therapists data (each has therapistName, clinicName, rating, address, reviews, and types): 
          ${JSON.stringify(therapistList, null, 2)}
          
          Instructions:
          - Always include both therapistName and clinicName fields.
          - If therapistName and clinicName are the same, OMIT clinicName entirely from the output.
          - If clinicName contains therapistName (e.g. "Dr. Jane Doe, Clinical Psychologist"), remove the therapistName part and keep only the clinic/organization portion.
          - Use reviews to extract specialties or strengths.
          - Use types to help match patient needs.
          - Prioritize higher ratings and closer locations.
          - Return the **top 5 therapists** that best match the patient.
          - Output JSON array only with keys: therapistName, clinicName (optional), rating, address, matchedWords.
          
          Example:
          [
            {
              "therapistName": "Dr. Jane Doe",
              "clinicName": "Healthy Minds NYC",
              "rating": 4.9,
              "address": "123 Main St",
              "matchedWords": "stress, trauma, anxiety"
            },
            {
              "therapistName": "Noah Clyman",
              "rating": 5,
              "address": "225 W 35th St, New York, NY",
              "matchedWords": "stress, anxiety, personal challenges"
            }
          ]
          `
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


Message Angela Cheng - she/her









