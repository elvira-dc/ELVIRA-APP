import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ShiftManagementModal = ({
  visible,
  onClose,
  schedule,
  onClockIn,
  onClockOut,
  onConfirm,
  onRequestChange,
  formatShiftTime,
  getShiftTypeColor,
  getStatusColor,
}) => {
  const [actionLoading, setActionLoading] = useState(false);

  if (!schedule) return null;

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      const success = await onClockIn(schedule.id);
      if (success) {
        Alert.alert("Success", "Clocked in successfully!");
        onClose();
      } else {
        Alert.alert("Error", "Failed to clock in. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while clocking in.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      const success = await onClockOut(schedule.id);
      if (success) {
        Alert.alert("Success", "Clocked out successfully!");
        onClose();
      } else {
        Alert.alert("Error", "Failed to clock out. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while clocking out.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      const success = await onConfirm(schedule.id);
      if (success) {
        Alert.alert("Success", "Shift confirmed successfully!");
        onClose();
      } else {
        Alert.alert("Error", "Failed to confirm shift. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while confirming shift.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChange = () => {
    Alert.alert("Request Change", "What would you like to request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Change Time",
        onPress: () => {
          onRequestChange?.(schedule.id, "time_change");
          onClose();
        },
      },
      {
        text: "Request Day Off",
        onPress: () => {
          onRequestChange?.(schedule.id, "day_off");
          onClose();
        },
      },
      {
        text: "Swap Shift",
        onPress: () => {
          onRequestChange?.(schedule.id, "shift_swap");
          onClose();
        },
      },
    ]);
  };

  const isToday = (() => {
    // Parse schedule date safely and compare with today
    const [year, month, day] = schedule.schedule_date.split("-");
    const scheduleDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    const today = new Date();

    return (
      scheduleDate.getFullYear() === today.getFullYear() &&
      scheduleDate.getMonth() === today.getMonth() &&
      scheduleDate.getDate() === today.getDate()
    );
  })();
  const canClockIn =
    schedule.status === "SCHEDULED" && !schedule.actual_start_time && isToday;
  const canClockOut =
    schedule.status === "CONFIRMED" &&
    schedule.actual_start_time &&
    !schedule.actual_end_time &&
    isToday;
  const canConfirm = schedule.status === "SCHEDULED" && !schedule.is_confirmed;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Shift Details</Text>
            <View style={styles.headerStatusContainer}>
              <View
                style={[
                  styles.headerStatusBadge,
                  {
                    backgroundColor: getStatusColor
                      ? getStatusColor(schedule.status)
                      : "#007AFF",
                  },
                ]}
              >
                <Text style={styles.headerStatusText}>{schedule.status}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Date and Shift Info */}
            <View style={styles.shiftHeader}>
              <Text style={styles.shiftDate}>
                {(() => {
                  // Parse date string safely to avoid timezone issues
                  const [year, month, day] = schedule.schedule_date.split("-");
                  const localDate = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                  );
                  return localDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                })()}
              </Text>
            </View>

            {/* Shift Type and Time */}
            <View style={styles.shiftDetails}>
              <View style={styles.shiftTypeRow}>
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
                <Text style={styles.shiftType}>
                  {schedule.shift_type} SHIFT
                </Text>
              </View>

              <Text style={styles.shiftTime}>
                {formatShiftTime
                  ? formatShiftTime(schedule.shift_start, schedule.shift_end)
                  : `${schedule.shift_start} - ${schedule.shift_end}`}
              </Text>

              {schedule.break_duration && (
                <Text style={styles.breakDuration}>
                  Break:{" "}
                  {schedule.break_duration
                    .replace(":", "h ")
                    .replace(":00", "m")}
                </Text>
              )}
            </View>

            {/* Confirmation Status */}
            {schedule.is_confirmed && (
              <View style={styles.confirmationRow}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.confirmedText}>
                  Confirmed{" "}
                  {schedule.confirmed_at
                    ? `on ${new Date(
                        schedule.confirmed_at
                      ).toLocaleDateString()}`
                    : ""}
                </Text>
              </View>
            )}

            {/* Actual Times */}
            {schedule.actual_start_time && (
              <View style={styles.actualTimesSection}>
                <Text style={styles.actualTimesTitle}>Actual Times</Text>
                <Text style={styles.actualTime}>
                  Started:{" "}
                  {new Date(schedule.actual_start_time).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                </Text>
                {schedule.actual_end_time && (
                  <Text style={styles.actualTime}>
                    Ended:{" "}
                    {new Date(schedule.actual_end_time).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}
                  </Text>
                )}
              </View>
            )}

            {/* Notes */}
            {schedule.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>{schedule.notes}</Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {canClockIn && (
              <TouchableOpacity
                style={[styles.actionButton, styles.clockInButton]}
                onPress={handleClockIn}
                disabled={actionLoading}
              >
                <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {actionLoading ? "Clocking In..." : "Clock In"}
                </Text>
              </TouchableOpacity>
            )}

            {canClockOut && (
              <TouchableOpacity
                style={[styles.actionButton, styles.clockOutButton]}
                onPress={handleClockOut}
                disabled={actionLoading}
              >
                <Ionicons name="stop-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {actionLoading ? "Clocking Out..." : "Clock Out"}
                </Text>
              </TouchableOpacity>
            )}

            {canConfirm && (
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={handleConfirm}
                disabled={actionLoading}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {actionLoading ? "Confirming..." : "Confirm Shift"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.requestButton]}
              onPress={handleRequestChange}
              disabled={actionLoading}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Request Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  headerStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  headerStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  shiftDetails: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  shiftTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  shiftTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  shiftType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  shiftTime: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 4,
  },
  breakDuration: {
    fontSize: 14,
    color: "#8E8E93",
  },
  confirmationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  confirmedText: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "500",
    marginLeft: 8,
  },
  actualTimesSection: {
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actualTimesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 8,
  },
  actualTime: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "500",
    marginBottom: 4,
  },
  notesSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  actionButtons: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  clockInButton: {
    backgroundColor: "#34C759",
  },
  clockOutButton: {
    backgroundColor: "#FF9500",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
  },
  requestButton: {
    backgroundColor: "#8E8E93",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
