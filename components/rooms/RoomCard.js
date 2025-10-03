import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getBedIconColor } from "../../utils/roomUtils";
import StatusIndicator from "./StatusIndicator";

/**
 * RoomCard component for displaying individual room information
 * @param {object} room - Room data object
 * @param {function} onPress - Optional onPress handler
 */
const RoomCard = ({ room, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(room)}>
      {/* Status indicator icon in top right corner */}
      <StatusIndicator status={room.status} />

      {/* Bed icon with status-based color */}
      <Ionicons name="bed" size={24} color={getBedIconColor(room.status)} />

      {/* Room number */}
      <Text style={styles.roomNumber}>{room.number}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    margin: 4,
    flex: 1,
    maxWidth: "22%",
    alignItems: "center",
    aspectRatio: 1,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roomNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#484848",
    marginTop: 4,
    textAlign: "center",
  },
});

export default RoomCard;
