import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { formatTime, getAvatarInitials } from "../../utils/messageUtils";

/**
 * ConversationItem Component
 * Individual conversation card with avatar, name, message preview, and timestamp
 */
const ConversationItem = ({ message, onPress }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    // Mark as read
    onPress(message.id);
    // Navigate to conversation
    navigation.navigate("Conversation", {
      conversationId: message.id,
      contactName: message.name,
    });
  };

  return (
    <TouchableOpacity style={styles.messageItem} onPress={handlePress}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getAvatarInitials(message.name)}
          </Text>
        </View>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text
            style={[styles.messageName, message.unread && styles.unreadName]}
          >
            {message.name}
          </Text>
          <Text style={styles.messageTime}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
        <Text
          style={[styles.messageText, message.unread && styles.unreadMessage]}
          numberOfLines={1}
        >
          {message.lastMessage}
        </Text>
      </View>
      {message.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5A5F",
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#484848",
  },
  unreadName: {
    fontWeight: "bold",
  },
  messageTime: {
    fontSize: 12,
    color: "#8E8E93",
  },
  messageText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  unreadMessage: {
    color: "#484848",
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5A5F",
    marginLeft: 8,
  },
});

export default ConversationItem;
