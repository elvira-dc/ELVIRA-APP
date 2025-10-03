/**
 * Profile Constants
 * Menu configurations, role mappings, and other profile-related constants
 */

// Role display mapping
export const ROLE_DISPLAY_MAP = {
  elvira_admin: "Administrator",
  elvira_employee: "Employee",
  hotel_admin: "Hotel Admin",
  hotel_staff: "Hotel Staff",
  restaurant_admin: "Restaurant Admin",
  agency_admin: "Agency Admin",
  guest: "Guest",
};

// Menu items configuration
export const PROFILE_MENU_ITEMS = [
  {
    title: "Account Settings",
    icon: "person-outline",
    id: "account-settings",
  },
  {
    title: "Notification Preferences",
    icon: "notifications-outline",
    id: "notifications",
  },
  {
    title: "Test Notification",
    icon: "notifications",
    id: "test-notification",
    hasAction: true,
  },
  {
    title: "Payment Methods",
    icon: "card-outline",
    id: "payment",
  },
  {
    title: "Help & Support",
    icon: "help-circle-outline",
    id: "help",
  },
  {
    title: "Privacy Policy",
    icon: "document-text-outline",
    id: "privacy",
  },
  {
    title: "Terms of Service",
    icon: "shield-outline",
    id: "terms",
  },
];

// Profile stats configuration (for future use)
export const PROFILE_STATS = [
  { key: "bookings", label: "Bookings", value: "12" },
  { key: "reviews", label: "Reviews", value: "4.8" },
  { key: "points", label: "Points", value: "2.4K" },
];

// Alert messages
export const ALERT_MESSAGES = {
  SIGN_OUT_TITLE: "Sign Out",
  SIGN_OUT_MESSAGE: "Are you sure you want to sign out?",
  SIGN_OUT_CONFIRM: "Sign Out",
  SIGN_OUT_CANCEL: "Cancel",
  PERMISSION_REQUIRED: "Permission Required",
  CAMERA_PERMISSION: "Permission to access camera is required!",
  LIBRARY_PERMISSION: "Permission to access photo library is required!",
  SELECT_AVATAR: "Select Avatar",
  AVATAR_OPTIONS: "Choose how you want to select your profile picture",
  TEST_NOTIFICATION_SUCCESS: "Success",
  TEST_NOTIFICATION_MESSAGE: "Test notification sent!",
  ERROR: "Error",
  SIGN_OUT_ERROR: "Failed to sign out",
  NOTIFICATION_ERROR: "Failed to send notification",
};

// Default values
export const DEFAULT_VALUES = {
  USER_NAME: "User",
  EMAIL_PLACEHOLDER: "No email",
  DEFAULT_ROLE: "Employee",
};
