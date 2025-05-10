<script setup lang="ts">
import type { VenueFormData, Province, EventType } from "~/types/venue";

const client = useSupabaseClient();
const route = useRoute();
const toast = useToast();
const router = useRouter();

const venueId = route.params.id as string;
const loading = ref(false);
const saving = ref(false);

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

// Event type options
const eventTypeOptions = [
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

// Province options
const provinceOptions = [
  { label: "Eastern Cape", value: "Eastern Cape" },
  { label: "Free State", value: "Free State" },
  { label: "Gauteng", value: "Gauteng" },
  { label: "KwaZulu-Natal", value: "KwaZulu-Natal" },
  { label: "Limpopo", value: "Limpopo" },
  { label: "Mpumalanga", value: "Mpumalanga" },
  { label: "Northern Cape", value: "Northern Cape" },
  { label: "North West", value: "North West" },
  { label: "Western Cape", value: "Western Cape" },
];

// Tabs for organization
const tabs = [
  {
    name: "Basic Info",
    icon: "i-heroicons-information-circle",
    id: "basic-info",
  },
  { name: "Media", icon: "i-heroicons-photo", id: "media" },
  {
    name: "Capacity & Pricing",
    icon: "i-heroicons-currency-dollar",
    id: "pricing",
  },
  { name: "Amenities", icon: "i-heroicons-wifi", id: "amenities" },
  { name: "Policies", icon: "i-heroicons-document-text", id: "policies" },
];

const activeTab = ref("basic-info");

// Fetch venue data
const fetchVenueData = async () => {
  loading.value = true;
  try {
    const { data, error } = await client
      .from("venues")
      .select()
      .eq("id", venueId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Venue not found");

    // Parse event types
    const parsedEventTypes =
      data.event_types?.map((type: any) => {
        if (typeof type === "string") {
          try {
            return JSON.parse(type);
          } catch {
            return type;
          }
        }
        return type;
      }) || [];

    // Parse selected province
    let parsedProvince = data.selected_province;
    try {
      if (typeof data.selected_province === "string") {
        parsedProvince = JSON.parse(data.selected_province);
      }
    } catch {
      // Keep as is if not JSON
    }

    // Map database values to form
    form.photos = data.photos || [];
    form.description = data.description || "";
    form.venueName = data.venue_name || "";
    form.minCapacity = data.min_capacity?.toString() || "";
    form.maxCapacity = data.max_capacity?.toString() || "";
    form.companyName = data.company_name || "";
    form.price = data.price?.toString() || "";
    form.selectedProvince = parsedProvince?.value || parsedProvince;
    form.provinces = parsedProvince?.value || parsedProvince;
    form.eventTypes = parsedEventTypes.map((t: any) => t.value || t);
    form.address = data.address || "";
    form.minimumHours = data.minimum_hours || 4;
    form.noticeRequired = data.notice_required || 7;

    // Parse amenities
    if (data.amenities) {
      form.amenities = {
        ...form.amenities,
        ...data.amenities,
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
  } catch (error) {
    console.error("Error fetching venue:", error);
    toast.add({
      title: "Error",
      description: "Failed to load venue data",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
};

// Save venue data
const saveVenue = async () => {
  saving.value = true;
  try {
    // Format data for Supabase
    const venueData = {
      venue_name: form.venueName,
      description: form.description,
      company_name: form.companyName,
      min_capacity: parseInt(form.minCapacity) || 0,
      max_capacity: parseInt(form.maxCapacity) || 0,
      price: parseFloat(form.price) || 0,
      address: form.address,
      selected_province:
        typeof form.selectedProvince === "string"
          ? form.selectedProvince
          : JSON.stringify({
              label: form.selectedProvince,
              value: form.selectedProvince,
            }),
      provinces: form.provinces,
      event_types: form.eventTypes.map((type) =>
        JSON.stringify({ label: type, value: type })
      ),
      photos: form.photos,
      minimum_hours: form.minimumHours,
      notice_required: form.noticeRequired,
      amenities: form.amenities,
      seasonal_pricing: {
        peak: parseFloat(form.seasonalPricing?.peak?.toString() || "0"),
        off_peak: parseFloat(form.seasonalPricing?.offPeak?.toString() || "0"),
        peak_months: form.seasonalPricing?.peakMonths || [],
      },
      cancellation_policy: form.cancellationPolicy,
    };

    const { error } = await client
      .from("venues")
      .update(venueData)
      .eq("id", venueId);

    if (error) throw error;

    toast.add({
      title: "Success",
      description: "Venue updated successfully",
      color: "green",
    });

    // Navigate back to venue details
    router.push(`/venues/${venueId}`);
  } catch (error) {
    console.error("Error updating venue:", error);
    toast.add({
      title: "Error",
      description: "Failed to update venue",
      color: "red",
    });
  } finally {
    saving.value = false;
  }
};

// Handle photo uploads
const handlePhotoUpload = async (event: any) => {
  const files = event.target.files;
  if (!files.length) return;

  const toastId = toast.add({
    title: "Uploading",
    description: "Uploading photos...",
    color: "blue",
    icon: "i-heroicons-arrow-path",
    loading: true,
  });

  try {
    // This is a placeholder for your actual upload logic
    // You would typically upload to Supabase storage here
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `venues/${venueId}/${Date.now()}-${file.name}`;

      // Upload file to Supabase Storage
      const { data, error } = await client.storage
        .from("venue-images")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = client.storage
        .from("venue-images")
        .getPublicUrl(fileName);

      // Add to photos array
      form.photos.push(publicUrlData.publicUrl);
    }

    toast.remove(toastId);
    toast.add({
      title: "Success",
      description: "Photos uploaded successfully",
      color: "green",
    });
  } catch (error) {
    console.error("Error uploading photos:", error);
    toast.remove(toastId);
    toast.add({
      title: "Error",
      description: "Failed to upload photos",
      color: "red",
    });
  }
};

// Remove photo
const removePhoto = (index: number) => {
  form.photos.splice(index, 1);
};

// Fetch venue data on page load
onMounted(() => {
  fetchVenueData();
});
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
          <div class="flex space-x-3">
            <UButton color="gray" to="/venues" variant="ghost">Cancel</UButton>
            <UButton color="primary" @click="saveVenue" :loading="saving"
              >Save Changes</UButton
            >
          </div>
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
      <div v-else>
        <!-- Tabs -->
        <UTabs v-model="activeTab" :items="tabs" />

        <div class="mt-6">
          <!-- Basic Info Tab -->
          <div v-if="activeTab === 'basic-info'" class="space-y-6">
            <UCard>
              <template #header>
                <div class="font-medium">Basic Information</div>
              </template>

              <UFormGroup label="Venue Name" required>
                <UInput
                  v-model="form.venueName"
                  placeholder="Enter venue name"
                />
              </UFormGroup>

              <UFormGroup label="Company Name" class="mt-4">
                <UInput
                  v-model="form.companyName"
                  placeholder="Enter company name"
                />
              </UFormGroup>

              <UFormGroup label="Description" class="mt-4" required>
                <UTextarea
                  v-model="form.description"
                  placeholder="Describe your venue"
                  rows="6"
                />
              </UFormGroup>

              <UFormGroup label="Address" class="mt-4" required>
                <UInput
                  v-model="form.address"
                  placeholder="Enter venue address"
                />
              </UFormGroup>

              <UFormGroup label="Province" class="mt-4" required>
                <USelect
                  v-model="form.selectedProvince"
                  :options="provinceOptions"
                  placeholder="Select province"
                />
              </UFormGroup>

              <UFormGroup label="Event Types" class="mt-4" required>
                <USelectMenu
                  v-model="form.eventTypes"
                  :options="eventTypeOptions"
                  placeholder="Select event types"
                  multiple
                />
              </UFormGroup>
            </UCard>
          </div>

          <!-- Media Tab -->
          <div v-if="activeTab === 'media'" class="space-y-6">
            <UCard>
              <template #header>
                <div class="font-medium">Venue Photos</div>
              </template>

              <div class="space-y-4">
                <UFormGroup label="Photos" required>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    @change="handlePhotoUpload"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </UFormGroup>

                <!-- Photo gallery -->
                <div
                  v-if="form.photos.length"
                  class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
                >
                  <div
                    v-for="(photo, index) in form.photos"
                    :key="index"
                    class="relative group"
                  >
                    <img
                      :src="photo"
                      alt="Venue photo"
                      class="h-40 w-full object-cover rounded-lg"
                    />
                    <button
                      @click="removePhoto(index)"
                      class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <UIcon name="i-heroicons-trash" class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div v-else class="text-gray-500 text-center py-8">
                  No photos uploaded yet
                </div>
              </div>
            </UCard>
          </div>

          <!-- Capacity & Pricing Tab -->
          <div v-if="activeTab === 'pricing'" class="space-y-6">
            <UCard>
              <template #header>
                <div class="font-medium">Capacity & Pricing</div>
              </template>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormGroup label="Minimum Capacity" required>
                  <UInput
                    v-model="form.minCapacity"
                    type="number"
                    placeholder="Minimum capacity"
                  />
                </UFormGroup>

                <UFormGroup label="Maximum Capacity" required>
                  <UInput
                    v-model="form.maxCapacity"
                    type="number"
                    placeholder="Maximum capacity"
                  />
                </UFormGroup>

                <UFormGroup label="Base Price (per hour)" required>
                  <UInputAddon>R</UInputAddon>
                  <UInput
                    v-model="form.price"
                    type="number"
                    placeholder="Price per hour"
                  />
                </UFormGroup>

                <UFormGroup label="Minimum Booking Hours" required>
                  <UInput
                    v-model="form.minimumHours"
                    type="number"
                    placeholder="Minimum hours"
                  />
                </UFormGroup>

                <UFormGroup label="Notice Required (days)" required>
                  <UInput
                    v-model="form.noticeRequired"
                    type="number"
                    placeholder="Notice required"
                  />
                </UFormGroup>
              </div>

              <div class="mt-6">
                <h3 class="font-medium text-lg mb-4">Seasonal Pricing</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UFormGroup label="Peak Season Price (per hour)">
                    <UInputAddon>R</UInputAddon>
                    <UInput
                      v-model="form.seasonalPricing.peak"
                      type="number"
                      placeholder="Peak season price"
                    />
                  </UFormGroup>

                  <UFormGroup label="Off-Peak Season Price (per hour)">
                    <UInputAddon>R</UInputAddon>
                    <UInput
                      v-model="form.seasonalPricing.offPeak"
                      type="number"
                      placeholder="Off-peak season price"
                    />
                  </UFormGroup>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Amenities Tab -->
          <div v-if="activeTab === 'amenities'" class="space-y-6">
            <UCard>
              <template #header>
                <div class="font-medium">Venue Amenities</div>
              </template>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <UFormGroup>
                  <UCheckbox
                    v-model="form.amenities.wifi"
                    label="WiFi Available"
                  />
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
                  <UCheckbox
                    v-model="form.amenities.lighting"
                    label="Lighting"
                  />
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

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <UFormGroup label="Tables Available">
                  <UInput
                    v-model="form.amenities.tables"
                    type="number"
                    placeholder="Number of tables"
                  />
                </UFormGroup>

                <UFormGroup label="Chairs Available">
                  <UInput
                    v-model="form.amenities.chairs"
                    type="number"
                    placeholder="Number of chairs"
                  />
                </UFormGroup>
              </div>
            </UCard>
          </div>

          <!-- Policies Tab -->
          <div v-if="activeTab === 'policies'" class="space-y-6">
            <UCard>
              <template #header>
                <div class="font-medium">Cancellation Policy</div>
              </template>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormGroup label="Full Refund (days before event)" required>
                  <UInput
                    v-model="form.cancellationPolicy.refundableDays"
                    type="number"
                    placeholder="Days for full refund"
                  />
                </UFormGroup>

                <UFormGroup label="Partial Refund (days before event)" required>
                  <UInput
                    v-model="form.cancellationPolicy.partialRefundDays"
                    type="number"
                    placeholder="Days for partial refund"
                  />
                </UFormGroup>

                <UFormGroup label="Partial Refund Percentage (%)" required>
                  <UInput
                    v-model="form.cancellationPolicy.partialRefundPercentage"
                    type="number"
                    placeholder="Percentage refunded"
                  />
                </UFormGroup>

                <UFormGroup label="No Refund (days before event)" required>
                  <UInput
                    v-model="form.cancellationPolicy.nonRefundableDays"
                    type="number"
                    placeholder="Days for no refund"
                  />
                </UFormGroup>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Bottom actions -->
        <div class="mt-8 flex justify-end space-x-3">
          <UButton color="gray" to="/venues" variant="ghost">Cancel</UButton>
          <UButton color="primary" @click="saveVenue" :loading="saving"
            >Save Changes</UButton
          >
        </div>
      </div>
    </UContainer>
  </div>
</template>
