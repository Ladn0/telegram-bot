exports.startOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "View current link and prompt", callback_data: "viewParams" }],
      [{ text: "Configure source link", callback_data: "addLink" }],
      [{ text: "Configure prompt parameters", callback_data: "addPrompt" }],
      [{ text: "Generate new articles", callback_data: "sendArticles" }],
    ],
  }),
};

exports.cancelSelected = {
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: "Cancel", callback_data: "cancel" }]],
  }),
};
