// src/components/CalendarHeader.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const CalendarHeader = ({
  getDisplayTitle,
  navigatePrevious,
  navigateNext,
  isCalendarVisible, // new prop
  onToggleCalendarVisibility, // new prop
  hotel_staff, // add this prop
  onPeoplePress, // add this prop
  staffList, // new prop: array of staff
  selectedStaffId, // new prop: selected staff id
  onStaffSelect, // new prop: handler for selection
}) => {
  // Log authenticated user info
  console.log("Authenticated user:", hotel_staff);

  // Check if user is Hotel Admin and Manager
  const isAdminManager =
    hotel_staff?.position === "Hotel Admin" &&
    hotel_staff?.department === "Manager";

  if (!isAdminManager) {
    console.log(
      "Admin icons not visible. Reason:",
      "position =",
      hotel_staff?.position,
      "department =",
      hotel_staff?.department
    );
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.headerTitle}>Calendar</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onToggleCalendarVisibility}
              accessibilityLabel={
                isCalendarVisible ? "Hide Calendar" : "Show Calendar"
              }
            >
              <Ionicons
                name={isCalendarVisible ? "eye-outline" : "eye-off-outline"}
                size={26}
                color="#FF5A5F"
              />
            </TouchableOpacity>
            {isAdminManager && (
              <>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    /* TODO: filter logic */
                  }}
                  accessibilityLabel="Filter"
                >
                  <Ionicons name="options-outline" size={26} color="#FF5A5F" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onPeoplePress}
                  accessibilityLabel="People"
                >
                  <Ionicons name="people-outline" size={26} color="#FF5A5F" />
                </TouchableOpacity>
              </>
            )}
          </View>
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
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#484848",
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
  iconButton: {
    padding: 6,
    borderRadius: 8,

    marginLeft: 4,
  },
});
