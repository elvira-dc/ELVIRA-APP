import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export function AmenityRequestCard({
  req,
  expanded,
  onExpand,
  onSwipeLeft,
  onSwipeRight,
  icon,
  styles,
  swipeableRef,
}) {
  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={onSwipeLeft}
      renderRightActions={onSwipeRight}
      onSwipeableLeftOpen={onSwipeLeft}
      onSwipeableRightOpen={onSwipeRight}
      friction={1}
      overshootLeft={true}
      overshootRight={true}
    >
      <View style={styles.swipeCardWrapper}>
        <TouchableOpacity
          style={[styles.swipeCard, expanded && styles.swipeCardNoBottomRadius]}
          activeOpacity={0.8}
          onPress={onExpand}
        >
          <MaterialCommunityIcons
            name={icon.name}
            size={22}
            color={icon.color}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.value}>{req.amenity?.name || "-"}</Text>
        </TouchableOpacity>
        {expanded && (
          <View style={styles.instructionsBox}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>Amenity Request</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Amenity:</Text>
              <Text style={styles.value}>{req.amenity?.name || "-"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Requested At:</Text>
              <Text style={styles.value}>
                {req.created_at ? new Date(req.created_at).toLocaleString() : "-"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Special Instructions:</Text>
              <Text style={styles.value}>{req.special_instructions || "-"}</Text>
            </View>
          </View>
        )}
      </View>
    </Swipeable>
  );
}

// You can create similar components for DineInRequestCard and ShopOrderCard if needed.