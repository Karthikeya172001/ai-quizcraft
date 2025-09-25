import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
app.use(bodyParser.json());

// ✅ Use the key from GitHub Secrets / environment
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => res.send("AI QuizCraft backend running!"));

app.post("/quiz", async (req, res) => {
  const { notes, difficulty } = req.body;

  if (!notes || !difficulty) {
    return res.status(400).json({ error: "Notes and difficulty are required" });
  }

  try {
    const prompt = `Create 3 multiple-choice questions from these notes:\n\n${notes}\nDifficulty: ${difficulty}\nReturn JSON like [{"question":"..","options":[".."],"answer":0}]`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const quiz = JSON.parse(response.choices[0].message.content);
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
