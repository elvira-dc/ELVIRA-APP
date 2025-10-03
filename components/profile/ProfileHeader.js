import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * ProfileHeader Component
 * User avatar, name, email, role, and edit profile button
 */
const ProfileHeader = ({
  avatarImage,
  userName,
  userEmail,
  userRole,
  onAvatarPress,
  onEditPress,
  uploading = false,
}) => {
  return (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity
          style={styles.avatar}
          onPress={onAvatarPress}
          disabled={uploading}
        >
          {avatarImage ? (
            <Image source={{ uri: avatarImage }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={40} color="#8E8E93" />
          )}
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onAvatarPress}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size={12} color="#FFFFFF" />
          ) : (
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.userName}>{userName}</Text>
      <Text style={styles.userEmail}>{userEmail}</Text>
      <Text style={styles.userRole}>{userRole}</Text>

      <TouchableOpacity style={styles.editProfileButton} onPress={onEditPress}>
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FF5A5F",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF5A5F",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#484848",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 8,
  },
  userRole: {
    fontSize: 14,
    color: "#FF5A5F",
    fontWeight: "600",
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    textAlign: "center",
  },
  editProfileButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FF5A5F",
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5A5F",
  },
});

export default ProfileHeader;
