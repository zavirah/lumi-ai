import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================
   ASK LUMI - TEXT
========================= */

app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Please enter a question.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are LumiAI, a friendly educational AI assistant.

Answer the student's question clearly and simply.
Use examples when helpful.
Keep the explanation appropriate for a student.

Student's question:
${question}`,
    });

    res.json({
      answer: response.text,
    });
  } catch (error) {
    console.error("Gemini text error:", error);

    res.status(500).json({
      error: "LumiAI could not generate a response. Please try again.",
    });
  }
});

/* =========================
   GENERATE LUMI IMAGE
   POLLINATIONS
========================= */

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter an image prompt.",
      });
    }

    console.log("Generating Lumi image with Pollinations...");

    const imageUrl =
      `https://gen.pollinations.ai/image/${encodeURIComponent(
        prompt.trim()
      )}?model=flux`;

    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Pollinations image error:",
        response.status,
        errorText
      );

      return res.status(response.status).json({
        error: "Pollinations could not generate the image.",
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    res.json({
      image: `data:image/jpeg;base64,${base64Image}`,
    });
  } catch (error) {
    console.error("Pollinations image error:", error);

    res.status(500).json({
      error: "Lumi could not generate the image. Please try again.",
    });
  }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `LumiAI API server running on http://localhost:${PORT}`
  );
});