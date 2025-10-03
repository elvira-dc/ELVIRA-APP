import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const ShiftsList = ({
  viewMode,
  schedules,
  schedulesLoading,
  handleShiftPress,
  clockIn,
  clockOut,
  formatShiftTime,
  getShiftTypeColor,
  getStatusColor,
  currentDateRange,
  showHeader = true,
}) => {
  return (
    <View style={styles.eventsSection}>
      {showHeader && (
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>
            {(() => {
              if (viewMode === "month") {
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
                return `${
                  monthNames[
                    currentDateRange?.start?.getMonth() || new Date().getMonth()
                  ]
                } Shifts`;
              } else {
                return "This Week's Shifts";
              }
            })()}
          </Text>
          <View style={styles.shiftCountBadge}>
            <Text style={styles.shiftCountText}>{schedules.length}</Text>
          </View>
        </View>
      )}
      {schedulesLoading ? (
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading schedules...</Text>
        </View>
      ) : schedules.length > 0 ? (
        schedules.map((schedule) => (
          <TouchableOpacity
            key={schedule.id}
            style={styles.scheduleCard}
            onPress={() => handleShiftPress(schedule)}
            activeOpacity={0.7}
          >
            <View style={styles.scheduleHeader}>
              <View style={styles.scheduleDateContainer}>
                <Text style={styles.scheduleDate}>
                  {(() => {
                    // Parse date string safely to avoid timezone issues
                    const [year, month, day] =
                      schedule.schedule_date.split("-");
                    const localDate = new Date(
                      parseInt(year),
                      parseInt(month) - 1,
                      parseInt(day)
                    );
                    return localDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                  })()}
                </Text>
                {/* Show status badge only if not confirmed, otherwise show confirmed badge */}
                {schedule.is_confirmed ? (
                  <View style={styles.confirmedBadge}>
                    <Text style={styles.confirmedBadgeText}>✓ Confirmed</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.scheduleStatusBadge,
                      { backgroundColor: getStatusColor(schedule.status) },
                    ]}
                  >
                    <Text style={styles.scheduleStatusText}>
                      {schedule.status}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.scheduleDetails}>
              <View style={styles.shiftInfo}>
                <View
                  style={[
                    styles.shiftTypeIndicator,
                    {
                      backgroundColor: getShiftTypeColor(schedule.shift_type),
                    },
                  ]}
                />
                <Text style={styles.shiftType}>
                  {schedule.shift_type} SHIFT
                </Text>
              </View>
              <Text style={styles.shiftTime}>
                {formatShiftTime(schedule.shift_start, schedule.shift_end)}
              </Text>
            </View>

            {schedule.notes && (
              <Text style={styles.scheduleNotes}>📝 {schedule.notes}</Text>
            )}

            {/* Action buttons for today's schedule */}
            {(() => {
              // Parse schedule date safely and compare with today
              const [year, month, day] = schedule.schedule_date.split("-");
              const scheduleDate = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day)
              );
              const today = new Date();

              const isToday =
                scheduleDate.getFullYear() === today.getFullYear() &&
                scheduleDate.getMonth() === today.getMonth() &&
                scheduleDate.getDate() === today.getDate();

              return isToday;
            })() && (
              <View style={styles.scheduleActions}>
                {schedule.status === "SCHEDULED" &&
                  !schedule.actual_start_time && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.clockInButton]}
                      onPress={() => clockIn(schedule.id)}
                    >
                      <Text style={styles.actionButtonText}>Clock In</Text>
                    </TouchableOpacity>
                  )}

                {schedule.status === "CONFIRMED" &&
                  schedule.actual_start_time &&
                  !schedule.actual_end_time && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.clockOutButton]}
                      onPress={() => clockOut(schedule.id)}
                    >
                      <Text style={styles.actionButtonText}>Clock Out</Text>
                    </TouchableOpacity>
                  )}
              </View>
            )}
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No schedules this {viewMode === "month" ? "month" : "week"}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Your work schedules will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  eventsSection: {
    // Remove padding since it's now handled by parent container
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#484848",
    flex: 1,
  },
  shiftCountBadge: {
    backgroundColor: "#FF5A5F",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  shiftCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingState: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  scheduleDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    marginRight: 8,
  },
  scheduleStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  scheduleStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  confirmedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#34C759",
  },
  confirmedBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  confirmedText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "600",
  },
  scheduleDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  shiftInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  shiftTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  shiftType: {
    fontSize: 13,
    fontWeight: "500",
    color: "#484848",
  },
  shiftTime: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
  scheduleNotes: {
    fontSize: 12,
    color: "#8E8E93",
    fontStyle: "italic",
    marginTop: 4,
  },
  scheduleActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  clockInButton: {
    backgroundColor: "#34C759",
  },
  clockOutButton: {
    backgroundColor: "#FF9500",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
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
