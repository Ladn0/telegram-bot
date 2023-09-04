const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  telegram_id: {
    type: Number,
    required: true,
  },
  links: [String],
  style: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
