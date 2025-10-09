<script setup lang="ts">
import type { DateRange } from "@nuxt/ui";

const route = useRoute();
const router = useRouter();
const client = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();
const auth = useAuth();

interface IVenue {
  id: number;
  venue_name: string;
  company_name: string;
  price: number;
  min_capacity: number;
  max_capacity: number;
  minimum_hours: number;
  notice_required: number;
  user_id: string;
  photos: string[];
  cancellation_policy: {
    refundableDays: number;
    nonRefundableDays: number;
    partialRefundDays: number;
    partialRefundPercentage: number;
  };
}

// Fetch venue data
const { data: venue } = useAsyncData<IVenue | null>("venue", async () => {
  const id = route.params.id;
  const { data } = await client.from("venues").select().eq("id", id);

  if (!data || data.length === 0) {
    throw createError({ statusCode: 404, statusMessage: "Venue not found" });
  }

  return data[0] as IVenue;
});

// Form state
const dates = ref<DateRange>();
const guests = ref(1);
const accommodation = ref(0);
const message = ref("");

// Computed values
const nightsCount = computed(() => {
  if (!dates.value?.start || !dates.value?.end) return 0;
  const start = new Date(dates.value.start);
  const end = new Date(dates.value.end);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
});

const subtotal = computed(() => {
  if (!venue.value) return 0;
  return nightsCount.value * venue.value.price;
});

const serviceFee = computed(() => {
  return Math.round(subtotal.value * 0.12); // 12% service fee
});

const total = computed(() => {
  return subtotal.value + serviceFee.value;
});

// Form submission
const isSubmitting = ref(false);

