import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

/**
 * useAbsenceRequests Hook
 * Manages absence requests from the absence_requests table
 */
export const useAbsenceRequests = (staffId, hotelId) => {
  const [absenceRequests, setAbsenceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch absence requests from database
  const fetchAbsenceRequests = async () => {
    if (!staffId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("absence_requests")
        .select("*")
        .eq("staff_id", staffId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching absence requests:", fetchError);
        setError(fetchError.message);
        return;
      }

      console.log(`✅ Found ${data?.length || 0} absence requests`);
      setAbsenceRequests(data || []);
    } catch (err) {
      console.error("Error in fetchAbsenceRequests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit new absence request
  const submitAbsenceRequest = async (requestData) => {
    if (!staffId || !hotelId) {
      throw new Error("Staff ID and Hotel ID are required");
    }

    try {
      setLoading(true);
      setError(null);

      const requestPayload = {
        staff_id: staffId,
        hotel_id: hotelId,
        request_type: requestData.requestType,
        start_date: requestData.startDate,
        end_date: requestData.endDate,
        notes: requestData.notes || null,
        status: "pending", // Default status
        data_processing_consent: true,
        consent_date: new Date().toISOString(),
      };

      console.log("📝 Submitting absence request:", requestPayload);

      const { data, error: submitError } = await supabase
        .from("absence_requests")
        .insert([requestPayload])
        .select()
        .single();

      if (submitError) {
        console.error("Error submitting absence request:", submitError);
        throw new Error(submitError.message);
      }

      console.log("✅ Absence request submitted successfully:", data);

      // Add the new request to the local state
      setAbsenceRequests((prev) => [data, ...prev]);

      return data;
    } catch (err) {
      console.error("Error in submitAbsenceRequest:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update absence request status
  const updateAbsenceRequest = async (requestId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("absence_requests")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating absence request:", updateError);
        throw new Error(updateError.message);
      }

      // Update the local state
      setAbsenceRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, ...data } : request
        )
      );

      return data;
    } catch (err) {
      console.error("Error in updateAbsenceRequest:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel absence request
  const cancelAbsenceRequest = async (requestId) => {
    return await updateAbsenceRequest(requestId, { status: "cancelled" });
  };

  // Delete absence request
  const deleteAbsenceRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);

      console.log("=== DELETE OPERATION START ===");
      console.log("deleteAbsenceRequest called with ID:", requestId);
      console.log("ID type:", typeof requestId);
      console.log("Current absence requests count:", absenceRequests.length);

      // Check if the request exists in local state
      const existingRequest = absenceRequests.find((r) => r.id === requestId);
      console.log("Request exists in local state:", !!existingRequest);
      if (existingRequest) {
        console.log("Request details:", {
          id: existingRequest.id,
          status: existingRequest.status,
          start_date: existingRequest.start_date,
          end_date: existingRequest.end_date,
        });
      }

      console.log("Attempting database delete...");
      const { data, error: deleteError } = await supabase
        .from("absence_requests")
        .delete()
        .eq("id", requestId)
        .select(); // Add select to see what was deleted

      console.log("Database delete response:", { data, error: deleteError });

      if (deleteError) {
        console.error("Supabase delete error:", deleteError);
        throw new Error(deleteError.message);
      }

      if (data && data.length === 0) {
        console.warn(
          "No rows were deleted - request may not exist in database"
        );
        // Still proceed to remove from local state in case it's a sync issue
      } else {
        console.log("Database delete successful, deleted rows:", data);
      }

      console.log("Updating local state...");

      // Remove from local state
      setAbsenceRequests((prev) => {
        const filtered = prev.filter((request) => request.id !== requestId);
        console.log("Local state updated, new count:", filtered.length);
        console.log("Removed request with ID:", requestId);
        return filtered;
      });
      return true;
    } catch (err) {
      console.error("Error in deleteAbsenceRequest:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get requests by status
  const getRequestsByStatus = (status) => {
    return absenceRequests.filter((request) => request.status === status);
  };

  // Get requests for date range
  const getRequestsForDateRange = (startDate, endDate) => {
    return absenceRequests.filter((request) => {
      const requestStart = new Date(request.start_date);
      const requestEnd = new Date(request.end_date);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);

      // Check if request overlaps with the date range
      return requestStart <= rangeEnd && requestEnd >= rangeStart;
    });
  };

  // Format request type for display
  const formatRequestType = (type) => {
    const typeMap = {
      vacation: "Vacation",
      sick: "Sick Leave",
      personal: "Personal",
      training: "Training",
      other: "Other",
    };
    return typeMap[type] || type;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#FF9500",
      approved: "#34C759",
      rejected: "#FF3B30",
      cancelled: "#8E8E93",
    };
    return colorMap[status] || "#8E8E93";
  };

  // Auto-fetch on mount and when staffId changes
  useEffect(() => {
    fetchAbsenceRequests();
  }, [staffId]);

  return {
    absenceRequests,
    loading,
    error,
    fetchAbsenceRequests,
    submitAbsenceRequest,
    updateAbsenceRequest,
    cancelAbsenceRequest,
    deleteAbsenceRequest,
    getRequestsByStatus,
    getRequestsForDateRange,
    formatRequestType,
    getStatusColor,
    refetch: fetchAbsenceRequests,
  };
};
