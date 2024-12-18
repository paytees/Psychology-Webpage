const config = {
  api: {
    baseUrl: 'http://localhost:5000',
    loginUrl: 'http://localhost:5000/login',
    adminLoginUrl: 'http://localhost:5000/admin/login',
    chatbotAccessUrl: 'http://localhost:5000/chatbot-access',
    fetchPromptsUrl: 'http://localhost:5000/prompts',
    storePromptUrl: 'http://localhost:5000/prompts',
    chatApiUrl: 'http://localhost:5000/chat',  // Add your chat API URL here
    userRequestApiUrl: 'http://localhost:5000/user-requests',  // Add your user request API URL here
  },
  header: {
    title: "Psychology Student Platform",
    links: [
      { label: "Home", href: "#home" },
      { label: "Topics", href: "#topics" },
      { label: "Resources", href: "#resources" },
      { label: "Contact", href: "#contact" },
    ],
    backgroundColor: "#4A90E2",
    textColor: "white",
  },
  body: {
    intro: {
      title: "Welcome to Your Psychology Learning Hub",
      description: "Explore resources and information designed specifically for psychology students.",
    },
    images: [
      {
        src: "https://media.istockphoto.com/id/1496640891/photo/shoulder-shot-of-indian-senior-couple-explaining-problems-to-psychologist-at-home-concept-of.jpg?s=1024x1024&w=is&k=20&c=C5lbn5L9TrqjDpr4zbhlazUrDXpprcBwKt5jFtCsYr0=",
        alt: "Psychology related image 1",
      },
      {
        src: "https://media.istockphoto.com/id/1210226489/photo/puzzle-jigsaw-heart-on-brain-mental-health-concept-world-autism-awareness-day.jpg?s=1024x1024&w=is&k=20&c=98i4HQrr7ynaj7jwV-wM9QRQyUusOwai8b0M0ukAhYo=",
        alt: "Psychology related image 2",
      },
      {
        src: "https://media.istockphoto.com/id/1369837941/photo/calm-young-woman-hold-hands-on-chest-praying.jpg?s=1024x1024&w=is&k=20&c=m_ygQSK6OqAczww5aMov03quP-g8e_RIEVdqS6A0Uf0=",
        alt: "Psychology related image 3",
      },
    ],
    backgroundColor: "#f4f4f4",
    textColor: "#333",
  },
  prompts: {
    title: "Prompts for Psychology Learning",
    description: "Use these prompts to enhance your understanding of psychology topics.",
    promptListStyle: {
      margin: "20px 0",
      padding: "15px",
      backgroundColor: "#e0f7fa",
      borderRadius: "10px",
    },
    itemStyle: {
      margin: "10px 0",
      padding: "10px",
      backgroundColor: "#ffffff",
      border: "1px solid #ddd",
      borderRadius: "5px",
    },
    buttonStyle: {
      backgroundColor: "#4A90E2",
      color: "white",
      padding: "8px 16px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    addButton: {
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "8px 16px",
      borderRadius: "5px",
      cursor: "pointer",
      marginBottom: "10px",
    },
  },
  footer: {
    text: "&copy; 2024 Psychology Student Platform. All rights reserved.",
    links: [
      { label: "Facebook", href: "https://www.facebook.com" },
      { label: "Twitter", href: "https://www.twitter.com" },
      { label: "Instagram", href: "https://www.instagram.com" },
    ],
    backgroundColor: "#333",
    textColor: "white",
  },
  auth: {
    title: "Register or Login",
    inputStyle: { padding: "8px", borderRadius: "5px", margin: "5px 0" },
    buttonStyle: { padding: "10px 20px", margin: "5px", backgroundColor: "#4A90E2", color: "white" },
    adminCredentials: { username: 'admin', password: 'adminpassword' },
  },
  chatbot: {
    welcomeMessage: "Hi! How can I help you today with your psychology questions?",
    placeholder: "Ask a question about psychology...",
    apiKeyError: "Please request an API key first.",
    defaultBotReply: "I'm here to help with your psychology questions!",
    errorReply: "An error occurred, please try again later.",
    style: { 
      position: "fixed", 
      bottom: "20px", 
      right: "20px", 
      backgroundColor: "#FFF", 
      borderRadius: "10px", 
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      padding: "10px",
    },
    requestButtonStyle: { 
      backgroundColor: "#4CAF50", 
      color: "white", 
      padding: "8px 16px", 
      border: "none", 
      borderRadius: "5px", 
      cursor: "pointer",
    },
    sendButtonStyle: { 
      backgroundColor: "#4CAF50", 
      color: "white", 
      padding: "8px 16px", 
      border: "none", 
      borderRadius: "5px", 
      cursor: "pointer",
    },
  },
};

export default config;
