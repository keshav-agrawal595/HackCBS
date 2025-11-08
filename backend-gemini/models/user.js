// In backend-gemini/models/user.js
import { Schema, model } from 'mongoose';
import { createHmac, randomBytes } from 'crypto';
import { createTokenForUser } from '../service/authService.js'; // Notice the .js

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  salt: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  profileImageURL: {
    type: String,
    default: "/images/default.png",
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },
}, { timestamps: true });

// This "pre-save" hook is perfect, no changes needed
userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified('password')) return;
  
  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');
  
  this.salt = salt;
  this.password = hashedPassword;
  next();
});

// This static method is also perfect, but we need to modify the error messages
userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error('User not found'); // This error is fine

  const salt = user.salt;
  const hashedPassword = user.password;

  const userProvidedHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  // IMPORTANT: Throw a specific error for React to catch
  if (hashedPassword !== userProvidedHash) throw new Error('Incorrect email or password');

  const token = createTokenForUser(user);
  return token;
});

const User = model('user', userSchema);

export default User; // Use "export default"