import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "../constants/theme";

/**
 * Reusable header component with navigation and actions
 */
export const ScreenHeader = ({
  title,
  leftComponent,
  rightComponent,
  showBackButton,
  onBackPress,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {rightComponent && (
          <View style={styles.rightComponent}>{rightComponent}</View>
        )}
      </View>

      {leftComponent && (
        <View style={styles.leftComponent}>{leftComponent}</View>
      )}
    </View>
  );
};

/**
 * Reusable toggle button component
 */
export const ToggleButton = ({ options, selectedValue, onSelect, style }) => {
  return (
    <View style={[styles.toggleContainer, style]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.toggleOption,
            selectedValue === option.value && styles.activeToggle,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.toggleText,
              selectedValue === option.value && styles.activeToggleText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Reusable navigation row with previous/next buttons
 */
export const NavigationRow = ({ title, onPrevious, onNext, style }) => {
  return (
    <View style={[styles.navigationRow, style]}>
      <TouchableOpacity style={styles.navButton} onPress={onPrevious}>
        <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <Text style={styles.navigationTitle} numberOfLines={1}>
        {title}
      </Text>

      <TouchableOpacity style={styles.navButton} onPress={onNext}>
        <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Reusable empty state component
 */
export const EmptyState = ({ title, subtitle, icon, actionButton, style }) => {
  return (
    <View style={[styles.emptyState, style]}>
      {icon && <View style={styles.emptyStateIcon}>{icon}</View>}

      <Text style={styles.emptyStateTitle}>{title}</Text>

      {subtitle && <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>}

      {actionButton && (
        <View style={styles.emptyStateAction}>{actionButton}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.display,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    flex: 1,
  },
  rightComponent: {
    marginLeft: SPACING.md,
  },
  leftComponent: {
    marginTop: SPACING.lg,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.divider,
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
  },
  toggleOption: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  activeToggleText: {
    color: COLORS.surface,
  },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceVariant,
  },
  navigationTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: SPACING.xl,
  },
  emptyStateIcon: {
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textTertiary,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyStateAction: {
    marginTop: SPACING.xl,
  },
});
