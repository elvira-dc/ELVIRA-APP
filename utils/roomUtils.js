/**
 * Room utility functions for colors, icons, and status management
 */

/**
 * Get bed icon color based on room status
 * @param {string} status - Room status
 * @returns {string} Color hex code
 */
export const getBedIconColor = (status) => {
  // Bed icons: red for DND, grey for all others
  return status === "DND" ? "#DC3545" : "#8E8E93";
};

/**
 * Get status icon color based on room status
 * @param {string} status - Room status
 * @returns {string} Color hex code
 */
export const getStatusIconColor = (status) => {
  switch ((status || "").toUpperCase().replace(/ /g, "_")) {
    case "CLEAN":
      return "#28A745"; // Green
    case "NOT_CLEAN":
      return "#DC3545"; // Red
    case "IN_PROGRESS":
      return "#FFC107"; // Yellow
    default:
      return "transparent"; // No icon for DND or default
  }
};

/**
 * Get status icon name based on room status
 * @param {string} status - Room status
 * @returns {string|null} Ionicons icon name or null
 */
export const getStatusIcon = (status) => {
  switch ((status || "").toUpperCase().replace(/ /g, "_")) {
    case "CLEAN":
      return "checkmark-circle";
    case "NOT_CLEAN":
      return "close-circle";
    case "IN_PROGRESS":
      return "time";
    default:
      return null;
  }
};

/**
 * Get status color for status displays
 * @param {string} status - Room status
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
  switch (status) {
    case "Clean":
      return "#28A745";
    case "DND":
      return "#6C757D";
    case "Not Clean":
      return "#DC3545";
    case "In Progress":
      return "#FF8A80";
    default:
      return "#8E8E93";
  }
};

/**
 * Get status background color for status displays
 * @param {string} status - Room status
 * @returns {string} Color hex code
 */
export const getStatusBackground = (status) => {
  switch (status) {
    case "Clean":
      return "#D4F7DC";
    case "DND":
      return "#E9ECEF";
    case "Not Clean":
      return "#F8D7DA";
    case "In Progress":
      return "#FFE8E6";
    default:
      return "#F2F2F7";
  }
};

/**
 * Default room categories for filtering
 */
export const roomCategories = [
  { id: "all", name: "All", icon: "home-outline" },
  { id: "dnd", name: "DND", icon: "moon-outline" },
  { id: "clean", name: "Clean", icon: "checkmark-circle-outline" },
  { id: "not-clean", name: "Not Clean", icon: "close-circle-outline" },
  { id: "in-progress", name: "In Progress", icon: "time-outline" },
];

/**
 * Sample room data - in a real app this would come from an API
 */
export const sampleRooms = [
  { id: "101", number: "101", status: "Clean", type: "Single", floor: 1 },
  { id: "102", number: "102", status: "DND", type: "Double", floor: 1 },
  { id: "103", number: "103", status: "Clean", type: "Single", floor: 1 },
  { id: "104", number: "104", status: "In Progress", type: "Suite", floor: 1 },
  { id: "201", number: "201", status: "Clean", type: "Double", floor: 2 },
  { id: "202", number: "202", status: "Not Clean", type: "Single", floor: 2 },
  { id: "203", number: "203", status: "DND", type: "Double", floor: 2 },
  { id: "204", number: "204", status: "Clean", type: "Suite", floor: 2 },
  { id: "301", number: "301", status: "In Progress", type: "Single", floor: 3 },
  { id: "302", number: "302", status: "Clean", type: "Double", floor: 3 },
  { id: "303", number: "303", status: "Not Clean", type: "Single", floor: 3 },
  { id: "304", number: "304", status: "DND", type: "Suite", floor: 3 },
];
