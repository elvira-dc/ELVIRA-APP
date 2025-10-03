import { useState, useRef, useEffect } from "react";
import { Alert, Animated } from "react-native";
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [recording, setRecording] = useState(null);

  // Animation for sound waves
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef(null);

  // Timer effect for recording duration
  useEffect(() => {
    if (isRecording && recordingStartTime) {
      recordingTimer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        setRecordingDuration(elapsed);
      }, 100);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording, recordingStartTime]);

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopWaveAnimation = () => {
    waveAnimation.stopAnimation();
    waveAnimation.setValue(0);
  };

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Audio recording permission is needed to record voice messages."
        );
        return;
      }

      // Configure audio mode for maximum volume
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        forceSpeakerAudioAndroid: true,
      });

      const recordingOptions = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(recording);
      setRecordingStartTime(Date.now());
      setIsRecording(true);
      setRecordingDuration(0);

      // Start wave animation
      startWaveAnimation();

      console.log("Recording started at:", Date.now());
    } catch (error) {
      Alert.alert("Error", "Failed to start recording.");
      console.error(error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return null;

      console.log("Stopping recording, duration was:", recordingDuration);

      // Calculate final duration
      const finalDuration = recordingStartTime
        ? Math.floor((Date.now() - recordingStartTime) / 1000)
        : recordingDuration;

      setIsRecording(false);
      setRecordingStartTime(null);
      setRecordingDuration(finalDuration);

      // Stop wave animation
      stopWaveAnimation();

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);

      return {
        uri,
        duration: finalDuration,
      };
    } catch (error) {
      Alert.alert("Error", "Failed to stop recording.");
      console.error(error);
      return null;
    }
  };

  const cancelRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }
      setIsRecording(false);
      setRecordingStartTime(null);
      setRecordingDuration(0);
      setAudioUri(null);
      stopWaveAnimation();
    } catch (error) {
      console.error("Error canceling recording:", error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    // States
    isRecording,
    recordingDuration,
    audioUri,
    waveAnimation,

    // Functions
    startRecording,
    stopRecording,
    cancelRecording,
    formatDuration,
  };
};
