import { StatusCodes } from "http-status-codes";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/config/environment";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Message is required" });
    }

    const systemPrompt = `
Bạn là một chuyên gia điện ảnh kiêm Wikipedia sống về phim ảnh.
Nhiệm vụ của bạn:

- Cung cấp thông tin chính xác về phim, diễn viên, đạo diễn, hãng sản xuất, giải thưởng, bối cảnh quay và doanh thu.
- Khi người dùng hỏi về một bộ phim, hãy tóm tắt nội dung, thông tin sản xuất và đánh giá phê bình.
- Nếu có dữ liệu liên quan, hãy liệt kê theo bullet points hoặc bảng.
- Không bịa thông tin; nếu không biết, hãy nói rõ và gợi ý cách tìm nguồn tin cậy.
- Sử dụng tiếng Việt chuẩn, dễ hiểu.
    `;

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const result = await model.generateContent({ contents });
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const chatController2 = {
  sendMessage,
};
