import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const requestTypes = [
  { value: "vacation", label: "Vacation", icon: "sunny-outline" },
  { value: "sick", label: "Sick", icon: "medical-outline" },
  { value: "personal", label: "Personal", icon: "person-outline" },
  { value: "training", label: "Training", icon: "school-outline" },
  { value: "other", label: "Other", icon: "help-outline" },
];

export const AbsenceRequestModal = ({
  visible,
  onClose,
  startDate,
  endDate,
  selectedRequestType,
  setSelectedRequestType,
  notes,
  setNotes,
  onSubmit,
}) => {
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
      >
        <ScrollView
          contentContainerStyle={styles.modalScrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Absence</Text>
              <TouchableOpacity onPress={onClose}>
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
                      selectedRequestType === type.value ? "#FFFFFF" : "#FF5A5F"
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
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
