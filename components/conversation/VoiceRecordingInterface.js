import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const VoiceRecordingInterface = ({
  isRecording,
  recordingDuration,
  waveAnimation,
  onStopRecording,
  formatDuration,
}) => {
  if (!isRecording) return null;

  return (
    <View style={styles.recordingContainer}>
      <View style={styles.recordingIndicator}>
        <View style={styles.recordingDot} />
        <Text style={styles.recordingText}>Recording...</Text>
        <Text style={styles.recordingDuration}>
          {formatDuration(recordingDuration)}
        </Text>
      </View>

      {/* Animated Sound Waves */}
      <View style={styles.soundWaves}>
        {[...Array(5)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.soundWave,
              {
                transform: [
                  {
                    scaleY: waveAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1.2 + Math.random() * 0.8],
                    }),
                  },
                ],
                opacity: waveAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 0.9],
                }),
              },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.stopRecordingButton}
        onPress={onStopRecording}
      >
        <Ionicons name="stop" size={24} color="#FF5A5F" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5A5F",
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  recordingDuration: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    minWidth: 50,
    textAlign: "right",
  },
  soundWaves: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    height: 40,
  },
  soundWave: {
    width: 3,
    height: 16,
    backgroundColor: "#FF5A5F",
    borderRadius: 1.5,
    marginHorizontal: 1.5,
  },
  stopRecordingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
