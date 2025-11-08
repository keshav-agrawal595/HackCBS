// src/components/UI.jsx

import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { MapScreen } from "./MapScreen";
import WeatherScreen from "./WeatherScreen"; 
import ObjectDetector from "./ObjectDetector";

// New Props: onSendMessage and messages
export const UI = ({ hidden, onSendMessage, messages, ...props }) => { 
    const input = useRef();
    // Get loading and message state from the refactored hook
    const { loading, cameraZoomed, setCameraZoomed, message } = useChat(); 
    const [showMap, setShowMap] = useState(false);
    const [showWeather, setShowWeather] = useState(false);
    const [showObjectDetector, setShowObjectDetector] = useState(false); 

    const sendMessage = () => {
        const text = input.current.value;
        // Call the controller function passed from Screen.jsx
        if (!loading && !message) {
            onSendMessage(text); // 👈 Calls the protected API function
            input.current.value = "";
        }
    };

    if (hidden) return null;

    const buttonStyle = "pointer-events-auto text-white p-4 rounded-md";

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
                
                {/* Header (Top Left) */}
                <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg pointer-events-auto ml-64">
                    <h1 className="font-black text-xl">Your own Co-Passenger</h1>
                    <p>There with you to guide you throughout your journey</p>
                </div>
                
                {/* Chat History Display */}
                {/* Adjusted position to account for the left sidebar */}
                <div className="absolute top-[10%] left-64 right-4 max-h-[50vh] overflow-y-auto p-4 pointer-events-auto z-10">
                    <div className="flex flex-col space-y-3 max-w-full">
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`p-3 rounded-xl max-w-[80%] ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white self-end' 
                                        : 'bg-gray-700 text-white self-start'
                                }`}
                            >
                                {msg.content}
                            </div>
                        ))}
                    </div>
                </div>


                {/* buttons => (Left and Right static buttons) */}
                <div className="flex justify-between items-end w-full pl-64">
                    {/* left buttons */}
                    <div className="flex flex-col gap-4 items-start">
                        <button className={`${buttonStyle} pointer-events-auto`} onClick={() => setShowWeather(true)}>
                            <img src="weather-icon.png" alt="Weather" className="w-8 h-8" />
                        </button>
                        
                        <button className={`${buttonStyle} pointer-events-auto`} onClick={() => setShowMap(true)}>
                            <img src="location-icon.png" alt="Location" className="w-8 h-8" />
                        </button>

                        <button className={buttonStyle}>
                            <img src="music-icon.png" alt="Music" className="w-8 h-8" />
                        </button>

                        <button className={buttonStyle}>
                            <img src="wifi-icon.png" alt="Health" className="w-8 h-8" />
                        </button>

                        <button className={buttonStyle}>
                            <img src="car-icon.png" alt="Car" className="w-8 h-8" />
                        </button>

                        <button className={buttonStyle}>
                            <img src="fastag-icon.png" alt="Fastag" className="w-12 h-8" />
                        </button>
                    </div>

                    {/* right buttons */}
                    <div className="flex flex-col gap-4 items-end">
                        <button className={buttonStyle}>
                            <img src="power-icon.png" alt="Power" className="w-8 h-8" />
                        </button>

                        <button className={buttonStyle}>
                            <img src="profile-icon.png" alt="Profile" className="w-8 h-8" />
                        </button>

                        <button className={buttonStyle}>
                            <img src="settings-icon.png" alt="Settings" className="w-8 h-8" />
                        </button>

                        <button className={buttonStyle}>
                            <img
                                src="notifications-icon.png"
                                alt="Notifications"
                                className="w-8 h-8"
                            />
                        </button>

                        <button className={`${buttonStyle} pointer-events-auto`} onClick={() => setShowObjectDetector(true)}>
                            <img src="search.png" alt="Search" className="w-8 h-8" />
                        </button>

                        <button className={buttonStyle}>
                            <img src="volume-icon.png" alt="Volume" className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Input */}
            <div className="fixed bottom-4 left-0 right-0 z-20 p-4 flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
                <input
                    className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
                    placeholder="Type a message..."
                    ref={input}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    disabled={loading || message}
                    onClick={sendMessage}
                    className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
                        loading || message ? "cursor-not-allowed opacity-30" : ""
                    }`}
                >
                    {loading ? 'Thinking...' : 'Send'}
                </button>
            </div>

            <MapScreen visible={showMap} onClose={() => setShowMap(false)} />
            {/* <WeatherScreen visible={showWeather} onClose={() => setShowWeather(false)} /> */}
            
            {showObjectDetector && (
                <div className="fixed top-0 left-0 right-0 bottom-0 z-20 bg-black bg-opacity-75 flex justify-center items-center">
                    <ObjectDetector onClose={() => setShowObjectDetector(false)} />
                    <button
                        onClick={() => setShowObjectDetector(false)}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full pointer-events-auto"
                    >
                        X
                    </button>
                </div>
            )}
        </>
    );
};
