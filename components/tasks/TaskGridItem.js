import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons"; // ✅ Import missing

// Utility function to get initials from a name
function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

const TaskGridItem = ({
  item,
  onPress,
  onCheckboxChange,
  styles,
  onLongPress,
}) => (
  <TouchableOpacity
    style={[cardStyles.card, styles?.gridItem]}
    onPress={() => onPress(item)}
    onLongPress={onLongPress ? () => onLongPress(item) : undefined}
    delayLongPress={300}
  >
    {/* Icon by priority */}
    <View style={cardStyles.iconContainer}>
      {item.priority === "High" && (
        <Ionicons name="flame" size={28} color="#FF5A5F" />
      )}
      {item.priority === "Medium" && (
        <Ionicons name="alert" size={28} color="#FFA500" />
      )}
      {item.priority === "Low" && (
        <Ionicons name="leaf" size={28} color="#8E8E93" />
      )}
    </View>

    {/* Title */}
    <View style={cardStyles.infoContainer}>
      <Text style={cardStyles.title}>{item.title}</Text>
    </View>

    {/* Checkbox */}
    <Checkbox
      value={item.status === "COMPLETED"}
      color={item.status === "COMPLETED" ? "#4CAF50" : undefined}
      onValueChange={(val) => onCheckboxChange(item, val)}
      style={cardStyles.checkbox}
    />
  </TouchableOpacity>
);

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#484848",
    marginBottom: 2,
  },
  checkbox: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 6,
  },
});

export default TaskGridItem;
