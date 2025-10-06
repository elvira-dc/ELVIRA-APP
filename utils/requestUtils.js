export function aggregateRequests({ amenityRequests, dineInOrders, shopOrders, onlyDineIn }) {
  let requests = [
    ...amenityRequests.map((req) => ({
      ...req,
      _type: "amenity",
      created_at: req.created_at || req.requested_at || req.createdAt || "",
    })),
    ...dineInOrders.map((order) => ({
      ...order,
      _type: "dinein",
      created_at: order.created_at || order.ordered_at || order.createdAt || "",
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
  return requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}