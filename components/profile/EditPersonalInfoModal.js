import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

/**
 * EditPersonalInfoModal Component
 * Modal for editing personal information from hotel_staff_personal_data table
 */
const EditPersonalInfoModal = ({ visible, onClose, personalData, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: personalData?.first_name || "",
    last_name: personalData?.last_name || "",
    date_of_birth: personalData?.date_of_birth || "",
    phone_number: personalData?.phone_number || "",
    city: personalData?.city || "",
    country: personalData?.country || "",
    address: personalData?.address || "",
    zip_code: personalData?.zip_code || "",
    email: personalData?.email || "",
  });

  const [loading, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    personalData?.date_of_birth
      ? new Date(personalData.date_of_birth)
      : new Date()
  );

  // Update form data when personalData changes
  useEffect(() => {
    if (personalData) {
      setFormData({
        first_name: personalData.first_name || "",
        last_name: personalData.last_name || "",
        date_of_birth: personalData.date_of_birth || "",
        phone_number: personalData.phone_number || "",
        city: personalData.city || "",
        country: personalData.country || "",
        address: personalData.address || "",
        zip_code: personalData.zip_code || "",
        email: personalData.email || "",
        emergency_contact_name: personalData.emergency_contact_name || "",
        emergency_contact_number: personalData.emergency_contact_number || "",
      });

      if (personalData.date_of_birth) {
        setSelectedDate(new Date(personalData.date_of_birth));
      }
    }
  }, [personalData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      handleInputChange("date_of_birth", formattedDate);
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Select date of birth";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      } else {
        // Don't show alert here - let ProfileScreen handle the messaging
        console.log("Save operation returned false");
      }
    } catch (error) {
      console.error("Save error:", error);
      // Don't show alert here - let ProfileScreen handle the messaging
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      first_name: personalData?.first_name || "",
      last_name: personalData?.last_name || "",
      date_of_birth: personalData?.date_of_birth || "",
      phone_number: personalData?.phone_number || "",
      city: personalData?.city || "",
      country: personalData?.country || "",
      address: personalData?.address || "",
      zip_code: personalData?.zip_code || "",
      email: personalData?.email || "",
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color="#FF5A5F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Personal Information</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FF5A5F" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.first_name}
                  onChangeText={(value) =>
                    handleInputChange("first_name", value)
                  }
                  placeholder="Enter first name"
                  placeholderTextColor="#C7C7CC"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.last_name}
                  onChangeText={(value) =>
                    handleInputChange("last_name", value)
                  }
                  placeholder="Enter last name"
                  placeholderTextColor="#C7C7CC"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={[
                    styles.datePickerText,
                    !formData.date_of_birth && styles.datePickerPlaceholder,
                  ]}
                >
                  {formatDateForDisplay(formData.date_of_birth)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#FF5A5F" />
              </TouchableOpacity>
              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    style={styles.datePicker}
                    textColor="#2C2C2C"
                  />
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                placeholder="Enter email address"
                placeholderTextColor="#C7C7CC"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone_number}
                onChangeText={(value) =>
                  handleInputChange("phone_number", value)
                }
                placeholder="Enter phone number"
                placeholderTextColor="#C7C7CC"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                placeholder="Enter street address"
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange("city", value)}
                  placeholder="Enter city"
                  placeholderTextColor="#C7C7CC"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Zip Code</Text>
                <TextInput
                  style={styles.input}
                  value={formData.zip_code}
                  onChangeText={(value) => handleInputChange("zip_code", value)}
                  placeholder="Enter zip code"
                  placeholderTextColor="#C7C7CC"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(value) => handleInputChange("country", value)}
                placeholder="Enter country"
                placeholderTextColor="#C7C7CC"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Emergency Contact Name</Text>
              <TextInput
                style={styles.input}
                value={formData.emergency_contact_name}
                onChangeText={(value) =>
                  handleInputChange("emergency_contact_name", value)
                }
                placeholder="Enter emergency contact name"
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Emergency Contact Number</Text>
              <TextInput
                style={styles.input}
                value={formData.emergency_contact_number}
                onChangeText={(value) =>
                  handleInputChange("emergency_contact_number", value)
                }
                placeholder="Enter emergency contact number"
                placeholderTextColor="#C7C7CC"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    backgroundColor: "#FFFFFF",
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#484848",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5A5F",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#484848",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#484848",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#484848",
    backgroundColor: "#FFFFFF",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    minHeight: 48,
  },
  datePickerText: {
    fontSize: 16,
    color: "#2C2C2C",
    fontWeight: "500",
  },
  datePickerPlaceholder: {
    color: "#C7C7CC",
    fontWeight: "400",
  },
  datePickerContainer: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingVertical: 12,
    alignItems: "center",
  },
  datePicker: {
    height: 200,
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
});

export default EditPersonalInfoModal;
