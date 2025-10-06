import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";

/**
 * useShopOrders - Fetches shop orders for given guestIds and hotelId, with nested items and product details.
 * @param {Object} params
 * @param {string[]} params.guestIds - Array of guest UUIDs
 * @param {string} params.hotelId - Hotel UUID
 * @param {string[]} [params.statuses] - Optional array of statuses to filter
 * @returns {Object} { orders, loading, error, refetch }
 */
export default function useShopOrders({ guestIds, hotelId, statuses }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    if (!guestIds?.length || !hotelId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    let query = supabase
      .from("shop_orders")
      .select(
        `
        *,
        shop_order_items:shop_order_items(order_id, product_id, quantity, price_at_order, product:products(id, name, image_url, price, description, category))
      `
      )
      .in("guest_id", guestIds)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false });
    if (statuses && statuses.length > 0) {
      query = query.in("status", statuses);
    }
    const { data, error } = await query;
    if (error) {
      setError(error);
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(guestIds), hotelId, JSON.stringify(statuses)]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
}
