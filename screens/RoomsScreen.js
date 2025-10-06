import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRooms } from "../hooks/useRooms";
import { useRoomStatus } from "../hooks/useRoomStatus";
import { useAuth } from "../hooks/useAuth";
import CategoryMenu from "../components/rooms/CategoryMenu";
import RoomCard from "../components/rooms/RoomCard";
import { useStaffData } from "../hooks/useStaffData";
import { supabase } from "../config/supabase"; // <-- Make sure this import is at the top

const RoomsScreen = () => {
  const {
    selectedCategory,
    scrollViewRef,
    categories,
    filteredRooms,
    handleCategoryPress,
  } = useRooms();

  const { user } = useAuth();
  const { staffData } = useStaffData(user?.id);
  const [hotelId, setHotelId] = useState(null);
  const [hotelIdLoading, setHotelIdLoading] = useState(true);
  const [hotelIdError, setHotelIdError] = useState(null);
  const {
    rooms: dbRooms,
    loading: dbLoading,
    error: dbError,
  } = useRoomStatus(hotelId);

  const [localRooms, setLocalRooms] = useState([]);

  useEffect(() => {
    const fetchHotelId = async () => {
      if (!user?.id) {
        setHotelIdError("No user ID found.");
        setHotelIdLoading(false);
        return;
      }
      try {
        const { data, error } = await require("../config/supabase")
          .supabase.from("hotel_staff")
          .select("hotel_id")
          .eq("id", user.id)
          .single();
        if (error) {
          setHotelIdError(error.message);
        } else {
          setHotelId(data?.hotel_id || null);
        }
      } catch (err) {
        setHotelIdError(err.message);
      }
      setHotelIdLoading(false);
    };
    fetchHotelId();
  }, [user]);

  useEffect(() => {
    // When dbRooms changes, update localRooms
    if (dbRooms && dbRooms.length > 0) {
      setLocalRooms(dbRooms);
    }
  }, [dbRooms]);

  // Filtering logic for dbRooms
  const filterRooms = (rooms) => {
    if (!rooms) return [];
    if (selectedCategory === "All") return rooms;
    if (selectedCategory === "DND") {
      return rooms.filter(
        (room) =>
          room.dnd_status === true ||
          room.dnd_status === "true" ||
          room.dnd_status === "DND"
      );
    }
    if (
      selectedCategory === "Clean" ||
      selectedCategory === "Not Clean" ||
      selectedCategory === "In Progress"
    ) {
      return rooms.filter(
        (room) =>
          !(
            room.dnd_status === true ||
            room.dnd_status === "true" ||
            room.dnd_status === "DND"
          ) &&
          room.cleaning_status &&
          (room.cleaning_status.toLowerCase().replace(/_/g, " ") ===
            selectedCategory.toLowerCase() ||
            room.cleaning_status.toLowerCase().replace(/ /g, "_") ===
              selectedCategory.toLowerCase().replace(/ /g, "_"))
      );
    }
    return rooms;
  };

  // Use filtered dbRooms if available, otherwise fallback to filteredRooms from sampleRooms
  const displayRooms =
    localRooms && localRooms.length > 0
      ? filterRooms(localRooms)
      : filteredRooms;

  // Cleaning status cycle: NOT_CLEANED -> IN_PROGRESS -> CLEAN
  const getNextCleaningStatus = (current) => {
    const order = ["NOT_CLEAN", "IN_PROGRESS", "CLEAN"];
    const idx = order.indexOf((current || "NOT_CLEAN").toUpperCase());
    return order[(idx + 1) % order.length];
  };

  // Only allow Housekeeping Hotel Staff to update cleaning status
  const canUpdateCleaningStatus =
    staffData?.position === "Hotel Staff" &&
    staffData?.department === "Housekeeping";

  const handleRoomPress = async (room) => {
    if (!canUpdateCleaningStatus) return; // Restrict update
    if (!room || !room.room_number || !hotelId) return;
    if ((room.cleaning_status || "").toUpperCase() === "CLEAN") return;

    const nextStatus = getNextCleaningStatus(room.cleaning_status);

    let updateFields = { cleaning_status: nextStatus };

    // Set cleaning_started_at when moving to IN_PROGRESS
    if (
      (room.cleaning_status || "").toUpperCase() === "NOT_CLEAN" &&
      nextStatus === "IN_PROGRESS"
    ) {
      updateFields.cleaning_started_at = new Date().toISOString();
    }

    // Set cleaning_duration when moving to CLEAN
    if (
      (room.cleaning_status || "").toUpperCase() === "IN_PROGRESS" &&
      nextStatus === "CLEAN" &&
      room.cleaning_started_at
    ) {
      const started = new Date(room.cleaning_started_at);
      const finished = new Date();
      const durationMs = finished - started;
      // Convert ms to ISO 8601 duration string (e.g., "PT5M30S")
      const seconds = Math.floor(durationMs / 1000);
      updateFields.cleaning_duration = `${seconds} seconds`;
    }

    // Optimistically update local state
    setLocalRooms((prev) =>
      prev.map((r) =>
        r.room_number === room.room_number ? { ...r, ...updateFields } : r
      )
    );

    // Update cleaning status in Supabase
    const { error } = await supabase
      .from("room_cleaning_status")
      .update(updateFields)
      .eq("hotel_id", hotelId)
      .eq("room_number", room.room_number);

    if (error) {
      console.error("Failed to update cleaning status:", error.message);
      // Optionally, revert local state if error
      setLocalRooms((prev) =>
        prev.map((r) =>
          r.room_number === room.room_number
            ? { ...r, cleaning_status: room.cleaning_status }
            : r
        )
      );
      return;
    }

    // Optionally, refetch from DB in background for consistency
    // setHotelId(null);
    // setTimeout(() => setHotelId(hotelId), 100);
  };

  const navigation = require("@react-navigation/native").useNavigation();

  // Handler for long press to show guest details
  const handleRoomLongPress = (room) => {
    if (
      staffData?.position === "Hotel Staff" &&
      staffData?.department === "Reception"
    ) {
      navigation.navigate("RoomDetailsScreen", { room });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hotel Rooms</Text>
        <Text style={styles.roomCount}>
          {displayRooms?.length || 0} room
          {(displayRooms?.length || 0) !== 1 ? "s" : ""}
        </Text>
      </View>

      <CategoryMenu
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryPress={handleCategoryPress}
        scrollViewRef={scrollViewRef}
      />

      <ScrollView style={styles.content}>
        {hotelIdLoading ? (
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: "#8E8E93" }}>
              Loading hotel information...
            </Text>
          </View>
        ) : hotelIdError ? (
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: "#FF5A5F" }}>Error: {hotelIdError}</Text>
          </View>
        ) : !hotelId ? (
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: "#FF5A5F" }}>
              No hotel ID found for your staff account.
            </Text>
          </View>
        ) : dbLoading ? (
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: "#8E8E93" }}>Loading rooms...</Text>
          </View>
        ) : dbError ? (
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: "#FF5A5F" }}>Error: {dbError}</Text>
          </View>
        ) : dbRooms && dbRooms.length === 0 ? (
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: "#8E8E93" }}>
              No rooms found for this hotel.
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayRooms}
            numColumns={4}
            keyExtractor={(item) => item.room_number || item.id}
            contentContainerStyle={styles.roomsGrid}
            renderItem={({ item }) => (
              <RoomCard
                room={item}
                onPress={handleRoomPress}
                onLongPress={() => handleRoomLongPress(item)}
                canUpdateCleaningStatus={canUpdateCleaningStatus}
              />
            )}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 68,
  },
  // headerContent removed
  selectedCategoryLabel: {
    fontSize: 14,
    color: "#FF5A5F",
    marginTop: 2,
    marginLeft: 2,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#484848",
  },
  roomCount: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  roomsGrid: {
    paddingBottom: 20,
  },
});

export default RoomsScreen;
