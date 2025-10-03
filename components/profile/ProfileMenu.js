import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * ProfileMenu Component
 * Displays menu items with icons and navigation arrows
 */
const ProfileMenu = ({ menuItems, onMenuItemPress }) => {
  return (
    <View style={styles.menuContainer}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={item.id || index}
          style={[
            styles.menuItem,
            index === menuItems.length - 1 && styles.lastMenuItem,
          ]}
          onPress={() => onMenuItemPress(item)}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name={item.icon} size={22} color="#8E8E93" />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: "#484848",
    marginLeft: 16,
  },
});

export default ProfileMenu;
