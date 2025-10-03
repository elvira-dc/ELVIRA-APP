import { useState } from "react";
import { Alert } from "react-native";
import { notifyAbsenceRequestSubmitted } from "../utils/notificationService";
import { useAbsenceRequests } from "./useAbsenceRequests";

export const useCalendarLogic = (staffId = null, hotelId = null) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month' or 'week'

  // Absence request state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState("");
  const [notes, setNotes] = useState("");

  // Absence requests integration
  const {
    absenceRequests,
    loading: absenceLoading,
    submitAbsenceRequest: submitToDatabase,
    updateAbsenceRequest,
    deleteAbsenceRequest,
    getRequestsForDateRange,
    formatRequestType,
    getStatusColor: getAbsenceStatusColor,
  } = useAbsenceRequests(staffId, hotelId);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const generateCalendarDays = () => {
    if (viewMode === "week") {
      return generateWeekDays();
    }

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getDisplayTitle = () => {
    if (viewMode === "month") {
      return `${
        monthNames[currentDate.getMonth()]
      } ${currentDate.getFullYear()}`;
    } else {
      const weekDays = generateWeekDays();
      const startDate = weekDays[0];
      const endDate = weekDays[6];

      if (startDate.getMonth() === endDate.getMonth()) {
        return `${
          monthNames[startDate.getMonth()]
        } ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
      } else {
        return `${monthNames[startDate.getMonth()]} ${startDate.getDate()} - ${
          monthNames[endDate.getMonth()]
        } ${endDate.getDate()}, ${startDate.getFullYear()}`;
      }
    }
  };

  const getShiftsTitle = () => {
    return viewMode === "month" ? "Month's shifts" : "Week shift";
  };

  const getCurrentDateRange = () => {
    if (viewMode === "month") {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      return { start: startOfMonth, end: endOfMonth };
    } else {
      const weekDays = generateWeekDays();
      return { start: weekDays[0], end: weekDays[6] };
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date) => {
    return (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  };

  // Date selection handlers for absence requests
  const handleDatePress = (date) => {
    if (!isSelectingRange) {
      // Start range selection
      setStartDate(date);
      setEndDate(null);
      setIsSelectingRange(true);
    } else {
      // Complete range selection
      if (date < startDate) {
        // If selected date is before start date, swap them
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setModalVisible(true);
    }
    setSelectedDate(date);
  };

  const resetSelection = () => {
    setStartDate(null);
    setEndDate(null);
    setIsSelectingRange(false);
    setModalVisible(false);
    setSelectedRequestType("");
    setNotes("");
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isStartDate = (date) => {
    return startDate && date.toDateString() === startDate.toDateString();
  };

  const isEndDate = (date) => {
    return endDate && date.toDateString() === endDate.toDateString();
  };

  const submitAbsenceRequest = async () => {
    if (!selectedRequestType) {
      Alert.alert("Error", "Please select a request type");
      return;
    }

    if (!staffId || !hotelId) {
      Alert.alert("Error", "Missing staff or hotel information");
      return;
    }

    try {
      const requestData = {
        requestType: selectedRequestType,
        startDate: startDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        endDate: endDate.toISOString().split("T")[0],
        notes: notes || null,
      };

      await submitToDatabase(requestData);

      const startDateString = startDate.toLocaleDateString();
      const endDateString = endDate.toLocaleDateString();

      Alert.alert(
        "Success",
        `Absence request submitted for ${startDateString} to ${endDateString}`,
        [{ text: "OK", onPress: resetSelection }]
      );

      // Send notification about the submitted request
      try {
        await notifyAbsenceRequestSubmitted(
          startDateString,
          endDateString,
          selectedRequestType
        );
      } catch (error) {
        console.log("Error sending notification:", error);
      }
    } catch (error) {
      console.error("Error submitting absence request:", error);
      Alert.alert(
        "Error",
        "Failed to submit absence request. Please try again."
      );
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "meeting":
        return "#FF5A5F";
      case "presentation":
        return "#FF8A80";
      case "call":
        return "#FFAB91";
      default:
        return "#8E8E93";
    }
  };

  return {
    // State
    selectedDate,
    currentDate,
    viewMode,
    startDate,
    endDate,
    isSelectingRange,
    modalVisible,
    selectedRequestType,
    notes,

    // Setters
    setSelectedDate,
    setCurrentDate,
    setViewMode,
    setSelectedRequestType,
    setNotes,
    setModalVisible,

    // Calendar functions
    generateCalendarDays,
    generateWeekDays,
    navigatePrevious,
    navigateNext,
    goToToday,
    getDisplayTitle,
    getShiftsTitle,
    getCurrentDateRange,

    // Date helpers
    isToday,
    isSameMonth,
    isDateInRange,
    isStartDate,
    isEndDate,

    // Absence request functions
    handleDatePress,
    resetSelection,
    submitAbsenceRequest,

    // Absence request data
    absenceRequests,
    absenceLoading,
    getRequestsForDateRange,
    formatRequestType,
    getAbsenceStatusColor,
    updateAbsenceRequest,
    deleteAbsenceRequest,

    // Utilities
    getEventTypeColor,
  };
};
