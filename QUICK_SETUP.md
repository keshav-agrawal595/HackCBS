# Quick Setup Guide - Vision Integration

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- MongoDB running (for authentication)
- GEMINI_API_KEY in your .env file
- ELEVEN_LABS_API_KEY in your .env file (for TTS)
- Video stream source (phone camera app or webcam)

## One-Time Setup

### 1. Install Python Dependencies
```powershell
pip install -r requirements-vision.txt
```

### 2. Configure Video URL

Edit these files with your video stream URL:

**vision-service.py** (line 148):
```python
video_url = data.get('video_url', 'http://YOUR_PHONE_IP:8080/video')
```

**frontend/src/components/HomeScreen/Screen.jsx** (line 81):
```javascript
requestBody.videoUrl = 'http://YOUR_PHONE_IP:8080/video';
```

#### Recommended Camera Apps:
- **IP Webcam** (Android): http://PHONE_IP:8080/video
- **DroidCam**: http://PHONE_IP:4747/video
- **iVCam** (iOS): Follow app instructions

### 3. Verify Environment Variables

Your `.env` file should have:
```
GEMINI_API_KEY=your_key_here
ELEVEN_LABS_API_KEY=your_key_here
MONGODB_URI=mongodb://localhost:27017/ai_chatbot_db
```

## Starting the System

### Option 1: Automatic (Recommended)
Run the PowerShell script:
```powershell
.\start-all-services.ps1
```

This will open 3 terminals:
1. Vision Service (Python) on port 5000
2. Backend (Node.js) on port 3000
3. Frontend (Vite) on port 5173 (or similar)

### Option 2: Manual

**Terminal 1 - Vision Service:**
```powershell
python vision-service.py
```

**Terminal 2 - Backend:**
```powershell
cd backend-gemini
npm start
```

**Terminal 3 - Frontend:**
```powershell
cd frontend
npm run dev
```

## Testing the Integration

1. **Login/Signup** to your account
2. **Start your video stream** (IP Webcam or similar)
3. **Test basic chat** first to ensure everything works
4. **Try vision triggers**:
   - Type: "visualize the environment"
   - Type: "look around"
   - Type: "what do you see"
   - Type: "describe surroundings"

## Expected Behavior

When you use a trigger keyword:

1. **UI shows**: "Analyzing surroundings..." with spinner
2. **Vision service**: Captures 6 frames from video stream
3. **Processing**: Combines frames and sends to Gemini Vision API
4. **Response**: Avatar describes what it sees with animations
5. **Time**: Takes 10-30 seconds depending on connection

## Troubleshooting

### "Vision Service Not Responding"
- Check if `python vision-service.py` is running
- Visit http://localhost:5000/health to test
- Check firewall/antivirus settings

### "Video Stream Error"
- Verify video URL is correct
- Test URL in browser: should show video stream
- Ensure phone and PC are on same network
- Try switching phone WiFi or restarting camera app

### "Frames Too Blurry"
- Improve lighting conditions
- Hold phone/camera steady
- Adjust `laplacian_threshold` in vision-service.py (lower = less strict)

### "Very Slow Response"
- Reduce `num_frames` from 6 to 3 in vision-service.py
- Check internet connection (Gemini API calls)
- Use GPU if available (install CUDA toolkit)

### "Gemini API Error"
- Verify GEMINI_API_KEY is correct
- Check API quota/limits
- Ensure API key has Vision API enabled

## Performance Tips

### For Faster Response:
```python
# In vision-service.py, line 125:
result = capture_and_analyze_environment(video_url, num_frames=3)  # Reduced from 6
```

### For Better Quality:
```python
# In vision-service.py, line 135:
frame_resized = cv2.resize(frame, (1280, 720))  # Higher resolution
```

### For GPU Acceleration:
Make sure PyTorch with CUDA is installed:
```powershell
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## File Locations

- **Vision Service**: `vision-service.py` (root)
- **Backend Integration**: `backend-gemini/index.js` (lines 177-220)
- **Frontend Trigger**: `frontend/src/components/HomeScreen/Screen.jsx` (lines 68-82)
- **Captured Images**: `captured_frames/` (auto-created)

## Support

If you encounter issues:
1. Check all three services are running
2. Verify API keys are set
3. Test video stream URL separately
4. Check terminal logs for errors
5. Ensure MongoDB is running

## Features

✅ Automatic trigger detection
✅ Multi-frame analysis for context
✅ Natural language descriptions
✅ Avatar animations and emotions
✅ Text-to-speech integration
✅ Seamless chat flow
✅ Loading indicators
✅ Error handling

Enjoy your AI co-passenger with vision capabilities! 🚗👁️🤖
