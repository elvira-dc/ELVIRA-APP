import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStaffContacts } from "../../hooks/useStaffContacts";
import { supabase } from "../../config/supabase";

const ContactSelectionModal = ({ visible, onClose, onSelectContact }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedContactName, setSelectedContactName] = useState("");
  const [tempHideContactModal, setTempHideContactModal] = useState(false);
  const { contacts, loading, error, searchContacts } = useStaffContacts();

  // Filter contacts based on search
  const filteredContacts = searchContacts(searchQuery);

  const handleContactSelect = (contact) => {
    onSelectContact(contact);
    setSearchQuery("");
    onClose();
  };

  const handleAvatarPress = (avatarUrl, contactName, event) => {
    console.log("🔄 Avatar pressed - attempting to stop propagation...");
    event?.stopPropagation(); // Prevent the parent TouchableOpacity from firing

    if (avatarUrl) {
      console.log(`🖼️ Opening image viewer for ${contactName}:`, avatarUrl);
      console.log("📱 Setting imageViewerVisible to true");

      // Temporarily hide the contact modal so image viewer can be seen
      setTempHideContactModal(true);
      setSelectedImageUrl(avatarUrl);
      setSelectedContactName(contactName);
      setImageViewerVisible(true);

      // Additional debug
      setTimeout(() => {
        console.log("⏰ Image viewer state after 100ms:", {
          imageViewerVisible,
          selectedImageUrl,
          selectedContactName,
          tempHideContactModal,
        });
      }, 100);
    } else {
      console.log("❌ No avatar URL provided for", contactName);
    }
  };

  const handleImageViewerClose = () => {
    console.log("❌ Closing image viewer and restoring contact modal");
    setImageViewerVisible(false);
    setTempHideContactModal(false);
    setSelectedImageUrl(null);
    setSelectedContactName("");
  };

  const renderContactItem = ({ item }) => {
    // Construct full Supabase Storage URL for avatar
    const getAvatarUrl = (avatarFileName) => {
      if (!avatarFileName) return null;

      // Get the full URL from Supabase Storage
      const { data } = supabase.storage
        .from("hotel-assets")
        .getPublicUrl(`users-avatar/${avatarFileName}`);

      return data?.publicUrl;
    };

    const fullAvatarUrl = getAvatarUrl(item.avatar_url);

    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => handleContactSelect(item)}
      >
        <View style={styles.contactAvatar}>
          {fullAvatarUrl ? (
            <TouchableOpacity
              onPress={(event) =>
                handleAvatarPress(fullAvatarUrl, item.name, event)
              }
              activeOpacity={0.7}
              style={styles.avatarTouchable}
            >
              <Image
                source={{ uri: fullAvatarUrl }}
                style={styles.avatarImage}
                onError={(error) => {
                  console.log(
                    `❌ Error loading avatar for ${item.name}:`,
                    error.nativeEvent.error
                  );
                }}

              />
            </TouchableOpacity>
          ) : (
            <Text style={styles.avatarText}>
              {item.firstName?.charAt(0) || "U"}
              {item.lastName?.charAt(0) || "S"}
            </Text>
          )}
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPosition}>
            {item.position} • {item.department}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {filteredContacts.length}{" "}
        {filteredContacts.length === 1 ? "Contact" : "Contacts"}
      </Text>
    </View>
  );

  return (
    <>
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible && !tempHideContactModal}
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FF5A5F" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Contact</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#8E8E93"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search contacts..."
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF5A5F" />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#FF3B30" />
                <Text style={styles.errorTitle}>Error Loading Contacts</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : filteredContacts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people" size={64} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>
                  {searchQuery ? "No matching contacts" : "No contacts found"}
                </Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "Try a different search term"
                    : "Staff contacts will appear here"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredContacts}
                renderItem={renderContactItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderSectionHeader}
                style={styles.contactsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Full-Screen Image Viewer Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageViewerVisible}
        onRequestClose={() => {
          console.log("📱 Image viewer modal onRequestClose called");
          handleImageViewerClose();
        }}
      >

        <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
        <View style={styles.imageViewerContainer}>
          {/* Header with close button */}
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity
              onPress={() => {
                console.log("❌ Close button pressed in image viewer");
                handleImageViewerClose();
              }}
              style={styles.imageViewerCloseButton}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.imageViewerTitle}>{selectedContactName}</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Full-size image */}
          <View style={styles.imageViewerImageContainer}>
            {selectedImageUrl && (
              <Image
                source={{ uri: selectedImageUrl }}
                style={styles.fullSizeImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </>
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
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1C1C1E",
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
    textTransform: "uppercase",
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF5A5F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarTouchable: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 2,
  },
  contactPosition: {
    fontSize: 14,
    color: "#8E8E93",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    marginTop: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    marginTop: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center",
  },
  // Image Viewer Styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  imageViewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  imageViewerCloseButton: {
    padding: 4,
  },
  imageViewerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  imageViewerImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  fullSizeImage: {
    width: Dimensions.get("window").width - 40,
    height: Dimensions.get("window").height - 200,
    borderRadius: 10,
  },
});

export default ContactSelectionModal;
