// config.js
const config = {
    header: {
      title: "Psychology Student Platform",
      links: [
        { label: "Home", href: "#home" },
        { label: "Topics", href: "#topics" },
        { label: "Resources", href: "#resources" },
        { label: "Contact", href: "#contact" }
      ],
      backgroundColor: "#4A90E2",
      textColor: "white"
    },
    body: {
      intro: {
        title: "Welcome to Your Psychology Learning Hub",
        description: "Explore resources and information designed specifically for psychology students."
      },
      images: [
        {
          src: "https://media.istockphoto.com/id/1496640891/photo/shoulder-shot-of-indian-senior-couple-explaining-problems-to-psychologist-at-home-concept-of.jpg?s=1024x1024&w=is&k=20&c=C5lbn5L9TrqjDpr4zbhlazUrDXpprcBwKt5jFtCsYr0=",
          alt: "Psychology related image 1"
        },
        {
          src: "https://media.istockphoto.com/id/1210226489/photo/puzzle-jigsaw-heart-on-brain-mental-health-concept-world-autism-awareness-day.jpg?s=1024x1024&w=is&k=20&c=98i4HQrr7ynaj7jwV-wM9QRQyUusOwai8b0M0ukAhYo=",
          alt: "Psychology related image 2"
        },
        {
          src: "https://media.istockphoto.com/id/1369837941/photo/calm-young-woman-hold-hands-on-chest-praying.jpg?s=1024x1024&w=is&k=20&c=m_ygQSK6OqAczww5aMov03quP-g8e_RIEVdqS6A0Uf0=",
          alt: "Psychology related image 3"
        }
      ],
      backgroundColor: "#f4f4f4",
      textColor: "#333"
    },
    footer: {
      text: "&copy; 2024 Psychology Student Platform. All rights reserved.",
      links: [
        { label: "Facebook", href: "https://www.facebook.com" },
        { label: "Twitter", href: "https://www.twitter.com" },
        { label: "Instagram", href: "https://www.instagram.com" }
      ],
      backgroundColor: "#333",
      textColor: "white"
    },
    chatbot: {
      welcomeMessage: "Hi! How can I help you today with your psychology questions?",
      placeholder: "Ask a question about psychology...",
      botReplyColor: "#4CAF50",
      userReplyColor: "#f0f0f0",
      models: [
        { label: "OpenAI GPT-3", value: "openai-gpt3" },
        { label: "Gemini", value: "gemini" },
        { label: "Google Bard", value: "google-bard" },
        { label: "Anthropic Claude", value: "anthropic-claude" }
      ]
    }
  };
  
  export default config;
  