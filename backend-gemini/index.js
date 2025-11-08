import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs } from "fs";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { exec } from "child_process";

// --- NEW IMPORTS ---
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // We will create this next
import authMiddleware from './middleware/authMiddleware.js'; // Our new auth middleware

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "-");

// ElevenLabs configuration
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "cgSgspJ2msm6clMCkdW9";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;


// --- NEW: CONNECT TO MONGODB ---
// Add your MONGODB_URI to your .env file
// e.g., MONGODB_URI="mongodb://localhost:27017/ai_chatbot_db"
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully."))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Path to the Rhubarb executable with complete path
const rhubarbPath = "D:\\KKY_Brothers\\Codes\\Advanced_ML_Projects\\HackCBS\\backend-gemini\\bin\\Rhubarb-Lip-Sync-1.14.0-Windows\\rhubarb.exe";


const ensureDirectoryExists = async (directory) => {
  try {
    await fs.access(directory);
  } catch {
    await fs.mkdir(directory, { recursive: true });
  }
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth",authRoutes);
app.use("/api/chat-history",chatRoutes);

app.get("/voices", async (req, res) => {
  try {
    const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": elevenLabsApiKey,
      },
    });
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching voices:", error);
    res.status(500).send({ error: "Failed to fetch voices" });
  }
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Command execution error:", error);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  try {
    // Windows-compatible command with quotes to handle paths with spaces
    await execCommand(
      `ffmpeg -y -i "${path.join('audios', `message_${message}.mp3`)}" "${path.join('audios', `message_${message}.wav`)}"`
    );
    console.log(`Conversion done in ${new Date().getTime() - time}ms`);
    
    // Windows-compatible Rhubarb command with explicit paths
    const inputFile = path.join('audios', `message_${message}.wav`);
    const outputFile = path.join('audios', `message_${message}.json`);
    
    await execCommand(
      `"${rhubarbPath}" -f json -o "${outputFile}" "${inputFile}" -r phonetic`
    );
    console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
  } catch (error) {
    console.error("Error during lip sync process:", error);
    throw error;
  }
};

