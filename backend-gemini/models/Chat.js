// In backend-gemini/models/Chat.js
import { Schema, model } from 'mongoose';

// A sub-document for each message
const MessageSchema = new Schema({
  role: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  // We don't need audio/lipsync data in the DB, just the text
}, {
  timestamps: true, // Adds createdAt/updatedAt to each message
  _id: false // Don't give individual messages their own _id
});

const ChatSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user', // Links to the User model
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Chat'
  },
  messages: [MessageSchema], // An array of messages
}, {
  timestamps: true // Adds createdAt/updatedAt to the whole chat
});

const Chat = model('Chat', ChatSchema);
export default Chat;