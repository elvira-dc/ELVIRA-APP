import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const CalendarScreen = () => {
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

  const events = [];

  const requestTypes = [
    { value: "vacation", label: "Vacation", icon: "sunny-outline" },
    { value: "sick", label: "Sick", icon: "medical-outline" },
    { value: "personal", label: "Personal", icon: "person-outline" },
    { value: "training", label: "Training", icon: "school-outline" },
    { value: "other", label: "Other", icon: "help-outline" },
  ];

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
    return viewMode === "week" ? "Week shift" : "Month's shifts";
  };

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

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const submitAbsenceRequest = () => {
    if (!selectedRequestType) {
      Alert.alert("Error", "Please select a request type");
      return;
    }

    // Here you would typically send the request to your backend
    Alert.alert(
      "Success",
      `Absence request submitted for ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      [{ text: "OK", onPress: resetSelection }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === "month" && styles.activeToggle,
              ]}
              onPress={() => setViewMode("month")}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "month" && styles.activeToggleText,
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === "week" && styles.activeToggle,
              ]}
              onPress={() => setViewMode("week")}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "week" && styles.activeToggleText,
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.navigationRow}>
          <TouchableOpacity style={styles.navButton} onPress={navigatePrevious}>
            <Ionicons name="chevron-back" size={24} color="#FF5A5F" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{getDisplayTitle()}</Text>
          <TouchableOpacity style={styles.navButton} onPress={navigateNext}>
            <Ionicons name="chevron-forward" size={24} color="#FF5A5F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Week days header */}
          <View style={styles.weekHeader}>
            {weekDays.map((day, index) => (
              <View
                key={index}
                style={[
                  viewMode === "month"
                    ? styles.monthDayCell
                    : styles.weekDayCell,
                  { backgroundColor: "transparent" },
                ]}
              >
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          <View
            style={[viewMode === "month" ? styles.monthGrid : styles.weekGrid]}
          >
            {generateCalendarDays().map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  viewMode === "month"
                    ? styles.monthDayCell
                    : styles.weekDayCell,
                  isToday(date) && styles.todayCell,
                  !isSameMonth(date) && styles.otherMonthCell,
                  isStartDate(date) && styles.startDateCell,
                  isEndDate(date) && styles.endDateCell,
                  isDateInRange(date) &&
                    !isStartDate(date) &&
                    !isEndDate(date) &&
                    styles.rangeDateCell,
                ]}
                onPress={() => handleDatePress(date)}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday(date) && styles.todayText,
                    !isSameMonth(date) && styles.otherMonthText,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Today button below calendar grid */}
          <View style={styles.todayButtonContainer}>
            <TouchableOpacity
              style={[
                styles.calendarTodayButton,
                viewMode === "week" && styles.weekTodayButton,
              ]}
              onPress={goToToday}
            >
              <Text style={styles.calendarTodayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic shifts title */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>{getShiftsTitle()}</Text>
          {events.length > 0 ? (
            events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View
                  style={[
                    styles.eventIndicator,
                    { backgroundColor: getEventTypeColor(event.type) },
                  ]}
                />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No shifts this {viewMode}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Shifts will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Absence Request Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetSelection}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request Absence</Text>
                <TouchableOpacity onPress={resetSelection}>
                  <Ionicons name="close" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateRangeContainer}>
                <Text style={styles.dateRangeText}>
                  {startDate?.toLocaleDateString()} -{" "}
                  {endDate?.toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.sectionLabel}>Request Type</Text>
              <View style={styles.requestTypeContainer}>
                {requestTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.requestTypeButton,
                      selectedRequestType === type.value &&
                        styles.selectedRequestType,
                    ]}
                    onPress={() => setSelectedRequestType(type.value)}
                  >
                    <Ionicons
                      name={type.icon}
                      size={20}
                      color={
                        selectedRequestType === type.value
                          ? "#FFFFFF"
                          : "#FF5A5F"
                      }
                    />
                    <Text
                      style={[
                        styles.requestTypeText,
                        selectedRequestType === type.value &&
                          styles.selectedRequestTypeText,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any additional information..."
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetSelection}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={submitAbsenceRequest}
                >
                  <Text style={styles.submitButtonText}>Submit Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFABA",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: "#FF5A5F",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  activeToggleText: {
    color: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#484848",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#484848",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    margin: 16,

    borderRadius: 16,
    padding: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  todayButtonContainer: {
    alignItems: "flex-end",
  },
  calendarTodayButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  weekTodayButton: {
    alignSelf: "flex-end",
  },
  calendarTodayButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8E8E93",
    textAlign: "center",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 4,
    marginBottom: -70,
  },
  weekGrid: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-evenly",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  monthDayCell: {
    width: "14.285%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 8,
  },
  weekDayCell: {
    width: "14.285%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  todayCell: {
    backgroundColor: "#FF5A5F",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF5A5F",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 45,
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: "#484848",
    textAlign: "center",
    fontWeight: "500",
  },
  todayText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  otherMonthText: {
    color: "#C7C7CC",
  },
  eventsSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#484848",
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  eventIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#484848",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: "#8E8E93",
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8E8E93",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#C7C7CC",
  },
  // Date range selection styles
  startDateCell: {
    backgroundColor: "#FF5A5F",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    shadowColor: "#FF5A5F",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  endDateCell: {
    backgroundColor: "#FF5A5F",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#FF5A5F",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rangeDateCell: {
    backgroundColor: "#FFE5E5",
    borderRadius: 0,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalScrollContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#484848",
  },
  dateRangeContainer: {
    backgroundColor: "#F8F8F8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  dateRangeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5A5F",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#484848",
    marginBottom: 12,
  },
  requestTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  requestTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FF5A5F",
    backgroundColor: "#FFFFFF",
    minWidth: "45%",
  },
  selectedRequestType: {
    backgroundColor: "#FF5A5F",
  },
  requestTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF5A5F",
    marginLeft: 6,
  },
  selectedRequestTypeText: {
    color: "#FFFFFF",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 20,
    maxHeight: 100,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#FF5A5F",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default CalendarScreen;
