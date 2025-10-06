import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";

/**
 * Fetches dine-in orders with their items, restaurant, and menu item details.
 * @param {Object} params - { guestIds, hotelId, restaurantId }
 * @returns {Object} { orders, loading, error }
 *
 * NOTE: guests.id = dine_in_orders.guest_id AND dine_in_orders.hotel_id = guests.hotel_id
 */
export default function useDineInOrders({ guestIds = [], hotelId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    if (!guestIds || guestIds.length === 0 || !hotelId) {
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    let query = supabase
      .from("dine_in_orders")
      .select(
        `
        *,
        items:dine_in_order_items (
          *,
          menu_item:menu_item_id (id, name, price, restaurant_ids, hotel_id)
        )
      `
      )
      .order("created_at", { ascending: false });
    if (guestIds && guestIds.length > 0) query = query.in("guest_id", guestIds);
    if (hotelId) query = query.eq("hotel_id", hotelId);
    query
      .then(({ data, error }) => {
        console.log(
          "[useDineInOrders] guestIds:",
          guestIds,
          "hotelId:",
          hotelId
        );
        if (error) {
          console.error("[useDineInOrders] Supabase error:", error);
          setError(error);
        } else {
          console.log("[useDineInOrders] dine_in_orders data:", data);
          setOrders(data || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("[useDineInOrders] Query error:", err);
        setError(err);
        setLoading(false);
      });
  }, [JSON.stringify(guestIds), hotelId]);

  return { orders, loading, error };
}
