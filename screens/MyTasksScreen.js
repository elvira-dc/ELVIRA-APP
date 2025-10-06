// Suggested folder location: screens/ (if you have a dedicated screens folder)
// Suggested script name: MyTasksScreen.js

import React, { useState } from "react";
// Suggested import path: react-native or react-native-safe-area-context
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MessageSearchBar from "../components/messages/MessageSearchBar";
import TaskGridItem from "../components/tasks/TaskGridItem";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import TaskFormModal from "../components/tasks/TaskFormModal";
import { supabase } from "../config/supabase";
import { useAuth } from "../hooks/useAuth";
import { useStaffData } from "../hooks/useStaffData";
import { useTasks } from "../hooks/useTasks";
import { useStaffContacts } from "../hooks/useStaffContacts";
import { ShiftManagementModal } from "../components/calendar/ShiftManagementModal.js";

const MyTasksScreen = () => {
  // Hooks (Suggested folder location: hooks/)
  const { user } = useAuth();
  const { staffData } = useStaffData(user?.id);

  // Get all staff contacts for dropdown
  const { contacts: staffOptions } = useStaffContacts();

  // State variables (Suggested folder location: state/)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "",
    status: "PENDING",
    assigned_to: "",
  });
  const [creating, setCreating] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [listEnabled, setListEnabled] = useState(false);
  const [searchText, setSearchText] = useState(""); // Search box state
  const [staffSelectionModalVisible, setStaffSelectionModalVisible] =
    useState(false); // Modal state
  const [selectedStaffIds, setSelectedStaffIds] = useState([]); // Selected staff ids

  // Check if user is Hotel Admin and Manager (Suggested folder location: utils/)
  const isAdminManager =
    staffData?.position === "Hotel Admin" &&
    staffData?.department === "Manager";

  // Only filter by hotel for admin/manager with list enabled (Suggested folder location: utils/)
  const effectiveFilter =
    isAdminManager && listEnabled
      ? { type: "hotel", value: staffData?.hotel_id }
      : null; // No filter for regular users

  // Tasks data (Suggested folder location: hooks/)
  const {
    tasks,
    loading,
    filter,
    setFilter,
    sortAsc,
    setSortAsc,
    filteredTasks,
    updateTaskStatus,
    fetchTasks,
  } = useTasks(effectiveFilter);

  // For admin/manager, show only own tasks when listEnabled is false (Suggested folder location: utils/)
  const displayedTasks =
    isAdminManager && !listEnabled
      ? filteredTasks.filter((task) => task.assigned_to === user.id)
      : filteredTasks;

  // Filter by search text (title or description) (Suggested folder location: utils/)
  const filteredBySearch = displayedTasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Task handlers (Suggested folder location: handlers/)
  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleAddTask = () => {
    setShowCreateModal(true);
  };

  const handleCreateTask = async () => {
    setCreating(true);
    const { title, description, priority, status, assigned_to } = newTask;
    if (!title || !priority || !assigned_to) {
      alert("Please fill in all required fields.");
      setCreating(false);
      return;
    }
    const { error } = await supabase.from("tasks").insert([
      {
        title,
        description,
        priority,
        status,
        assigned_to,
        hotel_id: staffData?.hotel_id,
        created_by: staffData?.id,
      },
    ]);
    setCreating(false);
    if (error) {
      alert("Error creating task: " + error.message);
    } else {
      setShowCreateModal(false);
      setNewTask({
        title: "",
        description: "",
        priority: "",
        status: "PENDING",
        assigned_to: "",
      });
      fetchTasks(staffData?.id);
    }
  };

  // Edit Task Modal logic (Suggested folder location: handlers/)
  const handleTaskLongPress = (task) => {
    if (isAdminManager) {
      setEditTask(task);
      setEditModalVisible(true);
    }
  };

  const [editSaving, setEditSaving] = useState(false);

  const [editFields, setEditFields] = useState({
    title: "",
    description: "",
    priority: "",
    assigned_to: "",
  });

  React.useEffect(() => {
    if (editTask) {
      setEditFields({
        title: editTask.title || "",
        description: editTask.description || "",
        priority: editTask.priority || "",
        assigned_to: editTask.assigned_to || "",
      });
    }
  }, [editTask]);

  const handleEditSave = async () => {
    setEditSaving(true);
    const { title, description, priority, assigned_to } = editFields;
    if (!title || !priority || !assigned_to) {
      alert("Please fill in all required fields.");
      setEditSaving(false);
      return;
    }
    const { error } = await supabase
      .from("tasks")
      .update({ title, description, priority, assigned_to })
      .eq("id", editTask.id);
    setEditSaving(false);
    if (error) {
      alert("Error updating task: " + error.message);
    } else {
      setEditModalVisible(false);
      setEditTask(null);
      fetchTasks(staffData?.id);
    }
  };

  // Update the list icon handler: (Suggested folder location: handlers/)
  const handleListToggle = () => {
    if (!isAdminManager) return;
    setListEnabled((prev) => {
      const next = !prev;
      setFilter(
        next ? { type: "hotel", value: staffData?.hotel_id } : null // No filter for regular users
      );
      return next;
    });
  };

  // Handler for people icon (Suggested folder location: handlers/)
  const handlePeopleIconPress = () => {
    setStaffSelectionModalVisible(true);
  };

  // Handler for selecting/deselecting staff in modal (Suggested folder location: handlers/)
  const toggleStaffSelection = (staffId) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  // Handler for confirming creation (Suggested folder location: handlers/)
  const handleConfirmStaffSelection = (selectionType) => {
    // TODO: Implement shift calendar creation or absence request based on selectionType
    setStaffSelectionModalVisible(false);
    setSelectedStaffIds([]);
  };

  // Map staff contacts to firstName/lastName (Suggested folder location: utils/)
  const staffList = (staffOptions || []).map((staff) => ({
    id: staff.id,
    firstName: staff.firstName,
    lastName: staff.lastName,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        {isAdminManager && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handlePeopleIconPress}
              accessibilityLabel="People"
            >
              <Ionicons name="people-outline" size={26} color="#FF5A5F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconButton,
                listEnabled && { backgroundColor: "#FFEAEA", borderRadius: 8 },
              ]}
              onPress={handleListToggle}
              accessibilityLabel="List icon"
            >
              <Ionicons
                name="list-outline"
                size={28}
                color={listEnabled ? "#FF5A5F" : "#8E8E93"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                /* TODO: open filter modal or toggle filter options */
              }}
              accessibilityLabel="Filter tasks"
            >
              <Ionicons name="options-outline" size={28} color="#FF5A5F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddTask}
              accessibilityLabel="Add new task"
            >
              <Ionicons name="add" size={28} color="#FF5A5F" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Search Box (Suggested folder location: components/search/) */}
      <MessageSearchBar
        searchQuery={searchText}
        onSearchChange={setSearchText}
        placeholder="Search tasks..."
      />

      {/* Create Task Modal (Suggested folder location: components/modals/) */}
      <TaskFormModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        staffOptions={staffOptions}
        fields={newTask}
        setFields={setNewTask}
        onSubmit={handleCreateTask}
        submitting={creating}
        submitLabel="Create"
        isEdit={false}
      />

      {/* Tasks Grid (Suggested folder location: components/tasks/) */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBySearch}
          renderItem={({ item }) => (
            <TaskGridItem
              item={item}
              onPress={() => handleTaskPress(item)}
              onCheckboxChange={updateTaskStatus}
              styles={styles}
              onLongPress={
                isAdminManager ? () => handleTaskLongPress(item) : undefined
              }
            />
          )}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {listEnabled
                ? "No tasks found for hotel staff."
                : "No tasks found."}
            </Text>
          }
        />
      )}

      {/* Task Detail Modal (Suggested folder location: components/modals/) */}
      <TaskDetailModal
        visible={modalVisible}
        task={selectedTask}
        onClose={() => setModalVisible(false)}
        styles={styles}
        staffOptions={staffOptions}
      />

      {/* Edit Task Modal (Suggested folder location: components/modals/) */}
      <TaskFormModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Edit Task"
        staffOptions={staffOptions}
        fields={editFields}
        setFields={setEditFields}
        onSubmit={handleEditSave}
        submitting={editSaving}
        submitLabel="Save"
        isEdit={true}
      />

      {/* Shift Management Modal (Suggested folder location: components/modals/) */}
      <ShiftManagementModal
        visible={staffSelectionModalVisible}
        onClose={() => setStaffSelectionModalVisible(false)}
        schedule={null} // You might need to pass a schedule or create a dummy one
        onClockIn={() => {}} // Implement clock-in logic if needed
        onClockOut={() => {}} // Implement clock-out logic if needed
        onConfirm={() => {}} // Implement confirm logic if needed
        onRequestChange={() => {}} // Implement request change logic if needed
        formatShiftTime={() => {}} // Implement format shift time logic if needed
        getShiftTypeColor={() => {}} // Implement get status color logic if needed
        getStatusColor={() => {}} // Implement get status color logic if needed
        staffList={staffList}
        selectedStaffIds={selectedStaffIds}
        onToggleStaff={toggleStaffSelection}
        onCancel={() => setStaffSelectionModalVisible(false)}
        loading={false}
      />
    </SafeAreaView>
  );
};

// Styles for the component (Suggested folder location: styles/)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
  iconButton: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#484848",
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
  emptyText: {
    textAlign: "center",
    color: "#8E8E93",
    fontSize: 16,
    marginTop: 32,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 8,
  },
});

export default MyTasksScreen;
