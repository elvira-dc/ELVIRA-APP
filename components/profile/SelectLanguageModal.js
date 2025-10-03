import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SelectLanguageModal = ({
  visible,
  onClose,
  currentLanguage,
  onLanguageSelect,
}) => {
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
  ];

  const handleLanguageSelect = (languageCode) => {
    onLanguageSelect(languageCode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FF5A5F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Language</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.description}>
            Choose your preferred language for the application
          </Text>

          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageOption,
                currentLanguage === language.code && styles.selectedOption,
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.flag}>{language.flag}</Text>
                <Text style={styles.languageName}>{language.name}</Text>
              </View>
              {currentLanguage === language.code && (
                <Ionicons name="checkmark" size={20} color="#FF5A5F" />
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              Note: Language selection is currently available for interface
              elements. Full translations will be implemented in future updates.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#484848",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedOption: {
    borderColor: "#FF5A5F",
    borderWidth: 2,
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#484848",
  },
  noteContainer: {
    backgroundColor: "#FFF9E6",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#FFB800",
  },
  noteText: {
    fontSize: 12,
    color: "#8E8E93",
    lineHeight: 16,
  },
});

export default SelectLanguageModal;
