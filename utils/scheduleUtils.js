/**
 * Schedule Utilities
 * Pure functions for date operations, formatting, and schedule calculations
 */

/**
 * Format a date as YYYY-MM-DD in local time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatLocalDate = (date) => {
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return date;
};

/**
 * Get schedule for a specific date
 * @param {Array} schedules - Array of schedule objects
 * @param {Date|string} date - Target date
 * @returns {Object|undefined} Schedule object or undefined
 */
export const getScheduleForDate = (schedules, date) => {
  const dateString = formatLocalDate(date);
  return schedules.find((schedule) => schedule.schedule_date === dateString);
};

/**
 * Get schedules for a date range
 * @param {Array} schedules - Array of schedule objects
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array} Filtered schedules
 */
export const getSchedulesForDateRange = (schedules, startDate, endDate) => {
  const start = formatLocalDate(startDate);
  const end = formatLocalDate(endDate);

  return schedules.filter((schedule) => {
    return schedule.schedule_date >= start && schedule.schedule_date <= end;
  });
};

/**
 * Get today's schedule from schedules array
 * @param {Array} schedules - Array of schedule objects
 * @returns {Object|undefined} Today's schedule or undefined
 */
export const getTodaySchedule = (schedules) => {
  const today = new Date().toISOString().split("T")[0];
  return schedules.find((schedule) => schedule.schedule_date === today);
};

/**
 * Format time string for display (24h to 12h format)
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Formatted time string
 */
const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Format shift time for display
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {string} Formatted shift time range
 */
export const formatShiftTime = (startTime, endTime) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

/**
 * Get color for shift type
 * @param {string} shiftType - Shift type
 * @returns {string} Hex color code
 */
export const getShiftTypeColor = (shiftType) => {
  switch (shiftType) {
    case "MORNING":
      return "#FFD60A";
    case "AFTERNOON":
      return "#FF9500";
    case "EVENING":
      return "#5856D6";
    case "NIGHT":
      return "#1D1D1F";
    case "SPLIT":
      return "#AF52DE";
    default:
      return "#8E8E93";
  }
};

/**
 * Get color for schedule status
 * @param {string} status - Schedule status
 * @returns {string} Hex color code
 */
export const getStatusColor = (status) => {
  switch (status) {
    case "SCHEDULED":
      return "#007AFF";
    case "CONFIRMED":
      return "#34C759";
    case "COMPLETED":
      return "#8E8E93";
    case "CANCELLED":
      return "#FF3B30";
    default:
      return "#8E8E93";
  }
};

/**
 * Filter schedules by multiple criteria
 * @param {Array} schedules - Array of schedule objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered schedules
 */
export const filterSchedules = (schedules, filters) => {
  return schedules.filter((schedule) => {
    // Date range filter
    if (filters.startDate || filters.endDate) {
      const scheduleDate = schedule.schedule_date;
      if (
        filters.startDate &&
        scheduleDate < formatLocalDate(filters.startDate)
      ) {
        return false;
      }
      if (filters.endDate && scheduleDate > formatLocalDate(filters.endDate)) {
        return false;
      }
    }

    // Status filter
    if (filters.status && schedule.status !== filters.status) {
      return false;
    }

    // Shift type filter
    if (filters.shiftType && schedule.shift_type !== filters.shiftType) {
      return false;
    }

    return true;
  });
};

/**
 * Group schedules by date
 * @param {Array} schedules - Array of schedule objects
 * @returns {Object} Schedules grouped by date
 */
export const groupSchedulesByDate = (schedules) => {
  return schedules.reduce((groups, schedule) => {
    const date = schedule.schedule_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {});
};

/**
 * Get schedules for current week
 * @param {Array} schedules - Array of schedule objects
 * @returns {Array} This week's schedules
 */
export const getThisWeekSchedules = (schedules) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)

  return getSchedulesForDateRange(schedules, startOfWeek, endOfWeek);
};

/**
 * Check if a schedule is happening today
 * @param {Object} schedule - Schedule object
 * @returns {boolean} True if schedule is today
 */
export const isScheduleToday = (schedule) => {
  const today = formatLocalDate(new Date());
  return schedule.schedule_date === today;
};

/**
 * Check if a schedule is in the past
 * @param {Object} schedule - Schedule object
 * @returns {boolean} True if schedule is in the past
 */
export const isSchedulePast = (schedule) => {
  const today = formatLocalDate(new Date());
  return schedule.schedule_date < today;
};

/**
 * Check if a schedule is in the future
 * @param {Object} schedule - Schedule object
 * @returns {boolean} True if schedule is in the future
 */
export const isScheduleFuture = (schedule) => {
  const today = formatLocalDate(new Date());
  return schedule.schedule_date > today;
};
