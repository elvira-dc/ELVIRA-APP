import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

/**
 * useStaffContacts Hook
 * Fetches all staff members to be used as contacts for messaging
 */
export const useStaffContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all staff members with their personal data
   */
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);



      // Get current authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("❌ Authentication error:", authError);
        setError("Authentication required");
        return;
      }



      // Alternative approach: Query personal data directly and join in code


      const { data: personalDataRecords, error: personalError } =
        await supabase.from("hotel_staff_personal_data").select(`
          staff_id,
          first_name,
          last_name,
          email,
          phone_number,
          avatar_url
        `);

      if (personalError) {
        console.error("❌ Error fetching personal data:", personalError);
        setError(personalError.message);
        return;
      }



      // Get staff IDs that have personal data
      const staffIds = personalDataRecords?.map((p) => p.staff_id) || [];


      if (staffIds.length === 0) {
        console.log("⚠️ No staff IDs found in personal data");
        setContacts([]);
        return;
      }

      // Now get hotel staff records for those IDs
      const { data: staffRecords, error: staffError } = await supabase
        .from("hotel_staff")
        .select(
          `
          id,
          employee_id,
          position,
          department,
          status
        `
        )
        .in("id", staffIds)
        .eq("status", "active");

      if (staffError) {
        console.error("❌ Error fetching staff records:", staffError);
        setError(staffError.message);
        return;
      }

      // Combine the data in JavaScript
      const allContacts = [];

      personalDataRecords.forEach((personalData) => {
        // Find matching staff record
        const staffRecord = staffRecords.find(
          (staff) => staff.id === personalData.staff_id
        );

        if (staffRecord) {

          allContacts.push({
            id: staffRecord.id,
            employeeId: staffRecord.employee_id,
            name: `${personalData.first_name || ""} ${
              personalData.last_name || ""
            }`.trim(),
            firstName: personalData.first_name,
            lastName: personalData.last_name,
            email: personalData.email,
            position: staffRecord.position,
            department: staffRecord.department,
            phone: personalData.phone_number,
            avatar_url: personalData.avatar_url,
            status: staffRecord.status,
          });
        } else {
          console.log(
            `⚠️ No staff record found for personal data with staff_id: ${personalData.staff_id}`
          );
        }
      });



      // Get the current user's staff ID for filtering by matching email
      // Since there's no auth_user_id column, we match by email in personal data
      let currentUserStaffId = null;

      const { data: personalData, error: userPersonalError } = await supabase
        .from("hotel_staff_personal_data")
        .select("staff_id")
        .eq("email", user.email)
        .single();

      if (!userPersonalError && personalData) {
        currentUserStaffId = personalData.staff_id;
        console.log(
          "✅ Found current user staff ID by email:",
          currentUserStaffId
        );
      } else {
        console.log(
          "⚠️ Could not find current user staff record, no filtering applied"
        );
      }

      // Filter out the current authenticated user - we don't want to chat with ourselves
      const filteredContacts = currentUserStaffId
        ? allContacts.filter((contact) => contact.id !== currentUserStaffId)
        : allContacts; // If we can't find current user, don't filter


      setContacts(filteredContacts);
    } catch (err) {
      console.error("Error in fetchContacts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search contacts by name, position, or department
   * @param {string} query - Search query
   * @returns {Array} Filtered contacts
   */
  const searchContacts = (query) => {
    if (!query.trim()) return contacts;

    const lowercaseQuery = query.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowercaseQuery) ||
        contact.position.toLowerCase().includes(lowercaseQuery) ||
        contact.department.toLowerCase().includes(lowercaseQuery) ||
        contact.email.toLowerCase().includes(lowercaseQuery)
    );
  };

  /**
   * Get contacts grouped by department
   * @returns {Object} Contacts grouped by department
   */
  const getContactsByDepartment = () => {
    return contacts.reduce((groups, contact) => {
      const department = contact.department || "Other";
      if (!groups[department]) {
        groups[department] = [];
      }
      groups[department].push(contact);
      return groups;
    }, {});
  };

  /**
   * Get a specific contact by ID
   * @param {string} contactId - Contact ID
   * @returns {Object|null} Contact or null if not found
   */
  const getContactById = (contactId) => {
    return contacts.find((contact) => contact.id === contactId) || null;
  };

  // Fetch contacts on hook initialization
  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    // State
    contacts,
    loading,
    error,

    // Actions
    fetchContacts,
    searchContacts,
    getContactsByDepartment,
    getContactById,
    refetch: fetchContacts,
  };
};
