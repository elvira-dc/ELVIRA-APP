import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  Modal,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useConversation } from "../hooks/useConversation";
import { useVoiceRecording } from "../hooks/useVoiceRecording";
import { useVoicePlayback } from "../hooks/useVoicePlayback";
import { useConversationImagePicker } from "../hooks/useConversationImagePicker";
import { VoiceRecordingInterface } from "../components/conversation/VoiceRecordingInterface";
import { VoicePreviewModal } from "../components/conversation/VoicePreviewModal";

const { width: screenWidth } = Dimensions.get("window");

const ConversationScreen = ({ route, navigation }) => {
  const { conversationId, contactName } = route.params;

  // Main conversation logic
  const { messages, sendMessage, sendImage, sendVoice } =
    useConversation(conversationId);

  // Voice recording hook
  const {
    isRecording,
    recordingDuration,
    audioUri,
    waveAnimation,
    startRecording,
    stopRecording,
    cancelRecording,
    formatDuration: formatRecordingDuration,
  } = useVoiceRecording();

  // Voice playback hook
  const {
    isPlayingPreview,
    playbackProgress,
    playbackPosition,
    playPreview,
    stopPreview,
    pausePreview,
    resumePreview,
    formatDuration: formatPlaybackDuration,
  } = useVoicePlayback();

  // Image picker hook
  const {
    selectedImage,
    imageModalVisible,
    openImagePicker,
    openImageModal,
    closeImageModal,
  } = useConversationImagePicker();

  // Local UI state
  const [inputMessage, setInputMessage] = useState("");
  const [showVoicePreview, setShowVoicePreview] = useState(false);
  const [currentRecordingData, setCurrentRecordingData] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null); // Track which voice message is playing
  const [voiceProgress, setVoiceProgress] = useState({}); // Track progress for each voice message

  const flatListRef = useRef(null);

  // Animation for multimedia buttons
  const buttonsOpacity = useRef(new Animated.Value(1)).current;
  const buttonsWidth = useRef(new Animated.Value(80)).current;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Animate multimedia buttons based on input
  useEffect(() => {
    const hasText = inputMessage.trim().length > 0;

    Animated.parallel([
      Animated.timing(buttonsOpacity, {
        toValue: hasText ? 0 : 1,
        duration: hasText ? 200 : 250,
        useNativeDriver: false,
      }),
      Animated.timing(buttonsWidth, {
        toValue: hasText ? 0 : 80,
        duration: hasText ? 200 : 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [inputMessage]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    sendMessage(inputMessage);
    setInputMessage("");
  };

  const handleAudioPress = async () => {
    if (isRecording) {
      const recordingData = await stopRecording();
      if (recordingData) {
        setCurrentRecordingData(recordingData);
        setShowVoicePreview(true);
      }
    } else {
      await startRecording();
    }
  };

  const handleCameraPress = async () => {
    const imageUri = await openImagePicker();
    if (imageUri) {
      sendImage(imageUri);
    }
  };

  const handleVoicePreviewPlay = async () => {
    if (currentRecordingData) {
      await playPreview(
        currentRecordingData.uri,
        currentRecordingData.duration
      );
    }
  };

  const handleVoicePreviewPause = async () => {
    if (isPlayingPreview) {
      await pausePreview();
    } else {
      await resumePreview();
    }
  };

  const handleSendVoice = () => {
    if (currentRecordingData) {
      sendVoice(currentRecordingData.uri, currentRecordingData.duration);
      setShowVoicePreview(false);
      setCurrentRecordingData(null);
      stopPreview();
    }
  };

  const handleCancelVoice = () => {
    setShowVoicePreview(false);
    setCurrentRecordingData(null);
    stopPreview();
  };

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Handle voice message playback
  const handleVoicePlayback = async (audioUri, messageId, duration) => {
    try {
      console.log("Voice playback requested:", {
        audioUri,
        messageId,
        duration,
      });

      if (playingVoiceId === messageId) {
        // Stop current playback
        stopPreview();
        setPlayingVoiceId(null);
        setVoiceProgress((prev) => ({ ...prev, [messageId]: 0 }));
        console.log("Stopped voice playback for message:", messageId);
        return;
      }

      // Stop any currently playing voice
      if (playingVoiceId) {
        stopPreview();
        setVoiceProgress((prev) => ({ ...prev, [playingVoiceId]: 0 }));
        console.log("Stopped previous voice:", playingVoiceId);
      }

      setPlayingVoiceId(messageId);
      setVoiceProgress((prev) => ({ ...prev, [messageId]: 0 }));
      console.log("Starting voice playback for message:", messageId);

      // Start playback with progress tracking
      await playPreview(audioUri, duration);

      // Set up progress monitoring
      const progressInterval = setInterval(() => {
        if (playbackPosition && duration) {
          const progress = playbackPosition / 1000 / duration;
          setVoiceProgress((prev) => ({
            ...prev,
            [messageId]: Math.min(progress, 1),
          }));
          console.log("Voice progress update:", {
            messageId,
            progress: Math.min(progress, 1),
            playbackPosition,
          });

          // Auto-stop when complete
          if (progress >= 1) {
            clearInterval(progressInterval);
            setPlayingVoiceId(null);
            setVoiceProgress((prev) => ({ ...prev, [messageId]: 0 }));
            console.log("Voice playback completed for message:", messageId);
          }
        }
      }, 100);

      // Clean up interval when playback stops
      setTimeout(() => {
        clearInterval(progressInterval);
        console.log("Cleaned up progress interval for message:", messageId);
      }, (duration + 1) * 1000);
    } catch (error) {
      console.error("Error playing voice message:", error);
      setPlayingVoiceId(null);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.isMyMessage || item.sender === "user";

    if (item.type === "image") {
      return (
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.otherMessage,
          ]}
        >
          <TouchableOpacity
            onPress={() => openImageModal(item.content || item.text)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: item.content || item.text }}
              style={styles.messageImage}
            />
            <View style={styles.imageTimestamp}>
              <Text style={styles.imageTimestampText}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === "voice") {
      const isPlaying = playingVoiceId === item.id;
      const progress = voiceProgress[item.id] || 0;

      return (
        <View
          style={[
            styles.voiceMessageContainer,
            isUser ? styles.userVoiceMessage : styles.otherVoiceMessage,
          ]}
        >
          <View style={styles.voiceMessageContent}>
            {/* Time displays */}
            <View style={styles.voiceTimeContainer}>
              <Text
                style={[
                  styles.voiceCurrentTime,
                  { color: isUser ? "white" : "#333" },
                ]}
              >
                {isPlaying
                  ? `${Math.floor(progress * (item.duration || 0))}:${String(
                      Math.floor(((progress * (item.duration || 0)) % 1) * 60)
                    ).padStart(2, "0")}`
                  : "0:00"}
              </Text>
              <Text
                style={[
                  styles.voiceTotalTime,
                  {
                    color: isUser
                      ? "rgba(255, 255, 255, 0.8)"
                      : "rgba(51, 51, 51, 0.7)",
                  },
                ]}
              >
                {formatPlaybackDuration(item.duration || 0)}
              </Text>
            </View>

            {/* Control bar with play button and progress */}
            <View style={styles.voiceControlBar}>
              <TouchableOpacity
                style={[
                  styles.voicePlayButtonSimple,
                  {
                    backgroundColor: isUser
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(255, 90, 95, 0.1)",
                  },
                  isPlaying && styles.voicePlayButtonActive,
                ]}
                onPress={() =>
                  handleVoicePlayback(
                    item.content || item.text,
                    item.id,
                    item.duration
                  )
                }
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={16}
                  color={isUser ? "white" : "#FF5A5F"}
                />
              </TouchableOpacity>

              {/* Progress bar with moving dot */}
              <View style={styles.voiceProgressContainer}>
                <View
                  style={[
                    styles.voiceProgressBackground,
                    {
                      backgroundColor: isUser
                        ? "rgba(255, 255, 255, 0.3)"
                        : "rgba(0, 0, 0, 0.1)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.voiceProgressFill,
                      {
                        width: `${Math.max(progress * 100, 2)}%`,
                        backgroundColor: isUser
                          ? "rgba(255, 255, 255, 0.9)"
                          : "#FF5A5F",
                      },
                    ]}
                  />
                  {/* Progress dot */}
                  <View
                    style={[
                      styles.voiceProgressDot,
                      {
                        left: `${Math.max(progress * 100, 1)}%`,
                        backgroundColor: isUser ? "white" : "#FF5A5F",
                      },
                    ]}
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.voiceTimestamp,
                  {
                    color: isUser
                      ? "rgba(255, 255, 255, 0.8)"
                      : "rgba(51, 51, 51, 0.6)",
                  },
                ]}
              >
                {formatTime(item.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.otherMessageText,
          ]}
        >
          {item.content || item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.otherTimestamp,
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#FF5A5F" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{contactName.charAt(0)}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contactName}</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Voice Recording Interface */}
      <VoiceRecordingInterface
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        waveAnimation={waveAnimation}
        onStopRecording={handleAudioPress}
        formatDuration={formatRecordingDuration}
      />

      {/* Voice Preview Interface */}
      <VoicePreviewModal
        visible={showVoicePreview}
        isPlayingPreview={isPlayingPreview}
        playbackProgress={playbackProgress}
        playbackPosition={playbackPosition}
        recordingDuration={currentRecordingData?.duration || 0}
        onPlay={handleVoicePreviewPlay}
        onPause={handleVoicePreviewPause}
        onSend={handleSendVoice}
        onCancel={handleCancelVoice}
        formatDuration={formatPlaybackDuration}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          {!isRecording && !showVoicePreview && (
            <View style={styles.inputWrapper}>
              {/* Multimedia Buttons */}
              <Animated.View
                style={[
                  styles.multimediaContainer,
                  {
                    opacity: buttonsOpacity,
                    width: buttonsWidth,
                    overflow: "hidden",
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.multimediaButton}
                  onPress={handleAudioPress}
                >
                  <Ionicons name="mic" size={20} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.multimediaButton, { marginRight: 8 }]}
                  onPress={handleCameraPress}
                >
                  <Ionicons name="camera" size={20} color="#666" />
                </TouchableOpacity>
              </Animated.View>

              {/* Text Input */}
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                maxHeight={100}
              />

              {/* Send Button */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  inputMessage.trim()
                    ? styles.sendButtonActive
                    : styles.sendButtonInactive,
                ]}
                onPress={handleSendMessage}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={inputMessage.trim() ? "white" : "#999"}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Image Modal */}
      <Modal visible={imageModalVisible} transparent>
        <View style={styles.imageModalOverlay}>
          <StatusBar barStyle="light-content" />
          <TouchableOpacity
            style={styles.imageModalBackground}
            onPress={closeImageModal}
          >
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
            <TouchableOpacity
              style={styles.imageCloseButton}
              onPress={closeImageModal}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF5A5F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  onlineStatus: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-end",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF5A5F",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  avatarText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: "75%",
    flex: 1,
  },
  voiceMessageContainer: {
    marginVertical: 4,
    maxWidth: "85%",
    minWidth: "70%",
    flex: 1,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FF5A5F",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userVoiceMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FF5A5F",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  otherVoiceMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: "white",
  },
  otherMessageText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "right",
  },
  otherTimestamp: {
    color: "#999",
  },
  messageImage: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    borderRadius: 12,
  },
  imageTimestamp: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageTimestampText: {
    color: "white",
    fontSize: 10,
  },
  voiceMessage: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 70,
    width: "100%",
  },
  voiceMessageContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  voiceTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  voiceCurrentTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  voiceTotalTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  voiceControlBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  voicePlayButtonSimple: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  voicePlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  voicePlayButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  voiceWaveformContainer: {
    flex: 1,
    marginRight: 8,
    minWidth: 180,
  },
  voiceProgressContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  voiceProgressBackground: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  voiceProgressFill: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 2,
    minWidth: 2,
  },
  voiceProgressDot: {
    position: "absolute",
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
    marginLeft: -4,
  },
  voiceTimestamp: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  voiceDurationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voiceDuration: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  inputContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  multimediaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  multimediaButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#FF5A5F",
  },
  sendButtonInactive: {
    backgroundColor: "#F5F5F5",
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
  imageCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
});

export default ConversationScreen;
