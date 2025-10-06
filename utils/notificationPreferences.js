import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Notification Preferences Utility
 * Manages notification preferences across the app
 */

const NOTIFICATION_PREFERENCE_KEY = "notifications_enabled";

/**
 * Check if notifications are enabled
 * @returns {Promise<boolean>} True if notifications are enabled
 */
export const areNotificationsEnabled = async () => {
  try {
    const storedPreference = await AsyncStorage.getItem(
      NOTIFICATION_PREFERENCE_KEY
    );
    if (storedPreference !== null) {
      return JSON.parse(storedPreference);
    }
    // Default to enabled
    return true;
  } catch (error) {
    console.error("Error checking notification preference:", error);
    // Default to enabled on error
    return true;
  }
};

/**
 * Set notification preference
 * @param {boolean} enabled - Whether notifications should be enabled
 * @returns {Promise<boolean>} True if successfully saved
 */
export const setNotificationPreference = async (enabled) => {
  try {
    await AsyncStorage.setItem(
      NOTIFICATION_PREFERENCE_KEY,
      JSON.stringify(enabled)
    );
    console.log("📱 Notification preference saved:", enabled);
    return true;
  } catch (error) {
    console.error("Error saving notification preference:", error);
    return false;
  }
};

/**
 * Get notification preference
 * @returns {Promise<boolean>} Current notification preference
 */
export const getNotificationPreference = async () => {
  return await areNotificationsEnabled();
};
