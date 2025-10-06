import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

/**
 * Custom hook for managing individual real conversation data from database
 * Auth user ID directly equals hotel_staff.id and hotel_staff_personal_data.staff_id
 * @param {string} conversationId - The ID of the conversation
 * @returns {object} - Object containing messages, loading state, and send functions
 */
export const useRealConversation = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStaffId, setCurrentStaffId] = useState(null);

  useEffect(() => {
    if (conversationId) {
      initializeConversation();
    }
  }, [conversationId]);

  /**
   * Get current staff member ID (which equals auth user ID)
   */
  const getCurrentStaffId = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Authentication required");
      }

      // Since auth user ID = hotel_staff.id, we can use it directly

      return user.id;
    } catch (error) {
      console.error("Error getting current staff ID:", error);
      throw error;
    }
  };

  /**
   * Initialize conversation and set up real-time subscription
   */
  const initializeConversation = async () => {
    try {
      const staffId = await getCurrentStaffId();
      setCurrentStaffId(staffId);

      await loadMessages(staffId);

      // Subscribe to new messages in this conversation
      const subscription = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "staff_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {

            handleNewMessage(payload.new, staffId);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error("Error initializing conversation:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Load messages from database
   */
  const loadMessages = async (staffId) => {
    try {
      setLoading(true);
      setError(null);

      const { data: messagesData, error: messagesError } = await supabase
        .from("staff_messages")
        .select(
          `
          id,
          content,
          file_url,
          voice_url,
          created_at,
          sender_id,
          hotel_staff!staff_messages_sender_id_fkey (
            id,
            employee_id,
            hotel_staff_personal_data (
              first_name,
              last_name,
              avatar_url
            )
          )
        `
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error loading messages:", messagesError);
        setError(messagesError.message);
        return;
      }



      // Process messages
      const processedMessages = messagesData.map((msg) => {
        const sender = msg.hotel_staff;
        const personalData = sender?.hotel_staff_personal_data;
        const isMyMessage = msg.sender_id === staffId;



        // Determine message type and content
        let type = "text";
        let content = msg.content || "";

        if (msg.file_url) {
          type = "image";
          content = msg.file_url;
        } else if (msg.voice_url) {
          type = "voice";
          content = msg.voice_url;
        }

        return {
          id: msg.id,
          text: content,
          content: content,
          timestamp: msg.created_at,
          sender: isMyMessage
            ? "me"
            : `${personalData?.first_name || ""} ${
                personalData?.last_name || ""
              }`.trim(),
          isMyMessage,
          type,
          senderAvatar: personalData?.avatar_url,
          senderId: msg.sender_id,
        };
      });


      setMessages(processedMessages);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle new message from real-time subscription
   */
  const handleNewMessage = async (newMessageData, staffId) => {
    try {


      // Get sender details
      const { data: senderData, error: senderError } = await supabase
        .from("hotel_staff")
        .select(
          `
          id,
          employee_id,
          hotel_staff_personal_data (
            first_name,
            last_name,
            avatar_url
          )
        `
        )
        .eq("id", newMessageData.sender_id)
        .single();

      if (senderError) {
        console.error("Error loading sender details:", senderError);
        return;
      }

      const personalData = senderData?.hotel_staff_personal_data;
      const isMyMessage = newMessageData.sender_id === staffId;

      console.log("📨 Processing new real-time message:", {
        messageId: newMessageData.id,
        senderId: newMessageData.sender_id,
        currentStaffId: staffId,
        isMyMessage: isMyMessage,
        comparison: `${newMessageData.sender_id} === ${staffId} = ${
          newMessageData.sender_id === staffId
        }`,
        content: newMessageData.content?.substring(0, 50) || "no content",
      });

      // Determine message type and content
      let type = "text";
      let content = newMessageData.content || "";

      if (newMessageData.file_url) {
        type = "image";
        content = newMessageData.file_url;
      } else if (newMessageData.voice_url) {
        type = "voice";
        content = newMessageData.voice_url;
      }

      const processedMessage = {
        id: newMessageData.id,
        text: content,
        content: content,
        timestamp: newMessageData.created_at,
        sender: isMyMessage
          ? "me"
          : `${personalData?.first_name || ""} ${
              personalData?.last_name || ""
            }`.trim(),
        isMyMessage,
        type,
        senderAvatar: personalData?.avatar_url,
        senderId: newMessageData.sender_id,
      };


      // Add to messages list
      setMessages((prevMessages) => [...prevMessages, processedMessage]);
    } catch (err) {
      console.error("Error handling new message:", err);
    }
  };

  /**
   * Send a text message
   * @param {string} messageText - The text content of the message
   */
  const sendMessage = async (messageText) => {
    console.log("🚀 sendMessage called with:", {
      messageText: messageText?.substring(0, 50) + "...",
      conversationId,
      currentStaffId,
      hasStaffId: !!currentStaffId,
    });

    if (!messageText?.trim()) {
      console.warn("⚠️ Empty message text");
      return null;
    }

    if (!currentStaffId) {
      console.warn("⚠️ No staff ID available for sending message");
      return null;
    }

    try {
      console.log("🚀 Attempting to send message:", {
        conversation_id: conversationId,
        sender_id: currentStaffId,
        content: messageText.trim(),
        sender_id_type: typeof currentStaffId,
      });

      const { data: newMessage, error: messageError } = await supabase
        .from("staff_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentStaffId,
          content: messageText.trim(),
        })
        .select()
        .single();

      if (messageError) {
        console.error("💥 Error sending message:", messageError);
        console.error("💥 Error details:", {
          code: messageError.code,
          message: messageError.message,
          details: messageError.details,
          hint: messageError.hint,
        });
        setError("Failed to send message");
        return null;
      }

      console.log("✅ Message sent successfully:", newMessage);

      // Update conversation's last_message_at
      await updateConversationTimestamp();

      return newMessage.id;
    } catch (err) {
      console.error("Error in sendMessage:", err);
      setError("Failed to send message");
      return null;
    }
  };

  /**
   * Send an image message
   * @param {string} imageUri - The URI/URL of the image
   */
  const sendImage = async (imageUri) => {
    if (!imageUri || !currentStaffId) return null;

    try {
      const { data: newMessage, error: messageError } = await supabase
        .from("staff_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentStaffId,
          content: null,
          file_url: imageUri,
        })
        .select()
        .single();

      if (messageError) {
        console.error("Error sending image:", messageError);
        setError("Failed to send image");
        return null;
      }



      // Update conversation's last_message_at
      await updateConversationTimestamp();

      return newMessage.id;
    } catch (err) {
      console.error("Error in sendImage:", err);
      setError("Failed to send image");
      return null;
    }
  };

  /**
   * Send a voice message
   * @param {string} voiceUri - The URI/URL of the voice recording
   * @param {number} duration - Duration of the voice message in seconds
   */
  const sendVoice = async (voiceUri, duration) => {
    if (!voiceUri || !currentStaffId) return null;

    try {
      const { data: newMessage, error: messageError } = await supabase
        .from("staff_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentStaffId,
          content: null,
          voice_url: voiceUri,
        })
        .select()
        .single();

      if (messageError) {
        console.error("Error sending voice message:", messageError);
        setError("Failed to send voice message");
        return null;
      }

      console.log("✅ Voice message sent:", newMessage);

      // Update conversation's last_message_at
      await updateConversationTimestamp();

      return newMessage.id;
    } catch (err) {
      console.error("Error in sendVoice:", err);
      setError("Failed to send voice message");
      return null;
    }
  };

  /**
   * Update conversation's last_message_at timestamp
   */
  const updateConversationTimestamp = async () => {
    try {
      const { error: updateError } = await supabase
        .from("staff_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      if (updateError) {
        console.error("Error updating conversation timestamp:", updateError);
      }
    } catch (err) {
      console.error("Error in updateConversationTimestamp:", err);
    }
  };

  /**
   * Mark conversation as read for current user
   */
  const markAsRead = async () => {
    if (!currentStaffId) return;

    try {
      const { error: readError } = await supabase
        .from("staff_conversation_reads")
        .upsert({
          conversation_id: conversationId,
          staff_id: currentStaffId,
          last_read_at: new Date().toISOString(),
        });

      if (readError) {
        console.error("Error marking conversation as read:", readError);
      } else {
        console.log("✅ Marked conversation as read");
      }
    } catch (err) {
      console.error("Error in markAsRead:", err);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendImage,
    sendVoice,
    markAsRead,
    reload: () => currentStaffId && loadMessages(currentStaffId),
  };
};
