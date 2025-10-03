import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * MessageHeader Component
 * Header with title, unread count badge, and action buttons
 */
const MessageHeader = ({ unreadCount, onSimulateMessage, onMarkAllRead }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSimulateMessage}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FF5A5F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onMarkAllRead}>
          <Ionicons name="checkmark-done" size={24} color="#FF5A5F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#484848",
  },
  unreadBadge: {
    backgroundColor: "#FF5A5F",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 12,
    minWidth: 24,
    alignItems: "center",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
});

export default MessageHeader;
