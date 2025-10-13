<script setup lang="ts">
import BookingInfo from "~/components/Venue/BookingInfo.vue";
import Masonry from "~/components/Venue/Masonry.vue";
import { useAuth } from "~/stores/auth";

// import BookingForm from "../../components/Venue/BookingForm.vue";
const client = useSupabaseClient();
const route = useRoute();
const auth = useAuth();

const product = {
  breadcrumbs: [
    { id: 1, name: "Wedding Venues", href: "#" },
    { id: 2, name: "Clothing", href: "#" },
  ],
};

const reviews = { href: "#", average: 4, totalCount: 117 };
const carouselItems = ref<string[]>([]);

interface IVenue {
  id: number;
  address: string;
  logo?: string;
  user_id?: string;
  amenities: {
    bar: boolean;
    wifi: boolean;
    stage: boolean;
    chairs: number;
    tables: number;
    [key: string]: any;
  };
  cancellation_policy: {
    refundableDays: number;
    nonRefundableDays: number;
    partialRefundDays: number;
    partialRefundPercentage: number;
  };
  company_name: string;
  description: string;
  event_types: string[];
  max_capacity: number;
  min_capacity: number;
  minimum_hours: number;
  notice_required: number;
  photos: string[];
  price: number;
  provinces: any;
  seasonal_pricing: {
    off_peak: number;
    peak: number;
    peak_months: any[];
  };
  selected_province: string;
  venue_name: string;
  created_at?: Date;
  structured_address?: {
    city?: string;
    state_province?: string;
    [key: string]: any;
  };
}

const { data: venue } = useAsyncData<IVenue | null>("venue", async () => {
  const id = route.params.id;
  const { data } = await client.from("venues").select().eq("id", id);

  if (!data || data.length === 0) {
    throw createError({ statusCode: 404, statusMessage: "Venue not found" });
  }

  const venueData = data[0];
  if (!venueData) {
    throw createError({ statusCode: 404, statusMessage: "Venue not found" });
  }

  // Parse event types if they're stored as JSON strings
  const parsedEventTypes =
    venueData.event_types?.map((type: any) => {
      try {
        return JSON.parse(type);
      } catch {
        return type;
      }
    }) || [];

  // Parse selected province if it's stored as a JSON string
  let parsedProvince = venueData.selected_province;
  try {
    if (typeof parsedProvince === "string") {
      parsedProvince = JSON.parse(parsedProvince);
    }
  } catch {
    // Keep as is if not JSON
  }

  // Set carousel items from photos array
  carouselItems.value = venueData.photos || [];

  return {
    ...venueData,
    event_types: parsedEventTypes,
    selected_province: parsedProvince,
  } as IVenue;
});

// Fetch host profile data
const { data: hostProfile } = useAsyncData(
  "host-profile",
  async () => {
    if (!venue.value?.user_id) return null;

    const { data, error } = await client
      .from("users")
      .select("*")
      .eq("user_id", venue.value.user_id)
      .single();

    if (error) {
      console.error("Error fetching host profile:", error);
      return null;
    }

    return data;
  },
  {
    watch: [venue],
  },
);

// Parse event types for display as badges
const parsedEventTypes = computed(() => {
  if (!venue.value?.event_types) return [];

  return venue.value.event_types.map((type: any) => {
    if (typeof type === "string") {
      try {
        return JSON.parse(type);
      } catch {
        return { label: type, value: type };
      }
    }
    return type;
  });
});

// Get province display value
const provinceDisplay = computed(() => {
  if (!venue.value?.selected_province) return "";

  if (typeof venue.value.selected_province === "string") {
    try {
      const parsed = JSON.parse(venue.value.selected_province);
      return parsed?.label || venue.value.selected_province;
    } catch {
      return venue.value.selected_province;
    }
  }

  return (
    (venue.value.selected_province as any)?.label ||
    venue.value.selected_province
  );
});

