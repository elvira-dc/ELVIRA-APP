import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";

/**
 * useRoomStatus hook
 * Fetches room status by joining guests and room_cleaning_status tables
 */
export const useRoomStatus = (hotelId) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotelId) return;
    fetchRooms();
  }, [hotelId]);

  useEffect(() => {
    if (!hotelId) return;

    const channel = supabase
      .channel("room_cleaning_status_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_cleaning_status",
          filter: `hotel_id=eq.${hotelId}`,
        },
        (payload) => {
          // Refetch or update state here
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hotelId]);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    // Fetch all guests (room_number, dnd_status) for this hotel
    const { data: guests, error: guestsError } = await supabase
      .from("guests")
      .select("room_number, dnd_status")
      .eq("hotel_id", hotelId)
      .eq("is_active", true);
    if (guestsError) {
      setError(guestsError.message);
      setLoading(false);
      return;
    }
    // Fetch cleaning status for all rooms in this hotel
    const { data: cleaning, error: cleaningError } = await supabase
      .from("room_cleaning_status")
      .select("room_number, cleaning_status")
      .eq("hotel_id", hotelId);
    if (cleaningError) {
      setError(cleaningError.message);
      setLoading(false);
      return;
    }
    // Merge by room_number
    const rooms = guests.map((guest) => {
      const clean = cleaning.find((c) => c.room_number === guest.room_number);
      return {
        room_number: guest.room_number,
        dnd_status: guest.dnd_status,
        cleaning_status: clean?.cleaning_status || null,
      };
    });
    setRooms(rooms);
    setLoading(false);
  };

  return { rooms, loading, error };
};