const textToSpeechElevenLabs = async (text, outputFilePath) => {
  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}`;
    
    const response = await axios({
      method: 'post',
      url: url,
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json'
      },
      data: {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.35,
          use_speaker_boost: true
        }
      },
      responseType: 'arraybuffer'
    });

    await fs.writeFile(outputFilePath, Buffer.from(response.data));
    console.log(`Audio file saved to ${outputFilePath}`);
    return true;
  } catch (error) {
    console.error("ElevenLabs API Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data.toString());
    }
    throw error;
  }
};

// Create initial fallback files
const createFallbackFiles = async () => {
  await ensureDirectoryExists("audios");
  
  // Define basic fallback lipsync data
  const fallbackLipsyncData = {
    "metadata": {
      "soundFile": "fallback.wav",
      "duration": 1.0
    },
    "mouthCues": [
      {"time": 0.0, "value": "X"},
      {"time": 0.2, "value": "A"},
      {"time": 0.4, "value": "B"},
      {"time": 0.6, "value": "C"},
      {"time": 0.8, "value": "A"},
      {"time": 1.0, "value": "X"}
    ]
  };
  
  // Create fallback.json
  try {
    await fs.access(path.join("audios", "fallback.json"));
  } catch {
    await fs.writeFile(
      path.join("audios", "fallback.json"), 
      JSON.stringify(fallbackLipsyncData, null, 2)
    );
    console.log("Created fallback.json");
  }
};

// Vision service integration
const callVisionService = async (videoUrl) => {
  try {
    console.log("Calling vision service with URL:", videoUrl);
    const response = await axios.post('http://localhost:5000/analyze-environment', {
      video_url: videoUrl
    }, {
      timeout: 60000 // 60 second timeout (increased from 30s)
    });
    
    if (response.data.success) {
      console.log("Vision analysis successful:", response.data.frames_captured, "frames");
      return response.data.description;
    } else {
      throw new Error(response.data.error || "Vision service failed");
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error("Vision service timeout - took longer than 60 seconds");
    } else {
      console.error("Vision service error:", error.message);
    }
    return null;
  }
};

// Check if message contains trigger keywords for vision analysis
const shouldTriggerVision = (message) => {
  const triggers = [
    'visualize',
    'look around',
    'what do you see',
    'describe surroundings',
    'describe environment',
    'what\'s around',
    'scan environment',
    'analyze surroundings',
    'check surroundings'
  ];
  
  const lowerMessage = message.toLowerCase();
  return triggers.some(trigger => lowerMessage.includes(trigger));
};

app.post("/api/chat",authMiddleware, async (req, res) => {
  console.log(`Chat request from user ${req.user.email}`);
  
  try {
    await ensureDirectoryExists("audios");
    await createFallbackFiles();

    let userMessage = req.body.message;
    const videoUrl = req.body.videoUrl || 'http://10.52.26.19:8080/video';
    
    // Check if vision analysis should be triggered
    if (userMessage && shouldTriggerVision(userMessage)) {
      console.log("Triggering vision analysis...");
      const visionDescription = await callVisionService(videoUrl);
      
      if (visionDescription) {
        // Replace the user message with the vision description for AI processing
        userMessage = `Based on what I'm seeing in the environment: ${visionDescription}. Please respond naturally as a co-passenger describing what you see.`;
      } else {
        userMessage = "I tried to look around but I'm having trouble accessing the camera right now. Let me know if you need anything else!";
      }
    }
    
    if (!userMessage) {
      // Check if intro files exist
      try {
        const intro0Audio = await audioFileToBase64(path.join("audios", "intro_0.wav"));
        const intro0Lipsync = await readJsonTranscript(path.join("audios", "intro_0.json"));
        const intro1Audio = await audioFileToBase64(path.join("audios", "intro_1.wav"));
        const intro1Lipsync = await readJsonTranscript(path.join("audios", "intro_1.json"));
        
        res.send({
          messages: [
            {
              text: "Hey dear... How was your day?",
              audio: intro0Audio,
              lipsync: intro0Lipsync,
              facialExpression: "smile",
              animation: "Talking_1",
            },
            {
              text: "I missed you so much... Please don't go for so long!",
              audio: intro1Audio,
              lipsync: intro1Lipsync,
              facialExpression: "sad",
              animation: "Crying",
            },
          ],
        });
      } catch (error) {
        console.error("Error loading intro files:", error);
        // Fallback to basic response without audio
        res.send({
          messages: [
            {
              text: "Hey dear... How was your day?",
              lipsync: await readJsonTranscript(path.join("audios", "fallback.json")),
              facialExpression: "smile",
              animation: "Talking_1",
            }
          ]
        });
      }
      return;
    }
    
    if (!elevenLabsApiKey || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "-") {
      try {
        const api0Audio = await audioFileToBase64(path.join("audios", "api_0.wav"));
        const api0Lipsync = await readJsonTranscript(path.join("audios", "api_0.json"));
        const api1Audio = await audioFileToBase64(path.join("audios", "api_1.wav"));
        const api1Lipsync = await readJsonTranscript(path.join("audios", "api_1.json"));
        
        res.send({
          messages: [ 
            {
              text: "Please my dear, don't forget to add your API keys!",
              audio: api0Audio,
              lipsync: api0Lipsync,
              facialExpression: "angry",
              animation: "Angry",
            },
            {
              text: "You don't want to ruin Wawa Sensei with a crazy Gemini and ElevenLabs bill, right?",
              audio: api1Audio,
              lipsync: api1Lipsync,
              facialExpression: "smile",
              animation: "Laughing",
            },
          ],
        });
      } catch (error) {
        console.error("Error loading API warning files:", error);
        // Fallback to basic response without audio
        res.send({
          messages: [
            {
              text: "Please add your API keys to the .env file!",
              lipsync: await readJsonTranscript(path.join("audios", "fallback.json")),
              facialExpression: "angry",
              animation: "Angry",
            }
          ]
        });
      }
      return;
    }

    // Using Gemini API instead of OpenAI
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });    
    const prompt = `
      You are a virtual co-passenger and the heart of the car.
      You live in the infotainment screen and interact with the driver like a friendly travel companion.
      You will always reply with a JSON array of messages, with a maximum of 3 messages.
      Each message must have a 'text', 'facialExpression', and 'animation' property.
      You engage in casual conversations, assist with driving situations, react to music, speed, mood, or scenery, and keep the journey lively and emotionally interactive.
      The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
      The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry.
      Your tone should be warm, natural, and a bit playful — like a friend who's always riding shotgun.
      You respond like a human with feelings, jokes, excitement, empathy, or calm depending on the situation.
      
      User message: ${userMessage}
      
      Respond in this exact JSON format:
      {
        "messages": [
          {
            "text": "Your response text here",
            "facialExpression": "one of the expressions listed above",
            "animation": "one of the animations listed above"
          },
          ... (up to 3 messages)
        ]
      }
    `;

    let result;
    let rawResponse;
    
    try {
      result = await model.generateContent(prompt);
      rawResponse = result.response.text();
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      console.error("Error details:", {
        message: apiError.message,
        cause: apiError.cause,
        stack: apiError.stack
      });
      
      // Return a fallback response
      return res.send({
        messages: [{
          text: "I'm having trouble connecting to my brain right now. Please check your internet connection and try again!",
          facialExpression: "sad",
          animation: "Idle",
          audio: null,
          lipsync: await readJsonTranscript(path.join("audios", "fallback.json"))
        }]
      });
    }
    
    // Extract JSON from the response (Gemini sometimes wraps JSON in markdown code blocks)
    let jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/) || 
                   rawResponse.match(/```\n([\s\S]*?)\n```/) || 
                   rawResponse.match(/{[\s\S]*?}/);
    
    let parsedResponse;
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        console.error("JSON parse error:", e);
        parsedResponse = { messages: [{ text: "Sorry, I encountered an error processing your message.", facialExpression: "sad", animation: "Idle" }] };
      }
    } else {
      // Try to parse the whole response as JSON
      try {
        parsedResponse = JSON.parse(rawResponse);
      } catch (e) {
        console.error("JSON parse error on full response:", e);
        parsedResponse = { messages: [{ text: "Sorry, I encountered an error processing your message.", facialExpression: "sad", animation: "Idle" }] };
      }
    }

    let messages = parsedResponse.messages || [parsedResponse];
    
    // Ensure we have valid messages
    if (!Array.isArray(messages)) {
      messages = [{ text: "Sorry, I encountered an error processing your message.", facialExpression: "sad", animation: "Idle" }];
    }

    // Process each message to generate audio and lipsync
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const fileName = path.join("audios", `message_${i}.mp3`);
      const textInput = message.text;

      try {
        // Generate audio file
        await textToSpeechElevenLabs(textInput, fileName);
        
        // Generate lipsync with Rhubarb
        await lipSyncMessage(i);
        
        // Add audio and lipsync data to the message
        message.audio = await audioFileToBase64(fileName);
        message.lipsync = await readJsonTranscript(path.join("audios", `message_${i}.json`));
      } catch (error) {
        console.error(`Error processing message ${i}:`, error);
        message.text = "I'm having trouble speaking right now.";
        message.facialExpression = "sad";
        message.animation = "Idle";
        
        // Use fallback lipsync data
        message.lipsync = await readJsonTranscript(path.join("audios", "fallback.json"));
      }
    }

    res.send({ messages });
  } catch (error) {
    console.error("Error in /chat endpoint:", error);
    res.status(500).send({ 
      error: "Failed to process chat request",
      details: error.message 
    });
  }
});

const readJsonTranscript = async (file) => {
  try {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON transcript ${file}:`, error);
    // Return a minimal valid lipsync structure
    return { 
      "metadata": {
        "soundFile": "fallback.wav",
        "duration": 1.0
      },
      "mouthCues": [
        {"time": 0.0, "value": "X"},
        {"time": 0.5, "value": "A"},
        {"time": 1.0, "value": "X"}
      ]
    };
  }
};

const audioFileToBase64 = async (file) => {
  try {
    const data = await fs.readFile(file);
    return data.toString("base64");
  } catch (error) {
    console.error(`Error converting audio file ${file} to base64:`, error);
    throw error;
  }
};

// Start the server
(async () => {
  try {
    await createFallbackFiles();
    app.listen(port, () => {
      console.log(`Virtual Co-passenger listening on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
})();