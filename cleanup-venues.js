// cleanup-venues.js - Run this once to clean up duplicate venues
import { createClient } from "@supabase/supabase-js";

// Replace with your actual Supabase credentials
const supabaseUrl = "https://your-project-url.supabase.co";
const supabaseKey = "your-service-role-key"; // Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicateVenues() {
  try {
    console.log("🔍 Fetching all venues...");

    // Get all venues
    const { data: venues, error } = await supabase
      .from("venues")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    console.log(`📊 Found ${venues.length} total venues`);

    // Group by user and venue name to find duplicates
    const venueGroups = {};
    venues.forEach((venue) => {
      const key = `${venue.user_id}-${venue.venue_name}`;
      if (!venueGroups[key]) {
        venueGroups[key] = [];
      }
      venueGroups[key].push(venue);
    });

    // Find duplicates (keep the first, delete the rest)
    const toDelete = [];
    Object.values(venueGroups).forEach((group) => {
      if (group.length > 1) {
        // Keep the first one, mark others for deletion
        const duplicates = group.slice(1);
        toDelete.push(...duplicates.map((v) => v.id));
        console.log(
          `🔍 Found ${group.length} duplicates for "${group[0].venue_name}"`
        );
      }
    });

    if (toDelete.length === 0) {
      console.log("✅ No duplicates found!");
      return;
    }

    console.log(`🗑️ Deleting ${toDelete.length} duplicate venues...`);

    // Delete duplicates in batches
    const batchSize = 50;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize);

      const { error: deleteError } = await supabase
        .from("venues")
        .delete()
        .in("id", batch);

      if (deleteError) throw deleteError;

      console.log(`✅ Deleted batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log("🎉 Cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  }
}

// Alternative: Delete by date (if you know when duplicates were created)
async function deleteVenuesCreatedAfter(date) {
  try {
    console.log(`🗑️ Deleting venues created after ${date}...`);

    const { data, error } = await supabase
      .from("venues")
      .delete()
      .gte("created_at", date)
      .select("id");

    if (error) throw error;

    console.log(`✅ Deleted ${data.length} venues`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Alternative: Delete all venues for a specific user
async function deleteUserVenues(userId) {
  try {
    console.log(`🗑️ Deleting all venues for user ${userId}...`);

    const { data, error } = await supabase
      .from("venues")
      .delete()
      .eq("user_id", userId)
      .select("id");

    if (error) throw error;

    console.log(`✅ Deleted ${data.length} venues`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the cleanup
if (process.argv[2] === "duplicates") {
  cleanupDuplicateVenues();
} else if (process.argv[2] === "date") {
  // Usage: node cleanup-venues.js date 2024-01-20
  deleteVenuesCreatedAfter(process.argv[3]);
} else if (process.argv[2] === "user") {
  // Usage: node cleanup-venues.js user your-user-id
  deleteUserVenues(process.argv[3]);
} else {
  console.log(`
Usage:
  node cleanup-venues.js duplicates     # Remove duplicate venues
  node cleanup-venues.js date 2024-01-20    # Delete venues after date
  node cleanup-venues.js user user-id       # Delete all venues for user
  `);
}
