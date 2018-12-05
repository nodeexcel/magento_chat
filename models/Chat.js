const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: String,
  chat_room: String,
  message: String,
  time: String
});

module.exports = mongoose.model('chat', chatSchema);
