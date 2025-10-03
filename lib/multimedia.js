import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";

// Image and Video Picker Utilities
export const MediaUtils = {
  // Request permissions
  requestPermissions: async () => {
    try {
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } =
        await MediaLibrary.requestPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();

      return {
        camera: cameraStatus === "granted",
        mediaLibrary: mediaLibraryStatus === "granted",
        audio: audioStatus === "granted",
      };
    } catch (error) {
      console.error("Permission request error:", error);
      return {
        camera: false,
        mediaLibrary: false,
        audio: false,
      };
    }
  },

  // Pick image from library
  pickImage: async (options = {}) => {
    try {
      const defaultOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        ...options,
      };

      const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);

      if (!result.canceled) {
        return {
          success: true,
          assets: result.assets,
        };
      }

      return { success: false, assets: [] };
    } catch (error) {
      console.error("Image picker error:", error);
      return { success: false, error };
    }
  },

  // Take photo with camera
  takePhoto: async (options = {}) => {
    try {
      const defaultOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        ...options,
      };

      const result = await ImagePicker.launchCameraAsync(defaultOptions);

      if (!result.canceled) {
        return {
          success: true,
          assets: result.assets,
        };
      }

      return { success: false, assets: [] };
    } catch (error) {
      console.error("Camera error:", error);
      return { success: false, error };
    }
  },

  // Pick video from library
  pickVideo: async (options = {}) => {
    try {
      const defaultOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        ...options,
      };

      const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);

      if (!result.canceled) {
        return {
          success: true,
          assets: result.assets,
        };
      }

      return { success: false, assets: [] };
    } catch (error) {
      console.error("Video picker error:", error);
      return { success: false, error };
    }
  },

  // Record video with camera
  recordVideo: async (options = {}) => {
    try {
      const defaultOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60, // 60 seconds
        ...options,
      };

      const result = await ImagePicker.launchCameraAsync(defaultOptions);

      if (!result.canceled) {
        return {
          success: true,
          assets: result.assets,
        };
      }

      return { success: false, assets: [] };
    } catch (error) {
      console.error("Video recording error:", error);
      return { success: false, error };
    }
  },

  // Pick any document
  pickDocument: async (options = {}) => {
    try {
      const defaultOptions = {
        type: "*/*",
        copyToCacheDirectory: true,
        ...options,
      };

      const result = await DocumentPicker.getDocumentAsync(defaultOptions);

      if (!result.canceled) {
        return {
          success: true,
          assets: result.assets,
        };
      }

      return { success: false, assets: [] };
    } catch (error) {
      console.error("Document picker error:", error);
      return { success: false, error };
    }
  },
};

// Audio Utilities
export const AudioUtils = {
  // Create audio recording
  createRecording: async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error("Audio permission not granted");
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      return { success: true, recording };
    } catch (error) {
      console.error("Recording creation error:", error);
      return { success: false, error };
    }
  },

  // Start recording
  startRecording: async (recording) => {
    try {
      await recording.startAsync();
      return { success: true };
    } catch (error) {
      console.error("Start recording error:", error);
      return { success: false, error };
    }
  },

  // Stop recording
  stopRecording: async (recording) => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      return { success: true, uri };
    } catch (error) {
      console.error("Stop recording error:", error);
      return { success: false, error };
    }
  },

  // Play audio
  playAudio: async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      return { success: true, sound };
    } catch (error) {
      console.error("Audio playback error:", error);
      return { success: false, error };
    }
  },
};

// File System Utilities
export const FileUtils = {
  // Save file to device
  saveFile: async (uri, filename) => {
    try {
      const documentDirectory = FileSystem.documentDirectory;
      const filePath = `${documentDirectory}${filename}`;

      await FileSystem.copyAsync({
        from: uri,
        to: filePath,
      });

      return { success: true, filePath };
    } catch (error) {
      console.error("Save file error:", error);
      return { success: false, error };
    }
  },

  // Read file info
  getFileInfo: async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return { success: true, fileInfo };
    } catch (error) {
      console.error("Get file info error:", error);
      return { success: false, error };
    }
  },

  // Delete file
  deleteFile: async (uri) => {
    try {
      await FileSystem.deleteAsync(uri);
      return { success: true };
    } catch (error) {
      console.error("Delete file error:", error);
      return { success: false, error };
    }
  },

  // Share file
  shareFile: async (uri, options = {}) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Sharing is not available on this platform");
      }

      await Sharing.shareAsync(uri, options);
      return { success: true };
    } catch (error) {
      console.error("Share file error:", error);
      return { success: false, error };
    }
  },

  // Create directory
  createDirectory: async (dirName) => {
    try {
      const dirUri = `${FileSystem.documentDirectory}${dirName}/`;
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
      return { success: true, dirUri };
    } catch (error) {
      console.error("Create directory error:", error);
      return { success: false, error };
    }
  },

  // List directory contents
  listDirectory: async (dirUri) => {
    try {
      const contents = await FileSystem.readDirectoryAsync(dirUri);
      return { success: true, contents };
    } catch (error) {
      console.error("List directory error:", error);
      return { success: false, error };
    }
  },
};

// Media Library Utilities
export const MediaLibraryUtils = {
  // Save to media library
  saveToLibrary: async (uri) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Media library permission not granted");
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      return { success: true, asset };
    } catch (error) {
      console.error("Save to library error:", error);
      return { success: false, error };
    }
  },

  // Get albums
  getAlbums: async () => {
    try {
      const albums = await MediaLibrary.getAlbumsAsync();
      return { success: true, albums };
    } catch (error) {
      console.error("Get albums error:", error);
      return { success: false, error };
    }
  },

  // Get assets from album
  getAssetsFromAlbum: async (albumId, options = {}) => {
    try {
      const defaultOptions = {
        first: 20,
        mediaType: "photo",
        sortBy: "creationTime",
        ...options,
      };

      const assets = await MediaLibrary.getAssetsAsync({
        album: albumId,
        ...defaultOptions,
      });

      return { success: true, assets };
    } catch (error) {
      console.error("Get assets error:", error);
      return { success: false, error };
    }
  },
};
