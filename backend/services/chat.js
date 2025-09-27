const { OpenAI } = require("openai");
const { getTranscript } = require("./context");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function chatGPT(userMessage) {


    const messages = [
        ...getTranscript()
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
              role: "system",
              content: "You are a professional Therapist. Respond with care and validation. Return JSON only."
            },
            {
              role: "user",
              content: `
        Extract text from the following JSON transcripts of the conversation history and communicate with caring thoughtful responses to your client. 
        Try not to repeat previous responses and only respond to the most recent text prompt.
        
        Client Text content:
        ${messages}
        
        IMPORTANT: Let text responses be concise.
        IMPORTANT: Responses should offer care and emotional validation, additionally you can provide ways to help. 
        
        Extract text from transcript to read the history and return the response as a JSON array with this exact structure:
        [
          {
            "role": "assistant",
            "content": "therapistResponse"
          }
        ]
        
        If no transcript is found, return an empty array: []
              `
            }
          ],
        temperature: 0.7
    });

    const therapistResponse = response.choices[0].message.content.trim();


    return {
        role: "assistant",
        content: therapistResponse
    };
}

module.exports = { chatGPT };