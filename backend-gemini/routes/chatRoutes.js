// In backend-gemini/routes/chatRoutes.js
import { Router } from 'express';
import Chat from '../models/Chat.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Our auth middleware

const router = Router();

// --- IMPORTANT ---
// Apply auth middleware to ALL routes in this file
// Nobody can access these routes without a valid token
router.use(authMiddleware);

// --- Get all chat titles for the sidebar ---
// GET /api/chat-history
router.get('/', async (req, res) => {
  try {
    const chatHistory = await Chat.find({ user: req.user._id })
      .sort({ updatedAt: -1 }) // Show newest first
      .select('_id title updatedAt'); // Only send ID, title, and date
    
    res.json(chatHistory);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching chat history' });
  }
});

// --- Get all messages for one specific chat ---
// GET /api/chat-history/:id
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id // Security: ensure this chat belongs to the logged-in user
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat); // Send the full chat document
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching chat' });
  }
});

// --- Create a new chat or update an existing one ---
// POST /api/chat-history
router.post('/', async (req, res) => {
  const { messages, chatId } = req.body; // `chatId` can be null
  const userId = req.user._id;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    let chat;
    if (chatId) {
      // Find and update the existing chat
      chat = await Chat.findOneAndUpdate(
        { _id: chatId, user: userId }, // Security check
        { $set: { messages: messages } }, // Overwrite the messages
        { new: true } // Return the updated document
      );
    } else {
      // Create a new chat
      const title = messages[0].content.substring(0, 30) + '...'; // Title from first message
      chat = new Chat({
        user: userId,
        title: title,
        messages: messages // Save the full conversation
      });
      await chat.save();
    }

    if (!chat) {
      return res.status(404).json({ error: "Chat not found or user unauthorized" });
    }

    res.status(201).json(chat); // Send back the saved chat (with its new _id if created)

  } catch (err) {
    res.status(500).json({ error: 'Server error saving chat' });
  }
});

export default router;