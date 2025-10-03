/**
 * Message utility functions
 * Handles time formatting, filtering, and other message-related operations
 */

/**
 * Format timestamp to human-readable time
 * @param {string|Date} timestamp - The message timestamp
 * @returns {string} Formatted time string
 */
export const formatTime = (timestamp) => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInHours = (now - messageTime) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return messageTime.toLocaleDateString();
  }
};

/**
 * Generate avatar initials from full name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "John Doe" -> "JD")
 */
export const getAvatarInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

/**
 * Filter messages based on search query
 * @param {Array} messages - Array of message objects
 * @param {string} searchQuery - Search string
 * @returns {Array} Filtered messages
 */
export const filterMessages = (messages, searchQuery) => {
  if (!searchQuery.trim()) return messages;

  const query = searchQuery.toLowerCase();
  return messages.filter(
    (message) =>
      message.name.toLowerCase().includes(query) ||
      message.lastMessage.toLowerCase().includes(query)
  );
};

/**
 * Sort messages by timestamp (newest first)
 * @param {Array} messages - Array of message objects
 * @returns {Array} Sorted messages
 */
export const sortMessagesByTime = (messages) => {
  return [...messages].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
};

/**
 * Count unread messages
 * @param {Array} messages - Array of message objects
 * @returns {number} Number of unread messages
 */
export const countUnreadMessages = (messages) => {
  return messages.filter((message) => message.unread).length;
};
