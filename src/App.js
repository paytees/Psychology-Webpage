import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from './config';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Body />
      <Footer />
      <Chatbot />
    </div>
  );
}

const Header = () => (
  <header className="header" style={{ backgroundColor: config.header.backgroundColor, color: config.header.textColor }}>
    <nav>
      <h1>{config.header.title}</h1>
      <ul>
        {config.header.links.map((link, idx) => (
          <li key={idx}>
            <a href={link.href} style={{ color: config.header.textColor }}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  </header>
);

const Body = () => (
  <section className="body-content" style={{ backgroundColor: config.body.backgroundColor }}>
    <div className="intro">
      <h2>{config.body.intro.title}</h2>
      <p style={{ color: config.body.textColor }}>{config.body.intro.description}</p>
    </div>
    <div className="image-section">
      {config.body.images.map((image, idx) => (
        <img key={idx} src={image.src} alt={image.alt} />
      ))}
    </div>
  </section>
);

const Footer = () => (
  <footer className="footer" style={{ backgroundColor: config.footer.backgroundColor, color: config.footer.textColor }}>
    <p>{config.footer.text}</p>
    <div>
      {config.footer.links.map((link, idx) => (
        <a key={idx} href={link.href} style={{ color: config.footer.textColor }}>{link.label}</a>
      ))}
    </div>
  </footer>
);

const Chatbot = () => {
  const [messages, setMessages] = useState([{ text: config.chatbot.welcomeMessage, sender: 'bot' }]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyExpiration, setApiKeyExpiration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(config.chatbot.models[0].value);

  const handleApiKeySubmit = () => {
    setApiKeyExpiration(Date.now() + 10 * 60 * 1000); // 10-minute expiration
  };

  const sendMessage = async (message) => {
    if (!apiKey || Date.now() > apiKeyExpiration) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "API key expired. Please enter a new key.", sender: 'bot' }
      ]);
      return;
    }

    setMessages([...messages, { text: message, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await callModelAPI(selectedModel, message);

      const botReply = response?.data?.choices?.[0]?.message?.content?.trim()
        ? response.data.choices[0].message.content.trim()
        : "Sorry, I couldn't process your question. Please try again.";

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botReply, sender: 'bot' }
      ]);
    } catch (error) {
      console.error("Error while sending message:", error.message || error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Sorry, an error occurred. Please try again.", sender: 'bot' }
      ]);
    }

    setIsLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
    }
  };

  const callModelAPI = async (model, message) => {
    const apiUrlMap = {
      "openai-gpt3": 'https://api.openai.com/v1/chat/completions',
      "gemini": 'https://gemini-api.example.com',
      "google-bard": 'https://bard-api.example.com',
      "anthropic-claude": 'https://anthropic-claude-api.example.com'
    };

    const params = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant specialized in psychology." },
        { role: "user", content: message }
      ],
      max_tokens: 150,
      temperature: 0.7
    };

    try {
      const response = await axios.post(apiUrlMap[model], params, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error("Error with API call:", error.response || error.message);
      throw error;
    }
  };

  return (
    <div className="chatbot">
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              <p style={{ backgroundColor: msg.sender === 'bot' ? config.chatbot.botReplyColor : config.chatbot.userReplyColor }}>
                {msg.text}
              </p>
            </div>
          ))}
        </div>
        {isLoading && <p>Loading...</p>}
        {(!apiKey || Date.now() > apiKeyExpiration) && (
          <div className="api-key-input">
            <input
              type="text"
              placeholder="Enter API key"
              onChange={(e) => setApiKey(e.target.value)}
              value={apiKey}
            />
            <button onClick={handleApiKeySubmit}>Submit Key</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="chat-input">
          <select
            className="model-selector"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {config.chatbot.models.map((model, idx) => (
              <option key={idx} value={model.value}>{model.label}</option>
            ))}
          </select>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config.chatbot.placeholder}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default App;
