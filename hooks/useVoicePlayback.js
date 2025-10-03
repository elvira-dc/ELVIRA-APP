import { useState, useRef, useEffect } from "react";
import { Alert } from "react-native";
import { Audio } from "expo-av";

export const useVoicePlayback = () => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [sound, setSound] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playPreview = async (uri, duration) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Set audio mode for playback with maximum volume
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        forceSpeakerAudioAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: uri },
        {
          shouldPlay: true,
          volume: 1.0, // Maximum volume
          rate: 1.0,
          shouldCorrectPitch: true,
          progressUpdateIntervalMillis: 50,
          positionMillis: 0,
        }
      );

      // Set volume to maximum
      await newSound.setVolumeAsync(1.0);

      setSound(newSound);
      setIsPlayingPreview(true);
      setPlaybackProgress(0);
      setPlaybackPosition(0);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.durationMillis && status.durationMillis > 0) {
            const progress =
              (status.positionMillis || 0) / status.durationMillis;
            setPlaybackProgress(progress * 100);
            setPlaybackPosition(
              Math.floor((status.positionMillis || 0) / 1000)
            );
          }

          if (status.didJustFinish) {
            setIsPlayingPreview(false);
            setPlaybackProgress(0);
            setPlaybackPosition(0);
          }
        }
      });
    } catch (error) {
      Alert.alert("Error", "Failed to play preview.");
      console.error(error);
    }
  };

  const stopPreview = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setIsPlayingPreview(false);
      setPlaybackProgress(0);
      setPlaybackPosition(0);
    } catch (error) {
      Alert.alert("Error", "Failed to stop preview.");
      console.error(error);
    }
  };

  const pausePreview = async () => {
    try {
      if (sound) {
        await sound.pauseAsync();
        setIsPlayingPreview(false);
      }
    } catch (error) {
      console.error("Error pausing preview:", error);
    }
  };

  const resumePreview = async () => {
    try {
      if (sound) {
        await sound.playAsync();
        setIsPlayingPreview(true);
      }
    } catch (error) {
      console.error("Error resuming preview:", error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    // States
    isPlayingPreview,
    playbackProgress,
    playbackPosition,

    // Functions
    playPreview,
    stopPreview,
    pausePreview,
    resumePreview,
    formatDuration,
  };
};
