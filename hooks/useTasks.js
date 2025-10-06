import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../config/supabase";

export function useTasks(initialFilter = null) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState(initialFilter);

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("tasks")
      .select(
        "id, title, description, status, priority, type, due_date, due_time, assigned_to, hotel_id, created_at"
      );

    // Only filter by hotel if provided
    if (filter?.type === "hotel" && filter?.value) {
      query = query.eq("hotel_id", filter.value);
    }

    const { data, error } = await query;

    if (!error) {
      setTasks(data || []);
    } else {
      console.error("Error fetching tasks:", error.message);
    }

    setLoading(false);
  }, [filter]);

  // Auto-fetch when filter changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Update status of a task
  const updateTaskStatus = useCallback(async (item, newValue) => {
    const newStatus = newValue ? "COMPLETED" : "PENDING";

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", item.id);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, status: newStatus } : t))
      );
    } else {
      console.error("Error updating task status:", error.message);
    }
  }, []);

  // Sort tasks by due_date or created_at
  const filteredTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const dateA = a.due_date || a.created_at;
      const dateB = b.due_date || b.created_at;
      if (!dateA || !dateB) return 0;
      return sortAsc
        ? new Date(dateA) - new Date(dateB)
        : new Date(dateB) - new Date(dateA);
    });
  }, [tasks, sortAsc]);

  return {
    tasks,
    loading,
    filter,
    setFilter, // ✅ parent can set filter dynamically
    sortAsc,
    setSortAsc,
    filteredTasks,
    updateTaskStatus,
    fetchTasks,
  };
}
