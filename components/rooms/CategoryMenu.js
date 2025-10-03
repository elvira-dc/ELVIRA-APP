import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * CategoryMenu component for scrollable room category filtering
 * @param {array} categories - Array of category objects
 * @param {string} selectedCategory - Currently selected category name
 * @param {function} onCategoryPress - Callback for category selection
 * @param {object} scrollViewRef - Ref for ScrollView
 */
const CategoryMenu = ({
  categories,
  selectedCategory,
  onCategoryPress,
  scrollViewRef,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.name && styles.activeCategoryButton,
            ]}
            onPress={() => onCategoryPress(category, index)}
          >
            <Ionicons
              name={category.icon}
              size={18}
              color={selectedCategory === category.name ? "#FFFFFF" : "#FF5A5F"}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.name && styles.activeCategoryText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  scroll: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#FF5A5F",
    backgroundColor: "#FFFFFF",
    minWidth: 80,
  },
  activeCategoryButton: {
    backgroundColor: "#FF5A5F",
    borderColor: "#FF5A5F",
    shadowColor: "#FF5A5F",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF5A5F",
    marginLeft: 6,
  },
  activeCategoryText: {
    color: "#FFFFFF",
  },
});

export default CategoryMenu;
