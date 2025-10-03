import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * MessageSearchBar Component
 * Search input with icon for filtering messages
 */
const MessageSearchBar = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search messages...",
}) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={20}
        color="#A0A0A0"
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        value={searchQuery}
        onChangeText={onSearchChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 36,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingLeft: 50,
    fontSize: 16,
    color: "#484848",
  },
});

export default MessageSearchBar;
