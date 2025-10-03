import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStatusIcon, getStatusIconColor } from "../../utils/roomUtils";

/**
 * StatusIndicator component for displaying room status icon
 * @param {string} status - Room status
 * @param {object} style - Additional styles
 */
const StatusIndicator = ({ status, style }) => {
  const iconName = getStatusIcon(status);
  const iconColor = getStatusIconColor(status);

  // Don't render if no icon should be shown
  if (!iconName) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Ionicons name={iconName} size={16} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
});

export default StatusIndicator;
