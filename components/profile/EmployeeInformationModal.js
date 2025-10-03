import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StaffDetails from "./StaffDetails";

const EmployeeInformationModal = ({
  visible,
  onClose,
  staffData,
  personalData,
  onEditPersonalInfo,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FF5A5F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Employee Information</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <StaffDetails
            staffData={staffData}
            personalData={personalData}
            onEditPersonalInfo={onEditPersonalInfo}
          />
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#484848",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default EmployeeInformationModal;
