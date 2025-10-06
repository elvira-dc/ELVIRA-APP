import { supabase } from "../config/supabase";

/**
 * Schedule Service
 * Handles all API operations related to staff schedules
 */
export class ScheduleService {
  /**
   * Fetch schedules with filters
   * @param {string} staffId - Staff member ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of schedule objects
   */
  static async fetchSchedules(staffId, filters = {}) {
    if (!staffId) {
      throw new Error("Staff ID is required");
    }

    let query = supabase
      .from("staff_schedules")
      .select("*")
      .eq("staff_id", staffId)
      .order("schedule_date", { ascending: true });

    // Apply date range filters
    if (filters.startDate) {
      query = query.gte("schedule_date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("schedule_date", filters.endDate);
    }

    // Apply status filter
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    // Apply shift type filter
    if (filters.shiftType) {
      query = query.eq("shift_type", filters.shiftType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching schedules:", error);
      throw new Error(error.message);
    }

    console.log(`✅ Found ${data?.length || 0} schedules`);
    return data || [];
  }

  /**
   * Update schedule status
   * @param {string} scheduleId - Schedule ID
   * @param {string} newStatus - New status
   * @param {Object} additionalData - Additional fields to update
   * @param {string} userId - User ID for confirmation tracking
   * @returns {Promise<Object>} Updated schedule object
   */
  static async updateScheduleStatus(
    scheduleId,
    newStatus,
    additionalData = {},
    userId = null
  ) {
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
      throw new Error(error.message);
    }

    console.log("✅ Schedule updated successfully");
    return data;
  }

  /**
   * Clock in functionality
   * @param {string} scheduleId - Schedule ID
   * @param {string} userId - User ID for confirmation
   * @returns {Promise<Object>} Updated schedule object
   */
  static async clockIn(scheduleId, userId = null) {
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

    return await this.updateScheduleStatus(
      scheduleId,
      "CONFIRMED",
      updateData,
      userId
    );
  }

  /**
   * Clock out functionality
   * @param {string} scheduleId - Schedule ID
   * @param {string} userId - User ID for tracking
   * @returns {Promise<Object>} Updated schedule object
   */
  static async clockOut(scheduleId, userId = null) {
    const now = new Date().toISOString();
    return await this.updateScheduleStatus(
      scheduleId,
      "COMPLETED",
      {
        actual_end_time: now,
      },
      userId
    );
  }
}
