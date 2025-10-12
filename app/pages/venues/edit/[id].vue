<script setup lang="ts">
import type { VenueFormData, Province, EventType } from "~/types/venue";
import GoogleAutocomplete from "~/components/Form/GoogleAutocomplete.vue";
import ImageUploader from "~/components/Form/ImageUploader.vue";

definePageMeta({
  layout: "vendor",
  middleware: "auth",
});

const client = useSupabaseClient();
const route = useRoute();
const toast = useToast();
const router = useRouter();

const venueId = route.params.id as string;
const loading = ref(false);
const saving = ref(false);
const showSuccessModal = ref(false);

// Initialize form with default values
const form = reactive<VenueFormData>({
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
  minimumHours: 4,
  noticeRequired: 7,
  amenities: {
    wifi: false,
    kitchen: false,
    stage: false,
    bar: false,
    soundSystem: false,
    lighting: false,
    projector: false,
    microphone: false,
    airConditioning: false,
    heating: false,
    tables: 0,
    chairs: 0,
    danceFloor: false,
    outdoorSpace: false,
    indoorSpace: false,
    customAmenities: [],
  },
  cancellationPolicy: {
    refundableDays: 30,
    partialRefundDays: 14,
    partialRefundPercentage: 50,
    nonRefundableDays: 7,
  },
  seasonalPricing: {
    peak: 0,
    offPeak: 0,
    peakMonths: [],
  },
});

const originalForm = ref<VenueFormData | null>(null);

// Event type options
const availableEventTypes: { label: string; value: EventType }[] = [
  { label: "Wedding", value: "Wedding" },
  { label: "Conference", value: "Conference" },
  { label: "Corporate Event", value: "Corporate Event" },
  { label: "Birthday", value: "Birthday" },
  { label: "Corporate", value: "Corporate" },
  { label: "Concert", value: "Concert" },
  { label: "Exhibition", value: "Exhibition" },
  { label: "Workshop", value: "Workshop" },
  { label: "Social", value: "Social" },
  { label: "Private Party", value: "Private Party" },
  { label: "Team Building", value: "Team Building" },
  { label: "Other", value: "Other" },
];

const isFieldEdited = (fieldPath: string) => {
  if (!originalForm.value) return false;

  const keys = fieldPath.split(".");
  let original: any = originalForm.value;
  let current: any = form;

  for (const key of keys) {
    original = original?.[key];
    current = current?.[key];
  }

  return original !== current;
};

