import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

// Demo data for development (remove in production)
const DEMO_STAFF_DATA = {
  id: "demo-1",
  employee_id: "EMP001",
  position: "Front Desk Manager",
  department: "Reception",
  status: "active",
  hire_date: "2023-01-15",
  data_processing_consent: true,
  consent_date: "2023-01-15",
  created_at: "2023-01-15",
  updated_at: "2024-10-01",
};

const DEMO_PERSONAL_DATA = {
  id: "demo-personal-1",
  staff_id: "demo-1",
  first_name: "Maria",
  last_name: "Rodriguez",
  date_of_birth: "1990-05-20",
  email: "maria.rodriguez@hotel.com",
  phone_number: "+34 612 345 678",
  city: "Madrid",
  zip_code: "28001",
  country: "Spain",
  address: "Calle Gran Vía 123",
  data_retention_until: "2030-01-15",
};

/**
 * useStaffData Hook
 * Fetches staff information from hotel_staff and hotel_staff_personal_data tables
 */
export const useStaffData = (userId) => {
  const [staffData, setStaffData] = useState(null);
  const [personalData, setPersonalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchStaffData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch hotel staff data
        // Try to match user id or email with staff records
        const { data: staffList, error: staffError } = await supabase
          .from("hotel_staff")
          .select("*");

        let staffInfo = null;
        if (staffList && staffList.length > 0) {
          // Try to find staff record by user id or email
          staffInfo =
            staffList.find(
              (staff) =>
                staff.id === userId ||
                staff.staff_id === userId ||
                staff.email === userId
            ) ||
            staffList.find((staff) => staff.status === "active") ||
            staffList[0];;
        } else {
          // Use demo data for development
          console.log("📝 Using demo staff data");
          staffInfo = DEMO_STAFF_DATA;
        }

        if (staffError && staffError.code !== "PGRST116") {
          console.log("Staff data error:", staffError);
        }

        setStaffData(staffInfo);

        // Fetch personal data if we have staff data
        if (staffInfo?.id) {

          const { data: personalInfo, error: personalError } = await supabase
            .from("hotel_staff_personal_data")
            .select("*")
            .eq("staff_id", staffInfo.id)
            .single();

          if (personalError) {
            if (personalError.code === "PGRST116") {
              console.log("📝 No personal data found, using demo data");
              setPersonalData({
                ...DEMO_PERSONAL_DATA,
                staff_id: staffInfo.id,
              });
            } else {
              console.log("Personal data error:", personalError);
              setPersonalData({
                ...DEMO_PERSONAL_DATA,
                staff_id: staffInfo.id,
              });
            }
          } else {

            setPersonalData(personalInfo);
          }
        }
      } catch (err) {
        console.error("Error fetching staff data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [userId]);

  // Function to update staff data
  const updateStaffData = async (updates) => {
    if (!staffData?.id) return false;

    try {
      const { error } = await supabase
        .from("hotel_staff")
        .update(updates)
        .eq("id", staffData.id);

      if (error) {
        console.error("Error updating staff data:", error);
        return false;
      }

      setStaffData((prev) => ({ ...prev, ...updates }));
      return true;
    } catch (err) {
      console.error("Error updating staff data:", err);
      return false;
    }
  };

  // Function to update personal data
  const updatePersonalData = async (updates) => {
    try {
      console.log("Updating personal data:", updates);

      // Check if we have a real personal data record with staff_id
      if (personalData?.staff_id || personalData?.id) {
        // Update the real database
        const { data, error } = await supabase
          .from("hotel_staff_personal_data")
          .update(updates)
          .eq("staff_id", personalData.staff_id || staffData?.id)
          .select()
          .single();

        if (error) {
          console.error("Database update error:", error);
          return false;
        }

        console.log("Database updated successfully:", data);
        setPersonalData(data);
      } else {
        console.log("No staff_id found, using demo mode");
        // Fallback to local state update
        setPersonalData((prev) => {
          const updatedData = { ...prev, ...updates };
          console.log("Updated personal data (demo):", updatedData);
          return updatedData;
        });
      }

      console.log("Update successful");
      return true;
    } catch (err) {
      console.error("Error updating personal data:", err);
      return false;
    }
  };

  // Update avatar URL
  const updateAvatarUrl = async (avatarUri) => {
    try {
      console.log("Updating avatar URL:", avatarUri);

      // Check if we have a real personal data record
      if (personalData?.staff_id || personalData?.id) {
        // Update the real database with avatar_url
        const { data, error } = await supabase
          .from("hotel_staff_personal_data")
          .update({ avatar_url: avatarUri })
          .eq("staff_id", personalData.staff_id || staffData?.id)
          .select()
          .single();

        if (error) {
          console.error("Database avatar update error:", error);
          return false;
        }

        console.log("Avatar updated in database:", data);
        setPersonalData(data);
      } else {
        console.log("No staff_id found, using demo mode for avatar");
        // Fallback to local state update
        setPersonalData((prev) => {
          const updatedData = {
            ...prev,
            avatar_url: avatarUri,
          };
          console.log("Updated avatar data (demo):", updatedData);
          return updatedData;
        });
      }

      return true;
    } catch (error) {
      console.error("Error updating avatar:", error);
      return false;
    }
  };

  return {
    staffData,
    personalData,
    loading,
    error,
    updateStaffData,
    updatePersonalData,
    updateAvatarUrl,
    refetch: () => {
      if (userId) {
        // Re-trigger the effect by updating a dependency
        setLoading(true);
      }
    },
  };
};
