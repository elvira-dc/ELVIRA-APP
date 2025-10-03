import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "../constants/theme";
import { getRoomStatusColor } from "../utils/helpers";

/**
 * Individual room card component for the grid
 */
export const RoomCard = ({ room, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.roomCard, style]}
      onPress={() => onPress(room)}
    >
      <Ionicons name="bed" size={24} color={getRoomStatusColor(room.status)} />
      <Text style={styles.roomNumber}>{room.number}</Text>
    </TouchableOpacity>
  );
};

/**
 * Room status indicator component
 */
export const RoomStatusIndicator = ({ status, showLabel = true }) => {
  const color = getRoomStatusColor(status);

  return (
    <View style={styles.statusContainer}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      {showLabel && (
        <Text style={[styles.statusLabel, { color }]}>{status}</Text>
      )}
    </View>
  );
};

/**
 * Room grid component
 */
export const RoomsGrid = ({ rooms, onRoomPress, numColumns = 4 }) => {
  return (
    <View style={styles.gridContainer}>
      {rooms.map((room, index) => (
        <RoomCard
          key={room.id}
          room={room}
          onPress={onRoomPress}
          style={[styles.gridItem, { width: `${100 / numColumns - 2}%` }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  roomCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.xs,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roomNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  statusLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xs,
  },
  gridItem: {
    marginBottom: SPACING.sm,
  },
});
