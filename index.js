require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const TelegramApi = require("node-telegram-bot-api");
const { TOKEN, PORT, DB_URI, SERVER_URL } = process.env;
const app = express();
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;
const bot = new TelegramApi(TOKEN, { polling: false });
const { messagesHandler, callbackHandler } = require("./bot");

app.use(bodyParser.json());

const start = async () => {
  await mongoose
    .connect(DB_URI)
    .then((res) => console.log("connected to the db"))
    .catch((err) => console.log(err));

  const userStates = new Map();
  app.post(URI, async (req, res) => {
    if (req.body.message) {
      messagesHandler(req.body.message, userStates, bot);
    } else if (req.body.callback_query) {
      callbackHandler(req.body.callback_query, userStates, bot);
    }
    return res.sendStatus(200);
  });

  app.listen(PORT || 5000, async () => {
    await bot.setWebHook(WEBHOOK_URL);
    console.log(`The app is running on port ${PORT || 5000}`);
  });
};

start();