// Computed property for logo with fallback
const logoSrc = computed(() => {
  return venue.value?.logo || "/logos/logo-snip.png";
});

// Check if current user owns this venue
const isOwner = computed(() => {
  return auth.user?.id && venue.value?.user_id === auth.user.id;
});

// Extract province (administrative_area_level_1) for display
const cityName = computed(() => {
  // First, try to get state_province from structured_address (this is administrative_area_level_1)
  if (venue.value?.structured_address) {
    const structuredAddress = venue.value.structured_address;

    // Try to extract from address_components
    if (
      structuredAddress.address_components &&
      Array.isArray(structuredAddress.address_components)
    ) {
      const stateComponent = structuredAddress.address_components.find(
        (component: any) =>
          component.types &&
          component.types.includes("administrative_area_level_1"),
      );
      if (stateComponent?.longText) {
        return stateComponent.longText;
      }
    }

    // Try state_province field
    if (structuredAddress.state_province) {
      const stateProvince = structuredAddress.state_province;

      // If it's an object, try to extract the value
      if (typeof stateProvince === "object" && stateProvince !== null) {
        return (
          (stateProvince as any).label || (stateProvince as any).value || ""
        );
      }

      // If it's a string, return it directly
      if (typeof stateProvince === "string") {
        return stateProvince;
      }
    }
  }

  // Fallback: try selected_province if it exists
  if (venue.value?.selected_province) {
    const selectedProvince = venue.value.selected_province;

    if (typeof selectedProvince === "string") {
      try {
        const parsed = JSON.parse(selectedProvince);
        return parsed?.label || parsed?.value || selectedProvince;
      } catch {
        return selectedProvince;
      }
    }

    if (typeof selectedProvince === "object" && selectedProvince !== null) {
      return (
        (selectedProvince as any)?.label ||
        (selectedProvince as any)?.value ||
        ""
      );
    }
  }

  return "";
});

// Handle share functionality
const isLiked = ref(false);

const handleShare = async () => {
  if (import.meta.client) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: venue.value?.venue_name || "Venue",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Sharing failed:", err);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        console.log("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  }
};

// Get map coordinates from structured_address
const mapCoordinates = computed(() => {
  console.log('🗺️ Map Debug - Full venue data:', venue.value);

  if (!venue.value) {
    console.log('❌ No venue data');
    return null;
  }

  console.log('🔍 Structured address:', venue.value.structured_address);

  const lat = venue.value.structured_address?.latitude;
  const lng = venue.value.structured_address?.longitude;

  console.log('📍 Coordinates:', { lat, lng });

  if (lat && lng && typeof lat === 'number' && typeof lng === 'number') {
    console.log('✅ Valid coordinates found:', { latitude: lat, longitude: lng });
    return { latitude: lat, longitude: lng };
  }

  console.log('❌ No valid coordinates found');
  return null;
});
</script>

