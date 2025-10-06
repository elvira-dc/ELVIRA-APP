import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRealConversations } from "../hooks/useRealConversations";
import { filterMessages } from "../utils/messageUtils";

// Import extracted components
import MessageHeader from "../components/messages/MessageHeader";
import MessageSearchBar from "../components/messages/MessageSearchBar";
import ConversationItem from "../components/messages/ConversationItem";
import EmptyMessagesState from "../components/messages/EmptyMessagesState";
import ContactSelectionModal from "../components/messages/ContactSelectionModal";

const MessagesScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const navigation = useNavigation();

  const {
    conversations,
    loading,
    error,
    unreadCount,
    startNewConversation,
    markAsRead,
    markAllAsRead,
  } = useRealConversations();

  // Filter conversations based on search query
  const filteredConversations = filterMessages(conversations, searchQuery);

  const handleNewConversation = () => {
    setShowContactModal(true);
  };

  const handleContactSelect = async (contact) => {
    try {
      // Start new conversation with selected contact
      const conversationId = await startNewConversation(contact);

      // Navigate to conversation screen
      navigation.navigate("Conversation", {
        conversationId,
        contactName: contact.name,
        contactPosition: contact.position,
        contactDepartment: contact.department,
        contactAvatarUrl: contact.avatar_url,
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleConversationPress = (conversation) => {
    // Mark as read and navigate to conversation
    markAsRead(conversation.id);

    navigation.navigate("Conversation", {
      conversationId: conversation.id,
      contactName: conversation.name || conversation.contactName,
      contactPosition: conversation.contactPosition,
      contactDepartment: conversation.contactDepartment,
      contactAvatarUrl: conversation.avatar_url || null,
      contactInitials: conversation.initials || "",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <MessageHeader
        unreadCount={unreadCount}
        onMarkAllRead={markAllAsRead}
        onNewConversation={handleNewConversation}
      />

      <MessageSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ScrollView style={styles.messagesList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              message={{
                id: conversation.id,
                name: conversation.name || conversation.contactName || "",
                lastMessage: conversation.lastMessage || "No messages yet",
                timestamp: conversation.lastMessageTime,
                unread: conversation.unread,
                avatar_url: conversation.avatar_url || null,
                initials: conversation.initials || "",
              }}
              onPress={() => handleConversationPress(conversation)}
            />
          ))
        ) : (
          <EmptyMessagesState
            title={
              searchQuery ? "No matching conversations" : "No conversations"
            }
            subtitle={
              searchQuery
                ? "Try a different search term"
                : "Start a new conversation with your colleagues"
            }
          />
        )}
      </ScrollView>

      {/* Contact Selection Modal */}
      <ContactSelectionModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSelectContact={handleContactSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  messagesList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#FF5A5F",
    textAlign: "center",
  },
});

export default MessagesScreen;
