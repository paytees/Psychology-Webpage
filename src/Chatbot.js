import React, { useState, useEffect, useRef, useCallback } from 'react';  // Added useRef here
import axios from 'axios';
import config from './config'; // Ensure you have this configuration file

function Chatbot({ token }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState('pending'); // 'pending', 'approved', 'denied'
  const [chatbotResponded, setChatbotResponded] = useState(false); // Track if the chatbot has responded
  const chatWindowRef = useRef(null); // This will work after importing useRef

  // Automatically scroll to the bottom of the chat window on new messages
  useEffect(() => {
    if (chatWindowRef.current) chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  }, [messages]);

  // Check user approval status (memoized with useCallback)
  const checkApprovalStatus = useCallback(async () => {
    try {
      const response = await axios.get(config.api.chatbotAccessUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApprovalStatus(response.data.message === 'Access granted' ? 'approved' : 'denied');
    } catch (error) {
      if (error.response?.status === 403) {
        setApprovalStatus('denied');
        alert('Access to chatbot denied by admin.');
      } else {
        console.error('Error fetching approval status:', error.message);
        setApprovalStatus('denied');
      }
    }
  }, [token]);

  // Fetch chatbot access approval status on load
  useEffect(() => {
    checkApprovalStatus();
  }, [checkApprovalStatus]);

  // Function to submit message without saving it to the database
  const handleSubmitRequest = async (message) => {
    if (!message) {
      console.error('Message is required');
      return;
    }
    try {
      const response = await axios.post(`${config.api.baseUrl}/chat`, { message, username: 'srilekha' });
      console.log(response.data.reply);  // Log the response from the backend
      // Update the chat history with the response
      setMessages((prevMessages) => [...prevMessages, { text: response.data.reply }]);

      // Mark chatbot as responded
      setChatbotResponded(true); // This triggers the "Connect with Admin" button
    } catch (error) {
      console.error('Error submitting message:', error);
    }
  };

  // Function to send a message through the chatbot
  const handleSendMessage = async () => {
    if (approvalStatus !== 'approved') {
      alert('Access to the chatbot is not granted. Please contact the admin.');
      return;
    }

    if (!input.trim()) {
      alert('Please enter a valid message.');
      return;
    }

    // Display user message in chat window
    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput(''); // Clear the input field

    try {
      // Call handleSubmitRequest to submit the user message
      await handleSubmitRequest(input);
    } catch (error) {
      console.error('Error with message submission:', error);
    }
  };

  // Function to handle "Connect with Admin" button click
  const handleConnectWithAdmin = () => {
    alert('Connecting you with the admin...');
    // You can add functionality to actually connect with the admin (e.g., open a new chat window, notify the admin, etc.)
  };

  return (
    <div className="chatbot">
      <div className="welcome-message">{config.chatbot.welcomeMessage}</div>

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
          placeholder={config.chatbot.placeholder || 'Type your message...'}
          disabled={approvalStatus !== 'approved'}
        />
        <button
          onClick={handleSendMessage}
          className="send-button"
          disabled={approvalStatus !== 'approved'}
        >
          Send
        </button>
      </div>

      {/* Display Connect with Admin button after chatbot responds */}
      {chatbotResponded && (
        <button
          onClick={handleConnectWithAdmin}
          className="connect-with-admin-button"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          Connect with Admin
        </button>
      )}
    </div>
  );
}

export default Chatbot;
