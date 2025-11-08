import requests
import json

def test_vision_service():
    """Test if vision service is running and responding"""
    
    print("=" * 50)
    print("Vision Service Test")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to vision service")
        print("   Make sure vision-service.py is running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 2: Video Stream Check
    print("\n2. Testing video stream accessibility...")
    video_url = input("Enter your video stream URL (or press Enter for default): ").strip()
    if not video_url:
        video_url = "http://10.52.26.19:8080/video"
    
    print(f"   Testing URL: {video_url}")
    try:
        response = requests.get(video_url, timeout=5, stream=True)
        if response.status_code == 200:
            print("✅ Video stream is accessible")
        else:
            print(f"⚠️ Video stream returned status {response.status_code}")
            print("   Vision service may not be able to capture frames")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to video stream")
        print("   Make sure your camera app is running and accessible")
        print("   Check if phone and PC are on the same network")
    except Exception as e:
        print(f"⚠️ Warning: {e}")
    
    # Test 3: Vision Analysis (Optional)
    print("\n3. Test vision analysis? (This will capture and analyze frames)")
    test_analysis = input("   Run full test? (y/n): ").strip().lower()
    
    if test_analysis == 'y':
        print("   Starting vision analysis... (this may take 10-30 seconds)")
        try:
            response = requests.post(
                "http://localhost:5000/analyze-environment",
                json={"video_url": video_url},
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print("✅ Vision analysis successful!")
                    print(f"   Frames captured: {data.get('frames_captured')}")
                    print(f"   Image saved: {data.get('image_path')}")
                    print(f"\n   Description:")
                    print(f"   {data.get('description')}")
                else:
                    print(f"❌ Vision analysis failed: {data.get('error')}")
            else:
                print(f"❌ Request failed with status {response.status_code}")
                try:
                    print(f"   Error: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
        except requests.exceptions.Timeout:
            print("❌ Request timed out (>60 seconds)")
            print("   This could mean:")
            print("   - Video stream is too slow")
            print("   - Cannot capture clear frames")
            print("   - Gemini API is slow/down")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("Test Complete!")
    print("=" * 50)
    print("\nIf all tests passed, your vision integration is ready!")
    print("You can now use trigger keywords like 'visualize the environment'")
    print("in your chat interface.")
    
    return True

if __name__ == "__main__":
    test_vision_service()
    input("\nPress Enter to exit...")
