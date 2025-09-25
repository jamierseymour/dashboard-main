<script setup lang="ts">
import type { VenueFormData } from "@/types/venue";
import DetailsStep from "@/components/Venue/DetailsStep.vue";
import LocationStep from "@/components/Venue/LocationStep.vue";
import MediaStep from "@/components/Venue/MediaStep.vue";
import ExtrasStep from "@/components/Venue/ExtrasStep.vue";
import BookingRequirements from "@/components/Venue/BookingReqsStep.vue";
import AuthModal from "@/components/Auth/AuthModal.vue"; // Import your auth modal
import { useAuth } from "~/stores/auth";

const supabase = useSupabaseClient();
const auth = useAuth();

const formData = ref<VenueFormData>({
  photos: [],
  description: "",
  venueName: "",
  minCapacity: "",
  maxCapacity: "",
  companyName: "",
  price: "",
  selectedProvince: null,
  provinces: null,
  eventTypes: [],
  address: "",
  minimumHours: "",
  noticeRequired: "",
  // Initialize cancellationPolicy with default values
  cancellationPolicy: {
    refundableDays: "",
    partialRefundDays: "",
    partialRefundPercentage: "",
    nonRefundableDays: "",
  },
  // Initialize seasonalPricing with default values
  seasonalPricing: {
    peak: "",
    offPeak: "",
    peakMonths: [],
  },
  // Initialize amenities with default values
  amenities: {
    wifi: false,
    kitchen: false,
    stage: false,
    bar: false,
    soundSystem: false,
    lighting: false,
    projector: false,
    microphone: false,
    airConditioning: false, // Corrected typo
    heating: false,
    danceFloor: false,
    outdoorSpace: false,
    indoorSpace: false,
    tables: "",
    chairs: "",
    customAmenities: [],
  },
});

// Track current step
const currentStep = ref(0);
const isSubmitting = ref(false);
const pendingSubmission = ref(false);

const items = [
  {
    slot: "details",
    title: "Venue Details",
    description: "Basic information about your venue",
    icon: "i-lucide-building",
  },
  {
    slot: "location",
    title: "Location",
    description: "Where is your venue located",
    icon: "i-lucide-map-pin",
  },
  {
    slot: "booking",
    title: "Booking Requirements",
    description: "Nitty Gritty Details for booking your venue",
    icon: "i-lucide-check-circle",
  },
  {
    slot: "extras",
    title: "Extras and Amenities",
    description: "Additional amenities and services",
    icon: "i-lucide-sparkles",
  },
  {
    slot: "media",
    title: "Photos",
    description: "Upload photos of your venue",
    icon: "i-lucide-camera",
  },
];

// Check authentication status
const checkAuthAndSubmit = async () => {
  // Check if user is logged in using the new loggedIn state
  if (!auth.loggedIn) {
    // Set flag to indicate we want to submit after login
    pendingSubmission.value = true;
    // Open auth modal for login/signup
    auth.toggleModal(true);
    return;
  }

  // User is authenticated, proceed with submission
  await SubmitVenue();
};

