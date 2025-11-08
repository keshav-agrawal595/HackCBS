// src/components/HomeScreen/Screen.jsx

import React, { useState } from 'react';
import { Canvas } from "@react-three/fiber";
import { Experience } from "../../components/Experience"; 
import { UI } from "../../components/UI"; 
import { Leva } from "leva";

import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat'; 

function Screen() {
    const { token, API_URL } = useAuth();
    // Use the functions from the refactored useChat hook
    const { startBotResponse, setLoading, setIsAnalyzingVision } = useChat(); 

    // --- CHAT HISTORY STATE ---
    const [messages, setMessages] = useState([]); 
    const [currentChatId, setCurrentChatId] = useState(null);
    const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0); 

    // --- API & LOGIC FUNCTIONS ---

    const saveChat = async (messagesToSave) => {
        const title = messagesToSave.find(m => m.role === 'user')?.content.substring(0, 50) || "New Chat";

        try {
            const res = await fetch(`${API_URL}/chat-history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    messages: messagesToSave, 
                    chatId: currentChatId,
                    title: title 
                })
            });
            
            const savedChat = await res.json();
            
            if (res.ok) {
                if (!currentChatId) {
                    setCurrentChatId(savedChat._id); 
                }
                setSidebarRefreshKey(prev => prev + 1); 
            }
        } catch (err) {
            console.error("Failed to save chat:", err);
        }
    };

    const handleSendMessage = async (userMessageText) => {
        if (!userMessageText.trim()) return;

        // 1. Add user message to history state
        const newUserMessage = { role: 'user', content: userMessageText };
        const updatedMessagesAfterUser = [...messages, newUserMessage];
        setMessages(updatedMessagesAfterUser); 
        
        setLoading(true); 

        try {
            // Check if vision analysis is needed (trigger keywords)
            const visionTriggers = ['visualize', 'look around', 'what do you see', 'describe surroundings', 'describe environment', 'what\'s around', 'scan environment', 'analyze surroundings', 'check surroundings'];
            const isVisionRequest = visionTriggers.some(trigger => 
                userMessageText.toLowerCase().includes(trigger)
            );

            // Show vision analyzing indicator if it's a vision request
            if (isVisionRequest) {
                setIsAnalyzingVision(true);
            }

            // 2. Call the protected API with the token and video URL if needed
            const requestBody = { 
                message: userMessageText
            };
            
            // Add video URL for vision requests
            if (isVisionRequest) {
                // You can configure this URL or get it from settings
                requestBody.videoUrl = 'http://10.52.26.19:8080/video';
            }

            const res = await fetch(`${API_URL}/chat`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // 👈 Authentication
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!res.ok) throw new Error(`Chat API failed with status ${res.status}.`);

            const data = await res.json(); // Data contains bot response, audio, lipsync

            // 3. Extract bot response text for the history state
            const botMessagesForHistory = data.messages.map(msg => ({
                role: 'bot',
                content: msg.text
            }));
            const finalMessages = [...updatedMessagesAfterUser, ...botMessagesForHistory];
            
            setMessages(finalMessages); 

            // 4. Start the audio/animation playback
            startBotResponse(data.messages); 

            // 5. Save the complete conversation
            await saveChat(finalMessages);

        } catch (err) {
            console.error("Error in chat process:", err.message);
            // Fallback error message for the user
            const errorMessage = { role: 'bot', content: "Sorry, I'm having trouble connecting or accessing the server. Please check your token."};
            setMessages((prev) => [...prev, errorMessage]);
            startBotResponse([{ // Start playback for the error message
                text: errorMessage.content, 
                facialExpression: "sad",
                animation: "Idle",
                audio: null,
                lipsync: null
            }]);
        } finally {
            setLoading(false);
            setIsAnalyzingVision(false);
        }
    };

    const handleSelectChat = async (chatId) => {
        if (chatId === currentChatId) return; 
        
        try {
            const res = await fetch(`${API_URL}/chat-history/${chatId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(data.messages); 
                setCurrentChatId(data._id);
                startBotResponse([]); // Stop any current bot playback
            }
        } catch (err) {
            console.error('Failed to load chat:', err);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setCurrentChatId(null);
        startBotResponse([]); // Stop any current bot playback
    };

    return (
        // The main chat container
        <div className="h-screen w-full bg-[#28282B] text-white relative overflow-hidden">
            <Leva hidden />
            
            <Sidebar 
                onNewChat={handleNewChat} 
                onSelectChat={handleSelectChat} 
                currentChatId={currentChatId}
                refreshKey={sidebarRefreshKey} 
            />
            
            {/* Main 3D Area - Offset by Sidebar width */}
            <div className="absolute inset-0 z-0 pl-64">
                <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
                    <Experience />
                </Canvas>
            </div>

            {/* UI Layer (Buttons, Chat Input, and History Display) */}
            <UI 
                onSendMessage={handleSendMessage} 
                messages={messages} // Pass history to UI for display
            />
        </div>
    );
}

export default Screen;
