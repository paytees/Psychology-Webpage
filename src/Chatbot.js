import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from './config';

function Chatbot({ token }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState('pending'); // 'pending', 'approved', 'denied'
  const chatWindowRef = useRef(null);

  // Automatically scroll to the bottom of the chat window on new messages
  useEffect(() => {
    if (chatWindowRef.current) chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  }, [messages]);

  // Fetch chatbot access approval status on load
  useEffect(() => {
    checkApprovalStatus();
  }, []);

  // Check user approval status
  const checkApprovalStatus = async () => {
    try {
      const response = await axios.get(config.api.chatbotAccessUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovalStatus(response.data.message === 'Access granted' ? 'approved' : 'denied');
    } catch (error) {
      if (error.response?.status === 403) {
        setApprovalStatus('denied');
        alert("Access to chatbot denied by admin.");
      } else {
        console.error("Error fetching approval status:", error.message);
      }
    }
  };

  // Function to send a message through the chatbot
  const handleSendMessage = async () => {
    if (approvalStatus !== 'approved') {
      alert("Access to the chatbot is not granted. Please contact the admin.");
      return;
    }

    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');

    try {
      const response = await axios.post(
        config.api.chatApiUrl,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botReply = response.data.reply || config.chatbot.defaultBotReply;
      setMessages((prevMessages) => [...prevMessages, { text: botReply, sender: 'bot' }]);
    } catch (error) {
      console.error("Error with API call:", error.message);
      setMessages((prevMessages) => [...prevMessages, { text: config.chatbot.errorReply, sender: 'bot' }]);
    }
  };

  return (
    <div className="chatbot">
      <div className="welcome-message">
        {config.chatbot.welcomeMessage}
      </div>
      
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      
      {/* Display approval status or chat input based on status */}
      {approvalStatus === 'pending' && (
        <p className="status-message">Waiting for admin approval to access chatbot...</p>
      )}

      {approvalStatus === 'denied' && (
        <p className="status-message">Chatbot access denied by admin. Please contact support.</p>
      )}

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={config.chatbot.placeholder}
          disabled={approvalStatus !== 'approved'}
        />
        <button onClick={handleSendMessage} className="send-button" disabled={approvalStatus !== 'approved'}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
