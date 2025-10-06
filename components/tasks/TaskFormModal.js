import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TaskFormModal = ({
  visible,
  onClose,
  title,
  staffOptions,
  staffLoading,
  fields,
  setFields,
  onSubmit,
  submitting,
  submitLabel,
  isEdit,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { width: "90%" }]}>
          <Text style={styles.modalTitle}>{title}</Text>

          {/* Assigned To Dropdown */}
          <Text style={styles.modalLabel}>Assigned To *</Text>
          <View style={styles.dropdownWrapper}>
            {staffLoading ? (
              <Text style={styles.dropdownLoading}>Loading staff...</Text>
            ) : staffOptions.length === 0 ? (
              <Text style={styles.dropdownLoading}>No staff available</Text>
            ) : (
              <TouchableOpacity
                style={styles.dropdownSelect}
                onPress={() => setDropdownOpen((open) => !open)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownSelectText}>
                  {fields.assigned_to
                    ? `${
                        staffOptions.find((s) => s.id === fields.assigned_to)
                          ?.name || ""
                      } ${
                        staffOptions.find((s) => s.id === fields.assigned_to)
                          ?.lastname || ""
                      }`
                    : "Select staff member"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color="#FF5A5F"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            )}
            {dropdownOpen && !staffLoading && staffOptions.length > 0 && (
              <View style={styles.dropdownMenu}>
                {staffOptions.map((staff) => (
                  <TouchableOpacity
                    key={staff.id}
                    style={styles.dropdownMenuItem}
                    onPress={() => {
                      setFields((t) => ({ ...t, assigned_to: staff.id }));
                      setDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownMenuItemText}>
                      {staff.name} {staff.lastname}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.modalLabel}>Title *</Text>
          <TextInput
            style={styles.largeInput}
            value={fields.title}
            onChangeText={(text) => setFields((t) => ({ ...t, title: text }))}
            placeholder="Task title"
          />

          {/* Description */}
          <Text style={styles.modalLabel}>Description</Text>
          <TextInput
            style={styles.largeInput}
            value={fields.description}
            onChangeText={(text) =>
              setFields((t) => ({ ...t, description: text }))
            }
            placeholder="Task description"
            multiline
            numberOfLines={3}
          />

          {/* Priority */}
          <Text style={styles.modalLabel}>Priority *</Text>
          <View style={styles.dropdownContainer}>
            {["Low", "Medium", "High"].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.dropdownOption,
                  fields.priority === level && styles.selectedDropdownOption,
                ]}
                onPress={() => setFields((t) => ({ ...t, priority: level }))}
              >
                <Text
                  style={{
                    color: fields.priority === level ? "#fff" : "#484848",
                  }}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.modalActionsRowSpaced}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={[styles.closeButtonText, { color: "#484848" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={onSubmit}
              disabled={submitting}
            >
              <Text style={styles.closeButtonText}>
                {submitting
                  ? isEdit
                    ? "Saving..."
                    : "Creating..."
                  : submitLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dropdownWrapper: {
    marginBottom: 12,
    position: "relative",
  },
  dropdownSelect: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  dropdownSelectText: {
    color: "#484848",
    fontSize: 16,
    flex: 1,
  },
  dropdownLoading: {
    color: "#8E8E93",
    textAlign: "center",
    padding: 10,
  },
  dropdownMenu: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  dropdownMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  dropdownMenuItemText: {
    color: "#484848",
    fontSize: 16,
  },
  modalActionsRowSpaced: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 16,
  },
  largeInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 18,
    backgroundColor: "#fafafa",
  },
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    marginBottom: 12,
  },
  dropdownOption: {
    flex: 1,
    backgroundColor: "#E8E8E8",
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedDropdownOption: {
    backgroundColor: "#FF5A5F",
  },
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
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#22223B",
  },
  modalLabel: {
    fontWeight: "bold",
    marginTop: 8,
    color: "#555",
  },
  closeButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    flex: 1,
  },
});

export default TaskFormModal;
