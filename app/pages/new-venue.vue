<script setup lang="ts">
import type { VenueFormData } from "@/types/venue";
import VenueCategoryStep from "@/components/Venue/VenueCategoryStep.vue";
import VenueTypeStep from "@/components/Venue/VenueTypeStep.vue";
import EventTypesStep from "@/components/Venue/EventTypesStep.vue";
import DetailsStep from "@/components/Venue/DetailsStep.vue";
import LocationStep from "@/components/Venue/LocationStep.vue";
import MediaStep from "@/components/Venue/MediaStep.vue";
import ExtrasStep from "@/components/Venue/ExtrasStep.vue";
import BookingRequirements from "@/components/Venue/BookingReqsStep.vue";
import AuthModal from "@/components/Auth/AuthModal.vue"; // Import your auth modal
import { useAuth } from "~/stores/auth";
import { v4 as uuidv4 } from "uuid";

definePageMeta({
  layout: "blank",
});

const tempVenueId = ref(uuidv4());

const supabase = useSupabaseClient();
const auth = useAuth();

const formData = ref<VenueFormData>({
  venueCategory: null,
  venueType: null,
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
    enabled: false,
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

const steps = [
  {
    id: 0,
    title: "Venue Category",
    description: "Is this a wedding venue or a general venue?",
    icon: "i-lucide-tag",
  },
  {
    id: 1,
    title: "Venue Type",
    description: "What type of venue is this?",
    icon: "i-lucide-layers",
  },
  {
    id: 2,
    title: "Event Types",
    description: "What types of events can your venue host?",
    icon: "i-lucide-calendar-range",
  },
  {
    id: 3,
    title: "Venue Details",
    description: "Basic information about your venue",
    icon: "i-lucide-building",
  },
  {
    id: 4,
    title: "Location",
    description: "Where is your venue located",
    icon: "i-lucide-map-pin",
  },
  {
    id: 5,
    title: "Booking Requirements",
    description: "Nitty Gritty Details for booking your venue",
    icon: "i-lucide-check-circle",
  },
  {
    id: 6,
    title: "Extras and Amenities",
    description: "Additional amenities and services",
    icon: "i-lucide-sparkles",
  },
  {
    id: 7,
    title: "Photos",
    description: "Upload photos of your venue",
    icon: "i-lucide-camera",
  },
];

const currentStepInfo = computed(() => steps[currentStep.value]);

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
    const { error } = await supabase.from("venues").insert([
      {
        venue_name: formData.value.venueName,
        company_name: formData.value.companyName,
        description: formData.value.description,
        selected_province: formData.value.selectedProvince,
        event_types: formData.value.eventTypes,
        min_capacity: parseInt(formData.value.minCapacity.toString()),
        max_capacity: parseInt(formData.value.maxCapacity.toString()),
        price: parseFloat(formData.value.price.toString()),
        minimum_hours: parseInt(formData.value.minimumHours.toString()) || 0,
        notice_required:
          parseInt(formData.value.noticeRequired.toString()) || 0,
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
          peak:
            parseFloat(formData.value.seasonalPricing?.peak.toString()) || 0,
          off_peak:
            parseFloat(formData.value.seasonalPricing?.offPeak.toString()) || 0,
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
          tables: parseInt(formData.value.amenities?.tables.toString()) || 0,
          chairs: parseInt(formData.value.amenities?.chairs.toString()) || 0,
          custom_amenities: formData.value.amenities?.customAmenities ?? [],
        },
      },
    ]);

    if (error) throw error;

    // Clear the pending submission flag
    pendingSubmission.value = false;

    // Clear the draft after successful submission
    clearDraft();

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

// Navigation functions
const goToNextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const goToPrevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const hasNext = computed(() => currentStep.value < steps.length - 1);
const hasPrev = computed(() => currentStep.value > 0);

// Calculate progress percentage
const progressPercentage = computed(() => {
  return ((currentStep.value + 1) / steps.length) * 100;
});

// LocalStorage draft management
const DRAFT_KEY = "venue-form-draft";
const DRAFT_TIMESTAMP_KEY = "venue-form-draft-timestamp";
const DRAFT_STEP_KEY = "venue-form-draft-step";

const toast = useToast();

// Save draft to localStorage
const saveDraft = () => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData.value));
    localStorage.setItem(DRAFT_TIMESTAMP_KEY, new Date().toISOString());
    localStorage.setItem(DRAFT_STEP_KEY, currentStep.value.toString());
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
};

