import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;;

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
========================= */

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter an image prompt.",
      });
    }

    console.log("Generating Lumi image...");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: `Create a clear educational image for a student.

${prompt}

Make it clean, accurate, visually helpful, and suitable for studying.`,
      config: {
        responseModalities: ["IMAGE"],
        responseFormat: {
          image: {
            aspectRatio: "16:9",
            imageSize: "1K",
          },
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];

    const imagePart = parts.find(
      (part) => part.inlineData?.data
    );

    if (!imagePart) {
      console.error("No image returned from Gemini.");

      return res.status(500).json({
        error: "Lumi did not return an image.",
      });
    }

    const { mimeType, data } = imagePart.inlineData;

    console.log("Lumi image generated successfully.");

    res.json({
      image: `data:${mimeType};base64,${data}`,
    });
  } catch (error) {
    console.error("Gemini image error:", error);

    /*
      Gemini image generation can return 429 when the
      project has no available image-generation quota.
    */

    if (error.status === 429) {
      return res.status(429).json({
        error:
          "Lumi image generation is currently unavailable because the Gemini image quota has been reached.",
        quota: true,
      });
    }

    if (error.status === 503) {
      return res.status(503).json({
        error:
          "Lumi's image service is temporarily busy. Please try again in a moment.",
        temporary: true,
      });
    }

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