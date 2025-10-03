import {
  ROOM_STATUS_COLORS,
  ROOM_STATUS_BACKGROUNDS,
  EVENT_TYPE_COLORS,
} from "../constants/theme";

/**
 * Color utility functions for consistent theming
 */

export const getRoomStatusColor = (status) => {
  return ROOM_STATUS_COLORS[status] || "#8E8E93";
};

export const getRoomStatusBackground = (status) => {
  return ROOM_STATUS_BACKGROUNDS[status] || "#F2F2F7";
};

export const getEventTypeColor = (type) => {
  return EVENT_TYPE_COLORS[type] || "#8E8E93";
};

/**
 * Room utility functions
 */

export const generateSampleRooms = () => [
  { id: "101", number: "101", status: "Available", type: "Single", floor: 1 },
  { id: "102", number: "102", status: "Occupied", type: "Double", floor: 1 },
  { id: "103", number: "103", status: "Available", type: "Single", floor: 1 },
  { id: "104", number: "104", status: "Reserved", type: "Suite", floor: 1 },
  { id: "201", number: "201", status: "Available", type: "Double", floor: 2 },
  { id: "202", number: "202", status: "Available", type: "Single", floor: 2 },
  { id: "203", number: "203", status: "Occupied", type: "Double", floor: 2 },
  { id: "204", number: "204", status: "Available", type: "Suite", floor: 2 },
  { id: "301", number: "301", status: "Reserved", type: "Single", floor: 3 },
  { id: "302", number: "302", status: "Available", type: "Double", floor: 3 },
  { id: "303", number: "303", status: "Available", type: "Single", floor: 3 },
  { id: "304", number: "304", status: "Occupied", type: "Suite", floor: 3 },
];

/**
 * Common text processing utilities
 */

export const getShiftsTitle = (viewMode) => {
  return viewMode === "week" ? "Week shift" : "Month's shifts";
};

export const getEmptyShiftsMessage = (viewMode) => {
  return `No shifts this ${viewMode}`;
};
