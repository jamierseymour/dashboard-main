<script setup lang="ts">
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

const { data: venue } = useAsyncData<IVenue>("venue", async () => {
  const id = route.params.id;
  const { data } = await client.from("venues").select().eq("id", id);

  if (!data || data.length === 0) {
    throw createError({ statusCode: 404, statusMessage: "Venue not found" });
  }

  // Parse event types if they're stored as JSON strings
  const parsedEventTypes =
    data[0].event_types?.map((type) => {
      try {
        return JSON.parse(type);
      } catch {
        return type;
      }
    }) || [];

  // Parse selected province if it's stored as a JSON string
  let parsedProvince = data[0].selected_province;
  try {
    parsedProvince = JSON.parse(data[0].selected_province);
  } catch {
    // Keep as is if not JSON
  }

  // Set carousel items from photos array
  carouselItems.value = data[0].photos || [];

  return {
    ...data[0],
    event_types: parsedEventTypes,
    selected_province: parsedProvince,
  };
});

console.log("data", venue.value);

// Parse event types for display as badges
const parsedEventTypes = computed(() => {
  if (!venue.value?.event_types) return [];

  return venue.value.event_types.map((type) => {
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
      return parsed.label;
    } catch {
      return venue.value.selected_province;
    }
  }

  return venue.value.selected_province.label || venue.value.selected_province;
});
</script>

<template>
  <div class="bg-white">
    <!-- Facebook-Style Header -->
    <div class="relative">
      <!-- Header Image -->
      <img
        v-if="venue?.photos?.length > 0"
        :src="venue.photos[0]"
        alt="Header Image"
        class="h-48 w-full object-cover lg:h-64"
      />

      <div v-else class="h-64 w-full bg-gray-300 lg:h-96"></div>

      <!-- Venue Name on top of the header image -->
      <div
        class="absolute bottom-0 left-0 ml-56 flex w-full bg-gradient-to-t from-black/70 to-transparent p-4"
      >
        <h1 class="text-3xl font-bold text-white lg:text-4xl">
          {{ venue?.venue_name }}
        </h1>
      </div>

      <!-- Logo -->
      <div class="absolute -bottom-16 left-4 lg:left-8">
        <img
          src="https://plus.unsplash.com/premium_vector-1689096818551-edb79a6fa3da?q=80&w=2360&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Logo"
          class="h-32 w-32 rounded-full border-4 border-white object-cover"
        />
      </div>
    </div>

    <div class="flex w-full items-center justify-center flex-wrap mt-2">
      <UBadge
        class="font-bold rounded-full mr-2 mb-2 text-amber-300"
        v-for="(badge, index) in parsedEventTypes"
        :key="index"
        >{{ badge.label }}</UBadge
      >
    </div>
    <div class="pt-6">
      <!-- Image gallery and product info -->
      <div
        class="mx-auto max-w-2xl px-4 pt-10 pb-16 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pt-16 lg:pb-24"
      >
        <!-- Venue Basic Info -->
        <div class="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
          <!-- <p class="mt-2 text-lg text-gray-600">{{ provinceDisplay }}</p>
          <p class="mt-2 text-lg text-gray-600">{{ venue?.company_name }}</p>
          <p v-if="venue?.created_at" class="mt-2 text-sm text-gray-500">
            Listed on {{ new Date(venue.created_at).toLocaleDateString() }}
          </p> -->
        </div>

        <!-- Sticky Booking Form -->
        <div class="lg:row-span-3 lg:mt-0">
          <div class="sticky top-24">
            <!-- <BookingForm :venue="venue" /> -->
            <VenueBookingForm :venue="venue" />
          </div>
        </div>

        <!-- Venue Details -->
        <div
          class="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pt-6 lg:pb-16 lg:pr-8"
        >
          <!-- Description -->
          <div>
            <h3 class="text-xl font-bold text-gray-900">about</h3>
            <p class="mt-4 text-base text-gray-600">
              {{ venue?.description }}
            </p>
          </div>

          <!-- Image Gallery -->
          <div class="mt-6">
            <h2 class="text-2xl font-bold tracking-tight text-gray-900 my-3">
              Gallery
            </h2>
            <UCarousel
              v-slot="{ item }"
              arrows
              :prev="{ color: 'primary' }"
              :next="{ variant: 'solid' }"
              :items="venue?.photos"
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
              v-if="carouselItems.length === 0"
              class="flex items-center justify-center p-6"
            >
              <p class="text-gray-500">No images available for this venue.</p>
            </div>
          </div>

          <!-- Amenities -->
          <div class="mt-6">
            <VenueAmenities
              v-if="venue?.amenities"
              :amenities="venue.amenities"
            />
          </div>

          <!-- Capacity -->
          <div class="mt-6">
            <h3 class="text-xl font-bold text-gray-900">Capacity</h3>
            <p class="mt-4 text-base text-gray-600">
              Minimum: {{ venue?.min_capacity ?? "N/A" }}<br />
              Maximum: {{ venue?.max_capacity ?? "N/A" }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
