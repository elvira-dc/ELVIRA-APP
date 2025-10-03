import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * EmptyMessagesState Component
 * Displayed when there are no messages to show
 */
const EmptyMessagesState = ({
  title = "No messages",
  subtitle = "Messages will appear here",
}) => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{title}</Text>
      <Text style={styles.emptyStateSubtext}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8E8E93",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#C7C7CC",
  },
});

export default EmptyMessagesState;
