import { supabase } from "../config/supabase";

/**
 * Test database connection and data operations
 * Use this to verify database connectivity and data structure
 */
export const testDatabaseConnection = async () => {
  try {
    console.log("🔍 Testing database connection...");

    // Test 1: Check hotel_staff table
    const { data: staffData, error: staffError } = await supabase
      .from("hotel_staff")
      .select("*")
      .limit(5);

    console.log("📋 Hotel Staff Data:", staffData);
    if (staffError) console.error("❌ Staff Error:", staffError);

    // Test 2: Check hotel_staff_personal_data table
    const { data: personalData, error: personalError } = await supabase
      .from("hotel_staff_personal_data")
      .select("*")
      .limit(5);

    console.log("👤 Personal Data:", personalData);
    if (personalError) console.error("❌ Personal Error:", personalError);

    // Test 3: Check storage bucket access
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();
    console.log("🗂️ Storage Buckets:", buckets);
    if (bucketError) {
      console.log(
        "ℹ️ Bucket list error (may be due to RLS policies):",
        bucketError.message
      );
    }

    // Test direct access to hotel-assets bucket
    try {
      const { data: files, error: filesError } = await supabase.storage
        .from("hotel-assets")
        .list("hotel-gallery", { limit: 5 });

      if (filesError) {
        console.log(
          "⚠️ Cannot access hotel-assets/hotel-gallery:",
          filesError.message
        );
        console.log("💡 This is normal if RLS policies restrict access");
      } else {
        console.log("✅ hotel-assets bucket is accessible!");
        console.log("📁 Files in hotel-gallery:", files?.length || 0);
      }
    } catch (err) {
      console.log("ℹ️ Storage access test:", err.message);
    }

    return { staffData, personalData, buckets };
  } catch (error) {
    console.error("🚨 Database test failed:", error);
    return null;
  }
};

export const testInsertPersonalData = async (sampleData) => {
  try {
    console.log("🧪 Testing insert with data:", sampleData);

    const { data, error } = await supabase
      .from("hotel_staff_personal_data")
      .insert(sampleData)
      .select()
      .single();

    if (error) {
      console.error("❌ Insert Error:", error);
      return { success: false, error };
    }

    console.log("✅ Insert Success:", data);
    return { success: true, data };
  } catch (error) {
    console.error("🚨 Insert test failed:", error);
    return { success: false, error };
  }
};
