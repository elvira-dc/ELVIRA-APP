import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCalendarLogic } from "../hooks/useCalendarLogic";
import { useStaffData } from "../hooks/useStaffData";
import { useStaffSchedules } from "../hooks/useStaffSchedules";
import { useAuth } from "../hooks/useAuth";
import { useCalendarState } from "../hooks/useCalendarState";
import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { CalendarHeader } from "../components/calendar/CalendarHeader";
import { ShiftsList } from "../components/calendar/ShiftsList";
import { AbsenceList } from "../components/calendar/AbsenceList";
import { AbsenceRequestModal } from "../components/calendar/AbsenceRequestModal";
import { ShiftManagementModal } from "../components/calendar/ShiftManagementModal";
import { AbsenceManagementModal } from "../components/calendar/AbsenceManagementModal";

const CalendarScreen = () => {
  const { user } = useAuth();
  const { staffData } = useStaffData(user?.id);

  const {
    // State
    viewMode,
    startDate,
    endDate,
    modalVisible,
    selectedRequestType,
    notes,

    // Setters
    setViewMode,
    setSelectedRequestType,
    setNotes,

    // Calendar functions
    generateCalendarDays,
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
  } = useCalendarLogic(staffData?.id, staffData?.hotel_id || "demo-hotel-1");

  // Staff schedules integration
  const {
    schedules,
    loading: schedulesLoading,
    getScheduleForDate,
    clockIn,
    clockOut,
    updateScheduleStatus,
    formatShiftTime,
    getShiftTypeColor,
    getStatusColor,
  } = useStaffSchedules(staffData?.id, user?.id);

  // Filter schedules based on current view
  const { start: rangeStart, end: rangeEnd } = getCurrentDateRange();
  const filteredSchedules = schedules.filter((schedule) => {
    const [year, month, day] = schedule.schedule_date.split("-");
    const scheduleDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    return scheduleDate >= rangeStart && scheduleDate <= rangeEnd;
  });

  // Calendar state management
  const {
    shiftModalVisible,
    selectedShift,
    handleShiftPress,
    closeShiftModal,
  } = useCalendarState();

  // Absence management modal state
  const [absenceModalVisible, setAbsenceModalVisible] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);

  // Expand/collapse state for sections
  const [shiftsExpanded, setShiftsExpanded] = useState(true);
  const [absenceExpanded, setAbsenceExpanded] = useState(true);

  const handleAbsencePress = (request) => {
    setSelectedAbsence(request);
    setAbsenceModalVisible(true);
  };

  const closeAbsenceModal = () => {
    setAbsenceModalVisible(false);
    setSelectedAbsence(null);
  };

  const handleConfirmShift = async (scheduleId) => {
    return await updateScheduleStatus(scheduleId, "CONFIRMED", {
      is_confirmed: true,
      confirmed_at: new Date().toISOString(),
      confirmed_by: user?.id, // Add the confirmed_by field with current user ID
    });
  };

  const handleRequestChange = (scheduleId, changeType) => {
    // Handle different types of change requests
    console.log(`Request ${changeType} for schedule ${scheduleId}`);
    // You can implement specific logic for each change type here
  };

  // Helper function to get absence requests for a specific date
  const getAbsenceRequestsForDate = (date) => {
    if (!absenceRequests || absenceRequests.length === 0) return [];

    const dateStr = date.toISOString().split("T")[0];
    return absenceRequests.filter((request) => {
      const startDate = request.start_date;
      const endDate = request.end_date;
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  // Helper function to check if date has absence requests
  const hasAbsenceRequest = (date) => {
    return getAbsenceRequestsForDate(date).length > 0;
  };

  // Custom date press handler that checks for absence requests first
  const handleCustomDatePress = (date) => {
    const absenceRequestsForDate = getAbsenceRequestsForDate(date);

    if (absenceRequestsForDate.length > 0) {
      // If there are absence requests for this date, open the absence modal
      // If multiple requests, show the first one (or you could show a picker)
      const primaryRequest = absenceRequestsForDate[0];
      setSelectedAbsence(primaryRequest);
      setAbsenceModalVisible(true);
    } else {
      // If no absence requests, use the default date press behavior (for absence request creation)
      handleDatePress(date);
    }
  };

  const events = [];

  return (
    <SafeAreaView style={styles.container}>
      <CalendarHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        getDisplayTitle={getDisplayTitle}
        navigatePrevious={navigatePrevious}
        navigateNext={navigateNext}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <CalendarGrid
          viewMode={viewMode}
          calendarDays={generateCalendarDays()}
          onDatePress={handleCustomDatePress}
          onTodayPress={goToToday}
          isToday={isToday}
          isSameMonth={isSameMonth}
          isStartDate={isStartDate}
          isEndDate={isEndDate}
          isDateInRange={isDateInRange}
          getScheduleForDate={getScheduleForDate}
          getShiftTypeColor={getShiftTypeColor}
          getStatusColor={getStatusColor}
          formatShiftTime={formatShiftTime}
          hasAbsenceRequest={hasAbsenceRequest}
          getAbsenceRequestsForDate={getAbsenceRequestsForDate}
          getAbsenceStatusColor={getAbsenceStatusColor}
        />

        {/* Shifts Section */}
        <View style={styles.eventsSection}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShiftsExpanded(!shiftsExpanded)}
          >
            <Text style={styles.sectionTitle}>{getDisplayTitle()} Shifts</Text>
            <View style={styles.headerRight}>
              <View style={styles.shiftCountBadge}>
                <Text style={styles.shiftCountText}>
                  {filteredSchedules.length}
                </Text>
              </View>
              <Ionicons
                name={shiftsExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
                style={styles.chevronIcon}
              />
            </View>
          </TouchableOpacity>

          {shiftsExpanded && (
            <ShiftsList
              viewMode={viewMode}
              schedules={filteredSchedules}
              schedulesLoading={schedulesLoading}
              handleShiftPress={handleShiftPress}
              clockIn={clockIn}
              clockOut={clockOut}
              formatShiftTime={formatShiftTime}
              getShiftTypeColor={getShiftTypeColor}
              getStatusColor={getStatusColor}
              currentDateRange={{ start: rangeStart, end: rangeEnd }}
              showHeader={false}
            />
          )}
        </View>

        {/* My absence section */}
        <View style={styles.eventsSection}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setAbsenceExpanded(!absenceExpanded)}
          >
            <Text style={styles.sectionTitle}>My absence</Text>
            <Ionicons
              name={absenceExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {absenceExpanded && (
            <AbsenceList
              absenceRequests={absenceRequests}
              absenceLoading={absenceLoading}
              formatRequestType={formatRequestType}
              getAbsenceStatusColor={getAbsenceStatusColor}
              onAbsencePress={handleAbsencePress}
            />
          )}
        </View>
      </ScrollView>

      <AbsenceRequestModal
        visible={modalVisible}
        onClose={resetSelection}
        startDate={startDate}
        endDate={endDate}
        selectedRequestType={selectedRequestType}
        setSelectedRequestType={setSelectedRequestType}
        notes={notes}
        setNotes={setNotes}
        onSubmit={submitAbsenceRequest}
      />

      <ShiftManagementModal
        visible={shiftModalVisible}
        onClose={closeShiftModal}
        schedule={selectedShift}
        onClockIn={clockIn}
        onClockOut={clockOut}
        onConfirm={handleConfirmShift}
        onRequestChange={handleRequestChange}
        formatShiftTime={formatShiftTime}
        getShiftTypeColor={getShiftTypeColor}
        getStatusColor={getStatusColor}
      />

      <AbsenceManagementModal
        visible={absenceModalVisible}
        onClose={closeAbsenceModal}
        request={selectedAbsence}
        onUpdate={updateAbsenceRequest}
        onDelete={deleteAbsenceRequest}
        formatRequestType={formatRequestType}
        getAbsenceStatusColor={getAbsenceStatusColor}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  eventsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#484848",
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shiftCountBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  shiftCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  chevronIcon: {
    marginLeft: 4,
  },
  loadingState: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
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
});

export default CalendarScreen;
