const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function getAIResponse(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Unable to connet to gemini");
  }
}

module.exports = { getAIResponse };
