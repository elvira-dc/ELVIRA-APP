import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const CalendarHeader = ({
  viewMode,
  setViewMode,
  getDisplayTitle,
  navigatePrevious,
  navigateNext,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "month" && styles.activeToggle,
            ]}
            onPress={() => setViewMode("month")}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "month" && styles.activeToggleText,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "week" && styles.activeToggle,
            ]}
            onPress={() => setViewMode("week")}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "week" && styles.activeToggleText,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.navigationRow}>
        <TouchableOpacity style={styles.navButton} onPress={navigatePrevious}>
          <Ionicons name="chevron-back" size={20} color="#FF5A5F" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{getDisplayTitle()}</Text>
        <TouchableOpacity style={styles.navButton} onPress={navigateNext}>
          <Ionicons name="chevron-forward" size={20} color="#FF5A5F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c3e50",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: "#FF5A5F",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeToggleText: {
    color: "#fff",
  },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
    textAlign: "center",
  },
});
