import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * ProfileStats Component
 * Displays user statistics in a horizontal card layout
 */
const ProfileStats = ({ stats = [] }) => {
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <View style={styles.statsContainer}>
      {stats.map((stat, index) => (
        <View key={stat.key || index} style={styles.statItem}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF5A5F",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
});

export default ProfileStats;
