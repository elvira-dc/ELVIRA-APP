import React from "react";
import { View, StyleSheet } from "react-native";
import ConversationScreen from "./ConversationScreen"; // Reuse existing chat UI

const GuestConversationScreen = ({ route, navigation }) => {
  const { room } = route.params || {};
  return (
    <View style={styles.container}>
      <ConversationScreen room={room} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default GuestConversationScreen;
