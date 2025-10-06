import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export const CalendarGrid = ({
  viewMode,
  calendarDays,
  onDatePress,
  onTodayPress,
  isToday,
  isSameMonth,
  isStartDate,
  isEndDate,
  isDateInRange,
  getScheduleForDate,
  getShiftTypeColor,
  getStatusColor,
  formatShiftTime,
  hasAbsenceRequest,
  getAbsenceRequestsForDate,
  getAbsenceStatusColor,
  isCalendarVisible, // add this prop
  selectedStaffName, // new prop
  isAdminManager, // new prop
}) => {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper function to check if a date is the start of an absence range
  const isAbsenceRangeStart = (date, absenceRequests) => {
    if (!absenceRequests || absenceRequests.length === 0) return false;
    const dateStr = date.toISOString().split("T")[0];
    return absenceRequests.some((request) => request.start_date === dateStr);
  };

  // Helper function to check if a date is the end of an absence range
  const isAbsenceRangeEnd = (date, absenceRequests) => {
    if (!absenceRequests || absenceRequests.length === 0) return false;
    const dateStr = date.toISOString().split("T")[0];
    return absenceRequests.some((request) => request.end_date === dateStr);
  };

  // Helper function to check if a date is in the middle of an absence range
  const isAbsenceRangeMiddle = (date, absenceRequests) => {
    if (!absenceRequests || absenceRequests.length === 0) return false;
    const dateStr = date.toISOString().split("T")[0];
    return absenceRequests.some((request) => {
      return dateStr > request.start_date && dateStr < request.end_date;
    });
  };

  // Helper function to check if a date is a single-day absence (start and end on same date)
  const isAbsenceSingleDay = (date, absenceRequests) => {
    if (!absenceRequests || absenceRequests.length === 0) return false;
    const dateStr = date.toISOString().split("T")[0];
    return absenceRequests.some(
      (request) =>
        request.start_date === dateStr && request.end_date === dateStr
    );
  };

  if (!isCalendarVisible) {
    return null;
  }

  return (
    <View style={styles.calendarContainer}>
      {/* Week days header */}
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <Text key={index} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar days */}
      <View style={[viewMode === "month" ? styles.monthGrid : styles.weekGrid]}>
        {calendarDays.map((date, index) => {
          const schedule = getScheduleForDate ? getScheduleForDate(date) : null;
          const hasAbsence = hasAbsenceRequest
            ? hasAbsenceRequest(date)
            : false;
          const absenceRequests = getAbsenceRequestsForDate
            ? getAbsenceRequestsForDate(date)
            : [];

          // Determine absence range position
          const isAbsenceStart = isAbsenceRangeStart(date, absenceRequests);
          const isAbsenceEnd = isAbsenceRangeEnd(date, absenceRequests);
          const isAbsenceMiddle = isAbsenceRangeMiddle(date, absenceRequests);
          const isSingleDay = isAbsenceSingleDay(date, absenceRequests);

          return (
            <TouchableOpacity
              key={index}
              style={[
                viewMode === "month" ? styles.monthDayCell : styles.weekDayCell,
                isToday(date) && styles.todayCell,
                !isSameMonth(date) && styles.otherMonthCell,
                isStartDate(date) && styles.startDateCell,
                isEndDate(date) && styles.endDateCell,
                isDateInRange(date) &&
                  !isStartDate(date) &&
                  !isEndDate(date) &&
                  styles.rangeDateCell,
                schedule && styles.scheduleCell,
                // Absence range styling
                hasAbsence && styles.absenceCell,
                isSingleDay && styles.absenceSingleDayContainer,
                isAbsenceStart && !isSingleDay && styles.absenceRangeStart,
                isAbsenceEnd && !isSingleDay && styles.absenceRangeEnd,
                isAbsenceMiddle && styles.absenceRangeMiddle,
              ]}
              onPress={() => onDatePress(date)}
            >
              {isSingleDay && (
                <View
                  style={styles.absenceSingleDayBorder}
                  pointerEvents="none"
                />
              )}
              <Text
                style={[
                  styles.dayText,
                  isToday(date) && styles.todayText,
                  !isSameMonth(date) && styles.otherMonthText,
                ]}
              >
                {date.getDate()}
              </Text>

              {/* Schedule indicator */}
              {schedule && (
                <View style={styles.scheduleInfo}>
                  <View
                    style={[
                      styles.shiftTypeIndicator,
                      {
                        backgroundColor: getShiftTypeColor
                          ? getShiftTypeColor(schedule.shift_type)
                          : "#007AFF",
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.statusIndicator,
                      {
                        backgroundColor: getStatusColor
                          ? getStatusColor(schedule.status)
                          : "#8E8E93",
                      },
                    ]}
                  />
                  {viewMode === "week" && formatShiftTime && (
                    <Text style={styles.shiftTimeText}>
                      {schedule.shift_start.substring(0, 5)}
                    </Text>
                  )}
                </View>
              )}

              {/* Absence indicator */}
              {hasAbsence && (
                <View style={styles.absenceInfo}>
                  {absenceRequests.map((request, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.absenceIndicator,
                        {
                          backgroundColor: getAbsenceStatusColor
                            ? getAbsenceStatusColor(request.status)
                            : "#FF9500",
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Today button inside calendar container */}
      <View style={styles.todayButtonContainer}>
        <TouchableOpacity
          style={[
            styles.calendarTodayButton,
            viewMode === "week" && styles.weekTodayButton,
          ]}
          onPress={onTodayPress}
        >
          <Text style={styles.calendarTodayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Selected staff name display for Admin/Manager */}
      {isAdminManager && selectedStaffName && (
        <View style={styles.selectedStaffContainer}>
          <Text style={styles.selectedStaffText}>
            Selected Staff: {selectedStaffName}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  weekDayText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#8E8E93",
    textAlign: "center",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: -70,
    rowGap: 8,
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
    borderRadius: 0,
    marginBottom: 8,
  },
  weekDayCell: {
    width: "14.285%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 0,
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
    minHeight: 40,
    borderRadius: 8,
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
  // Schedule styles
  scheduleCell: {
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 8,
  },
  scheduleInfo: {
    position: "absolute",
    bottom: 2,
    left: 2,
    right: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  shiftTypeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  shiftTimeText: {
    fontSize: 8,
    color: "#484848",
    fontWeight: "500",
  },
  // Today button styles
  todayButtonContainer: {
    alignItems: "flex-end",
    marginTop: -4,
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
  // Absence styles
  absenceCell: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
  },
  absenceSingleDayContainer: {
    position: "relative",
  },
  absenceSingleDayBorder: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderWidth: 2,
    borderColor: "#FF9500",
    borderRadius: 8,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  absenceRangeStart: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FF9500",
    borderStyle: "solid",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  absenceRangeMiddle: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FF9500",
    borderStyle: "solid",
  },
  absenceRangeEnd: {
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FF9500",
    borderStyle: "solid",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  absenceInfo: {
    position: "absolute",
    top: 2,
    right: 2,
    flexDirection: "row",
    gap: 2,
  },
  absenceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fff",
  },
  // Selected staff styles
  selectedStaffContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 5,
    borderRadius: 5,
  },
  selectedStaffText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
});
