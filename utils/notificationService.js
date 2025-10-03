import * as Notifications from "expo-notifications";

/**
 * Notification utility functions for the Elvira Hotel app
 */

/**
 * Send notification when absence request is submitted
 * @param {string} startDate - Start date of absence
 * @param {string} endDate - End date of absence
 * @param {string} type - Type of absence request
 */
export const notifyAbsenceRequestSubmitted = async (
  startDate,
  endDate,
  type
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Absence Request Submitted",
      body: `Your ${type.toLowerCase()} request from ${startDate} to ${endDate} has been submitted for approval.`,
      data: { type: "absence_request", startDate, endDate, requestType: type },
      sound: true,
    },
    trigger: { seconds: 2 },
  });
};

/**
 * Send notification for shift reminders
 * @param {string} shiftTime - Time of the shift
 * @param {string} location - Location of the shift
 */
export const notifyShiftReminder = async (shiftTime, location = "Hotel") => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Shift Reminder",
      body: `You have a shift starting at ${shiftTime} at ${location}`,
      data: { type: "shift_reminder", shiftTime, location },
      sound: true,
    },
    trigger: { seconds: 1 },
  });
};

/**
 * Send notification when room status changes
 * @param {string} roomNumber - Room number
 * @param {string} newStatus - New room status
 * @param {string} previousStatus - Previous room status
 */
export const notifyRoomStatusChange = async (
  roomNumber,
  newStatus,
  previousStatus
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Room Status Updated",
      body: `Room ${roomNumber} status changed from ${previousStatus} to ${newStatus}`,
      data: { type: "room_status", roomNumber, newStatus, previousStatus },
      sound: true,
    },
    trigger: { seconds: 1 },
  });
};

/**
 * Send notification for new messages
 * @param {string} senderName - Name of message sender
 * @param {string} messagePreview - Preview of the message
 */
export const notifyNewMessage = async (senderName, messagePreview) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `New message from ${senderName}`,
      body: messagePreview,
      data: { type: "new_message", senderName, messagePreview },
      sound: true,
    },
    trigger: { seconds: 1 },
  });
};

/**
 * Send notification for maintenance alerts
 * @param {string} roomNumber - Room number requiring maintenance
 * @param {string} issueType - Type of maintenance issue
 * @param {string} priority - Priority level (low, medium, high)
 */
export const notifyMaintenanceAlert = async (
  roomNumber,
  issueType,
  priority = "medium"
) => {
  const priorityText = priority === "high" ? "URGENT: " : "";

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${priorityText}Maintenance Required`,
      body: `Room ${roomNumber} requires attention: ${issueType}`,
      data: { type: "maintenance_alert", roomNumber, issueType, priority },
      sound: true,
    },
    trigger: { seconds: 1 },
  });
};

/**
 * Schedule daily shift reminder notifications
 * @param {Array} shifts - Array of shift objects with time and location
 */
export const scheduleDailyShiftReminders = async (shifts) => {
  // Cancel existing shift reminders
  const existingNotifications =
    await Notifications.getAllScheduledNotificationsAsync();
  const shiftNotifications = existingNotifications.filter(
    (notif) => notif.content.data?.type === "shift_reminder"
  );

  for (const notif of shiftNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notif.identifier);
  }

  // Schedule new shift reminders
  for (const shift of shifts) {
    const reminderTime = new Date(shift.startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 30); // 30 minutes before shift

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Shift Starting Soon",
        body: `Your shift at ${shift.location} starts in 30 minutes`,
        data: { type: "shift_reminder", ...shift },
        sound: true,
      },
      trigger: {
        date: reminderTime,
      },
    });
  }
};

/**
 * Send welcome notification when user logs in
 * @param {string} userName - Name of the user
 */
export const notifyWelcome = async (userName) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Welcome back, ${userName}!`,
      body: "You have new updates in your Elvira Hotel app",
      data: { type: "welcome", userName },
      sound: true,
    },
    trigger: { seconds: 3 },
  });
};
