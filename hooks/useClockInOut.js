import { useState } from "react";
import { ScheduleService } from "../services/scheduleService";

/**
 * useClockInOut Hook
 * Manages clock in/out operations with focused state management
 */
export const useClockInOut = () => {
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  const [clockError, setClockError] = useState(null);

  /**
   * Clock in to a schedule
   * @param {string} scheduleId - Schedule ID
   * @param {string} userId - User ID for confirmation
   * @param {Function} onSuccess - Success callback with updated schedule
   * @param {Function} onError - Error callback
   * @returns {Promise<boolean>} Success status
   */
  const clockIn = async (
    scheduleId,
    userId = null,
    onSuccess = null,
    onError = null
  ) => {
    try {
      setClockingIn(true);
      setClockError(null);

      console.log("⏰ Clocking in to schedule:", scheduleId);

      const updatedSchedule = await ScheduleService.clockIn(scheduleId, userId);

      console.log("✅ Successfully clocked in");

      if (onSuccess) {
        onSuccess(updatedSchedule);
      }

      return true;
    } catch (error) {
      console.error("❌ Clock in failed:", error);
      setClockError(error.message);

      if (onError) {
        onError(error);
      }

      return false;
    } finally {
      setClockingIn(false);
    }
  };

  /**
   * Clock out from a schedule
   * @param {string} scheduleId - Schedule ID
   * @param {string} userId - User ID for tracking
   * @param {Function} onSuccess - Success callback with updated schedule
   * @param {Function} onError - Error callback
   * @returns {Promise<boolean>} Success status
   */
  const clockOut = async (
    scheduleId,
    userId = null,
    onSuccess = null,
    onError = null
  ) => {
    try {
      setClockingOut(true);
      setClockError(null);

      console.log("⏰ Clocking out from schedule:", scheduleId);

      const updatedSchedule = await ScheduleService.clockOut(
        scheduleId,
        userId
      );

      console.log("✅ Successfully clocked out");

      if (onSuccess) {
        onSuccess(updatedSchedule);
      }

      return true;
    } catch (error) {
      console.error("❌ Clock out failed:", error);
      setClockError(error.message);

      if (onError) {
        onError(error);
      }

      return false;
    } finally {
      setClockingOut(false);
    }
  };

  /**
   * Update schedule status
   * @param {string} scheduleId - Schedule ID
   * @param {string} newStatus - New status
   * @param {Object} additionalData - Additional data to update
   * @param {string} userId - User ID for tracking
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   * @returns {Promise<boolean>} Success status
   */
  const updateStatus = async (
    scheduleId,
    newStatus,
    additionalData = {},
    userId = null,
    onSuccess = null,
    onError = null
  ) => {
    try {
      setClockError(null);

      console.log("📝 Updating schedule status:", { scheduleId, newStatus });

      const updatedSchedule = await ScheduleService.updateScheduleStatus(
        scheduleId,
        newStatus,
        additionalData,
        userId
      );

      console.log("✅ Schedule status updated successfully");

      if (onSuccess) {
        onSuccess(updatedSchedule);
      }

      return true;
    } catch (error) {
      console.error("❌ Status update failed:", error);
      setClockError(error.message);

      if (onError) {
        onError(error);
      }

      return false;
    }
  };

  /**
   * Clear any clock-related errors
   */
  const clearError = () => {
    setClockError(null);
  };

  /**
   * Check if any clock operation is in progress
   */
  const isClockingInProgress = clockingIn || clockingOut;

  return {
    // State
    clockingIn,
    clockingOut,
    clockError,
    isClockingInProgress,

    // Actions
    clockIn,
    clockOut,
    updateStatus,
    clearError,
  };
};
