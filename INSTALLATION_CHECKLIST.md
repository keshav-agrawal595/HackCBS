# Installation & Setup Checklist

## ✅ Pre-Installation Checklist

- [ ] Python 3.8+ installed (`python --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] MongoDB installed and running
- [ ] Git installed (optional, for version control)
- [ ] At least 2GB free RAM
- [ ] Stable internet connection

## 📦 Step 1: Install Python Dependencies

```powershell
# Navigate to project root
cd d:\KKY_Brothers\Codes\Advanced_ML_Projects\HackCBS

# Install Python packages
pip install -r requirements-vision.txt

# Verify installation
python -c "import flask; import cv2; import torch; print('All packages installed!')"
```

- [ ] All Python packages installed successfully
- [ ] No installation errors

## 🔑 Step 2: Configure Environment Variables

Edit your `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
ELEVEN_LABS_API_KEY=your_elevenlabs_key_here
MONGODB_URI=mongodb://localhost:27017/ai_chatbot_db
```

- [ ] GEMINI_API_KEY is set
- [ ] ELEVEN_LABS_API_KEY is set
- [ ] MONGODB_URI is configured
- [ ] .env file is in project root

## 📹 Step 3: Set Up Video Stream

### Option A: Using Phone Camera (Recommended)

**For Android:**
1. Download "IP Webcam" from Play Store
2. Open app and scroll down
3. Click "Start Server"
4. Note the IP address shown (e.g., http://192.168.1.100:8080)

**For iOS:**
1. Download "iVCam" or "EpocCam" from App Store
2. Follow app instructions
3. Note the connection URL

- [ ] Camera app installed on phone
- [ ] Phone and PC on same WiFi network
- [ ] Video stream URL noted: ________________

### Option B: Using Webcam

Use `0` as the video_url parameter (OpenCV default)

- [ ] Webcam connected and working

## 🔧 Step 4: Configure Video URLs

Edit the following files with your video URL:

**File 1: vision-service.py (line 148)**
```python
video_url = data.get('video_url', 'http://YOUR_IP:8080/video')
```

**File 2: frontend/src/components/HomeScreen/Screen.jsx (line 81)**
```javascript
requestBody.videoUrl = 'http://YOUR_IP:8080/video';
```

- [ ] Updated vision-service.py with correct URL
- [ ] Updated Screen.jsx with correct URL
- [ ] Tested URL in browser (should show video)

## 📦 Step 5: Install Node.js Dependencies

```powershell
# Install backend dependencies
cd backend-gemini
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] No npm errors

## 🚀 Step 6: Start Services

### Option A: Automatic Start (Recommended)

```powershell
.\start-all-services.ps1
```

This opens 3 terminals automatically.

### Option B: Manual Start

**Terminal 1 - Vision Service:**
```powershell
python vision-service.py
```
Should show: "Starting Vision Service on port 5000..."

**Terminal 2 - Backend:**
```powershell
cd backend-gemini
npm start
```
Should show: "Virtual Co-passenger listening on port 3000"

**Terminal 3 - Frontend:**
```powershell
cd frontend
npm run dev
```
Should show: "Local: http://localhost:5173/" (or similar)

- [ ] Vision service running on port 5000
- [ ] Backend running on port 3000
- [ ] Frontend running (note the port: _____)
- [ ] MongoDB connected message appears
- [ ] No error messages in any terminal

## 🧪 Step 7: Test the System

### Test 1: Health Checks

**Test Vision Service:**
Open browser: http://localhost:5000/health
Expected: `{"status":"healthy","service":"vision-service"}`

**Test Backend:**
Open browser: http://localhost:3000/
Expected: "Hello World!"

**Test Frontend:**
Open browser: http://localhost:5173/ (or your port)
Expected: Login page appears

- [ ] Vision service health check passes
- [ ] Backend responds
- [ ] Frontend loads correctly

### Test 2: Run Test Script

```powershell
python test-vision.py
```

Follow the prompts and run all tests.

- [ ] Health test passes
- [ ] Video stream test passes
- [ ] Vision analysis test passes (optional)

### Test 3: Basic Chat

