import { useState, useEffect } from "react";
import { ScheduleService } from "../services/scheduleService";
import {
  getScheduleForDate,
  getSchedulesForDateRange,
  getTodaySchedule,
  formatShiftTime,
  getShiftTypeColor,
  getStatusColor,
} from "../utils/scheduleUtils";

/**
 * useStaffSchedules Hook
 * Simplified hook that orchestrates schedule data fetching and state management
 */
export const useStaffSchedules = (staffId, userId, options = {}) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    startDate = null,
    endDate = null,
    status = null,
    shiftType = null,
    autoFetch = true,
  } = options;

  /**
   * Fetch schedules from the service layer
   * @param {Object} customFilters - Optional custom filters
   * @returns {Promise<Array>} Array of schedules
   */
  const fetchSchedules = async (customFilters = {}) => {
    if (!staffId) return [];

    try {
      setLoading(true);
      setError(null);

      // Combine default options with custom filters
      const filters = {
        startDate: customFilters.startDate || startDate,
        endDate: customFilters.endDate || endDate,
        status: customFilters.status || status,
        shiftType: customFilters.shiftType || shiftType,
      };

      const data = await ScheduleService.fetchSchedules(staffId, filters);
      setSchedules(data);
      return data;
    } catch (err) {
      console.error("Error in fetchSchedules:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update a schedule in local state
   * @param {Object} updatedSchedule - Updated schedule object
   */
  const updateLocalSchedule = (updatedSchedule) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === updatedSchedule.id ? updatedSchedule : schedule
      )
    );
  };

  /**
   * Update schedule status using the service layer
   * @param {string} scheduleId - Schedule ID
   * @param {string} newStatus - New status
   * @param {Object} additionalData - Additional data
   * @returns {Promise<boolean>} Success status
   */
  const updateScheduleStatus = async (
    scheduleId,
    newStatus,
    additionalData = {}
  ) => {
    try {
      const updatedSchedule = await ScheduleService.updateScheduleStatus(
        scheduleId,
        newStatus,
        additionalData,
        userId
      );

      updateLocalSchedule(updatedSchedule);
      return true;
    } catch (err) {
      console.error("Error updating schedule status:", err);
      setError(err.message);
      return false;
    }
  };

  /**
   * Clock in functionality
   * @param {string} scheduleId - Schedule ID
   * @returns {Promise<boolean>} Success status
   */
  const clockIn = async (scheduleId) => {
    try {
      const updatedSchedule = await ScheduleService.clockIn(scheduleId, userId);
      updateLocalSchedule(updatedSchedule);
      return true;
    } catch (err) {
      console.error("Error clocking in:", err);
      setError(err.message);
      return false;
    }
  };

  /**
   * Clock out functionality
   * @param {string} scheduleId - Schedule ID
   * @returns {Promise<boolean>} Success status
   */
  const clockOut = async (scheduleId) => {
    try {
      const updatedSchedule = await ScheduleService.clockOut(
        scheduleId,
        userId
      );
      updateLocalSchedule(updatedSchedule);
      return true;
    } catch (err) {
      console.error("Error clocking out:", err);
      setError(err.message);
      return false;
    }
  };

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch && staffId) {
      fetchSchedules();
    }
  }, [staffId, startDate, endDate, status, shiftType, autoFetch]);

  return {
    // State
    schedules,
    loading,
    error,

    // Actions
    fetchSchedules,
    updateScheduleStatus,
    clockIn,
    clockOut,
    refetch: () => fetchSchedules(),

    // Utility functions (from scheduleUtils)
    getScheduleForDate: (date) => getScheduleForDate(schedules, date),
    getSchedulesForDateRange: (start, end) =>
      getSchedulesForDateRange(schedules, start, end),
    getTodaySchedule: () => getTodaySchedule(schedules),
    formatShiftTime,
    getShiftTypeColor,
    getStatusColor,
  };
};
