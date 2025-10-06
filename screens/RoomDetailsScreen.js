import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../config/supabase";
import { Swipeable } from "react-native-gesture-handler";
import useAmenityRequests from "../hooks/useAmenityRequests";
import useDineInOrders from "../hooks/useDineInOrders";
import useShopOrders from "../hooks/useShopOrders";
import { useAuth } from "../hooks/useAuth";

const STATUS_ICONS = {
  pending: { name: "clock-outline", color: "#FFA500" },
  approved: { name: "check-circle-outline", color: "#4CD964" },
  cancelled: { name: "close-circle-outline", color: "#FF5A5F" },
};

const DINE_STATUS_ICONS = {
  pending: { name: "clock-outline", color: "#FFA500" },
  confirmed: { name: "check-circle-outline", color: "#4CD964" },
  cancelled: { name: "close-circle-outline", color: "#FF5A5F" },
};

const RoomDetailsScreen = ({ route }) => {
  const { user } = useAuth();
  const [staffInfo, setStaffInfo] = useState(null);

  useEffect(() => {
    const fetchStaffInfo = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("hotel_staff")
        .select("position,department")
        .eq("id", user.id)
        .single();
      if (!error && data) setStaffInfo(data);
    };
    fetchStaffInfo();
  }, [user]);

  const { room } = route.params;
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [optimisticStatus, setOptimisticStatus] = useState({});
  const [reloadFlag, setReloadFlag] = useState(false);
  const navigation = useNavigation();
  const swipeableRefs = useRef({});

  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      // Fetch guests for the room
      const { data: guestsData, error: guestsError } = await supabase
        .from("guests")
        .select("id, guest_name, access_code_expires_at, hotel_id")
        .eq("room_number", room.room_number);

      if (guestsError || !guestsData) {
        setGuests([]);
        setLoading(false);
        return;
      }

      // For each guest, fetch their personal data by guest_is = guest.id
      const enrichedGuests = await Promise.all(
        guestsData.map(async (guest) => {
          const { data: personal, error: personalError } = await supabase
            .from("guest_personal_data")
            .select("country, language, aditional_guest_data")
            .eq("guest_is", guest.id)
            .single();
          return {
            ...guest,
            guest_personal_data: personal || null,
          };
        })
      );
      setGuests(enrichedGuests);
      setLoading(false);
    };
    fetchGuests();
  }, [room.room_number]);

  // Use the hook for amenity requests
  const guestIds = guests.map((g) => g.id);
  const hotelId = guests[0]?.hotel_id;
  const {
    amenityRequests,
    loading: amenityLoading,
    updateAmenityRequestStatus,
  } = useAmenityRequests(guestIds, reloadFlag);

  const restaurantId = undefined; // Default: no filter
  const {
    orders: dineInOrders,
    loading: dineLoading,
    error: dineError,
  } = useDineInOrders({ guestIds, hotelId, restaurantId });
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const {
    orders: shopOrders,
    loading: shopLoading,
    error: shopError,
  } = useShopOrders({ guestIds, hotelId });

  // Filter requests if staff is Kitchen
  let onlyDineIn = false;
  if (
    staffInfo &&
    staffInfo.position === "Hotel Staff" &&
    staffInfo.department === "Kitchen"
  ) {
    onlyDineIn = true;
  }
  // Debug logs for shop orders
  useEffect(() => {
    if (shopError) console.error("[RoomDetailsScreen] shopError:", shopError);
  }, [guestIds, hotelId, shopOrders, shopError]);
  const [expandedShopOrderId, setExpandedShopOrderId] = useState(null);

  // Real-time subscription for amenity_requests
  useEffect(() => {
    if (!guestIds.length) return;
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
          // Refetch amenity requests on any change
          if (typeof updateAmenityRequestStatus === "function") {
            // If using a hook, trigger a refetch or update state
            // For now, just force a reload by updating a dummy state
            setReloadFlag((f) => !f);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [guestIds]);

  // Swipe actions
  const renderRightActions = (progress, dragX, req) => (
    <View style={[styles.swipeAction, styles.swipeActionRight]}>
      <Ionicons name="close" size={28} color="#fff" />
    </View>
  );
  const renderLeftActions = (progress, dragX, req) => (
    <View style={[styles.swipeAction, styles.swipeActionLeft]}>
      <Ionicons name="checkmark" size={28} color="#fff" />
    </View>
  );
  const [updatingId, setUpdatingId] = useState(null);
  // Handler for swipeable open
  const handleSwipeableOpen = async (direction, req) => {
    // Optimistically update icon
    setOptimisticStatus((prev) => ({
      ...prev,
      [req.id]: direction === "left" ? "approved" : "cancelled",
    }));

    // Update in database
    const newStatus = direction === "left" ? "approved" : "cancelled";
    await supabase
      .from("amenity_requests")
      .update({ status: newStatus })
      .eq("id", req.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#FF5A5F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room {room.room_number}</Text>
        {/* Chat icon for Reception Hotel Staff */}
        {staffInfo?.position === "Hotel Staff" &&
        staffInfo?.department === "Reception" ? (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("GuestConversationScreen", { room });
            }}
            style={{ padding: 4, borderRadius: 8, backgroundColor: "#fff" }}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={26}
              color="#007AFF"
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      <View style={styles.content}>
        {loading ? (
          <Text>Loading...</Text>
        ) : guests.length === 0 ? (
          <Text>No guests found.</Text>
        ) : (
          <>
            <FlatList
              data={guests}
              keyExtractor={(item, idx) => item.guest_name + idx}
              renderItem={({ item }) => {
                let additionalCount = 0;
                if (item.guest_personal_data?.aditional_guest_data) {
                  try {
                    const ad =
                      typeof item.guest_personal_data.aditional_guest_data ===
                      "string"
                        ? JSON.parse(
                            item.guest_personal_data.aditional_guest_data
                          )
                        : item.guest_personal_data.aditional_guest_data;
                    additionalCount = Array.isArray(ad) ? ad.length : 0;
                  } catch (error) {
                    console.error(
                      "Error parsing additional guest data:",
                      error
                    );
                  }
                }
                return (
                  <View style={styles.card}>
                    <Text style={styles.guestName}>
                      {item.guest_name}
                      {additionalCount > 0 && (
                        <Text style={styles.guestName}>
                          {" "}
                          x{additionalCount}
                        </Text>
                      )}
                    </Text>
                    <View style={styles.infoTable}>
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Country:</Text>
                        <Text style={styles.value}>
                          {item.guest_personal_data?.country || "-"}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Language:</Text>
                        <Text style={styles.value}>
                          {item.guest_personal_data?.language || "-"}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>
                          Access Code Expires At:
                        </Text>
                        <Text style={styles.value}>
                          {item.access_code_expires_at
                            ? new Date(
                                item.access_code_expires_at
                              ).toLocaleDateString()
                            : "-"}
                        </Text>
                      </View>
                    </View>
                    {item.guest_personal_data?.aditional_guest_data && (
                      <>
                        <Text style={styles.label}>Additional Data:</Text>
                        <Text style={styles.value}>
                          {typeof item.guest_personal_data
                            .aditional_guest_data === "string"
                            ? item.guest_personal_data.aditional_guest_data
                            : JSON.stringify(
                                item.guest_personal_data.aditional_guest_data
                              )}
                        </Text>
                      </>
                    )}
                  </View>
                );
              }}
              ListFooterComponent={(() => {
                // Merge amenityRequests and dineInOrders into a single array, sorted by created_at descending
                // Merge all requests, including shop orders, into a single array, sorted by created_at descending
                let requests = [
                  ...amenityRequests.map((req) => ({
                    ...req,
                    _type: "amenity",
                    created_at:
                      req.created_at || req.requested_at || req.createdAt || "",
                  })),
                  ...dineInOrders.map((order) => ({
                    ...order,
                    _type: "dinein",
                    created_at:
                      order.created_at ||
                      order.ordered_at ||
                      order.createdAt ||
                      "",
                  })),
                  ...shopOrders.map((order) => ({
                    ...order,
                    _type: "shop",
                    created_at: order.created_at || order.createdAt || "",
                  })),
                ];
                if (onlyDineIn) {
                  requests = requests.filter((r) => r._type === "dinein");
                }
                requests = requests.sort(
                  (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                // Debug log for requests array

                return (
                  <>
                    <Text style={styles.sectionHeader}>Room Requests</Text>
                    {amenityLoading || dineLoading || shopLoading ? (
                      <Text style={styles.noRequests}>Loading requests...</Text>
                    ) : requests.length === 0 ? (
                      <Text style={styles.noRequests}>No requests found.</Text>
                    ) : (
                      requests.map((req) => {
                        if (req._type === "amenity") {
                          // ...existing code for amenity...
                          const expanded = expandedRequestId === req.id;
                          const status = optimisticStatus[req.id] || req.status;
                          const icon =
                            STATUS_ICONS[status] || STATUS_ICONS["pending"];
                          return (
                            <Swipeable
                              key={"amenity-" + req.id}
                              ref={(ref) => {
                                swipeableRefs.current[req.id] = ref;
                              }}
                              renderLeftActions={(progress, dragX) =>
                                renderLeftActions(progress, dragX, req)
                              }
                              renderRightActions={(progress, dragX) =>
                                renderRightActions(progress, dragX, req)
                              }
                              onSwipeableLeftOpen={async () => {
                                await handleSwipeableOpen("left", req);
                                swipeableRefs.current[req.id]?.close();
                              }}
                              onSwipeableRightOpen={async () => {
                                await handleSwipeableOpen("right", req);
                                swipeableRefs.current[req.id]?.close();
                              }}
                              friction={1}
                              overshootLeft={true}
                              overshootRight={true}
                            >
                              <View style={styles.swipeCardWrapper}>
                                <TouchableOpacity
                                  style={[
                                    styles.swipeCard,
                                    expanded && styles.swipeCardNoBottomRadius,
                                  ]}
                                  activeOpacity={0.8}
                                  onPress={() =>
                                    setExpandedRequestId(
                                      expanded ? null : req.id
                                    )
                                  }
                                >
                                  <MaterialCommunityIcons
                                    name={icon.name}
                                    size={22}
                                    color={icon.color}
                                    style={{ marginRight: 8 }}
                                  />
                                  <Text style={styles.value}>
                                    {req.amenity?.name || "-"}
                                  </Text>
                                </TouchableOpacity>
                                {expanded && (
                                  <View style={styles.instructionsBox}>
                                    <View style={styles.infoRow}>
                                      <Text style={styles.label}>Type:</Text>
                                      <Text style={styles.value}>
                                        Amenity Request
                                      </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                      <Text style={styles.label}>Amenity:</Text>
                                      <Text style={styles.value}>
                                        {req.amenity?.name || "-"}
                                      </Text>
                                    </View>
                                    {/* Status label removed as requested */}
                                    <View style={styles.infoRow}>
                                      <Text style={styles.label}>
                                        Requested At:
                                      </Text>
                                      <Text style={styles.value}>
                                        {req.created_at
                                          ? new Date(
                                              req.created_at
                                            ).toLocaleString()
                                          : "-"}
                                      </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                      <Text style={styles.label}>
                                        Special Instructions:
                                      </Text>
                                      <Text style={styles.value}>
                                        {req.special_instructions || "-"}
                                      </Text>
                                    </View>
                                  </View>
                                )}
                              </View>
                            </Swipeable>
                          );
                        } else if (req._type === "dinein") {
                          // ...existing code for dine-in...
                          const expanded = expandedOrderId === req.id;
                          const icon =
                            DINE_STATUS_ICONS[req.status] ||
                            DINE_STATUS_ICONS["pending"];
                          let cardLabel = "Room Service";
                          if (req.order_type === "restaurant") {
                            cardLabel = `Restaurant: ${
                              req.restaurant?.name || "-"
                            }`;
                          }
                          return (
                            <Swipeable
                              key={"dinein-" + req.id}
                              renderLeftActions={(progress, dragX) => (
                                <View
                                  style={[
                                    styles.swipeAction,
                                    styles.swipeActionLeft,
                                  ]}
                                >
                                  <Ionicons
                                    name="checkmark"
                                    size={28}
                                    color="#fff"
                                  />
                                </View>
                              )}
                              renderRightActions={(progress, dragX) => (
                                <View
                                  style={[
                                    styles.swipeAction,
                                    styles.swipeActionRight,
                                  ]}
                                >
                                  <Ionicons
                                    name="close"
                                    size={28}
                                    color="#fff"
                                  />
                                </View>
                              )}
                              onSwipeableLeftOpen={async () => {
                                await supabase
                                  .from("dine_in_orders")
                                  .update({ status: "confirmed" })
                                  .eq("id", req.id);
                              }}
                              onSwipeableRightOpen={async () => {
                                await supabase
                                  .from("dine_in_orders")
                                  .update({ status: "cancelled" })
                                  .eq("id", req.id);
                              }}
                              friction={1}
                              overshootLeft={true}
                              overshootRight={true}
                            >
                              <View style={styles.swipeCardWrapper}>
                                <TouchableOpacity
                                  style={[
                                    styles.swipeCard,
                                    expanded && styles.swipeCardNoBottomRadius,
                                  ]}
                                  activeOpacity={0.8}
                                  onPress={() =>
                                    setExpandedOrderId(expanded ? null : req.id)
                                  }
                                >
                                  <MaterialCommunityIcons
                                    name={icon.name}
                                    size={22}
                                    color={icon.color}
                                    style={{ marginRight: 8 }}
                                  />
                                  <Text style={styles.value}>{cardLabel}</Text>
                                </TouchableOpacity>
                                {expanded && (
                                  <View style={styles.instructionsBox}>
                                    <View style={styles.infoRow}>
                                      <Text style={styles.label}>Type:</Text>
                                      <Text style={styles.value}>
                                        Dine-In Order
                                      </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                      <Text style={styles.label}>Order:</Text>
                                      <Text style={styles.value}>
                                        {cardLabel}
                                      </Text>
                                    </View>
                                    {/* Status label removed as requested */}
                                    <View style={styles.infoRow}>
                                      <Text style={styles.label}>
                                        Ordered At:
                                      </Text>
                                      <Text style={styles.value}>
                                        {req.created_at
                                          ? new Date(
                                              req.created_at
                                            ).toLocaleString()
                                          : "-"}
                                      </Text>
                                    </View>
                                    <View
                                      style={{
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        marginBottom: 4,
                                      }}
                                    >
                                      <Text style={styles.label}>Items:</Text>
                                      {req.items && req.items.length > 0 ? (
                                        req.items.map((item) => (
                                          <Text
                                            key={item.id}
                                            style={styles.value}
                                          >
                                            {item.menu_item?.name || "-"} x
                                            {item.quantity} ($
                                            {item.price_at_order})
                                          </Text>
                                        ))
                                      ) : (
                                        <Text style={styles.value}>
                                          No items
                                        </Text>
                                      )}
                                    </View>
                                    <View style={styles.infoRow}>
                                      <Text style={styles.label}>Total:</Text>
                                      <Text style={styles.value}>
                                        ${req.total_price}
                                      </Text>
                                    </View>
                                  </View>
                                )}
                              </View>
                            </Swipeable>
                          );
                        } else if (req._type === "shop") {
                          // Hotel Shop card logic
                          const expanded = expandedShopOrderId === req.id;
                          // Use a shopping bag icon for shop orders
                          const icon = {
                            name: "shopping-outline",
                            color: "#007AFF",
                          };
                          return (
                            <View
                              key={"shop-" + req.id}
                              style={styles.swipeCardWrapper}
                            >
                              <TouchableOpacity
                                style={[
                                  styles.swipeCard,
                                  expanded && styles.swipeCardNoBottomRadius,
                                ]}
                                activeOpacity={0.8}
                                onPress={() =>
                                  setExpandedShopOrderId(
                                    expanded ? null : req.id
                                  )
                                }
                              >
                                <MaterialCommunityIcons
                                  name={icon.name}
                                  size={22}
                                  color={icon.color}
                                  style={{ marginRight: 8 }}
                                />
                                <Text style={styles.value}>Hotel Shop</Text>
                              </TouchableOpacity>
                              {expanded && (
                                <View style={styles.instructionsBox}>
                                  <View style={styles.infoRow}>
                                    <Text style={styles.label}>Type:</Text>
                                    <Text style={styles.value}>
                                      Hotel Shop Order
                                    </Text>
                                  </View>
                                  <View style={styles.infoRow}>
                                    <Text style={styles.label}>
                                      Ordered At:
                                    </Text>
                                    <Text style={styles.value}>
                                      {req.created_at
                                        ? new Date(
                                            req.created_at
                                          ).toLocaleString()
                                        : "-"}
                                    </Text>
                                  </View>
                                  <View style={styles.infoRow}>
                                    <Text style={styles.label}>Status:</Text>
                                    <Text style={styles.value}>
                                      {req.status || "-"}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                      marginBottom: 4,
                                    }}
                                  >
                                    <Text style={styles.label}>Items:</Text>
                                    {req.shop_order_items &&
                                    req.shop_order_items.length > 0 ? (
                                      req.shop_order_items.map((item, idx) => (
                                        <Text
                                          key={item.id || idx}
                                          style={styles.value}
                                        >
                                          {item.product?.name || "-"} x
                                          {item.quantity} ($
                                          {item.price_at_order})
                                        </Text>
                                      ))
                                    ) : (
                                      <Text style={styles.value}>No items</Text>
                                    )}
                                  </View>
                                  <View style={styles.infoRow}>
                                    <Text style={styles.label}>Total:</Text>
                                    <Text style={styles.value}>
                                      ${req.total_price}
                                    </Text>
                                  </View>
                                  {req.special_instructions && (
                                    <View style={styles.infoRow}>
                                      <Text style={styles.label}>
                                        Special Instructions:
                                      </Text>
                                      <Text style={styles.value}>
                                        {req.special_instructions}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              )}
                            </View>
                          );
                        }
                        return null;
                      })
                    )}
                  </>
                );
              })()}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 68,
  },
  backButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#484848",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  guestName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#484848",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#484848",
    marginBottom: 2,
  },
  infoTable: {
    marginTop: 8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  additionalCount: {
    fontSize: 14,
    color: "#FF5A5F",
    fontWeight: "500",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#484848",
    marginTop: 24,
    marginBottom: 12,
  },
  noRequests: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 12,
    textAlign: "center",
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 56,
    borderRadius: 12,
    marginVertical: 0,
    marginHorizontal: 0,
  },
  swipeActionLeft: {
    backgroundColor: "#4CD964",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  swipeActionRight: {
    backgroundColor: "#FF5A5F",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  swipeCardWrapper: {
    flexDirection: "column",
    backgroundColor: "transparent",
    marginBottom: 12,
  },
  swipeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsBox: {
    backgroundColor: "#fff", // Match card background
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 12,
    marginTop: 0, // Remove negative margin to merge visually
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    // Add shadow to bottom only
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  swipeCardNoBottomRadius: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});

export default RoomDetailsScreen;