1. Go to frontend URL
2. Sign up / Log in
3. Type a simple message: "Hello"
4. Avatar should respond

- [ ] Can create account / login
- [ ] Can send basic message
- [ ] Avatar responds with voice
- [ ] Animations work

### Test 4: Vision Integration

Type one of these trigger phrases:
- "visualize the environment"
- "look around and describe"
- "what do you see around"

Expected behavior:
1. "Analyzing surroundings..." appears with spinner
2. Wait 10-30 seconds
3. Avatar describes what the camera sees
4. Description is natural and conversational

- [ ] Trigger keyword detected
- [ ] Analyzing indicator shows
- [ ] Vision analysis completes
- [ ] Avatar speaks description
- [ ] Description matches camera view

## 🎯 Step 8: Verify All Features

- [ ] User registration works
- [ ] User login works
- [ ] Chat history saves
- [ ] Previous chats load correctly
- [ ] New chat button works
- [ ] Regular chat (non-vision) works
- [ ] Vision triggers work
- [ ] Avatar animations play
- [ ] Text-to-speech works
- [ ] Lip sync works
- [ ] Loading states show correctly

## 🐛 Troubleshooting Common Issues

### Issue: "Cannot connect to vision service"
**Solution:**
- Ensure `python vision-service.py` is running
- Check port 5000 is not in use by another app
- Visit http://localhost:5000/health directly

### Issue: "Video stream error" 
**Solution:**
- Test video URL in browser
- Ensure phone and PC on same network
- Restart camera app
- Check firewall settings

### Issue: "Vision analysis times out"
**Solution:**
- Reduce `num_frames` in vision-service.py to 3
- Improve lighting conditions
- Move camera for clearer view
- Check internet connection

### Issue: "Backend crashes on vision request"
**Solution:**
- Check vision service is running
- Verify GEMINI_API_KEY is correct
- Check backend terminal for error details

### Issue: "No frames captured"
**Solution:**
- Improve lighting
- Hold camera steady
- Adjust `laplacian_threshold` in vision-service.py (lower it)
- Check if video stream actually provides video

### Issue: "MongoDB connection error"
**Solution:**
- Start MongoDB service
- Check MONGODB_URI in .env
- Verify MongoDB is running: `mongosh` command

## 📊 Performance Optimization

### For Faster Response:
```python
# vision-service.py, line 125
num_frames=3  # Reduced from 6
```

### For GPU Acceleration:
```powershell
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

- [ ] Adjusted settings if needed
- [ ] GPU detected (if available)

## 🎉 Final Verification

Test the complete flow:

1. [ ] Start all three services
2. [ ] Login to the app
3. [ ] Send a regular message - works
4. [ ] Say "visualize the environment" 
5. [ ] See analyzing indicator
6. [ ] Wait for response (10-30s)
7. [ ] Avatar describes environment
8. [ ] Description is accurate
9. [ ] Chat history saves correctly
10. [ ] Can use regular chat again

## ✨ Success Criteria

Your integration is successful when:

✅ All three services run without errors
✅ Regular chat works normally  
✅ Vision triggers are detected
✅ Camera frames are captured
✅ Gemini analyzes images correctly
✅ Avatar speaks descriptions
✅ Animations and emotions work
✅ Loading indicators display properly
✅ Chat history saves everything

## 📝 Notes

- Vision analysis takes **10-30 seconds** - this is normal
- First request may be slower (model loading)
- Captured images are saved in `captured_frames/` folder
- Each service needs its own terminal window
- Keep all terminals open while using the app

## 🆘 Getting Help

If you encounter issues:

1. Check all terminals for error messages
2. Review the VISION_INTEGRATION_README.md
3. Run test-vision.py to diagnose problems
4. Verify all checklist items above
5. Check video stream works in browser first

## 🎊 Congratulations!

If you've completed all steps and tests pass, your AI co-passenger can now see and describe the environment! 

### Try These Commands:
- "Visualize the environment"
- "Look around and tell me what you see"
- "Describe our surroundings"
- "What's around us?"
- "Scan the area"

Enjoy your enhanced AI co-passenger! 🚗👁️🤖
