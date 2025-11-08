// In backend-gemini/routes/authRoutes.js
import { Router } from 'express';
import User from '../models/user.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Our NEW middleware

const router = Router();

// --- SIGNUP ---
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    await User.create({
      fullName,
      email,
      password,
    });
    return res.status(201).json({ message: "User created successfully. Please log in." });
  } catch (error) {
    // Handle duplicate email
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists." });
    }
    return res.status(500).json({ error: "Failed to create user." });
  }
});

// --- LOGIN ---
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // This will throw an error if password/email is wrong
    const token = await User.matchPasswordAndGenerateToken(email, password);

    // If successful, find the user data to send back
    const user = await User.findOne({ email }).select('-password -salt');

    // Send the token AND user data back as JSON
    return res.json({
      token: token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    // Send the specific error message from the User model
    return res.status(400).json({
      error: error.message || "An error occurred during login.",
    });
  }
});

// --- GET CURRENT USER (NEW) ---
// GET /api/auth/me
// This protected route lets React check if a stored token is still valid
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user was set by authMiddleware
    const user = await User.findById(req.user._id).select('-password -salt');
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;