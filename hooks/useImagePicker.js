import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../config/supabase";

/**
 * useImagePicker Hook
 * Handles avatar upload logic, image picker functionality, and Supabase storage integration
 */
export const useImagePicker = (personalData, onAvatarUpdate) => {
  const [avatarImage, setAvatarImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Set avatar from database when personalData changes
  useEffect(() => {
    if (personalData?.avatar_url) {
      // Check if it's a local URI or already a full URL
      if (
        personalData.avatar_url.startsWith("file://") ||
        personalData.avatar_url.startsWith("content://") ||
        personalData.avatar_url.startsWith("http://") ||
        personalData.avatar_url.startsWith("https://")
      ) {
        // Use the URL directly
        setAvatarImage(personalData.avatar_url);
      } else {
        // It's a filename, get the public URL from Supabase storage
        const { data } = supabase.storage
          .from("hotel-assets")
          .getPublicUrl(`users-avatar/${personalData.avatar_url}`); // Use users-avatar folder

        setAvatarImage(data.publicUrl);
        console.log("Avatar loaded from storage:", data.publicUrl);
      }
    }
  }, [personalData]);

  // Upload image to Supabase storage
  const uploadImageToSupabase = async (imageUri) => {
    try {
      setUploading(true);

      const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `avatar-${
        personalData?.staff_id || personalData?.id
      }-${Date.now()}.${fileExt}`;
      const filePath = `users-avatar/${fileName}`; // Changed to users-avatar folder

      console.log("🔄 Starting upload to hotel-assets bucket:", filePath);
      console.log("📱 Image URI:", imageUri);
      console.log("👤 Staff ID:", personalData?.staff_id || personalData?.id);

      // Read the file as array buffer
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      console.log("📦 File size:", arrayBuffer.byteLength, "bytes");

      // Try uploading to Supabase storage bucket
      const { data: uploadData, error } = await supabase.storage
        .from("hotel-assets")
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (error) {
        console.log("🚫 Error details:", {
          message: error.message,
          statusCode: error.statusCode,
        });

        if (error.message?.includes("violates row-level security policy")) {
          console.log(
            "🔐 RLS policy violation detected. Using fallback storage."
          );
          console.log("💡 Recommended: Check storage policies in database.");
        }

        console.log("🔄 Using local storage fallback");

        // Store local URI as fallback
        if (onAvatarUpdate) {
          const success = await onAvatarUpdate(imageUri);
          if (success) {
            setAvatarImage(imageUri);
            Alert.alert(
              "Info",
              "Avatar saved locally (storage access restricted)"
            );
          }
        }
        return imageUri;
      }

      console.log("✅ Image uploaded successfully to storage!", uploadData);

      // Update the database with the filename
      if (onAvatarUpdate) {
        console.log("💾 Updating database with filename:", fileName);
        const success = await onAvatarUpdate(fileName);
        if (success) {
          // Get the public URL for display
          const { data: urlData } = supabase.storage
            .from("hotel-assets")
            .getPublicUrl(filePath);

          console.log("🖼️ Avatar public URL:", urlData.publicUrl);
          setAvatarImage(urlData.publicUrl);
          Alert.alert("Success", "Avatar uploaded to cloud storage!");
        }
      }

      return fileName;
    } catch (error) {
      console.error("❌ Error uploading image:", error);

      // Fallback to local storage
      if (onAvatarUpdate) {
        const success = await onAvatarUpdate(imageUri);
        if (success) {
          setAvatarImage(imageUri);
          Alert.alert("Success", "Avatar updated locally!");
        }
      }
      return imageUri;
    } finally {
      setUploading(false);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImageToSupabase(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImageToSupabase(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    Alert.alert(
      "Select Avatar",
      "Choose how you'd like to update your avatar",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  return {
    avatarImage,
    uploading,
    showImagePickerOptions,
  };
};
