const express = require("express");
const ai = require("../common/gemini");
const transactionCommon = require("../common/transaction");
const { readFromFile, writeToFile } = require("../common/fileutil");
const fs = require("fs");
const path = require("path");

const router = express.Router();

let interactionHistory = [];

router.post("/", async (req, res) => {
  const userId = req.userId;
  let { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      message: "Prompt is required.",
    });
  }

  const fileName = path.join(
    __dirname,
    "../interactionHistory",
    `${userId}.txt`
  );

  const filedata = readFromFile(fileName);
  if (filedata != null || filedata != undefined) {
    interactionHistory = JSON.parse(filedata);
  } else {
    console.log(`no intersactionHistory available for the user ${userId}`);
  }

  const instruction = `You are an intelligent chatbot which helps the customer to answer the questions about their transactions.
  Be straight forward and consise in giving your response to the customer.
  You will be provided with all the transaction details of the customer in the context.
  All the transaction amount is in INR.`;
  let context = "Context containing user transaction details below \n";

  const userTransactions = await transactionCommon.getTransaction(userId);

  context += JSON.stringify(userTransactions);

  const finalprompt = instruction + "\n" + context + "\n" + prompt;

  const aiResponse = await ai.getAIResponse(finalprompt);

  interactionHistory.push({ user: prompt, model: aiResponse });
  writeToFile(fileName, JSON.stringify(interactionHistory));

  res.status(200).json({
    message: "The API is working, and this response is from the backend.",
    data: aiResponse,
  });
});

module.exports = router;