async function submitRequest() {
  // Check if user is authenticated, if not show auth modal
  if (!user.value) {
    const authenticated = await auth.waitForAuth();

    if (!authenticated) {
      // User closed modal without logging in
      return;
    }

    // Wait a moment for user state to update
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!user.value) {
      toast.add({
        title: "Authentication required",
        description: "Please log in to make a booking request",
        color: "error",
      });
      return;
    }
  }

  // Validation
  if (!venue.value || !dates.value?.start || !dates.value?.end) {
    toast.add({
      title: "Missing information",
      description: "Please select dates for your booking",
      color: "warning",
    });
    return;
  }

  if (guests.value < (venue.value.min_capacity || 1) || guests.value > (venue.value.max_capacity || 100)) {
    toast.add({
      title: "Invalid guest count",
      description: `Guest count must be between ${venue.value.min_capacity} and ${venue.value.max_capacity}`,
      color: "warning",
    });
    return;
  }

  isSubmitting.value = true;

  try {
    // Format dates as ISO strings
    const checkInDate = new Date(dates.value.start).toISOString().split("T")[0];
    const checkOutDate = new Date(dates.value.end).toISOString().split("T")[0];

    // Create booking request
    const bookingData = {
      venue_id: venue.value.id,
      user_id: user.value.id,
      venue_owner_id: venue.value.user_id,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      number_of_guests: guests.value,
      accommodation_needed: accommodation.value,
      message_to_host: message.value || null,
      price_per_night: venue.value.price,
      number_of_nights: nightsCount.value,
      subtotal: subtotal.value,
      service_fee: serviceFee.value,
      total_amount: total.value,
      booking_status: "pending",
      payment_status: "unpaid",
    };

    const { error } = await client
      .from("bookings")
      .insert(bookingData as any)
      .select()
      .single();

    if (error) {
      console.error("Booking error:", error);
      throw error;
    }

    toast.add({
      title: "Booking request sent!",
      description: "The venue owner will review your request",
      color: "success",
    });

    // Navigate to bookings page or back to venue
    router.push(`/venues/${venue.value.id}?booking=success`);
  } catch (error: any) {
    console.error("Error submitting booking request:", error);
    toast.add({
      title: "Booking failed",
      description: error.message || "Failed to submit booking request. Please try again.",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
}

// Format date range
const dateRangeText = computed(() => {
  if (!dates.value?.start || !dates.value?.end) return "Select dates";
  const start = new Date(dates.value.start);
  const end = new Date(dates.value.end);
  return `${start.toLocaleDateString("en-ZA", {
    month: "short",
    day: "numeric",
  })} - ${end.toLocaleDateString("en-ZA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
});

// Prevent invalid characters in number inputs
function preventInvalidChars(event: KeyboardEvent) {
  const invalidChars = ['e', 'E', '+', '-'];
  if (invalidChars.includes(event.key)) {
    event.preventDefault();
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Auth Modal -->
    <AuthModal />
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <div class="mb-6">
        <UButton
          icon="i-heroicons-arrow-left"
          color="neutral"
          variant="solid"
          :to="`/venues/${route.params.id}`"
          label="Back to venue"
        />
      </div>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Request to book</h1>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Left Column - Booking Form -->
        <div class="space-y-6">
          <!-- Step 1: Booking Details -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">1. Your booking details</h2>
            </template>

            <div class="space-y-6">
              <!-- Date Picker -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2"
                  >Dates</label
                >
                <div class="cursor-pointer">
                  <UCalendar range v-model="dates" />
                </div>
              </div>

              <!-- Guests Input -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">
                  Guests
                </label>
                <UInput
                  v-model.number="guests"
                  type="number"
                  :min="venue?.min_capacity || 1"
                  :max="venue?.max_capacity || 100"
                  size="xl"
                  placeholder="Number of guests"
                  class="[&_input::-webkit-outer-spin-button]:appearance-none [&_input::-webkit-inner-spin-button]:appearance-none [&_input]:[-moz-appearance:textfield]"
                  @keydown="preventInvalidChars"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Min: {{ venue?.min_capacity || 1 }}, Max:
                  {{ venue?.max_capacity || 100 }}
                </p>
              </div>

              <!-- Accommodation Input -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">
                  Accommodation needed
                </label>
                <UInput
                  v-model.number="accommodation"
                  type="number"
                  :min="0"
                  :max="guests"
                  size="xl"
                  placeholder="Number of people needing accommodation"
                  class="[&_input::-webkit-outer-spin-button]:appearance-none [&_input::-webkit-inner-spin-button]:appearance-none [&_input]:[-moz-appearance:textfield]"
                  @keydown="preventInvalidChars"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Maximum: {{ guests }} (number of guests)
                </p>
              </div>
            </div>
          </UCard>

          <!-- Step 2: Message to Host -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">
                2. Message to host (optional)
              </h2>
            </template>

            <div class="rounded-lg border border-gray-300 p-4">
              <textarea
                v-model="message"
                placeholder="Tell the host about your event, special requirements, or any questions you have..."
                rows="6"
                class="w-full border-0 focus:outline-none focus:ring-0 resize-none"
              />
            </div>
          </UCard>

          <!-- Step 3: Review -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">3. Review your request</h2>
            </template>

            <div class="space-y-4">
              <!-- Cancellation Policy -->
              <div
                v-if="venue?.cancellation_policy"
                class="rounded-lg bg-gray-50 p-4"
              >
                <h3 class="font-semibold text-gray-900 mb-2">
                  Cancellation policy
                </h3>
                <p class="text-sm text-gray-600">
                  Cancel within
                  {{ venue.cancellation_policy.refundableDays }} hours for a
                  full refund. Cancel at least
                  {{ venue.cancellation_policy.partialRefundDays }} days before
                  for a {{ venue.cancellation_policy.partialRefundPercentage }}%
                  refund.
                </p>
              </div>

              <!-- Terms -->
              <div class="text-xs text-gray-500">
                By selecting the button below, I agree to the Host's House
                Rules, Ground rules for guests, and the cancellation policy.
              </div>
            </div>
          </UCard>

          <!-- Submit Button -->
          <UButton
            block
            size="xl"
            color="primary"
            class="cursor-pointer"
            :loading="isSubmitting"
            :disabled="!dates?.start || !dates?.end || isSubmitting"
            @click="submitRequest"
          >
            Request to book
          </UButton>

          <p class="text-center text-sm text-gray-600">
            You won't be charged to request
          </p>
        </div>

        <!-- Right Column - Venue Summary -->
        <div class="lg:sticky lg:top-24 h-fit">
          <UCard>
            <div class="space-y-6">
              <!-- Venue Info -->
              <div class="flex gap-4">
                <NuxtImg
                  v-if="venue?.photos?.[0]"
                  :src="venue.photos[0]"
                  alt="Venue"
                  class="h-24 w-24 rounded-lg object-cover"
                  width="96"
                  height="96"
                />
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">
                    {{ venue?.venue_name }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    {{ venue?.company_name }}
                  </p>
                </div>
              </div>

              <UDivider />

              <!-- Selected Details -->
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm font-medium text-gray-900">Dates</span>
                  <span class="text-sm text-gray-600">{{ dateRangeText }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm font-medium text-gray-900">Guests</span>
                  <span class="text-sm text-gray-600">{{ guests }} guests</span>
                </div>
                <div v-if="accommodation > 0" class="flex justify-between">
                  <span class="text-sm font-medium text-gray-900"
                    >Accommodation</span
                  >
                  <span class="text-sm text-gray-600"
                    >{{ accommodation }} people</span
                  >
                </div>
              </div>

              <UDivider />

              <!-- Price Breakdown -->
              <div class="space-y-3">
                <h3 class="font-semibold text-gray-900">Price details</h3>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600"
                    >R{{ venue?.price }} x {{ nightsCount }} nights</span
                  >
                  <span class="text-gray-900">R{{ subtotal }} ZAR</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Service fee</span>
                  <span class="text-gray-900">R{{ serviceFee }} ZAR</span>
                </div>
              </div>

              <UDivider />

              <!-- Total -->
              <div class="flex justify-between">
                <span class="font-semibold text-gray-900">Total ZAR</span>
                <span class="font-semibold text-gray-900"
                  >R{{ total }} ZAR</span
                >
              </div>

              <!-- Notice -->
              <div
                v-if="venue?.notice_required"
                class="flex items-start gap-2 rounded-lg bg-purple-50 p-3"
              >
                <UIcon
                  name="i-heroicons-information-circle"
                  class="h-5 w-5 flex-shrink-0 text-purple-600"
                />
                <p class="text-xs text-purple-900">
                  This venue requires {{ venue.notice_required }} days advance
                  notice for bookings.
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
