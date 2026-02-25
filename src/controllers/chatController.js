import { StatusCodes } from "http-status-codes";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "~/config/environment";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Message is required" });
    }

    const result = await model.generateContent(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const chatController = {
  sendMessage,
};
