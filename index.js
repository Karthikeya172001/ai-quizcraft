// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple health check
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Quiz generation endpoint
app.post("/quiz", async (req, res) => {
  try {
    const { notes, difficulty } = req.body;

    if (!notes || !difficulty) {
      return res.status(400).json({ error: "Notes and difficulty are required" });
    }

    // Call OpenAI to generate quiz
    const prompt = `
Create a ${difficulty} multiple-choice quiz based on these notes:
${notes}

Format response as JSON array:
[
  { "question": "…", "options": ["…","…","…","…"], "answer": 0 },
  ...
]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const text = completion.choices[0].message.content;

    // Parse AI response as JSON
    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Quiz generation failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
