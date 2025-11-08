import cv2
import os
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.models import resnet18
import numpy as np
from PIL import Image
import imagehash
import asyncio
import aiohttp
import time
import json
import base64
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

# Use GPU if available
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# Load pre-trained ResNet model (for feature extraction)
model = resnet18(weights="IMAGENET1K_V1")
model = nn.Sequential(*list(model.children())[:-1])  # Remove last fully connected layer
model = model.to(device)
model.eval()

# Define the preprocessing pipeline
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# Flask app
app = Flask(__name__)
CORS(app)

# Function to get frame features
def get_frame_features(frame):
    pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    frame_preprocessed = preprocess(pil_image).unsqueeze(0).to(device)
    with torch.no_grad():
        features = model(frame_preprocessed)
    return features.cpu()

def get_phash(image):
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    return imagehash.phash(pil_image)

def is_clear_image(gray_frame, laplacian_threshold=300, edge_threshold=100):
    laplacian_var = cv2.Laplacian(gray_frame, cv2.CV_64F).var()
    if laplacian_var < laplacian_threshold:
        return False
    edges = cv2.Canny(gray_frame, 100, 200)
    return np.sum(edges > 0) > edge_threshold

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

async def process_image_with_gemini(image_path, prompt):
    api_key = os.getenv("GEMINI_API_KEY")
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={api_key}"
    
    base64_image = encode_image_to_base64(image_path)
    
    data = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": base64_image
                        }
                    }
                ]
            }
        ],
        "generation_config": {
            "temperature": 0.8,
            "max_output_tokens": 900
        }
    }

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(api_url, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    return result['candidates'][0]['content']['parts'][0]['text']
                else:
                    error_text = await response.text()
                    return f"Error processing image: {response.status}, {error_text}"
        except Exception as e:
            return f"Error: {str(e)}"

def capture_and_analyze_environment(video_url, num_frames=4):
    """Capture frames from video stream and analyze with Gemini"""
    print(f"Starting frame capture from: {video_url}")
    cap = cv2.VideoCapture(video_url)
    
    if not cap.isOpened():
        print("ERROR: Could not open video stream")
        return {"error": "Couldn't open video stream"}
    
    save_folder = 'captured_frames'
    os.makedirs(save_folder, exist_ok=True)
    
    image_buffer = []
    frame_skip = 5  # Reduced from 10 for faster capture
    frame_counter = 0
    max_attempts = 300  # Reduced from 500
    attempts = 0
    
    print(f"Attempting to capture {num_frames} frames...")
    
    try:
        while len(image_buffer) < num_frames and attempts < max_attempts:
            ret, frame = cap.read()
            if not ret or frame is None:
                attempts += 1
                time.sleep(0.01)  # Small delay to prevent busy loop
                continue
            
            frame_counter += 1
            if frame_counter % frame_skip != 0:
                continue
            
            attempts += 1
            frame_resized = cv2.resize(frame, (640, 360))
            gray_frame = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2GRAY)
            
            # Relaxed quality check - accept more frames
            if not is_clear_image(gray_frame, laplacian_threshold=100, edge_threshold=50):
                continue
            
            image_buffer.append(frame_resized)
            print(f"Captured frame {len(image_buffer)}/{num_frames}")
        
        if len(image_buffer) == 0:
            print("ERROR: No clear frames captured")
            return {"error": "Could not capture clear frames"}
        
        print(f"Successfully captured {len(image_buffer)} frames, combining...")
        
        # Combine frames horizontally (or vertically if too many)
        if len(image_buffer) <= 3:
            combined_image = np.hstack(image_buffer)
        else:
            # For 4+ frames, arrange in a 2x2 grid
            top_row = np.hstack(image_buffer[:len(image_buffer)//2])
            bottom_row = np.hstack(image_buffer[len(image_buffer)//2:])
            combined_image = np.vstack([top_row, bottom_row])
        
        # Save combined image
        timestamp = time.strftime("%Y-%m-%d_%H-%M-%S", time.localtime())
        filename = os.path.join(save_folder, f"environment_{timestamp}.jpg")
        cv2.imwrite(filename, combined_image)
        
        print(f"Image saved to {filename}, sending to Gemini...")
        
        # Analyze with Gemini
        prompt = "I am providing you an image. Describe the scene in the image with utmost detail, focusing on every minute aspect such as colors, objects, textures, lighting, and any visible patterns. Provide a natural, conversational description as if you're telling someone what you see. Keep it concise but informative, around 3-4 sentences."
        
        description = asyncio.run(process_image_with_gemini(filename, prompt))
        
        print("Analysis complete!")
        
        return {
            "success": True,
            "description": description,
            "image_path": filename,
            "frames_captured": len(image_buffer)
        }
        
    finally:
        cap.release()

@app.route('/analyze-environment', methods=['POST'])
def analyze_environment():
    """API endpoint to analyze environment from video stream"""
    try:
        data = request.json
        video_url = data.get('video_url', 'http://10.52.26.19:8080/video')
        
        print(f"\n{'='*60}")
        print(f"New vision analysis request")
        print(f"Video URL: {video_url}")
        print(f"{'='*60}\n")
        
        result = capture_and_analyze_environment(video_url)
        
        if "error" in result:
            print(f"ERROR: {result['error']}")
            return jsonify(result), 500
        
        print(f"\n{'='*60}")
        print(f"Analysis successful!")
        print(f"Description: {result['description'][:100]}...")
        print(f"{'='*60}\n")
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"EXCEPTION in analyze_environment: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "vision-service"}), 200

if __name__ == '__main__':
    print("Starting Vision Service on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
