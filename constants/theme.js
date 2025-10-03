// App-wide constants for consistent styling and configuration

export const COLORS = {
  // Primary Colors
  primary: "#FF5A5F",
  secondary: "#FF8A80",
  tertiary: "#FFAB91",

  // Background Colors
  background: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceVariant: "#FFF5F5",

  // Text Colors
  textPrimary: "#484848",
  textSecondary: "#8E8E93",
  textTertiary: "#C7C7CC",
  placeholder: "#A0A0A0",

  // Status Colors
  success: "#28A745",
  error: "#DC3545",
  warning: "#FF8A80",

  // Status Backgrounds
  successBackground: "#D4F7DC",
  errorBackground: "#F8D7DA",
  warningBackground: "#FFE8E6",

  // UI Colors
  border: "#E8E8E8",
  divider: "#F2F2F7",
  shadow: "#000",
};

export const ROOM_STATUS = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
};

export const ROOM_STATUS_COLORS = {
  [ROOM_STATUS.AVAILABLE]: COLORS.success,
  [ROOM_STATUS.OCCUPIED]: COLORS.error,
  [ROOM_STATUS.RESERVED]: COLORS.warning,
};

export const ROOM_STATUS_BACKGROUNDS = {
  [ROOM_STATUS.AVAILABLE]: COLORS.successBackground,
  [ROOM_STATUS.OCCUPIED]: COLORS.errorBackground,
  [ROOM_STATUS.RESERVED]: COLORS.warningBackground,
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const EVENT_TYPES = {
  MEETING: "meeting",
  PRESENTATION: "presentation",
  CALL: "call",
};

export const EVENT_TYPE_COLORS = {
  [EVENT_TYPES.MEETING]: COLORS.primary,
  [EVENT_TYPES.PRESENTATION]: COLORS.secondary,
  [EVENT_TYPES.CALL]: COLORS.tertiary,
};

export const VIEW_MODES = {
  MONTH: "month",
  WEEK: "week",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 28,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};
