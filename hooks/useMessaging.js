import { useState, useEffect } from "react";
import { useNotifications } from "./useNotifications";

/**
 * Custom hook for managing real message conversations
 * @returns {object} Messaging state and functions
 */
export const useMessaging = () => {
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { sendLocalNotification } = useNotifications();

  useEffect(() => {
    // Load conversations from storage or database
    loadConversations();
  }, []);

  /**
   * Load conversations from local storage or database
   */
  const loadConversations = async () => {
    try {
      // For now, start with empty conversations
      // In the future, this would load from a database or local storage
      setConversations([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  /**
   * Start a new conversation with a contact
   * @param {Object} contact - Contact object from staff data
   */
  const startNewConversation = (contact) => {
    const existingConversation = conversations.find(
      (conv) => conv.contactId === contact.id
    );

    if (existingConversation) {
      // Return existing conversation ID
      return existingConversation.id;
    }

    // Create new conversation
    const newConversation = {
      id: Date.now(),
      contactId: contact.id,
      contactName: contact.name,
      contactPosition: contact.position,
      contactDepartment: contact.department,
      avatar_url: contact.avatar_url, // Use avatar_url to match database field
      lastMessage: null,
      lastMessageTime: null,
      unread: false,
      messages: [], // Array of individual messages
    };

    setConversations((prev) => [newConversation, ...prev]);
    return newConversation.id;
  };

  /**
   * Send a message in a conversation
   * @param {number} conversationId - ID of the conversation
   * @param {string} messageText - Text of the message
   * @param {string} messageType - Type of message (text, image, voice)
   */
  const sendMessage = (conversationId, messageText, messageType = "text") => {
    const timestamp = new Date();
    const newMessage = {
      id: Date.now(),
      text: messageText,
      type: messageType,
      timestamp: timestamp,
      isUser: true, // This message is from the current user
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: messageText,
            lastMessageTime: timestamp,
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      })
    );

    return newMessage.id;
  };

  /**
   * Mark conversation as read
   * @param {number} conversationId - ID of the conversation to mark as read
   */
  const markAsRead = (conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread: false } : conv
      )
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  /**
   * Mark all conversations as read
   */
  const markAllAsRead = () => {
    setConversations((prev) =>
      prev.map((conv) => ({ ...conv, unread: false }))
    );
    setUnreadCount(0);
  };

  /**
   * Get conversation by ID
   * @param {number} conversationId - ID of the conversation
   * @returns {Object|null} Conversation object or null
   */
  const getConversationById = (conversationId) => {
    return conversations.find((conv) => conv.id === conversationId) || null;
  };

  /**
   * Delete a conversation
   * @param {number} conversationId - ID of the conversation to delete
   */
  const deleteConversation = (conversationId) => {
    setConversations((prev) =>
      prev.filter((conv) => conv.id !== conversationId)
    );
    setUnreadCount((prev) => {
      const conversation = conversations.find(
        (conv) => conv.id === conversationId
      );
      return conversation && conversation.unread ? Math.max(0, prev - 1) : prev;
    });
  };

  /**
   * Simulate receiving a message (for testing)
   * @param {number} conversationId - ID of the conversation
   * @param {string} messageText - Text of the received message
   */
  const simulateReceivedMessage = (conversationId, messageText) => {
    const timestamp = new Date();
    const newMessage = {
      id: Date.now(),
      text: messageText,
      type: "text",
      timestamp: timestamp,
      isUser: false, // This message is from the other person
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            lastMessage: messageText,
            lastMessageTime: timestamp,
            unread: true,
            messages: [...conv.messages, newMessage],
          };

          // Send notification
          sendLocalNotification(conv.contactName, messageText, {
            type: "new_message",
            conversationId: conversationId,
            timestamp: timestamp.toISOString(),
          });

          return updatedConv;
        }
        return conv;
      })
    );

    setUnreadCount((prev) => prev + 1);
    return newMessage.id;
  };

  return {
    // State
    conversations,
    unreadCount,

    // Functions
    startNewConversation,
    sendMessage,
    markAsRead,
    markAllAsRead,
    getConversationById,
    deleteConversation,
    simulateReceivedMessage,
    loadConversations,
  };
};
