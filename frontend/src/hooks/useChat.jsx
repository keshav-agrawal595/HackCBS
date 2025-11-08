// src/hooks/useChat.jsx

import { createContext, useContext, useEffect, useState } from "react";
// Removed: backendUrl and the `chat` function logic

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    // Renamed for clarity: this queue holds messages only for audio/lipsync playback
    const [messagesQueue, setMessagesQueue] = useState([]); 
    const [message, setMessage] = useState(); // The currently playing message
    
    // Loading is exposed to the controller (Screen.jsx)
    const [loading, setLoading] = useState(false); 
    const [cameraZoomed, setCameraZoomed] = useState(true);
    const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);

    // New function: Screen.jsx calls this when it gets a response from the server
    const startBotResponse = (messagesArray) => {
        setMessagesQueue(messagesArray);
    };

    const onMessagePlayed = () => {
        setMessagesQueue((queue) => queue.slice(1));
    };

    useEffect(() => {
        if (messagesQueue.length > 0) {
            setMessage(messagesQueue[0]);
        } else {
            setMessage(null);
        }
    }, [messagesQueue]);

    return (
        <ChatContext.Provider
            value={{
                startBotResponse, // Exposed for Screen.jsx to trigger playback
                setLoading, // Exposed for Screen.jsx to control loading state
                message, 
                onMessagePlayed,
                loading, 
                cameraZoomed,
                setCameraZoomed,
                isAnalyzingVision,
                setIsAnalyzingVision,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};