// Fetch venue data
const fetchVenueData = async () => {
  loading.value = true;
  try {
    const { data, error } = await client
      .from("venues")
      .select("*")
      .eq("id", venueId)
      .single();

    console.log("Fetched venue data:", data);

    if (error) throw error;
    if (!data) throw new Error("Venue not found");

    // Parse event types
    const parsedEventTypes =
      data.event_types?.map((type: any) => {
        if (typeof type === "string") {
          try {
            const parsed = JSON.parse(type);
            return parsed.value || parsed;
          } catch {
            return type;
          }
        }
        return type?.value || type;
      }) || [];

    // Parse selected province - handle different formats
    let selectedProvinceValue = null;
    if (data.selected_province) {
      if (typeof data.selected_province === "string") {
        try {
          const parsed = JSON.parse(data.selected_province);
          selectedProvinceValue = parsed.value || parsed.label || parsed;
        } catch {
          selectedProvinceValue = data.selected_province;
        }
      } else {
        selectedProvinceValue =
          data.selected_province.value ||
          data.selected_province.label ||
          data.selected_province;
      }
    }

    // Map database values to form
    form.photos = data.photos || [];
    form.description = data.description || "";
    form.venueName = data.venue_name || "";
    form.minCapacity = data.min_capacity?.toString() || "";
    form.maxCapacity = data.max_capacity?.toString() || "";
    form.companyName = data.company_name || "";
    form.price = data.price?.toString() || "";

    // Set selected province - ensure it matches the options format
    form.selectedProvince = selectedProvinceValue;
    form.provinces = selectedProvinceValue;

    form.eventTypes = parsedEventTypes;
    form.address = data.address || "";
    form.minimumHours = data.minimum_hours || 4;
    form.noticeRequired = data.notice_required || 7;

    // Parse amenities with proper defaults
    if (data.amenities) {
      form.amenities = {
        wifi: data.amenities.wifi || false,
        kitchen: data.amenities.kitchen || false,
        stage: data.amenities.stage || false,
        bar: data.amenities.bar || false,
        soundSystem:
          data.amenities.sound_system || data.amenities.soundSystem || false,
        lighting: data.amenities.lighting || false,
        projector: data.amenities.projector || false,
        microphone: data.amenities.microphone || false,
        airConditioning:
          data.amenities.air_conditioning ||
          data.amenities.airConditioning ||
          false,
        heating: data.amenities.heating || false,
        tables: data.amenities.tables || 0,
        chairs: data.amenities.chairs || 0,
        danceFloor:
          data.amenities.dance_floor || data.amenities.danceFloor || false,
        outdoorSpace:
          data.amenities.outdoor_space || data.amenities.outdoorSpace || false,
        indoorSpace:
          data.amenities.indoor_space || data.amenities.indoorSpace || false,
        customAmenities:
          data.amenities.custom_amenities ||
          data.amenities.customAmenities ||
          [],
      };
    }

    // Parse seasonal pricing
    if (data.seasonal_pricing) {
      form.seasonalPricing = {
        peak: data.seasonal_pricing.peak || 0,
        offPeak: data.seasonal_pricing.off_peak || 0,
        peakMonths: data.seasonal_pricing.peak_months || [],
      };
    }

    const getChangedFields = () => {
      if (!originalForm.value) return [];
      const changed: string[] = [];

      const compare = (current: any, original: any, prefix = "") => {
        Object.keys(current).forEach((key) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (typeof current[key] === "object" && current[key] !== null) {
            compare(current[key], original[key] || {}, fullKey);
          } else if (current[key] !== original[key]) {
            changed.push(fullKey);
          }
        });
      };

      compare(form, originalForm.value);
      return changed;
    };

    // Parse cancellation policy
    if (data.cancellation_policy) {
      form.cancellationPolicy = {
        refundableDays: data.cancellation_policy.refundableDays || 30,
        partialRefundDays: data.cancellation_policy.partialRefundDays || 14,
        partialRefundPercentage:
          data.cancellation_policy.partialRefundPercentage || 50,
        nonRefundableDays: data.cancellation_policy.nonRefundableDays || 7,
      };
    }

    originalForm.value = JSON.parse(JSON.stringify(form));
  } catch (error: any) {
    console.error("Error fetching venue:", error);
    toast.add({
      title: "Error",
      description: "Failed to load venue data",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const getChangedFields = () => {
  if (!originalForm.value) return [];
  const changed: string[] = [];

  const compare = (current: any, original: any, prefix = "") => {
    Object.keys(current).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof current[key] === "object" && current[key] !== null) {
        compare(current[key], original[key] || {}, fullKey);
      } else if (current[key] !== original[key]) {
        changed.push(fullKey);
      }
    });
  };

  compare(form, originalForm.value);
  return changed;
};

