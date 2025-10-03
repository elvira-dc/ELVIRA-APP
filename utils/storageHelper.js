import { supabase } from "../config/supabase";

/**
 * Storage Policy Helper
 * Utilities to test and manage Supabase storage policies
 */

export const testStorageAccess = async () => {
  try {
    console.log("🔍 Testing storage access...");

    // Test 1: Check if we can list files
    const { data: files, error: listError } = await supabase.storage
      .from("hotel-assets")
      .list("hotel-gallery", { limit: 1 });

    if (listError) {
      console.log("❌ List access failed:", listError.message);
    } else {
      console.log("✅ List access works");
    }

    // Test 2: Try to upload a small test file
    const testContent = new TextEncoder().encode("test");
    const testPath = `users-avatar/test_${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("hotel-assets")
      .upload(testPath, testContent, {
        contentType: "text/plain",
        upsert: true,
      });

    if (uploadError) {
      console.log("❌ Upload test failed:", uploadError.message);

      if (uploadError.message?.includes("row-level security policy")) {
        console.log(`
🔒 RLS Policy Issue Detected!

To fix this, you need to create/update storage policies in Supabase:

1. Go to Storage > Policies in your Supabase dashboard
2. Make sure you have these policies for 'hotel-assets' bucket:

POLICY: "Allow authenticated uploads to hotel-gallery"
- Command: INSERT
- Target: authenticated
- Expression: bucket_id = 'hotel-assets' AND name LIKE 'hotel-gallery/%'

POLICY: "Allow authenticated updates to hotel-gallery" 
- Command: UPDATE
- Target: authenticated
- Expression: bucket_id = 'hotel-assets' AND name LIKE 'hotel-gallery/%'

POLICY: "Allow public read access"
- Command: SELECT
- Target: public
- Expression: bucket_id = 'hotel-assets'
        `);
      }

      return { success: false, error: uploadError };
    } else {
      console.log("✅ Upload test successful!");

      // Clean up test file
      await supabase.storage.from("hotel-assets").remove([testPath]);

      return { success: true, data: uploadData };
    }
  } catch (error) {
    console.error("🚨 Storage test failed:", error);
    return { success: false, error };
  }
};

export const getSuggestedPolicies = () => {
  return `
-- Storage Policies for hotel-assets bucket
-- Run these in your Supabase SQL editor:

-- Policy 1: Allow authenticated users to upload to hotel-gallery
CREATE POLICY "Allow authenticated uploads to hotel-gallery" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'hotel-assets' AND name LIKE 'hotel-gallery/%');

-- Policy 2: Allow authenticated users to update files in hotel-gallery  
CREATE POLICY "Allow authenticated updates to hotel-gallery" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'hotel-assets' AND name LIKE 'hotel-gallery/%');

-- Policy 3: Allow public read access (for displaying images)
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'hotel-assets');

-- Policy 4: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated delete own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'hotel-assets' AND name LIKE 'hotel-gallery/%');
  `;
};
