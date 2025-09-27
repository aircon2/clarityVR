import express from "express";
import 'dotenv/config';
import { chatGPT } from "./services/chat.js"; // adjust path

const app = express();
app.use(express.json()); // parse JSON body
const PORT = 3001;

app.post("/chat", async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: "userMessage is required" });
    }

    const response = await chatGPT(userMessage);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));