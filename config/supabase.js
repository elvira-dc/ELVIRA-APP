import { createClient } from "@supabase/supabase-js";

// Supabase configuration
// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = "https://lxlabfgifswvhtkqrlek.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4bGFiZmdpZnN3dmh0a3FybGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDY4MTMsImV4cCI6MjA3MzE4MjgxM30.ECAKr8NhNtzBud3M7NUKj3c-fM9tzYRH-ZhdYCbt5Bs";

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Demo configuration for testing
// You can uncomment these lines and add your actual Supabase credentials
/*
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key-here';
*/