<template>
  <div class="bg-white">
    <!-- Header Section with Venue Name and Actions -->
    <div class="px-4 py-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-6xl mx-auto">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-3 flex-1">
            <h1 class="text-3xl font-bold text-gray-900">
              {{ venue?.venue_name }}
              <span v-if="cityName" class="text-gray-600"
                >in {{ cityName }}</span
              >
            </h1>
            <!-- Edit Button for Owner -->
            <UButton
              v-if="isOwner"
              icon="i-heroicons-pencil-square"
              color="primary"
              :to="`/venues/edit/${venue?.id}`"
              label="Edit"
              size="sm"
            />
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <!-- Share Button -->
            <button
              @click="handleShare"
              class="flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon name="lucide:share-2" size="16" />
              <span class="hidden sm:inline">Share</span>
            </button>
            <!-- Wishlist Button -->
            <button
              @click="isLiked = !isLiked"
              :class="[
                'flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors',
                isLiked
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-300 hover:bg-gray-100',
              ]"
            >
              <Icon
                name="lucide:heart"
                size="16"
                :class="isLiked ? 'fill-current' : ''"
              />
              <span class="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Masonry Gallery -->
    <div class="px-4 py-6 sm:px-6 lg:px-8">
      <Masonry
        v-if="venue?.photos && venue.photos.length > 0"
        :images="venue.photos"
        :venue-name="venue.venue_name"
        :max-images="8"
      />
    </div>

    <!-- Event Types Badges -->
    <div
      v-if="parsedEventTypes && parsedEventTypes.length > 0"
      class="px-4 sm:px-6 lg:px-8"
    >
      <div class="w-full max-w-6xl mx-auto">
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge
            v-for="(badge, index) in parsedEventTypes"
            :key="index"
            color="primary"
            variant="subtle"
            size="md"
            class="px-3 py-1"
          >
            {{ badge?.label || badge }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="pt-6" v-if="venue">
      <div
        class="mx-auto max-w-2xl px-4 pt-4 pb-16 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pt-8 lg:pb-24"
      >
        <!-- Left Content Area -->
        <div class="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
          <!-- Content starts here without the header since it's now in the hero -->
        </div>

        <!-- Sticky Booking Form -->
        <div class="lg:row-span-3 lg:mt-0">
          <div class="sticky top-24">
            <VenueBookingForm :venue="venue" />
          </div>
        </div>

        <!-- Venue Details -->
        <div
          class="py-6 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pt-6 lg:pb-16 lg:pr-8"
        >
          <!-- Description -->
          <div>
            <h3 class="text-xl font-bold text-gray-900">about</h3>
            <p class="mt-4 text-base text-gray-600">
              {{ venue.description }}
            </p>
          </div>

          <!-- Image Gallery -->
          <div class="mt-6">
            <h2 class="text-2xl font-bold tracking-tight text-gray-900 my-3">
              Gallery
            </h2>
            <UCarousel
              v-if="venue.photos && venue.photos.length > 0"
              v-slot="{ item }"
              arrows
              :prev="{ color: 'primary' }"
              :next="{ variant: 'solid' }"
              :items="venue.photos"
              class="w-full h-full mx-auto"
            >
              <NuxtImg
                :src="item"
                width="800"
                class="w-full h-96 object-cover rounded-lg"
                alt="Venue photo"
              />
            </UCarousel>

            <!-- Fallback if no images are available -->
            <div
              v-if="!venue.photos || venue.photos.length === 0"
              class="flex items-center justify-center p-6"
            >
              <p class="text-gray-500">No images available for this venue.</p>
            </div>
          </div>

          <!-- Amenities -->
          <div class="mt-6">
            <VenueAmenities
              v-if="venue.amenities"
              :amenities="venue.amenities"
            />
          </div>

          <!-- Capacity -->
          <div class="mt-6">
            <h3 class="text-xl font-bold text-gray-900">Capacity</h3>
            <p class="mt-4 text-base text-gray-600">
              Minimum: {{ venue.min_capacity ?? "N/A" }}<br />
              Maximum: {{ venue.max_capacity ?? "N/A" }}
            </p>
          </div>

          <!-- Host Profile Section -->
          <VenueHostProfile
            v-if="hostProfile"
            :host="hostProfile"
            :location="cityName"
            :rating="5.0"
            :review-count="7"
            :response-rate="100"
            response-time="within an hour"
            :is-verified="true"
            @message-host="() => {}"
          />

          <!-- Map Section -->
          <VenueMap
            v-if="mapCoordinates"
            :latitude="mapCoordinates.latitude"
            :longitude="mapCoordinates.longitude"
            :address="venue.structured_address?.formatted_address || venue.address"
            :city="venue.structured_address?.city || ''"
            :province="venue.structured_address?.state_province || cityName"
            :venue-name="venue.venue_name"
            :show-details="true"
            :zoom="14"
          />

          <BookingInfo />
        </div>
      </div>
    </div>
  </div>
</template>