// Enhanced save venue function with proper debugging and user feedback
const saveVenue = async () => {
  console.log("🚀 Starting venue save process");
  console.log("📋 Current form data:", JSON.stringify(form, null, 2));

  // Validate required fields before saving
  const requiredFields = {
    venueName: form.venueName,
    description: form.description,
    minCapacity: form.minCapacity,
    maxCapacity: form.maxCapacity,
    price: form.price,
    address: form.address,
  };

  console.log("✅ Checking required fields:", requiredFields);

  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => !value || value === "")
    .map(([key]) => key);

  if (missingFields.length > 0) {
    console.error("❌ Missing required fields:", missingFields);
    toast.add({
      title: "Validation Error",
      description: `Please fill in the following required fields: ${missingFields.join(
        ", ",
      )}`,
      color: "error",
      timeout: 5000,
    });
    return;
  }

  saving.value = true;
  console.log("💾 Setting saving state to true");

  // Create a timeout to prevent indefinite spinning
  const timeoutId = setTimeout(() => {
    console.warn("⏰ Save operation timed out after 30 seconds");
    saving.value = false;
    toast.add({
      title: "Request Timeout",
      description: "The save operation took too long. Please try again.",
      color: "error",
      timeout: 8000,
    });
  }, 30000); // 30 second timeout

  try {
    console.log("📦 Preparing venue data for Supabase...");

    // Validate and parse numeric values
    const parsedMinCapacity = parseInt(form.minCapacity);
    const parsedMaxCapacity = parseInt(form.maxCapacity);
    const parsedPrice = parseFloat(form.price);

    console.log("🔢 Parsed numeric values:", {
      minCapacity: parsedMinCapacity,
      maxCapacity: parsedMaxCapacity,
      price: parsedPrice,
    });

    if (isNaN(parsedMinCapacity) || parsedMinCapacity < 0) {
      throw new Error("Invalid minimum capacity value");
    }
    if (isNaN(parsedMaxCapacity) || parsedMaxCapacity < 0) {
      throw new Error("Invalid maximum capacity value");
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw new Error("Invalid price value");
    }
    if (parsedMinCapacity > parsedMaxCapacity) {
      throw new Error(
        "Minimum capacity cannot be greater than maximum capacity",
      );
    }

    // Format data for Supabase
    const venueData = {
      venue_name: form.venueName.trim(),
      description: form.description.trim(),
      company_name: form.companyName?.trim() || null,
      min_capacity: parsedMinCapacity,
      max_capacity: parsedMaxCapacity,
      price: parsedPrice,
      address: form.address.trim(),
      selected_province:
        typeof form.selectedProvince === "string"
          ? form.selectedProvince
          : JSON.stringify({
              label: form.selectedProvince,
              value: form.selectedProvince,
            }),
      provinces: form.provinces,
      event_types: form.eventTypes.map((type) =>
        JSON.stringify({ label: type, value: type }),
      ),
      photos: form.photos || [],
      minimum_hours: form.minimumHours || 4,
      notice_required: form.noticeRequired || 7,
      amenities: {
        ...form.amenities,
        // Ensure numeric values are properly handled
        tables: parseInt(form.amenities.tables?.toString() || "0") || 0,
        chairs: parseInt(form.amenities.chairs?.toString() || "0") || 0,
      },
      seasonal_pricing: {
        peak: parseFloat(form.seasonalPricing?.peak?.toString() || "0") || 0,
        off_peak:
          parseFloat(form.seasonalPricing?.offPeak?.toString() || "0") || 0,
        peak_months: form.seasonalPricing?.peakMonths || [],
      },
      cancellation_policy: {
        refundableDays:
          parseInt(
            form.cancellationPolicy?.refundableDays?.toString() || "30",
          ) || 30,
        partialRefundDays:
          parseInt(
            form.cancellationPolicy?.partialRefundDays?.toString() || "14",
          ) || 14,
        partialRefundPercentage:
          parseInt(
            form.cancellationPolicy?.partialRefundPercentage?.toString() ||
              "50",
          ) || 50,
        nonRefundableDays:
          parseInt(
            form.cancellationPolicy?.nonRefundableDays?.toString() || "7",
          ) || 7,
      },
      updated_at: new Date().toISOString(),
    };

    console.log(
      "📋 Final venue data to be sent:",
      JSON.stringify(venueData, null, 2),
    );
    console.log("🎯 Updating venue with ID:", venueId);
    console.log("🗄️ Using Supabase client:", !!client);

    const changedFields = getChangedFields();
    if (changedFields.length > 0) {
      toast.add({
        title: "Changes detected",
        description: `You have modified: ${changedFields.join(", ")}`,
        color: "blue",
        timeout: 5000,
      });
    }

    // Show progress toast
    const progressToast = toast.add({
      title: "Saving Changes",
      description: "Updating venue information...",
      color: "blue",
      timeout: 0, // Don't auto-dismiss
      loading: true,
    });

    console.log("⬆️ Sending update request to Supabase...");

    const { data, error } = await client
      .from("venues")
      .update(venueData)
      .eq("id", venueId)
      .select(); // Add select to get the updated data back

    console.log("📨 Supabase response received");
    console.log("📊 Response data:", data);
    console.log("❌ Response error:", error);

    // Clear timeout since operation completed
    clearTimeout(timeoutId);

    // Remove progress toast
    toast.remove(progressToast);

    if (error) {
      console.error("💥 Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      let errorMessage = "Failed to update venue";

      // Provide specific error messages based on error type
      if (error.code === "23505") {
        errorMessage = "A venue with this name already exists";
      } else if (error.code === "23502") {
        errorMessage = "Missing required information";
      } else if (error.code === "23514") {
        errorMessage = "Invalid data format";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.add({
        title: "Save Failed",
        description: errorMessage,
        color: "red",
        timeout: 8000,
      });

      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ No data returned from update operation");
      toast.add({
        title: "Warning",
        description: "Update completed but no confirmation received",
        color: "yellow",
        timeout: 5000,
      });
    } else {
      console.log("✅ Venue updated successfully:", data[0]);
    }

    // Show success notification
    toast.add({
      title: "Success!",
      description: `Venue "${form.venueName}" has been updated successfully`,
      color: "green",
      timeout: 5000,
    });

    console.log("🎉 Save operation completed successfully");

    // Optional: Show success modal or redirect
    // showSuccessModal.value = true;
  } catch (error: any) {
    console.error("💥 Error in save operation:", error);
    console.error("📊 Error stack:", error.stack);

    // Clear timeout if still active
    clearTimeout(timeoutId);

    let userFriendlyMessage = "An unexpected error occurred while saving";

    if (error.message?.includes("Invalid")) {
      userFriendlyMessage = error.message;
    } else if (error.message?.includes("network")) {
      userFriendlyMessage =
        "Network error. Please check your connection and try again";
    } else if (error.message?.includes("timeout")) {
      userFriendlyMessage = "The operation timed out. Please try again";
    }

    toast.add({
      title: "Error",
      description: userFriendlyMessage,
      color: "red",
      timeout: 8000,
    });
  } finally {
    console.log("🏁 Save operation finished, setting saving state to false");
    saving.value = false;
  }
};

// Handle navigation from success modal
const goToDashboard = () => {
  showSuccessModal.value = false;
  router.push("/venues");
};

const viewVenue = () => {
  showSuccessModal.value = false;
  router.push(`/venues/${venueId}`);
};

// Close modal without navigation
const closeModal = () => {
  showSuccessModal.value = false;
};

// Handle photo update
const handlePhotoUpdate = (updatedPhotos: string[]) => {
  console.log("📸 Photos updated:", updatedPhotos);
  form.photos = updatedPhotos;
};

// Fetch venue data on page load
onMounted(() => {
  // Explicitly reset modal state on page load
  showSuccessModal.value = false;
  fetchVenueData();
});

// Watch for route changes and reset modal state
watch(
  () => route.path,
  () => {
    showSuccessModal.value = false;
  },
  { immediate: true },
);

// Reset modal state when component unmounts
onUnmounted(() => {
  showSuccessModal.value = false;
});

// Address selection handler
const onAddressSelected = (place: any) => {
  form.address = place.formatted_address;
};

// Address input changed handler
const onAddressInputChanged = (input: string) => {
  form.address = input;
};
</script>

<template>
  <div class="bg-white p-4 md:p-8">
    <UContainer>
      <!-- Header -->
      <div class="mb-8">
        <UBreadcrumb
          :links="[
            { label: 'Venues', to: '/venues' },
            { label: 'Edit Venue', to: '', disabled: true },
          ]"
        />
        <div class="flex items-center justify-between mt-4">
          <h1 class="text-2xl font-bold">Edit Venue: {{ form.venueName }}</h1>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin h-8 w-8 text-gray-400"
        />
      </div>

      <!-- Main content -->
      <div v-else class="space-y-8">
        <!-- Basic Information Section -->
        <UCard>
          <template #header>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-information-circle" class="h-5 w-5" />
              <span class="font-medium">Basic Information</span>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Venue Name and Company Name Row -->
            <div class="flex flex-col lg:flex-row gap-4">
              <div class="flex-1">
                <UFormGroup label="Venue Name" required>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Venue Name: {{ form.venueName || "Not set" }}
                  </div>
                  <UInput
                    v-model="form.venueName"
                    placeholder="Enter venue name"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
              <div class="flex-1">
                <UFormGroup label="Company Name">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Company Name: {{ form.companyName || "Not set" }}
                  </div>
                  <UInput
                    v-model="form.companyName"
                    placeholder="Enter company name"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
            </div>

            <!-- Address and Province Row -->
            <div class="flex flex-col lg:flex-row gap-4">
              <div class="flex-1">
                <UFormGroup label="Address" required>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Address: {{ form.address || "Not set" }}
                  </div>
                  <GoogleAutocomplete
                    placeholder="Search for venue address..."
                    :component-restrictions="{ country: 'za' }"
                    :location-bias="{ lat: -26.2041, lng: 28.0473 }"
                    @place-selected="onAddressSelected"
                    @input-changed="onAddressInputChanged"
                  />
                </UFormGroup>
              </div>
              <!-- <div class="flex-1">
                <UFormGroup label="Province" required>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Province: {{ form.selectedProvince || "Not set" }}
                  </div>
                  <USelectMenu
                    v-model="form.selectedProvince"
                    :options="provinceOptions"
                    placeholder="Select province"
                    class="w-full"
                  />
                </UFormGroup>
              </div> -->
            </div>

            <!-- Description -->
            <UFormGroup label="Description" required>
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Description: {{ form.description || "Not set" }}
              </div>
              <UTextarea
                v-model="form.description"
                placeholder="Describe your venue..."
                rows="4"
                class="w-full"
              />
            </UFormGroup>

            <!-- Capacity and Pricing Row -->
            <div class="flex flex-col lg:flex-row gap-4 mt-3">
              <div class="flex-1">
                <UFormGroup label="Minimum Capacity" required>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Minimum Capacity: {{ form.minCapacity || "Not set" }} people
                  </div>
                  <UInput
                    v-model="form.minCapacity"
                    type="number"
                    placeholder="Min capacity"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
              <div class="flex-1">
                <UFormGroup label="Maximum Capacity" required>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Maximum Capacity: {{ form.maxCapacity || "Not set" }} people
                  </div>
                  <UInput
                    v-model="form.maxCapacity"
                    type="number"
                    placeholder="Max capacity"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
              <div class="flex-1">
                <UFormGroup label="Price per Hour (R)" required>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Price per Hour: R{{ form.price || "Not set" }}
                  </div>
                  <UInput
                    v-model="form.price"
                    type="number"
                    placeholder="0.00"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
            </div>

            <!-- Event Types -->
            <UFormGroup label="Event Types" required>
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Event Types you offer:
              </div>
              <USelectMenu
                v-model="form.eventTypes"
                :items="availableEventTypes"
                placeholder="Select event types"
                multiple
                selected-icon="i-bx-party"
                class="w-full"
              />
            </UFormGroup>

            <!-- <div class="flex flex-row gap-3">
        <USelectMenu
          v-model="form.eventTypes"
          multiple
          selected-icon="i-bx-party"
          class="h-full w-full"
          placeholder="Event Types Offered (Select as many as applicable)"
          :items="availableEventTypes"
        />
      </div> -->
          </div>
        </UCard>

        <!-- Media Section -->
        <UCard>
          <template #header>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-photo" class="h-5 w-5" />
              <span class="font-medium">Venue Photos</span>
            </div>
          </template>

          <div class="space-y-4">
            <ImageUploader
              :initial-images="form.photos"
              :venue-id="venueId"
              bucket-name="venue-photos"
              @update:images="handlePhotoUpdate"
            />
          </div>
        </UCard>

        <!-- Booking Requirements Section -->
        <UCard>
          <template #header>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-clock" class="h-5 w-5" />
              <span class="font-medium">Booking Requirements</span>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex flex-col lg:flex-row gap-4">
              <div class="flex-1">
                <UFormGroup label="Minimum Hours" required>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Minimum Hours: {{ form.minimumHours || "Not set" }} hours
                  </div>
                  <UInput
                    v-model="form.minimumHours"
                    type="number"
                    placeholder="4"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
              <div class="flex-1">
                <UFormGroup label="Notice Required (days)" required>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Notice Required: {{ form.noticeRequired || "Not set" }} days
                  </div>
                  <UInput
                    v-model="form.noticeRequired"
                    type="number"
                    placeholder="7"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Amenities Section -->
        <UCard>
          <template #header>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-sparkles" class="h-5 w-5" />
              <span class="font-medium">Amenities</span>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Basic Amenities Grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <UFormGroup>
                <UCheckbox v-model="form.amenities.wifi" label="WiFi" />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox v-model="form.amenities.kitchen" label="Kitchen" />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox v-model="form.amenities.stage" label="Stage" />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox v-model="form.amenities.bar" label="Bar" />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox
                  v-model="form.amenities.soundSystem"
                  label="Sound System"
                />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox v-model="form.amenities.lighting" label="Lighting" />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox
                  v-model="form.amenities.projector"
                  label="Projector"
                />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox
                  v-model="form.amenities.microphone"
                  label="Microphone"
                />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox
                  v-model="form.amenities.airConditioning"
                  label="Air Conditioning"
                />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox v-model="form.amenities.heating" label="Heating" />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox
                  v-model="form.amenities.danceFloor"
                  label="Dance Floor"
                />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox
                  v-model="form.amenities.outdoorSpace"
                  label="Outdoor Space"
                />
              </UFormGroup>
              <UFormGroup>
                <UCheckbox
                  v-model="form.amenities.indoorSpace"
                  label="Indoor Space"
                />
              </UFormGroup>
            </div>

            <!-- Tables and Chairs -->
            <div class="flex flex-col lg:flex-row gap-4">
              <div class="flex-1">
                <UFormGroup label="Number of Tables">
                  <UInput
                    v-model="form.amenities.tables"
                    type="number"
                    placeholder="0"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
              <div class="flex-1">
                <UFormGroup label="Number of Chairs">
                  <UInput
                    v-model="form.amenities.chairs"
                    type="number"
                    placeholder="0"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Seasonal Pricing Section -->
        <UCard>
          <template #header>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-currency-dollar" class="h-5 w-5" />
              <span class="font-medium">Seasonal Pricing</span>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex flex-col lg:flex-row gap-4">
              <div class="flex-1">
                <UFormGroup label="Peak Season Price (R/hour)">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Peak Season Price: R{{
                      form.seasonalPricing.peak || "Not set"
                    }}
                  </div>
                  <UInput
                    v-model="form.seasonalPricing.peak"
                    type="number"
                    placeholder="0.00"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
              <div class="flex-1">
                <UFormGroup label="Off-Peak Season Price (R/hour)">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Off-Peak Season Price: R{{
                      form.seasonalPricing.offPeak || "Not set"
                    }}
                  </div>
                  <UInput
                    v-model="form.seasonalPricing.offPeak"
                    type="number"
                    placeholder="0.00"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Cancellation Policy Section -->
        <UCard>
          <template #header>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-shield-check" class="h-5 w-5" />
              <span class="font-medium">Cancellation Policy</span>
            </div>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Full Refund (days before event)" required>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Refundable Days:
                  {{ form.cancellationPolicy.refundableDays || "Not set" }} days
                </div>
                <UInput
                  v-model="form.cancellationPolicy.refundableDays"
                  type="number"
                  placeholder="Days for full refund"
                />
              </UFormGroup>

              <UFormGroup label="Partial Refund (days before event)" required>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Partial Refund Days:
                  {{ form.cancellationPolicy.partialRefundDays || "Not set" }}
                  days
                </div>
                <UInput
                  v-model="form.cancellationPolicy.partialRefundDays"
                  type="number"
                  placeholder="Days for partial refund"
                />
              </UFormGroup>

              <UFormGroup label="Partial Refund Percentage (%)" required>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Partial Refund Percentage:
                  {{
                    form.cancellationPolicy.partialRefundPercentage ||
                    "Not set"
                  }}%
                </div>
                <UInput
                  v-model="form.cancellationPolicy.partialRefundPercentage"
                  type="number"
                  placeholder="Percentage refunded"
                />
              </UFormGroup>

              <UFormGroup label="No Refund (days before event)" required>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Non Refundable Days:
                  {{ form.cancellationPolicy.nonRefundableDays || "Not set" }}
                  days
                </div>
                <UInput
                  v-model="form.cancellationPolicy.nonRefundableDays"
                  type="number"
                  placeholder="Days for no refund"
                />
              </UFormGroup>
            </div>
          </div>
        </UCard>

        <!-- Bottom actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t">
          <UButton
            color="neutral"
            class="cursor-pointer"
            to="/venues"
            variant="ghost"
            >Cancel</UButton
          >
          <UButton
            color="primary"
            class="cursor-pointer"
            @click="saveVenue"
            :loading="saving"
            >Save Changes</UButton
          >
        </div>
      </div>
    </UContainer>

    <!-- Success Modal - Fixed positioning -->
    <!-- <UModal
      v-model="showSuccessModal"
      @close="closeModal"
      :ui="{
        wrapper: 'z-50',
        overlay: 'z-40',
        base: 'z-50',
      }"
    >
      <UCard>
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-check"
                    class="w-6 h-6 text-green-600"
                  />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  Venue Updated Successfully!
                </h3>
                <p class="text-sm text-gray-600">
                  Your changes have been saved.
                </p>
              </div>
            </div>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="closeModal"
              class="flex-shrink-0"
            />
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-gray-700">
            The venue "<strong>{{ form.venueName }}</strong
            >" has been updated successfully. What would you like to do next?
          </p>

          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <UButton
              color="primary"
              @click="viewVenue"
              class="flex-1 justify-center"
              icon="i-heroicons-eye"
            >
              View Updated Venue
            </UButton>
            <UButton
              color="neutral"
              @click="goToDashboard"
              class="flex-1 justify-center"
              icon="i-heroicons-squares-2x2"
              variant="solid"
            >
              Back to Dashboard
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal> -->
  </div>
</template>
