import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export const useConversationImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    return {
      camera: cameraStatus === "granted",
      mediaLibrary: mediaStatus === "granted",
    };
  };

  const openImagePicker = async () => {
    const permissions = await requestPermissions();

    if (!permissions.camera && !permissions.mediaLibrary) {
      Alert.alert(
        "Permissions Required",
        "Please grant camera and photo library permissions to send images."
      );
      return null;
    }

    return new Promise((resolve) => {
      Alert.alert("Select Image", "Choose how you want to select an image", [
        {
          text: "Camera",
          onPress: async () => {
            const result = await openCamera();
            resolve(result);
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const result = await openGallery();
            resolve(result);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(null),
        },
      ]);
    });
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert("Error", "Failed to open camera. Please try again.");
    }
    return null;
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error("Error opening gallery:", error);
      Alert.alert("Error", "Failed to open gallery. Please try again.");
    }
    return null;
  };

  const openImageModal = (imageUri) => {
    setSelectedImage(imageUri);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setImageModalVisible(false);
  };

  return {
    // States
    selectedImage,
    imageModalVisible,

    // Functions
    openImagePicker,
    openCamera,
    openGallery,
    openImageModal,
    closeImageModal,
  };
};
