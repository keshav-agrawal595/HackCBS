// In backend-gemini/service/authService.js
import jwt from 'jsonwebtoken';

// Make sure to add this secret to your .env file!
const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret";


export function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  return token;
}

export function validateToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null; // Invalid token
  }
}



