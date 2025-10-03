import { useState, useEffect } from "react";

/**
 * Custom hook for managing individual conversation data
 * @param {string} conversationId - The ID of the conversation
 * @param {string} contactName - The name of the contact
 * @returns {object} - Object containing messages, loading state, and send function
 */
export const useConversation = (conversationId, contactName) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading conversation data
    const loadConversation = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock conversation data matching the screenshot
      const mockMessages = [
        {
          id: 1,
          text: "Hola",
          timestamp: "2025-10-02T10:09:59.532Z",
          sender: "me",
          isMyMessage: true,
          type: "text",
        },
        {
          id: 2,
          text: "Thanks for your message! I'll get back to you soon.",
          timestamp: "2025-10-02T10:09:56.546Z",
          sender: contactName,
          isMyMessage: false,
          type: "text",
        },
        {
          id: 3,
          text: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Beautiful landscape
          timestamp: "2025-10-02T10:10:04.409Z",
          sender: "me",
          isMyMessage: true,
          type: "image",
        },
        {
          id: 4,
          text: "Nice photo! 📸",
          timestamp: "2025-10-02T10:10:05.910Z",
          sender: contactName,
          isMyMessage: false,
          type: "text",
        },
        {
          id: 5,
          text: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Sample audio for testing
          duration: 2.2,
          timestamp: "2025-10-02T10:10:14.693Z",
          sender: "me",
          isMyMessage: true,
          type: "voice",
        },
      ];

      setMessages(mockMessages);
      setLoading(false);
    };

    if (conversationId && contactName) {
      loadConversation();
    }
  }, [conversationId, contactName]);

  const sendMessage = (messageText) => {
    const newMessage = {
      id: messages.length + 1,
      text: messageText,
      timestamp: new Date().toISOString(),
      sender: "me",
      isMyMessage: true,
      type: "text",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Simulate receiving a response after a delay
    setTimeout(() => {
      const responseMessage = {
        id: messages.length + 2,
        text: "Thanks for your message! I'll get back to you soon.",
        timestamp: new Date().toISOString(),
        sender: contactName,
        isMyMessage: false,
        type: "text",
      };

      setMessages((prevMessages) => [...prevMessages, responseMessage]);
    }, 1000);
  };

  const sendImage = (imageUri) => {
    const newMessage = {
      id: messages.length + 1,
      text: imageUri, // Use 'text' field for image URL to match render function
      timestamp: new Date().toISOString(),
      sender: "me",
      isMyMessage: true,
      type: "image",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Simulate receiving a response after a delay
    setTimeout(() => {
      const responseMessage = {
        id: messages.length + 2,
        text: "Nice photo! 📸",
        timestamp: new Date().toISOString(),
        sender: contactName,
        isMyMessage: false,
        type: "text",
      };

      setMessages((prevMessages) => [...prevMessages, responseMessage]);
    }, 1500);
  };

  const sendVoice = (audioUri, duration) => {
    const newMessage = {
      id: messages.length + 1,
      text: audioUri, // Use 'text' field for audio URL to match render function
      duration: duration,
      timestamp: new Date().toISOString(),
      sender: "me",
      isMyMessage: true,
      type: "voice",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Simulate receiving a response after a delay
    setTimeout(() => {
      const responseMessage = {
        id: messages.length + 2,
        text: "Thanks for the voice message! 🎤",
        timestamp: new Date().toISOString(),
        sender: contactName,
        isMyMessage: false,
        type: "text",
      };

      setMessages((prevMessages) => [...prevMessages, responseMessage]);
    }, 1500);
  };

  return {
    messages,
    loading,
    sendMessage,
    sendImage,
    sendVoice,
  };
};
