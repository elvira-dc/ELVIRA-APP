import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

/**
 * Custom hook for managing conversations list from database
 * Auth user ID directly equals hotel_staff.id and hotel_staff_personal_data.staff_id
 * @returns {object} - Object containing conversations, loading state, and functions
 */
export const useRealConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStaffId, setCurrentStaffId] = useState(null);

  useEffect(() => {
    initializeConversations();
  }, []);

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



      // Get hotel_id for conversation creation
      const { data: staffData, error: staffError } = await supabase
        .from("hotel_staff")
        .select("hotel_id")
        .eq("id", user.id)
        .single();

      if (staffError || !staffData) {
        throw new Error("Staff record not found");
      }

      return {
        staffId: user.id,
        hotelId: staffData.hotel_id,
      };
    } catch (error) {
      console.error("Error getting current staff info:", error);
      throw error;
    }
  };

  /**
   * Initialize conversations and set up real-time subscription
   */
  const initializeConversations = async () => {
    try {
      const { staffId, hotelId } = await getCurrentStaffId();
      setCurrentStaffId(staffId);



      await loadConversations(staffId);

      // Subscribe to conversation changes
      const subscription = supabase
        .channel("conversations-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "staff_conversations",
          },
          () => {
            
            loadConversations(staffId);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "staff_conversation_participants",
          },
          () => {
            console.log("🔄 Participant change detected, reloading...");
            loadConversations(staffId);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "staff_messages",
          },
          () => {
            
            loadConversations(staffId);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error("Error initializing conversations:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Load conversations from database
   */
  const loadConversations = async (staffId) => {
    try {
      setLoading(true);
      setError(null);



      // Get conversations where user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from("staff_conversation_participants")
        .select(
          `
          conversation_id,
          staff_conversations (
            id,
            title,
            is_group,
            created_at,
            last_message_at,
            hotel_id
          )
        `
        )
        .eq("staff_id", staffId);

      if (participantError) {
        console.error("Error loading participant data:", participantError);
        setError(participantError.message);
        return;
      }



      // Process conversations
      const processedConversations = await Promise.all(
        participantData.map(async (item) => {
          const conversation = item.staff_conversations;

          if (!conversation) {
            console.warn("⚠️ Conversation not found for participant:", item);
            return null;
          }

          // Get last message
          const { data: lastMessage } = await supabase
            .from("staff_messages")
            .select("content, created_at, sender_id")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: false })
            .limit(1);

          // Get unread count
          const { data: readData } = await supabase
            .from("staff_conversation_reads")
            .select("last_read_at")
            .eq("conversation_id", conversation.id)
            .eq("staff_id", staffId)
            .single();

          let unreadCount = 0;
          if (readData?.last_read_at) {
            const { count } = await supabase
              .from("staff_messages")
              .select("*", { count: "exact", head: true })
              .eq("conversation_id", conversation.id)
              .gt("created_at", readData.last_read_at);
            unreadCount = count || 0;
          } else {
            // No read record, count all messages
            const { count } = await supabase
              .from("staff_messages")
              .select("*", { count: "exact", head: true })
              .eq("conversation_id", conversation.id);
            unreadCount = count || 0;
          }

          // Determine conversation name and avatar
          let name = conversation.title || "Untitled";
          let avatar_url = null;

          if (!conversation.is_group) {
            // For 1-on-1 conversations, get the other participant's info
            const { data: otherParticipants } = await supabase
              .from("staff_conversation_participants")
              .select(
                `
                staff_id,
                hotel_staff (
                  id,
                  hotel_staff_personal_data (
                    first_name,
                    last_name,
                    avatar_url
                  )
                )
              `
              )
              .eq("conversation_id", conversation.id)
              .neq("staff_id", staffId);

            if (otherParticipants?.length > 0) {
              const otherUser = otherParticipants[0].hotel_staff;
              const personalData = otherUser?.hotel_staff_personal_data;

              if (personalData) {
                name = `${personalData.first_name || ""} ${
                  personalData.last_name || ""
                }`.trim();
                avatar_url = personalData.avatar_url;
              }
            }
            // Fallback: if no name, use 'No Name'; if no avatar_url, UI should use initials
            if (!name || name === "") name = "No Name";
            if (avatar_url === undefined) avatar_url = null;
          }

          const processedConversation = {
            id: conversation.id,
            name,
            avatar_url,
            initials:
              name && typeof name === "string"
                ? name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "",
            lastMessage: lastMessage?.[0]?.content || "No messages yet",
            lastMessageTime:
              conversation.last_message_at || conversation.created_at,
            unread: unreadCount > 0,
            unreadCount,
            isGroup: conversation.is_group,
            hotelId: conversation.hotel_id,
          };


          return processedConversation;
        })
      );

      // Filter out null conversations and sort by last message time
      const validConversations = processedConversations
        .filter((conv) => conv !== null)
        .sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );


      setConversations(validConversations);
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start a new conversation with another staff member
   * @param {object} contact - The contact to start conversation with
   * @returns {string|null} - The conversation ID or null if failed
   */
  const startNewConversation = async (contact) => {
    if (!currentStaffId) {
      console.error("❌ No current staff ID available");
      return null;
    }

    try {
      console.log("🚀 Starting new conversation with:", contact);

      // Get current user's hotel_id
      const { data: currentUserData, error: userError } = await supabase
        .from("hotel_staff")
        .select("hotel_id")
        .eq("id", currentStaffId)
        .single();

      if (userError || !currentUserData) {
        console.error("❌ Error getting current user hotel_id:", userError);
        return null;
      }

      // Check if conversation already exists between these two users
      const { data: existingParticipants } = await supabase
        .from("staff_conversation_participants")
        .select("conversation_id")
        .in("staff_id", [currentStaffId, contact.id]);

      if (existingParticipants?.length > 0) {
        // Group participants by conversation_id
        const conversationCounts = {};
        existingParticipants.forEach((p) => {
          conversationCounts[p.conversation_id] =
            (conversationCounts[p.conversation_id] || 0) + 1;
        });

        // Find conversation that has exactly both users
        const existingConversationId = Object.keys(conversationCounts).find(
          (convId) => conversationCounts[convId] === 2
        );

        if (existingConversationId) {
          console.log(
            "✅ Found existing conversation:",
            existingConversationId
          );
          return existingConversationId;
        }
      }

      console.log("🔨 Creating new conversation...");
      console.log("📋 Current user data for conversation creation:", {
        currentStaffId,
        hotelId: currentUserData.hotel_id,
        authUserId: (await supabase.auth.getUser()).data.user?.id,
      });

      // Get fresh auth user to ensure we have the right ID
      const {
        data: { user: authUser },
        error: freshAuthError,
      } = await supabase.auth.getUser();
      if (freshAuthError || !authUser) {
        console.error("❌ Error getting fresh auth user:", freshAuthError);
        return null;
      }

      console.log("🔍 About to insert conversation with:", {
        hotel_id: currentUserData.hotel_id,
        is_group: false,
        title: null,
        created_by: authUser.id, // Use fresh auth user ID
        authUserId: authUser.id,
        currentStaffId: currentStaffId,
        areTheyEqual: authUser.id === currentStaffId,
      });

      const { data: newConversation, error: conversationError } = await supabase
        .from("staff_conversations")
        .insert({
          hotel_id: currentUserData.hotel_id,
          is_group: false,
          title: null, // Let the trigger set created_by
        })
        .select()
        .single();

      if (conversationError) {
        console.error("❌ Error creating conversation:", conversationError);
        return null;
      }

      console.log("✅ Created conversation:", newConversation);

      // Add participants
      const participants = [
        {
          conversation_id: newConversation.id,
          staff_id: currentStaffId,
        },
        {
          conversation_id: newConversation.id,
          staff_id: contact.id,
        },
      ];

      const { error: participantsError } = await supabase
        .from("staff_conversation_participants")
        .insert(participants);

      if (participantsError) {
        console.error("❌ Error adding participants:", participantsError);

        // Clean up conversation if participant addition failed
        await supabase
          .from("staff_conversations")
          .delete()
          .eq("id", newConversation.id);

        return null;
      }

      console.log("✅ Added participants to conversation");

      // Reload conversations to include the new one
      await loadConversations(currentStaffId);

      return newConversation.id;
    } catch (err) {
      console.error("❌ Error in startNewConversation:", err);
      return null;
    }
  };

  /**
   * Mark conversation as read
   * @param {string} conversationId - The ID of the conversation to mark as read
   */
  const markConversationAsRead = async (conversationId) => {
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
        // Reload conversations to update unread counts
        await loadConversations(currentStaffId);
      }
    } catch (err) {
      console.error("Error in markConversationAsRead:", err);
    }
  };

  return {
    conversations,
    loading,
    error,
    startNewConversation,
    markConversationAsRead,
    markAsRead: markConversationAsRead, // alias for compatibility
    reload: () => currentStaffId && loadConversations(currentStaffId),
  };
};
