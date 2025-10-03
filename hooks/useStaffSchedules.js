import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

/**
 * useStaffSchedules Hook
 * Fetches and manages staff schedule data from the staff_schedules table
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

  // Fetch schedules from database
  const fetchSchedules = async (customFilters = {}) => {
    if (!staffId) return;

    try {
      setLoading(true);
      setError(null);

      console.log("🗓️ Fetching schedules for staff_id:", staffId);

      let query = supabase
        .from("staff_schedules")
        .select("*")
        .eq("staff_id", staffId)
        .order("schedule_date", { ascending: true });

      // Apply date range filters
      const dateStart = customFilters.startDate || startDate;
      const dateEnd = customFilters.endDate || endDate;

      if (dateStart) {
        query = query.gte("schedule_date", dateStart);
      }
      if (dateEnd) {
        query = query.lte("schedule_date", dateEnd);
      }

      // Apply status filter
      const statusFilter = customFilters.status || status;
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      // Apply shift type filter
      const shiftTypeFilter = customFilters.shiftType || shiftType;
      if (shiftTypeFilter) {
        query = query.eq("shift_type", shiftTypeFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching schedules:", fetchError);
        setError(fetchError.message);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} schedules`);
      setSchedules(data || []);
      return data || [];
    } catch (err) {
      console.error("Error in fetchSchedules:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get schedule for a specific date
  const getScheduleForDate = (date) => {
    // Create a local date string to avoid timezone conversion issues
    let dateString;
    if (date instanceof Date) {
      // Format date as YYYY-MM-DD in local time
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      dateString = `${year}-${month}-${day}`;
    } else {
      dateString = date;
    }
    return schedules.find((schedule) => schedule.schedule_date === dateString);
  };

  // Get schedules for a date range
  const getSchedulesForDateRange = (startDate, endDate) => {
    // Format dates as YYYY-MM-DD in local time
    const formatLocalDate = (date) => {
      if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      return date;
    };

    const start = formatLocalDate(startDate);
    const end = formatLocalDate(endDate);

    return schedules.filter((schedule) => {
      return schedule.schedule_date >= start && schedule.schedule_date <= end;
    });
  };

  // Update schedule status
  const updateScheduleStatus = async (
    scheduleId,
    newStatus,
    additionalData = {}
  ) => {
    try {
      console.log("📝 Updating schedule status:", { scheduleId, newStatus });

      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...additionalData,
      };

      // If confirming, add confirmation details
      if (newStatus === "CONFIRMED") {
        updateData.is_confirmed = true;
        updateData.confirmed_at = new Date().toISOString();
        // Add confirmed_by if userId is available
        if (userId) {
          updateData.confirmed_by = userId;
        }
      }

      const { data, error } = await supabase
        .from("staff_schedules")
        .update(updateData)
        .eq("id", scheduleId)
        .select()
        .single();

      if (error) {
        console.error("Error updating schedule:", error);
        return false;
      }

      // Update local state
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId ? { ...schedule, ...data } : schedule
        )
      );

      console.log("✅ Schedule updated successfully");
      return true;
    } catch (err) {
      console.error("Error updating schedule status:", err);
      return false;
    }
  };

  // Clock in functionality
  const clockIn = async (scheduleId) => {
    const now = new Date().toISOString();
    const updateData = {
      actual_start_time: now,
    };
    // Add confirmation details when clocking in
    if (userId) {
      updateData.is_confirmed = true;
      updateData.confirmed_at = now;
      updateData.confirmed_by = userId;
    }
    return await updateScheduleStatus(scheduleId, "CONFIRMED", updateData);
  };

  // Clock out functionality
  const clockOut = async (scheduleId) => {
    const now = new Date().toISOString();
    return await updateScheduleStatus(scheduleId, "COMPLETED", {
      actual_end_time: now,
    });
  };

  // Get today's schedule
  const getTodaySchedule = () => {
    const today = new Date().toISOString().split("T")[0];
    return schedules.find((schedule) => schedule.schedule_date === today);
  };

  // Format shift time for display
  const formatShiftTime = (startTime, endTime) => {
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(":");
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? "PM" : "AM";
      return `${hour12}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Get shift type color
  const getShiftTypeColor = (shiftType) => {
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

  // Get status color
  const getStatusColor = (status) => {
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

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch && staffId) {
      fetchSchedules();
    }
  }, [staffId, startDate, endDate, status, shiftType, autoFetch]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    getScheduleForDate,
    getSchedulesForDateRange,
    getTodaySchedule,
    updateScheduleStatus,
    clockIn,
    clockOut,
    formatShiftTime,
    getShiftTypeColor,
    getStatusColor,
    refetch: () => fetchSchedules(),
  };
};
