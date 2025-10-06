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
const RoomCard = ({ room, onPress, onLongPress }) => {
  // DND status: true/false or string
  const isDND =
    room.dnd_status === true ||
    room.dnd_status === "true" ||
    room.dnd_status === "DND";
  // Only show cleaning status icon in the top right if present and not DND
  let statusIcon = null;
  if (!isDND && room.cleaning_status) {
    statusIcon = <StatusIndicator status={room.cleaning_status} />;
  }
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(room)}
      onLongPress={() => onLongPress?.(room)}
      delayLongPress={350}
    >
      {/* Cleaning status indicator in top right corner if available and not DND */}
      {statusIcon}

      {/* Bed icon with DND-based color (red if DND, gray otherwise) */}
      <Ionicons
        name="bed"
        size={24}
        color={getBedIconColor(isDND ? "DND" : undefined)}
      />

      {/* Room number */}
      <Text style={styles.roomNumber}>{room.room_number}</Text>
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
  cleaningStatus: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
    textTransform: "capitalize",
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
