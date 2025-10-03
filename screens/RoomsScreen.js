import React from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRooms } from "../hooks/useRooms";
import CategoryMenu from "../components/rooms/CategoryMenu";
import RoomCard from "../components/rooms/RoomCard";

const RoomsScreen = () => {
  const {
    selectedCategory,
    scrollViewRef,
    categories,
    filteredRooms,
    handleCategoryPress,
  } = useRooms();

  const handleRoomPress = (room) => {
    // Handle room selection - could navigate to room details
    console.log("Room selected:", room.number);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Hotel Rooms</Text>
          <Text style={styles.roomCount}>
            {filteredRooms?.length || 0} room
            {(filteredRooms?.length || 0) !== 1 ? "s" : ""}
            {selectedCategory !== "All" && ` • ${selectedCategory}`}
          </Text>
        </View>
      </View>

      {/* Scrollable Category Menu */}
      <CategoryMenu
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryPress={handleCategoryPress}
        scrollViewRef={scrollViewRef}
      />

      <ScrollView style={styles.content}>
        <FlatList
          data={filteredRooms}
          numColumns={4}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.roomsGrid}
          renderItem={({ item }) => (
            <RoomCard room={item} onPress={handleRoomPress} />
          )}
          scrollEnabled={false}
        />
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
    paddingTop: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    zIndex: 2,
    minHeight: 100,
  },
  headerContent: {
    // Remove flex: 1 to prevent stretching issues
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
