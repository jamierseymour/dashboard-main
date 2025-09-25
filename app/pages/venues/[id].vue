<script setup lang="ts">
import Masonry from "~/components/Venue/Masonry.vue";

// import BookingForm from "../../components/Venue/BookingForm.vue";
const client = useSupabaseClient();
const route = useRoute();

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
</script>

<template>
  <div class="bg-white">
    <!-- Header Image -->
    <div class="relative">
      <img
        v-if="venue?.photos && venue.photos.length > 0"
        :src="venue.photos[0]"
        alt="Header Image"
        class="h-48 w-full object-cover lg:h-64"
      />
      <div v-else class="h-48 w-full bg-gray-300 lg:h-64"></div>

      <Masonry
        v-if="venue?.photos && venue.photos.length > 1"
        :images="venue.photos.slice(1, 5)"
      />
      <!-- Venue Header with Logo and Name - Overlaying hero image -->
      <div
        v-if="venue"
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent"
      >
        <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div class="flex items-center py-4 lg:py-6">
            <!-- Logo -->
            <div class="flex-shrink-0 mr-6">
              <img
                :src="logoSrc"
                alt="Venue Logo"
                class="h-16 w-16 lg:h-20 lg:w-20 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>

            <!-- Venue Name and Info -->
            <div class="flex-1">
              <h1
                class="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 lg:mb-2"
              >
                {{ venue.venue_name }}
              </h1>
              <p class="text-base lg:text-lg text-white/90">
                {{ venue.company_name }}
              </p>
              <p v-if="venue.created_at" class="text-sm text-white/80 mt-1">
                Listed on {{ new Date(venue.created_at).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Types Badges -->
    <div class="flex w-full items-center justify-center flex-wrap mt-4 mb-6">
      <UBadge
        class="font-bold rounded-full mr-2 mb-2 text-amber-300"
        v-for="(badge, index) in parsedEventTypes"
        :key="index"
        >{{ badge.label }}</UBadge
      >
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
            <VenueBookingForm :venue="venue as any" />
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
        </div>
      </div>
    </div>
  </div>
</template>
