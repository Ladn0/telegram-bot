const User = require("./models/user");
const requestGtpResponse = require("./requestLogic");
const verifier = require("./verifier");
const { startOptions, cancelSelected } = require("./buttonsUtils");

const languageOptions = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'German', callback_data: 'lang_de' }],
      [{ text: 'English', callback_data: 'lang_en' }],
      [{ text: 'Russian', callback_data: 'lang_ru' }]
    ]
  }
};

exports.messagesHandler = async (msg, userStates, bot) => {
  let text = msg.text;
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  let userState = userStates.get(userId);
  const existingUser = await User.findOne({ telegram_id: userId });

  switch (userState) {
    case "waiting_for_link":
      // [The rest remains unchanged...]
      break;
    case "waiting_for_style":
      // [The rest remains unchanged...]
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
    userStates.delete(userId);
    await bot.sendMessage(
      chatId,
      "Welcome to this awesome chatbot! You can select one of the listed actions",
      startOptions
    );
    userStates.delete(userId);
  }
};

exports.callbackHandler = async (msg, userStates, bot) => {
  const action = msg.data;
  const chatId = msg.message.chat.id;
  const userId = msg.from.id;

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
      userStates.set(userId, "waiting_for_language");
      await bot.sendMessage(
        chatId,
        "Please select a language for the articles:",
        languageOptions
      );
      break;
    case "lang_de":
      await handleArticleRequest(userId, chatId, bot, userStates, "de");
      break;
    case "lang_en":
      await handleArticleRequest(userId, chatId, bot, userStates, "en");
      break;
    case "lang_ru":
      await handleArticleRequest(userId, chatId, bot, userStates, "ru");
      break;
    case "viewParams":
      userStates.delete(userId);
      const theUser = await User.findOne({ telegram_id: userId });
      if (theUser != null) {
        await bot.sendMessage(
          chatId,
          `Your source link is: ${theUser.links != undefined
            ? theUser.links[theUser.links.length - 1]
            : "*you have not configured links yet*"
          }\nYour prompt is: ${theUser.style != undefined
            ? `"` + theUser.style + `"`
            : "*you have not configured prompts yet*"
          }\nWhat should I do next?`,
          startOptions
        );
      } else {
        await bot.sendMessage(
          chatId,
          "You did not configure any links or prompts yet",
          startOptions
        );
      }
      break;
  }
};

const handleArticleRequest = async (userId, chatId, bot, userStates, language) => {
  userStates.delete(userId);
  const existingUser = await User.findOne({ telegram_id: userId });
  if (
    existingUser != null &&
    existingUser.links != undefined &&
    existingUser.style != undefined
  ) {
    await bot.sendMessage(chatId, "Your request is in progress...");
    const reply = await requestGtpResponse(
      existingUser.links[existingUser.links.length - 1],
      existingUser.style,
      language
    );
    for (let i of reply) {
      await bot.sendMessage(chatId, i);
    }
    await bot.sendMessage(
      chatId,
      "Is there anything else you want me to do?",
      startOptions
    );
  } else {
    await bot.sendMessage(
      chatId,
      "You have not added any links or prompts defined. Please do it first!",
      startOptions
    );
  }
};

