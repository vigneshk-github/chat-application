
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const prisma = new PrismaClient();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 3000,
  responseModalities: [],
  responseMimeType: "text/plain",
};

async function chatwithgemini(req, res) {
  const { userInput } = req.body;

  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });


  const result = await chatSession.sendMessage(
    `Please provide a short and concise answer noe answer this prompt ${userInput} `
  );
  const resText = JSON.stringify(result.response.text());

  let res1 = resText.replace(/\\n/g, "\n"); // Replace escaped newlines with actual newlines first.
  res1 = res1.replace(/[^a-zA-Z0-9.,\n\s]/g, "").trim(); // Remove all except letters, numbers, commas, periods, newlines and spaces.
  res1 = res1.replace(/\s+/g, " "); // Replace multiple spaces with single space.
  res1 = res1.replace(/^"|"$/g, ""); //Remove the first and last double quote.

  res.json(res1);

}

module.exports = { chatwithgemini };