// Clear draft from localStorage
const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
  localStorage.removeItem(DRAFT_STEP_KEY);
};

// Restore draft from localStorage
const restoreDraft = () => {
  try {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    const savedStep = localStorage.getItem(DRAFT_STEP_KEY);
    const savedTimestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);

    if (savedDraft && savedTimestamp) {
      formData.value = JSON.parse(savedDraft);
      if (savedStep) {
        currentStep.value = parseInt(savedStep);
      }

      // Format the timestamp
      const draftDate = new Date(savedTimestamp);
      const now = new Date();
      const diffMs = now.getTime() - draftDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo = "";
      if (diffMins < 1) {
        timeAgo = "just now";
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      } else {
        timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      }

      toast.add({
        title: "Draft Restored",
        description: `Your previous draft from ${timeAgo} has been restored.`,
        color: "primary",
      });
    }
  } catch (error) {
    console.error("Failed to restore draft:", error);
  }
};

// Watch formData and save to localStorage (debounced)
let saveTimeout: NodeJS.Timeout | null = null;
watch(
  formData,
  () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveDraft();
    }, 1000); // Debounce for 1 second
  },
  { deep: true },
);

// Watch current step and save to localStorage
watch(currentStep, () => {
  saveDraft();
});

// Restore draft on mount
onMounted(async () => {
  restoreDraft();

  // Set user as vendor when they visit the new venue page
  if (auth.loggedIn) {
    await auth.setVendorStatus();
  }
});

// Watch for authentication changes - only auto-submit if we have a pending submission
watch([() => auth.loggedIn, () => auth.modal], ([loggedIn, modalOpen]) => {
  // Only auto-submit if user just logged in, modal closed, and we have pending submission
  if (loggedIn && !modalOpen && pendingSubmission.value) {
    SubmitVenue();
  }
});

// Expose clearDraft to be called from layout
provide("clearDraft", clearDraft);
</script>

<template>
  <div class="pb-32">
    <div class="px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="max-w-3xl mx-auto text-center mb-8 mt-8">
        <div class="flex items-center justify-center gap-3 mb-4">
          <UIcon :name="currentStepInfo.icon" class="w-8 h-8 text-primary" />
          <h1 class="text-3xl sm:text-4xl font-bold">
            {{ currentStepInfo.title }}
          </h1>
        </div>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          {{ currentStepInfo.description }}
        </p>
      </div>

      <!-- Step Content -->
      <div class="max-w-7xl mx-auto">
        <VenueCategoryStep
          v-if="currentStep === 0"
          :form-data="formData"
          @update:form-data="formData = $event"
          @next="goToNextStep"
        />

        <VenueTypeStep
          v-if="currentStep === 1"
          :form-data="formData"
          @update:form-data="formData = $event"
          @next="goToNextStep"
        />

        <EventTypesStep
          v-if="currentStep === 2"
          :form-data="formData"
          @update:form-data="formData = $event"
        />

        <DetailsStep
          v-if="currentStep === 3"
          :form-data="formData"
          @update:form-data="formData = $event"
        />

        <LocationStep
          v-if="currentStep === 4"
          :form-data="formData"
          @update:form-data="formData = $event"
        />

        <BookingRequirements
          v-if="currentStep === 5"
          :form-data="formData"
          @update:form-data="(newData) => (formData = newData)"
        />

        <ExtrasStep
          v-if="currentStep === 6"
          :form-data="formData"
          @update:form-data="formData = $event"
        />

        <MediaStep
          v-if="currentStep === 7"
          :form-data="formData"
          :id="tempVenueId"
          @update:form-data="formData = $event"
        />
      </div>
    </div>

    <!-- Sticky footer with navigation buttons -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 shadow-lg"
    >
      <!-- Progress Bar -->
      <UProgress :model-value="progressPercentage" color="primary" size="md" />

      <div class="max-w-7xl mx-auto px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <UButton
            leading-icon="i-lucide-arrow-left"
            :disabled="!hasPrev"
            class="cursor-pointer"
            size="lg"
            @click="goToPrevStep"
          >
            Previous
          </UButton>

          <UButton
            v-if="hasNext"
            trailing-icon="i-lucide-arrow-right"
            class="cursor-pointer"
            size="lg"
            @click="goToNextStep"
          >
            Next
          </UButton>

          <UButton
            v-else
            trailing-icon="i-lucide-check"
            class="cursor-pointer"
            size="lg"
            :disabled="isSubmitting"
            @click="checkAuthAndSubmit()"
          >
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit</span>
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
