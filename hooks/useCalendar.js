import { useState } from "react";
import {
  generateMonthDays,
  generateWeekDays,
  getMonthYearDisplay,
  getWeekRangeDisplay,
  navigateDate,
} from "../utils/dateUtils";

/**
 * Custom hook for managing calendar state and operations
 */
export const useCalendar = (initialViewMode = "month") => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(initialViewMode);

  const generateCalendarDays = () => {
    return viewMode === "week"
      ? generateWeekDays(currentDate)
      : generateMonthDays(currentDate);
  };

  const navigatePrevious = () => {
    const newDate = navigateDate(currentDate, "previous", viewMode);
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = navigateDate(currentDate, "next", viewMode);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getDisplayTitle = () => {
    return viewMode === "month"
      ? getMonthYearDisplay(currentDate)
      : getWeekRangeDisplay(currentDate);
  };

  const switchViewMode = (newMode) => {
    setViewMode(newMode);
  };

  return {
    // State
    selectedDate,
    currentDate,
    viewMode,

    // Actions
    setSelectedDate,
    setCurrentDate,
    switchViewMode,
    navigatePrevious,
    navigateNext,
    goToToday,

    // Computed values
    calendarDays: generateCalendarDays(),
    displayTitle: getDisplayTitle(),
  };
};
