# Vision Service Integration

This integration adds environment visualization capabilities to your AI co-passenger system. When users say specific trigger keywords, the system will capture frames from a video stream, analyze them using Gemini Vision API, and respond naturally with what it sees.

## Features

- **Automatic Vision Trigger**: Detects keywords like "visualize", "look around", "describe surroundings", etc.
- **Frame Analysis**: Captures and combines multiple frames for better context
- **Natural Response**: The AI describes what it sees in a conversational manner
- **Seamless Integration**: Works with existing chat flow and avatar animations

## Setup Instructions

### 1. Install Python Dependencies

```bash
pip install -r requirements-vision.txt
```

### 2. Configure Video URL

Update the video URL in both files if needed:
- **vision-service.py**: Line 148 (default: `'http://10.52.26.19:8080/video'`)
- **frontend/src/components/HomeScreen/Screen.jsx**: Line 81 (default: `'http://10.52.26.19:8080/video'`)

You can use:
- IP Webcam app on Android: `http://YOUR_PHONE_IP:8080/video`
- DroidCam: `http://YOUR_PHONE_IP:4747/video`
- Local webcam: `0` (for OpenCV)
- RTSP stream URL
- Any HTTP video stream URL

### 3. Ensure GEMINI_API_KEY is Set

Make sure your `.env` file in the root directory contains:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start the Vision Service

Open a terminal and run:

```bash
python vision-service.py
```

The service will start on `http://localhost:5000`

### 5. Start Backend (if not already running)

```bash
cd backend-gemini
npm install
npm start
```

Backend runs on `http://localhost:3000`

### 6. Start Frontend (if not already running)

```bash
cd frontend
npm install
npm run dev
```

## Usage

### Trigger Keywords

Simply say any of these phrases in the chat:
- "visualize the environment"
- "look around"
- "what do you see"
- "describe surroundings"
- "describe environment"
- "what's around"
- "scan environment"
- "analyze surroundings"
- "check surroundings"

### Example Interaction

**User**: "Visualize the surroundings"

**System Process**:
1. Frontend detects trigger keyword
2. Sends request to backend with video URL
3. Backend calls vision service
4. Vision service captures 6 frames from video stream
5. Combines frames and analyzes with Gemini Vision API
6. Returns description to backend
7. Backend generates natural response with avatar animations
8. Avatar speaks the description with appropriate emotions

**Avatar**: "Looking around, I can see we're on a tree-lined road with dappled sunlight filtering through the leaves. There's a car ahead of us, and the asphalt looks smooth. The scenery is quite peaceful with greenery on both sides..."

## Architecture

```
User Input (with trigger) 
    ↓
Frontend (Screen.jsx) - Detects trigger & adds videoUrl
    ↓
Backend (index.js) - Calls vision service
    ↓
Vision Service (vision-service.py) - Captures & analyzes frames
    ↓
Gemini Vision API - Analyzes combined frames
    ↓
Backend - Generates response with TTS & lipsync
    ↓
Frontend - Avatar speaks the description
```

## Troubleshooting

### Vision Service Not Responding
- Check if vision-service.py is running on port 5000
- Verify GEMINI_API_KEY is set correctly
- Check video stream URL is accessible

### Video Stream Issues
- Test video URL in browser first
- Ensure phone/camera is on same network
- Check firewall settings
- Try different video stream apps

### No Frames Captured
- Verify video stream is working
- Check if frames are too blurry (adjust `laplacian_threshold`)
- Increase `max_attempts` in vision-service.py if needed

### Slow Response
- Vision analysis can take 10-30 seconds depending on:
  - Video stream quality
  - Frame capture speed
  - Gemini API response time
- Consider reducing `num_frames` from 6 to 3 for faster response

## Customization

### Modify Vision Prompt

Edit the prompt in `vision-service.py` (line 141):
```python
prompt = "Your custom prompt here..."
```

### Add More Trigger Keywords

Edit `backend-gemini/index.js` around line 195:
```javascript
const triggers = [
  'your custom trigger',
  // ... existing triggers
];
```

### Adjust Frame Quality

In `vision-service.py`:
- Change `num_frames` (default: 6)
- Modify `frame_skip` (default: 10)
- Adjust `laplacian_threshold` for blur detection

### Change Video Resolution

In `vision-service.py` line 135:
```python
frame_resized = cv2.resize(frame, (640, 360))  # Modify resolution
```

## Notes

- Vision analysis is computationally intensive; ensure adequate system resources
- The service creates a `captured_frames/` folder to store analyzed images
- Each vision request captures and analyzes 6 frames by default
- GPU acceleration is used if CUDA is available (recommended for better performance)

## Integration with Existing Features

The vision integration works seamlessly with:
- ✅ User authentication
- ✅ Chat history
- ✅ Avatar animations
- ✅ Text-to-speech
- ✅ Lip sync
- ✅ Facial expressions
- ✅ All existing chat features

The avatar will respond to vision analysis with the same natural flow as regular chat messages!
