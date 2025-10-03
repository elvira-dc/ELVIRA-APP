import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Custom hook for managing notifications
 * @returns {object} Notification state and functions
 */
export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    // Listener for notifications received while app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // Listener for when user taps on notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        // Handle notification tap here (navigate to specific screen, etc.)
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  /**
   * Register device for push notifications and get push token
   */
  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })
      ).data;
      console.log("Push token:", token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  };

  /**
   * Send a local notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {object} data - Additional data to include
   */
  const sendLocalNotification = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { seconds: 1 },
    });
  };

  /**
   * Schedule a notification for a future time
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Date} triggerDate - When to send the notification
   * @param {object} data - Additional data to include
   */
  const scheduleNotification = async (title, body, triggerDate, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        date: triggerDate,
      },
    });
  };

  /**
   * Cancel all scheduled notifications
   */
  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  /**
   * Get all scheduled notifications
   */
  const getScheduledNotifications = async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
  };

  return {
    // State
    expoPushToken,
    notification,

    // Functions
    sendLocalNotification,
    scheduleNotification,
    cancelAllNotifications,
    getScheduledNotifications,
    registerForPushNotificationsAsync,
  };
};
