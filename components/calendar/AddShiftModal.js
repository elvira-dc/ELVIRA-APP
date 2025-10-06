import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const AddShiftModal = ({
  visible,
  staffList,
  selectedStaffIds,
  onToggleStaff,
  onConfirm,
  onCancel,
  loading,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Add new staff member shift calendar
          </Text>
          <Text style={styles.modalText}>
            Select one or more staff members:
          </Text>

          {/* Dropdown Selector */}
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setDropdownOpen((open) => !open)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownHeaderText}>
              {selectedStaffIds.length > 0
                ? `${selectedStaffIds.length} staff selected`
                : "Select staff"}
            </Text>
            <Ionicons
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#FF5A5F"
            />
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              {loading ? (
                <Text style={styles.loadingText}>Loading staff...</Text>
              ) : (staffList || []).length === 0 ? (
                <Text style={styles.loadingText}>No staff available</Text>
              ) : (
                <ScrollView style={{ maxHeight: 250 }}>
                  {(staffList || []).map((staff) => (
                    <TouchableOpacity
                      key={staff.id}
                      style={styles.dropdownItem}
                      onPress={() => onToggleStaff(staff.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          selectedStaffIds.includes(staff.id) &&
                            styles.checkboxSelected,
                        ]}
                      >
                        {selectedStaffIds.includes(staff.id) && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.staffName}>
                        {staff.firstName} {staff.lastName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                selectedStaffIds.length === 0 && styles.buttonDisabled,
              ]}
              onPress={onConfirm}
              disabled={selectedStaffIds.length === 0}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxHeight: "75%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#22223B",
  },
  modalText: {
    marginBottom: 12,
    color: "#555",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: "#484848",
    flex: 1,
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 12,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FF5A5F",
    backgroundColor: "#fff",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#FF5A5F",
  },
  staffName: {
    fontSize: 16,
    color: "#333",
  },
  loadingText: {
    textAlign: "center",
    paddingVertical: 10,
    color: "#8E8E93",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  confirmButton: {
    backgroundColor: "#FF5A5F",
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "#E8E8E8",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelText: {
    color: "#484848",
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
