import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const AbsenceManagementModal = ({
  visible,
  onClose,
  request,
  onUpdate,
  onDelete,
  formatRequestType,
  getAbsenceStatusColor,
}) => {
  // Early return BEFORE any hooks to avoid hook order violations
  if (!request) return null;

  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const notesInputRef = useRef(null);

  React.useEffect(() => {
    if (request && visible) {
      setEditNotes(request.notes || "");
      setIsEditing(false);
    }
  }, [request, visible]);

  const handleUpdate = async () => {
    if (!isEditing) {
      setIsEditing(true);
      // Focus the input field after a small delay to ensure it's rendered
      setTimeout(() => {
        notesInputRef.current?.focus();
      }, 100);
      return;
    }

    setActionLoading(true);
    try {
      const success = await onUpdate(request.id, { notes: editNotes });
      if (success) {
        Alert.alert("Success", "Absence request updated successfully!");
        setIsEditing(false);
      } else {
        Alert.alert("Error", "Failed to update request. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while updating the request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this absence request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              const success = await onUpdate(request.id, {
                status: "cancelled",
              });
              if (success) {
                Alert.alert(
                  "Success",
                  "Absence request cancelled successfully!"
                );
                onClose();
              } else {
                Alert.alert(
                  "Error",
                  "Failed to cancel request. Please try again."
                );
              }
            } catch (error) {
              Alert.alert(
                "Error",
                "An error occurred while cancelling the request."
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Request",
      "Are you sure you want to permanently delete this absence request? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              console.log("Starting delete for request ID:", request.id);
              console.log("onDelete function:", typeof onDelete);

              const success = await onDelete(request.id);


              if (success !== false) {
                // Consider undefined or true as success
                Alert.alert("Success", "Absence request deleted successfully!");
                onClose();
              } else {
                Alert.alert(
                  "Error",
                  "Failed to delete request. Please try again."
                );
              }
            } catch (error) {
              console.error("Delete error in modal:", error);
              Alert.alert(
                "Error",
                `An error occurred while deleting the request: ${error.message}`
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  const formatDateRange = () => {
    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    if (isNaN(startDate) || isNaN(endDate)) return "";
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(request.start_date);
    } else {
      return `${formatDate(request.start_date)} - ${formatDate(
        request.end_date
      )}`;
    }
  };

  const canEdit = request.status === "pending";

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleContainer}>
              <View
                style={[
                  styles.requestTypeIndicator,
                  { backgroundColor: getAbsenceStatusColor(request.status) },
                ]}
              />
              <Text style={styles.modalTitle}>
                {formatRequestType(request.request_type)}
              </Text>
            </View>
            <View style={styles.headerStatusContainer}>
              <View
                style={[
                  styles.headerStatusBadge,
                  { backgroundColor: getAbsenceStatusColor(request.status) },
                ]}
              >
                <Text style={styles.headerStatusText}>
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Date Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <Text style={styles.dateRange}>{formatDateRange()}</Text>
              <Text style={styles.totalDays}>
                {(() => {
                  const startDate = new Date(request.start_date);
                  const endDate = new Date(request.end_date);
                  if (isNaN(startDate) || isNaN(endDate)) return "";
                  // Calculate difference in days (inclusive)
                  const diff =
                    Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) +
                    1;
                  return `Total days requested: ${diff}`;
                })()}
              </Text>
            </View>

            {/* Request Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Request Type</Text>
              <Text style={styles.requestType}>
                {formatRequestType(request.request_type)}
              </Text>
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              {isEditing ? (
                <TextInput
                  ref={notesInputRef}
                  style={styles.notesInput}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Add notes about your request..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoFocus={true}
                />
              ) : (
                <Text style={styles.notesText}>
                  {request.notes || "No notes added"}
                </Text>
              )}
            </View>

            {/* Request Dates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Request Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Submitted:</Text>
                <Text style={styles.infoValue}>
                  {new Date(request.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              {request.updated_at !== request.created_at && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Updated:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(request.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          {canEdit && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.updateButton]}
                onPress={handleUpdate}
                disabled={actionLoading}
              >
                <Ionicons
                  name={isEditing ? "checkmark" : "create-outline"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.actionButtonText}>
                  {isEditing ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={actionLoading}
              >
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                disabled={actionLoading}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          {!canEdit && (
            <View style={styles.readOnlyNotice}>
              <Text style={styles.readOnlyText}>
                This request cannot be modified as it has been {request.status}.
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  totalDays: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  requestTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  modalContent: {
    paddingHorizontal: 20,
  },
  statusSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 18,
    fontWeight: "500",
    color: "#34495e",
  },
  requestType: {
    fontSize: 16,
    color: "#34495e",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: "#f8f9fa",
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    fontStyle: (request) => (request.notes ? "normal" : "italic"),
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    minHeight: 44,
  },
  updateButton: {
    backgroundColor: "#3498db",
  },
  cancelButton: {
    backgroundColor: "#f39c12",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  readOnlyNotice: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  readOnlyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
