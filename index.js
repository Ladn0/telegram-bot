require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const TelegramApi = require("node-telegram-bot-api");
const { TOKEN, PORT, DB_URI } = process.env;
const bot = new TelegramApi(TOKEN, { polling: true });
const app = express();
const User = require("./models/user");
const requestGtpResponse = require("./requestLogic");

const start = async () => {
  //connecting to the db
  await mongoose
    .connect(DB_URI)
    .then((res) => console.log("connected"))
    .catch((err) => console.log(err));

  //setting up the serever
  app.listen(PORT || 5000, async () => {
    console.log(`The app is running on port ${PORT || 5000}`);
  });

  // bot logic
  const userStates = new Map();

  bot.setMyCommands([
    {
      command: "/start",
      description: "Start interaction with the bot",
    },
  ]);

  const startOptions = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Add a new link", callback_data: "addLink" }],
        [{ text: "Add prompt parameters", callback_data: "addPrompt" }],
        [{ text: "Generate new articles", callback_data: "sendArticles" }],
      ],
    }),
  };

  const cancelSelected = {
    reply_markup: JSON.stringify({
      inline_keyboard: [[{ text: "Cancel", callback_data: "cancel" }]],
    }),
  };

  bot.on("callback_query", async (msg) => {
    const action = msg.data;
    const chatId = msg.message.chat.id;
    const userId = msg.from.id;
    let userState = userStates.get(userId);
    switch (action) {
      case "addLink":
        userStates.set(userId, "waiting_for_link");
        await bot.sendMessage(
          chatId,
          "Enter the link of the source",
          cancelSelected
        );
        break;
      case "cancel":
        userStates.delete(userId);
        await bot.sendMessage(
          chatId,
          "Is ther anything else I can do for you?",
          startOptions
        );
        break;
      case "addPrompt":
        userStates.set(userId, "waiting_for_style");
        await bot.sendMessage(
          chatId,
          "Enter props separated by commas (e.g., 20 words, in informal way, etc.)",
          cancelSelected
        );
        break;
      case "sendArticles":
        const existingUser = await User.findOne({ telegram_id: userId });
        if (
          existingUser != null &&
          existingUser.links != null &&
          existingUser.style != null
        ) {
          await bot.sendMessage(chatId, "Your reqest is in progress...");
          const reply = await requestGtpResponse(
            existingUser.links[existingUser.links.length - 1],
            existingUser.style,
            "en"
          );
          await bot.sendMessage(chatId, reply, startOptions);
        } else {
          await bot.sendMessage(
            chatId,
            "You have not added any links or prompts defined. Please do it first!",
            startOptions
          );
        }
        break;
    }
  });

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    let userState = userStates.get(userId);
    const existingUser = await User.findOne({ telegram_id: userId });

    switch (userState) {
      case "waiting_for_link":
        if (existingUser != null) {
          existingUser.links.push(text);
          try {
            await existingUser.save();
            bot.sendMessage(
              chatId,
              "New source was added successfully! Is there anything else I can do for you?",
              startOptions
            );
          } catch (err) {
            console.log(err);
          }
        } else {
          const newUser = new User({
            telegram_id: userId,
            links: [text],
          });
          try {
            await newUser.save();
            bot.sendMessage(
              chatId,
              "The source was successfully added! Should I do anything else for you?",
              startOptions
            );
          } catch (err) {
            console.log(err);
          }
        }
        userStates.delete(userId);
        break;
      case "waiting_for_style":
        if (existingUser != null) {
          existingUser.style = text;
          try {
            await existingUser.save();
            bot.sendMessage(
              chatId,
              "The props were added successfully! Is there anything else I can do for you?",
              startOptions
            );
          } catch (err) {
            console.log(err);
          }
        } else {
          const newUser = new User({
            telegram_id: userId,
            style: text,
          });
          try {
            await newUser.save();
            bot.sendMessage(
              chatId,
              "The props were uploaded susseccfully! Should I do anything else for you?",
              startOptions
            );
          } catch (err) {
            console.log(err);
          }
        }
        userStates.delete(userId);
        break;
      default:
        if (text != "/start") {
          await bot.sendMessage(
            chatId,
            "Please select one of the actions first!",
            startOptions
          );
        }
    }

    if (text === "/start") {
      await bot.sendMessage(
        chatId,
        "Welcome to this awesome chatbot! You can select one of the listed actions",
        startOptions
      );
    }
  });
};

start();
