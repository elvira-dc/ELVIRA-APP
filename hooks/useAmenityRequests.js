import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";

/**
 * Custom hook to fetch amenity requests for a list of guest IDs.
 * @param {Array<string>} guestIds - Array of guest UUIDs
 * @returns {Object} { amenityRequests, loading, error }
 */
export default function useAmenityRequests(guestIds) {
  const [amenityRequests, setAmenityRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch amenity requests
  const fetchAmenityRequests = async () => {
    if (!guestIds || guestIds.length === 0) {
      setAmenityRequests([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("amenity_requests")
      .select(
        "id, special_instructions, amenity_id, guest_id, status, amenity:amenity_id(name)"
      )
      .in("guest_id", guestIds);
    if (error) {
      setAmenityRequests([]);
      setError(error);
    } else {
      setAmenityRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAmenityRequests();
    // Real-time subscription
    if (!guestIds || guestIds.length === 0) return;
    const channel = supabase
      .channel("roomdetails-amenity-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "amenity_requests",
          filter: `guest_id=in.(${guestIds.map((id) => `'${id}'`).join(",")})`,
        },
        (payload) => {
          fetchAmenityRequests();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(guestIds)]);

  // Update status
  const updateAmenityRequestStatus = async (id, newStatus) => {
    await supabase
      .from("amenity_requests")
      .update({ status: newStatus })
      .eq("id", id);
    // Optionally, you can optimistically update local state here
  };

  return { amenityRequests, loading, updateAmenityRequestStatus };
}
