import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMessaging } from "../hooks/useMessaging";
import { filterMessages } from "../utils/messageUtils";

// Import extracted components
import MessageHeader from "../components/messages/MessageHeader";
import MessageSearchBar from "../components/messages/MessageSearchBar";
import ConversationItem from "../components/messages/ConversationItem";
import EmptyMessagesState from "../components/messages/EmptyMessagesState";

const MessagesScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    messages,
    unreadCount,
    markAsRead,
    markAllAsRead,
    simulateNewMessage,
  } = useMessaging();

  // Filter messages based on search query
  const filteredMessages = filterMessages(messages, searchQuery);

  return (
    <SafeAreaView style={styles.container}>
      <MessageHeader
        unreadCount={unreadCount}
        onSimulateMessage={simulateNewMessage}
        onMarkAllRead={markAllAsRead}
      />

      <MessageSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ScrollView style={styles.messagesList}>
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <ConversationItem
              key={message.id}
              message={message}
              onPress={markAsRead}
            />
          ))
        ) : (
          <EmptyMessagesState
            title={searchQuery ? "No matching messages" : "No messages"}
            subtitle={
              searchQuery
                ? "Try a different search term"
                : "Messages will appear here"
            }
          />
        )}
      </ScrollView>
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
});

export default MessagesScreen;
