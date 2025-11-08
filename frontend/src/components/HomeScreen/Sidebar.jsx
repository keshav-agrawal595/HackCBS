// src/components/HomeScreen/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSignOutAlt, FaHistory } from 'react-icons/fa'; 
import { useAuth } from '../../context/AuthContext'; 

// Props: functions to handle history and a key to force refresh
const Sidebar = ({ onNewChat, onSelectChat, currentChatId, refreshKey }) => {
  const { token, logout, API_URL } = useAuth();
  const [chatList, setChatList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return; 
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/chat-history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setChatList(data); 
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch when token is available or after a save operation
    fetchHistory();
  }, [token, API_URL, refreshKey]); 

  return (
    // Fixed sidebar on the left for chat history
    <div className="fixed top-0 left-0 h-screen w-64 bg-[#1e1e20] text-white p-4 flex flex-col z-50">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-pink-400">
        <FaHistory /> Chat History
      </h2>
      
      {/* New Chat Button */}
      <button 
        onClick={onNewChat} 
        className="flex items-center justify-center p-3 mb-4 rounded-md bg-pink-500 hover:bg-pink-600 transition-colors"
      >
        <FaPlus className="mr-2" /> New Chat
      </button>
      
      {/* Chat History List */}
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading chats...</p>
        ) : (
          <ul className="space-y-2">
            {chatList.map(chat => (
              <li 
                key={chat._id} 
                onClick={() => onSelectChat(chat._id)}
                className={`p-2 rounded-md cursor-pointer transition-colors truncate ${
                  currentChatId === chat._id 
                    ? 'bg-pink-500 text-white font-semibold' 
                    : 'hover:bg-[#333333] text-gray-300'
                }`}
                title={chat.title}
              >
                {chat.title.substring(0, 30)}{chat.title.length > 30 ? '...' : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Logout Button */}
      <button 
        onClick={logout} 
        className="mt-6 flex items-center justify-center p-3 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
      >
        <FaSignOutAlt className="mr-2" /> Logout
      </button>
    </div>
  );
};

export default Sidebar;
