import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const VoicePreviewModal = ({
  visible,
  isPlayingPreview,
  playbackProgress,
  playbackPosition,
  recordingDuration,
  onPlay,
  onPause,
  onSend,
  onCancel,
  formatDuration,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.voicePreviewContainer}>
      <TouchableOpacity
        style={styles.playPreviewButton}
        onPress={isPlayingPreview ? onPause : onPlay}
      >
        <Ionicons
          name={isPlayingPreview ? "pause" : "play"}
          size={24}
          color="#FF5A5F"
        />
      </TouchableOpacity>

      <View style={styles.voiceWaveform}>
        <View style={styles.voiceContentContainer}>
          <View style={styles.durationContainer}>
            <Text style={styles.voiceDuration}>
              {isPlayingPreview ? formatDuration(playbackPosition) : "0:00"}
            </Text>
            <Text style={styles.voiceDuration}>
              {formatDuration(recordingDuration)}
            </Text>
          </View>
        </View>

        {/* Progress bar at bottom */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(playbackProgress, 2)}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.cancelVoiceButton} onPress={onCancel}>
        <Ionicons name="close" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.sendVoiceButton} onPress={onSend}>
        <Ionicons name="send" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  voicePreviewContainer: {
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
  playPreviewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  voiceWaveform: {
    flex: 1,
    marginRight: 8,
  },
  voiceContentContainer: {
    minHeight: 25,
    justifyContent: "center",
    marginBottom: 12,
    paddingBottom: 4,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 4,
    minHeight: 20,
  },
  voiceDuration: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    letterSpacing: 0.3,
    minWidth: 35,
    textAlign: "center",
  },
  progressContainer: {
    paddingHorizontal: 4,
    marginTop: 8,
    paddingTop: 4,
  },
  progressBackground: {
    height: 8,
    backgroundColor: "#E5E5EA",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF5A5F",
    borderRadius: 4,
    minWidth: 8,
    shadowColor: "#FF5A5F",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  cancelVoiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendVoiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF5A5F",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
