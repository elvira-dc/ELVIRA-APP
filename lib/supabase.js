import { createClient } from "@supabase/supabase-js";

// Supabase configuration using environment variables
// Make sure to create a .env file based on .env.example
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example functions for common operations
export const supabaseAuth = {
  // Sign up with email and password
  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      return null;
    }
  },
};

// Example database operations
export const supabaseDB = {
  // Generic select function
  select: async (table, columns = "*", filters = {}) => {
    try {
      let query = supabase.from(table).select(columns);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Generic insert function
  insert: async (table, data) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Generic update function
  update: async (table, data, filters = {}) => {
    try {
      let query = supabase.from(table).update(data);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data: result, error } = await query.select();
      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Generic delete function
  delete: async (table, filters = {}) => {
    try {
      let query = supabase.from(table).delete();

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// File storage operations
export const supabaseStorage = {
  // Upload file
  uploadFile: async (bucket, path, file) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Download file
  downloadFile: async (bucket, path) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  deleteFile: async (bucket, paths) => {
    try {
      const { data, error } = await supabase.storage.from(bucket).remove(paths);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};
