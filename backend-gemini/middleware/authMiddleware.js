// In backend-gemini/middleware/authMiddleware.js
import { validateToken } from '../service/authService.js';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // The header should be in the format: "Bearer YOUR_TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // User is not authenticated
    return res.status(401).json({ error: "No token provided, authorization denied." });
  }

  try {
    const userPayload = validateToken(token);
    if (!userPayload) {
      return res.status(401).json({ error: "Token is invalid." });
    }
    
    // Attach the user payload (e.g., _id, email) to the request
    req.user = userPayload; 
    next(); // Proceed to the next middleware or route handler

  } catch (error) {
    return res.status(401).json({ error: "Token is invalid." });
  }
}

export default authMiddleware;