const SubmitVenue = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    // Prepare the data for Supabase
    // @ts-ignore - Supabase type configuration issue
    const { data, error } = await supabase.from("venues").insert([
      {
        venue_name: formData.value.venueName,
        company_name: formData.value.companyName,
        description: formData.value.description,
        selected_province: formData.value.selectedProvince,
        event_types: formData.value.eventTypes,
        min_capacity: parseInt(formData.value.minCapacity),
        max_capacity: parseInt(formData.value.maxCapacity),
        price: parseFloat(formData.value.price),
        minimum_hours: parseInt(formData.value.minimumHours) || 0,
        notice_required: parseInt(formData.value.noticeRequired) || 0,
        cancellation_policy: formData.value.cancellationPolicy,
        photos: formData.value.photos,
        provinces: formData.value.provinces,
        address: formData.value.address,
        // Add structured address data
        address_line_1:
          formData.value.structuredAddress?.address_line_1 || null,
        address_line_2:
          formData.value.structuredAddress?.address_line_2 || null,
        city: formData.value.structuredAddress?.city || null,
        state_province:
          formData.value.structuredAddress?.state_province || null,
        postal_code: formData.value.structuredAddress?.postal_code || null,
        country: formData.value.structuredAddress?.country || "ZA",
        latitude: formData.value.structuredAddress?.latitude || null,
        longitude: formData.value.structuredAddress?.longitude || null,
        google_place_id:
          formData.value.structuredAddress?.google_place_id || null,
        formatted_address:
          formData.value.structuredAddress?.formatted_address || null,
        address_components:
          formData.value.structuredAddress?.address_components || null,
        place_types: formData.value.structuredAddress?.place_types || null,
        user_id: auth.user?.id, // Add the user ID to associate the venue with the user
        // Add seasonal pricing data
        seasonal_pricing: {
          peak: parseFloat(formData.value.seasonalPricing?.peak) || 0,
          off_peak: parseFloat(formData.value.seasonalPricing?.offPeak) || 0,
          peak_months: formData.value.seasonalPricing?.peakMonths ?? [],
        },

        // Add amenities data with fallback
        amenities: {
          wifi: formData.value.amenities?.wifi ?? false,
          kitchen: formData.value.amenities?.kitchen ?? false,
          stage: formData.value.amenities?.stage ?? false,
          bar: formData.value.amenities?.bar ?? false,
          sound_system: formData.value.amenities?.soundSystem ?? false,
          lighting: formData.value.amenities?.lighting ?? false,
          projector: formData.value.amenities?.projector ?? false,
          microphone: formData.value.amenities?.microphone ?? false,
          air_conditioning: formData.value.amenities?.airConditioning ?? false,
          heating: formData.value.amenities?.heating ?? false,
          dance_floor: formData.value.amenities?.danceFloor ?? false,
          outdoor_space: formData.value.amenities?.outdoorSpace ?? false,
          indoor_space: formData.value.amenities?.indoorSpace ?? false,
          tables: parseInt(formData.value.amenities?.tables) || 0,
          chairs: parseInt(formData.value.amenities?.chairs) || 0,
          custom_amenities: formData.value.amenities?.customAmenities ?? [],
        },
      },
    ]);

    if (error) throw error;

    // Clear the pending submission flag
    pendingSubmission.value = false;

    // Show success message and redirect
    useToast().add({
      title: "Success!",
      description: "Your venue has been submitted successfully.",
      color: "success",
    });

    // Redirect to dashboard or venue list
    await navigateTo("/dashboard");
  } catch (error) {
    console.error("Error submitting venue:", error);
    // Clear the pending submission flag on error too
    pendingSubmission.value = false;

    // Show error message to user
    useToast().add({
      title: "Error",
      description: "Failed to submit venue. Please try again.",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

const stepper = useTemplateRef("stepper");

// Watch for authentication changes - only auto-submit if we have a pending submission
watch([() => auth.loggedIn, () => auth.modal], ([loggedIn, modalOpen]) => {
  // Only auto-submit if user just logged in, modal closed, and we have pending submission
  if (loggedIn && !modalOpen && pendingSubmission.value) {
    SubmitVenue();
  }
});
</script>

<template>
  <div class="mt-24">
    <UStepper ref="stepper" v-model="currentStep" :items="items" class="w-full">
      <template #details>
        <DetailsStep
          :form-data="formData"
          @update:form-data="formData = $event"
        />
      </template>

      <template #location>
        <LocationStep
          :form-data="formData"
          @update:form-data="formData = $event"
        />
      </template>

      <template #booking>
        <BookingRequirements
          :form-data="formData"
          @update:form-data="(newData) => (formData = newData)"
        />
      </template>

      <template #extras>
        <ExtrasStep
          :form-data="formData"
          @update:form-data="formData = $event"
        />
      </template>

      <template #media>
        <MediaStep
          :form-data="formData"
          @update:form-data="formData = $event"
        />
      </template>
    </UStepper>

    <div class="flex items-center justify-center mt-4">
      <div class="flex justify-between w-full max-w-1/2">
        <UButton
          leading-icon="i-lucide-arrow-left"
          :disabled="!stepper?.hasPrev"
          class="cursor-pointer"
          @click="stepper?.prev()"
        >
          Prev
        </UButton>

        <UButton
          v-if="stepper?.hasNext"
          trailing-icon="i-lucide-arrow-right"
          :disabled="!stepper?.hasNext"
          class="cursor-pointer"
          @click="stepper?.next()"
        >
          Next
        </UButton>

        <UButton
          v-else
          trailing-icon="i-lucide-arrow-right"
          class="cursor-pointer"
          :disabled="isSubmitting"
          @click="checkAuthAndSubmit()"
        >
          <span v-if="isSubmitting">Submitting...</span>
          <span v-else>Submit</span>
        </UButton>
      </div>
    </div>
  </div>
</template>
