import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const modalStyles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    position: "relative",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#22223B",
    textAlign: "center",
  },
  modalLabel: {
    fontWeight: "bold",
    marginTop: 12,
    color: "#555",
    fontSize: 16,
  },
  modalText: {
    fontSize: 16,
    color: "#484848",
    marginTop: 4,
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 24,
  },
  closeButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
};

const TaskDetailModal = ({
  visible,
  task,
  onClose,
  styles,
  staffOptions = [],
}) => {

  // If staffOptions is empty, you will not get a name match.
  // You need to ensure staffOptions is populated and passed correctly from the parent.
  // If you expect staffOptions to be loaded asynchronously, add a loading state or fetch logic in the parent.

  let assignedStaff = null;
  if (task?.assigned_to && staffOptions.length > 0) {
    // Try both .id and .staff_id for matching, depending on your data structure
    assignedStaff =
      staffOptions.find((s) => s.id === task.assigned_to) ||
      staffOptions.find((s) => s.staff_id === task.assigned_to);
    if (assignedStaff) {
      // Use first_name/last_name if available, otherwise fallback to name/lastname
      assignedStaff.name = assignedStaff.first_name || assignedStaff.name || "";
      assignedStaff.lastname =
        assignedStaff.last_name || assignedStaff.lastname || "";
    }
  }
  const assignedName = assignedStaff
    ? `${assignedStaff.name} ${assignedStaff.lastname}`.trim()
    : task?.assigned_to || "-";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <Pressable
            style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
            onPress={onClose}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={28} color="#8E8E93" />
          </Pressable>
          {task && (
            <>
              <Text style={modalStyles.modalTitle}>{task.title}</Text>
              <Text style={modalStyles.modalLabel}>Description:</Text>
              <Text style={modalStyles.modalText}>
                {task.description || "No description."}
              </Text>
              <Text style={modalStyles.modalLabel}>Assigned To:</Text>
              <Text style={modalStyles.modalText}>{assignedName}</Text>
              <Text style={modalStyles.modalLabel}>Created At:</Text>
              <Text style={modalStyles.modalText}>
                {task.created_at
                  ? new Date(task.created_at).toLocaleString()
                  : "-"}
              </Text>
              <Text style={modalStyles.modalLabel}>Priority:</Text>
              <Text style={modalStyles.modalText}>{task.priority}</Text>
            </>
          )}
          <Pressable style={modalStyles.closeButton} onPress={onClose}>
            <Text style={modalStyles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default TaskDetailModal;
