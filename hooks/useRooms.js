import { useState, useRef } from "react";
import * as Haptics from "expo-haptics";
import { sampleRooms, roomCategories } from "../utils/roomUtils";

/**
 * Custom hook for managing room data, filtering, and category selection
 * @returns {object} Room management state and functions
 */
export const useRooms = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const scrollViewRef = useRef(null);

  // In a real app, this would be fetched from an API
  const rooms = sampleRooms;
  const categories = roomCategories;

  /**
   * Handle category selection with haptic feedback and auto-scroll
   * @param {object} category - Selected category object
   * @param {number} index - Category index for scroll positioning
   */
  const handleCategoryPress = (category, index) => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Toggle functionality - if same category clicked, reset to "All"
    if (selectedCategory === category.name && category.name !== "All") {
      setSelectedCategory("All");
      // Scroll to beginning to show "All" category
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    } else {
      setSelectedCategory(category.name);
      // Center the selected category
      const buttonWidth = 120; // Approximate button width
      const scrollPosition = Math.max(0, index * (buttonWidth + 12) - 150);
      scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
    }
  };

  /**
   * Get filtered rooms based on selected category
   * @returns {array} Filtered room array
   */
  const getFilteredRooms = () => {
    if (selectedCategory === "All") return rooms;
    return rooms.filter((room) => room.status === selectedCategory);
  };

  return {
    // State
    selectedCategory,
    scrollViewRef,

    // Data
    rooms,
    categories,
    filteredRooms: getFilteredRooms(),

    // Functions
    handleCategoryPress,
    getFilteredRooms,
  };
};
