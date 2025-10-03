import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

const KeyboardTest = () => {
  const [text, setText] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keyboard Test</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type here to test keyboard..."
        autoFocus={true}
      />
      <Text style={styles.result}>You typed: {text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  result: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default KeyboardTest;
