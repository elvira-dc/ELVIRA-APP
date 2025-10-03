import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useImagePicker } from "../hooks/useImagePicker";
import { useAuth } from "../hooks/useAuth";
import { notifyWelcome } from "../utils/notificationService";
import {
  testStorageAccess,
  getSuggestedPolicies,
} from "../utils/storageHelper";
import { Ionicons } from "@expo/vector-icons";

// Import extracted components
import ProfileHeader from "../components/profile/ProfileHeader";
import EditPersonalInfoModal from "../components/profile/EditPersonalInfoModal";
import EmployeeInformationModal from "../components/profile/EmployeeInformationModal";
import SelectLanguageModal from "../components/profile/SelectLanguageModal";
import UpdatePasswordModal from "../components/profile/UpdatePasswordModal";

// Import hooks
import { useStaffData } from "../hooks/useStaffData";

// Import constants
import {
  ROLE_DISPLAY_MAP,
  ALERT_MESSAGES,
  DEFAULT_VALUES,
} from "../constants/profileConstants";

const ProfileScreen = () => {
  const { user, profile, signOut, updatePassword } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const {
    staffData,
    personalData,
    loading: staffLoading,
    updatePersonalData,
    updateAvatarUrl,
  } = useStaffData(user?.id);

  // Image picker with avatar update callback
  const { avatarImage, uploading, showImagePickerOptions } = useImagePicker(
    personalData,
    updateAvatarUrl
  );

  // Send welcome notification on component mount
  useEffect(() => {
    const sendWelcomeNotification = async () => {
      if (user && profile) {
        try {
          const userName =
            profile.email?.split("@")[0] || DEFAULT_VALUES.USER_NAME;
          await notifyWelcome(userName);
        } catch (error) {
          console.log("Error sending welcome notification:", error);
        }
      }
    };

    const timer = setTimeout(sendWelcomeNotification, 3000);
    return () => clearTimeout(timer);
  }, [user, profile]);

  // Get user display name
  const getUserDisplayName = () => {
    // Use full name from personal data if available
    if (personalData?.first_name && personalData?.last_name) {
      return `${personalData.first_name} ${personalData.last_name}`.trim();
    }

    // Fallback to email prefix
    if (profile?.email) {
      return profile.email.split("@")[0];
    }
    return user?.email?.split("@")[0] || DEFAULT_VALUES.USER_NAME;
  };

  // Get user role display
  const getUserRole = () => {
    return ROLE_DISPLAY_MAP[profile?.role] || DEFAULT_VALUES.DEFAULT_ROLE;
  };

  // Handle edit personal info
  const handleEditPersonalInfo = () => {
    // Close employee modal if it's open
    setShowEmployeeModal(false);
    // Open edit modal
    setShowEditModal(true);
  };

  // Handle save personal info
  const handleSavePersonalInfo = async (updatedData) => {
    const success = await updatePersonalData(updatedData);
    if (success) {
      setShowEditModal(false);
      Alert.alert("Success", "Personal information updated successfully!");
    } else {
      Alert.alert("Error", "Failed to update personal information");
    }
  };

  // Handle language selection
  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
    // Here you could save to AsyncStorage or user preferences
    Alert.alert(
      "Language Selected",
      `Language changed to ${languageCode.toUpperCase()}`
    );
  };

  // Handle password update
  const handlePasswordUpdate = async (currentPassword, newPassword) => {
    try {
      console.log("Starting password update...");

      // Note: Supabase doesn't require current password verification for updateUser
      // In production, you might want to add additional verification steps
      const result = await updatePassword(newPassword);

      console.log("Password update result:", result);

      if (result.error) {
        console.error("Password update error:", result.error);

        // Handle specific error types
        if (result.error.message.includes("Password")) {
          throw new Error(
            "Password requirements not met. Please ensure your password is at least 6 characters long."
          );
        } else if (result.error.message.includes("rate")) {
          throw new Error(
            "Too many password update attempts. Please try again later."
          );
        } else {
          throw new Error(
            result.error.message ||
              "Failed to update password. Please try again."
          );
        }
      }

      console.log("Password updated successfully");
      return true;
    } catch (error) {
      console.error("Password update error:", error);
      throw error;
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      ALERT_MESSAGES.SIGN_OUT_TITLE,
      ALERT_MESSAGES.SIGN_OUT_MESSAGE,
      [
        { text: ALERT_MESSAGES.SIGN_OUT_CANCEL, style: "cancel" },
        {
          text: ALERT_MESSAGES.SIGN_OUT_CONFIRM,
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert(ALERT_MESSAGES.ERROR, ALERT_MESSAGES.SIGN_OUT_ERROR);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <ProfileHeader
          avatarImage={avatarImage}
          userName={getUserDisplayName()}
          userEmail={user?.email || DEFAULT_VALUES.EMAIL_PLACEHOLDER}
          userRole={getUserRole()}
          onAvatarPress={showImagePickerOptions}
          onEditPress={handleEditPersonalInfo}
          uploading={uploading}
        />

        {/* Main Profile Menu Buttons */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowEmployeeModal(true)}
          >
            <View style={styles.menuButtonContent}>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color="#FF5A5F"
              />
              <Text style={styles.menuButtonText}>Employee Information</Text>
              <Text style={styles.menuButtonSubtext}>
                View staff details and personal information
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.menuButtonContent}>
              <Ionicons name="language-outline" size={24} color="#FF5A5F" />
              <Text style={styles.menuButtonText}>Select Language</Text>
              <Text style={styles.menuButtonSubtext}>
                Choose your preferred language
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.menuButtonContent}>
              <Ionicons name="lock-closed-outline" size={24} color="#FF5A5F" />
              <Text style={styles.menuButtonText}>Update Password</Text>
              <Text style={styles.menuButtonSubtext}>
                Change your account password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {staffLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FF5A5F" />
            <Text style={styles.loadingText}>Loading staff information...</Text>
          </View>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <EditPersonalInfoModal
        visible={showEditModal}
        personalData={personalData}
        onSave={handleSavePersonalInfo}
        onClose={() => setShowEditModal(false)}
      />

      <EmployeeInformationModal
        visible={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        staffData={staffData}
        personalData={personalData}
        onEditPersonalInfo={handleEditPersonalInfo}
      />

      <SelectLanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        currentLanguage={selectedLanguage}
        onLanguageSelect={handleLanguageSelect}
      />

      <UpdatePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onPasswordUpdate={handlePasswordUpdate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    flex: 1,
  },
  menuContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuButtonContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#484848",
    marginBottom: 4,
  },
  menuButtonSubtext: {
    fontSize: 12,
    color: "#8E8E93",
    lineHeight: 16,
  },
  signOutButton: {
    backgroundColor: "#FF5A5F",
    marginHorizontal: 16,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomSpacing: {
    height: 100,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#8E8E93",
  },
});

export default ProfileScreen;
