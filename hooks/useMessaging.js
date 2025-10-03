import { useState, useEffect } from "react";
import { useNotifications } from "./useNotifications";

/**
 * Custom hook for managing WhatsApp-style message notifications
 * @returns {object} Messaging state and functions
 */
export const useMessaging = () => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { sendLocalNotification } = useNotifications();

  // Sample conversations for demo
  const sampleConversations = [
    {
      id: 1,
      name: "Hotel Manager",
      lastMessage: "Don't forget about the staff meeting tomorrow",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unread: true,
      avatar: null,
    },
    {
      id: 2,
      name: "Housekeeping Team",
      lastMessage: "Room 301 needs urgent cleaning",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      unread: true,
      avatar: null,
    },
    {
      id: 3,
      name: "Reception",
      lastMessage: "Guest complaint about room 205",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unread: false,
      avatar: null,
    },
  ];

  useEffect(() => {
    // Initialize with sample data
    setMessages(sampleConversations);
    const unreadMessages = sampleConversations.filter(
      (msg) => msg.unread
    ).length;
    setUnreadCount(unreadMessages);

    // Simulate receiving new messages every 30 seconds for demo
    const messageInterval = setInterval(() => {
      simulateNewMessage();
    }, 30000);

    return () => clearInterval(messageInterval);
  }, []);

  /**
   * Simulate receiving a new message (like WhatsApp)
   */
  const simulateNewMessage = async () => {
    const sampleMessages = [
      { from: "Hotel Manager", text: "Please check the front desk schedule" },
      {
        from: "Maintenance",
        text: "Air conditioning in room 102 needs repair",
      },
      { from: "Kitchen Staff", text: "Room service request for room 304" },
      {
        from: "Security",
        text: "Late night guest check-in requires attention",
      },
      { from: "Housekeeping", text: "Extra towels needed for room 208" },
    ];

    const randomMessage =
      sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

    // Send WhatsApp-style notification
    await sendLocalNotification(`${randomMessage.from}`, randomMessage.text, {
      type: "new_message",
      sender: randomMessage.from,
      timestamp: new Date().toISOString(),
    });

    // Update messages list
    const newMessage = {
      id: Date.now(),
      name: randomMessage.from,
      lastMessage: randomMessage.text,
      timestamp: new Date(),
      unread: true,
      avatar: null,
    };

    setMessages((prevMessages) => {
      // Remove existing conversation with same sender and add new one at top
      const filteredMessages = prevMessages.filter(
        (msg) => msg.name !== randomMessage.from
      );
      return [newMessage, ...filteredMessages];
    });

    setUnreadCount((prev) => prev + 1);
  };

  /**
   * Mark conversation as read
   * @param {number} conversationId - ID of the conversation to mark as read
   */
  const markAsRead = (conversationId) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === conversationId ? { ...msg, unread: false } : msg
      )
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  /**
   * Mark all messages as read
   */
  const markAllAsRead = () => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => ({ ...msg, unread: false }))
    );
    setUnreadCount(0);
  };

  /**
   * Send a new message notification
   * @param {string} recipientName - Name of the recipient
   * @param {string} messageText - Text of the message
   */
  const sendMessageNotification = async (recipientName, messageText) => {
    await sendLocalNotification(
      `Message sent to ${recipientName}`,
      messageText,
      {
        type: "message_sent",
        recipient: recipientName,
        timestamp: new Date().toISOString(),
      }
    );
  };

  return {
    // State
    messages,
    unreadCount,

    // Functions
    markAsRead,
    markAllAsRead,
    sendMessageNotification,
    simulateNewMessage,
  };
};
