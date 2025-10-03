import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * StaffDetails Component
 * Displays staff information from hotel_staff and hotel_staff_personal_data tables
 */
const StaffDetails = ({ staffData, personalData, onEditPersonalInfo }) => {
  if (!staffData && !personalData) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatus = (status) => {
    const statusColors = {
      active: "#4CAF50",
      inactive: "#FF9800",
      terminated: "#F44336",
    };

    return {
      text: status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown",
      color: statusColors[status] || "#757575",
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Staff Information</Text>

      {/* Basic Staff Info */}
      {staffData && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionSubtitle}>Employment Details</Text>

          <View style={styles.infoRow}>
            <Ionicons name="id-card-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Employee ID</Text>
              <Text style={styles.infoValue}>
                {staffData.employee_id || "Not assigned"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Position</Text>
              <Text style={styles.infoValue}>
                {staffData.position || "Not specified"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>
                {staffData.department || "Not assigned"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="radio-button-on-outline"
              size={20}
              color={formatStatus(staffData.status).color}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: formatStatus(staffData.status).color },
                ]}
              >
                {formatStatus(staffData.status).text}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Hire Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(staffData.hire_date)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Personal Information */}
      {personalData && (
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>Personal Information</Text>
            {onEditPersonalInfo && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={onEditPersonalInfo}
              >
                <Ionicons name="pencil" size={16} color="#FF5A5F" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>
                {`${personalData.first_name || ""} ${
                  personalData.last_name || ""
                }`.trim() || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-clear-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {formatDate(personalData.date_of_birth)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>
                {personalData.phone_number || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="home-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {personalData.address || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>
                {personalData.city || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>
                {personalData.country || "Not provided"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Emergency Contact Information */}
      {personalData && (
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.emergencyContactTitle}>Emergency Contact</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#FF5A5F" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Contact Name</Text>
              <Text style={styles.infoValue}>
                {personalData.emergency_contact_name || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#FF5A5F" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Contact Number</Text>
              <Text style={styles.infoValue}>
                {personalData.emergency_contact_number || "Not provided"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#484848",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5A5F",
    marginBottom: 12,
    marginTop: 8,
  },
  emergencyContactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5A5F",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF5A5F",
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF5A5F",
    marginLeft: 4,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#484848",
    fontWeight: "400",
    marginTop: 2,
  },
});

export default StaffDetails;
