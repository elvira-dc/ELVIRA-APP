import { supabase } from "../config/supabase";

/**
 * Constructs the full Supabase Storage URL for an avatar
 * @param {string} avatarFileName - The filename stored in the database
 * @returns {string|null} - The full public URL or null if no filename provided
 */
export const getAvatarUrl = (avatarFileName) => {
  if (!avatarFileName) return null;

  try {
    // Get the full URL from Supabase Storage
    const { data } = supabase.storage
      .from("hotel-assets")
      .getPublicUrl(`users-avatar/${avatarFileName}`);

    return data?.publicUrl;
  } catch (error) {
    console.error("Error constructing avatar URL:", error);
    return null;
  }
};

/**
 * Gets the initials from a contact's name for fallback display
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} fullName - Full name (fallback if firstName/lastName not available)
 * @returns {string} - Two character initials
 */
export const getInitials = (firstName, lastName, fullName) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  if (fullName) {
    const nameParts = fullName.trim().split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return `${nameParts[0].charAt(0)}${
      nameParts[0].charAt(1) || "S"
    }`.toUpperCase();
  }

  return "US"; // Default initials
};
