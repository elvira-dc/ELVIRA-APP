import { useState } from "react";

/**
 * Custom hook to manage calendar state and modal management
 * Consolidates state that was previously scattered across CalendarScreen
 */
export const useCalendarState = () => {
  // Shift modal state
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  // Shift modal handlers
  const handleShiftPress = (schedule) => {
    setSelectedShift(schedule);
    setShiftModalVisible(true);
  };

  const closeShiftModal = () => {
    setShiftModalVisible(false);
    setSelectedShift(null);
  };

  return {
    // State
    shiftModalVisible,
    selectedShift,

    // Setters
    setShiftModalVisible,
    setSelectedShift,

    // Handlers
    handleShiftPress,
    closeShiftModal,
  };
};
