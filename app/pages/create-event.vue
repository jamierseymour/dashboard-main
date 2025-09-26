<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-800">
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            size="sm"
            class="cursor-pointer"
            @click="goBack"
          />
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Create New Event
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              Plan your perfect event with our comprehensive booking system
            </p>
          </div>
        </div>

        <!-- Progress Steps -->
        <div class="flex items-center gap-2 mt-6">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="flex items-center"
          >
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200"
              :class="{
                'bg-fuchsia-600 text-white': currentStep >= index + 1,
                'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400': currentStep < index + 1
              }"
            >
              <span class="text-sm font-medium">{{ index + 1 }}</span>
            </div>
            <div class="ml-3 mr-8">
              <p
                class="text-sm font-medium transition-colors duration-200"
                :class="{
                  'text-fuchsia-600': currentStep >= index + 1,
                  'text-gray-500 dark:text-gray-400': currentStep < index + 1
                }"
              >
                {{ step.title }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Event Information Section -->
        <div
          v-show="currentStep === 1"
          class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-fuchsia-100 dark:bg-fuchsia-900 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-information-circle" class="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Event Information
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                Tell us about your event details
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Event Name -->
            <UFormGroup label="Event Name" required :error="errors.eventName">
              <UInput
                v-model="eventForm.eventName"
                placeholder="Enter your event name"
                :color="errors.eventName ? 'red' : 'primary'"
              />
            </UFormGroup>

            <!-- Event Type -->
            <UFormGroup label="Event Type" required :error="errors.eventType">
              <USelectMenu
                v-model="eventForm.eventType"
                :options="eventTypes"
                placeholder="Select event type"
                :color="errors.eventType ? 'red' : 'primary'"
              />
            </UFormGroup>

            <!-- Event Date -->
            <UFormGroup label="Event Date" required :error="errors.eventDate">
              <UInput
                v-model="eventForm.eventDate"
                type="date"
                :color="errors.eventDate ? 'red' : 'primary'"
              />
            </UFormGroup>

            <!-- Event Time -->
            <UFormGroup label="Event Time" required :error="errors.eventTime">
              <UInput
                v-model="eventForm.eventTime"
                type="time"
                :color="errors.eventTime ? 'red' : 'primary'"
              />
            </UFormGroup>

            <!-- Expected Guests -->
            <UFormGroup label="Expected Guests" required :error="errors.expectedGuests">
              <UInput
                v-model="eventForm.expectedGuests"
                type="number"
                placeholder="Number of guests"
                :color="errors.expectedGuests ? 'red' : 'primary'"
              />
            </UFormGroup>

            <!-- Duration -->
            <UFormGroup label="Duration (hours)" required :error="errors.duration">
              <USelectMenu
                v-model="eventForm.duration"
                :options="durationOptions"
                placeholder="Select duration"
                :color="errors.duration ? 'red' : 'primary'"
              />
            </UFormGroup>
          </div>

          <!-- Event Description -->
          <div class="mt-6">
            <UFormGroup label="Event Description" :error="errors.description">
              <UTextarea
                v-model="eventForm.description"
                placeholder="Describe your event, special requirements, or additional details..."
                :rows="4"
                :color="errors.description ? 'red' : 'primary'"
              />
            </UFormGroup>
          </div>

          <!-- Budget Range -->
          <div class="mt-6">
            <UFormGroup label="Budget Range" :error="errors.budget">
              <USelectMenu
                v-model="eventForm.budget"
                :options="budgetOptions"
                placeholder="Select your budget range"
                :color="errors.budget ? 'red' : 'primary'"
              />
            </UFormGroup>
          </div>
        </div>

        <!-- Venue Selection Section -->
        <div
          v-show="currentStep === 2"
          class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-fuchsia-100 dark:bg-fuchsia-900 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-map-pin" class="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Venue Selection
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                Choose the perfect venue for your event
              </p>
            </div>
          </div>

          <!-- Venue Search -->
          <div class="mb-6">
            <UFormGroup label="Search Venues" :error="errors.venue">
              <div class="relative">
                <UInput
                  v-model="venueSearch"
                  placeholder="Search venues by name, location, or type..."
                  icon="i-heroicons-magnifying-glass"
                  :color="errors.venue ? 'red' : 'primary'"
                  @input="searchVenues"
                />
              </div>
            </UFormGroup>
          </div>

          <!-- Venue Filters -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <UFormGroup label="Location">
              <USelectMenu
                v-model="venueFilters.location"
                :options="locationOptions"
                placeholder="Any location"
              />
            </UFormGroup>

            <UFormGroup label="Capacity">
              <USelectMenu
                v-model="venueFilters.capacity"
                :options="capacityOptions"
                placeholder="Any capacity"
              />
            </UFormGroup>

            <UFormGroup label="Price Range">
              <USelectMenu
                v-model="venueFilters.priceRange"
                :options="priceRangeOptions"
                placeholder="Any price"
              />
            </UFormGroup>
          </div>

          <!-- Venue Results -->
          <div v-if="filteredVenues.length > 0" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Available Venues ({{ filteredVenues.length }})
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="venue in filteredVenues"
                :key="venue.id"
                class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                :class="{
                  'ring-2 ring-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/10': selectedVenue?.id === venue.id,
                  'hover:border-gray-300 dark:hover:border-gray-600': selectedVenue?.id !== venue.id
                }"
                @click="selectVenue(venue)"
              >
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UIcon name="i-heroicons-building-office" class="w-8 h-8 text-gray-400" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {{ venue.name }}
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {{ venue.location }}
                    </p>
                    <div class="flex items-center gap-4 mt-2 text-sm">
                      <span class="flex items-center gap-1 text-gray-500">
                        <UIcon name="i-heroicons-users" class="w-4 h-4" />
                        {{ venue.capacity }} capacity
                      </span>
                      <span class="flex items-center gap-1 text-gray-500">
                        <UIcon name="i-heroicons-banknotes" class="w-4 h-4" />
                        R{{ venue.price }}/hour
                      </span>
                    </div>
                    <div class="flex items-center gap-1 mt-2">
                      <UIcon name="i-heroicons-star" class="w-4 h-4 text-yellow-400" />
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        {{ venue.rating }} ({{ venue.reviews }} reviews)
                      </span>
                    </div>
                  </div>
                  <div
                    v-if="selectedVenue?.id === venue.id"
                    class="flex-shrink-0"
                  >
                    <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-fuchsia-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else-if="venueSearch || Object.values(venueFilters).some(v => v)" class="text-center py-8">
            <UIcon name="i-heroicons-map-pin" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No venues found
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or filters
            </p>
          </div>

          <!-- Selected Venue Details -->
          <div v-if="selectedVenue" class="mt-6 p-4 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-lg border border-fuchsia-200 dark:border-fuchsia-800">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-fuchsia-600" />
              <h4 class="font-medium text-fuchsia-900 dark:text-fuchsia-100">
                Selected Venue: {{ selectedVenue.name }}
              </h4>
            </div>
            <p class="text-sm text-fuchsia-700 dark:text-fuchsia-300">
              {{ selectedVenue.location }} • R{{ selectedVenue.price }}/hour • {{ selectedVenue.capacity }} capacity
            </p>
          </div>
        </div>

        <!-- Additional Services Section -->
        <div
          v-show="currentStep === 3"
          class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-fuchsia-100 dark:bg-fuchsia-900 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Additional Services
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                Enhance your event with professional services
              </p>
            </div>
          </div>

          <!-- Service Categories -->
          <div class="space-y-6">
            <div
              v-for="category in serviceCategories"
              :key="category.name"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {{ category.name }}
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-for="service in category.services"
                  :key="service.id"
                  class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200"
                  :class="{
                    'bg-fuchsia-50 dark:bg-fuchsia-900/20 border-fuchsia-200 dark:border-fuchsia-800': selectedServices.includes(service.id),
                    'hover:bg-gray-50 dark:hover:bg-gray-800': !selectedServices.includes(service.id)
                  }"
                  @click="toggleService(service.id)"
                >
                  <div class="flex items-center gap-3">
                    <UCheckbox
                      :model-value="selectedServices.includes(service.id)"
                      class="cursor-pointer"
                    />
                    <div>
                      <h4 class="font-medium text-gray-900 dark:text-gray-100">
                        {{ service.name }}
                      </h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ service.description }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-900 dark:text-gray-100">
                      R{{ service.price }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ service.unit }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Services Summary -->
          <div v-if="selectedServices.length > 0" class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Selected Services ({{ selectedServices.length }})
            </h4>
            <div class="space-y-2">
              <div
                v-for="serviceId in selectedServices"
                :key="serviceId"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-700 dark:text-gray-300">
                  {{ getServiceById(serviceId)?.name }}
                </span>
                <span class="font-medium text-gray-900 dark:text-gray-100">
                  R{{ getServiceById(serviceId)?.price }}
                </span>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div class="flex items-center justify-between font-semibold">
                  <span class="text-gray-900 dark:text-gray-100">Total Services:</span>
                  <span class="text-fuchsia-600 dark:text-fuchsia-400">
                    R{{ selectedServicesTotal }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <UButton
            v-if="currentStep > 1"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            label="Previous"
            class="cursor-pointer"
            @click="previousStep"
          />
          <div v-else></div>

          <div class="flex items-center gap-3">
            <UButton
              color="gray"
              variant="outline"
              label="Save as Draft"
              class="cursor-pointer"
              @click="saveDraft"
            />

            <UButton
              v-if="currentStep < steps.length"
              color="primary"
              trailing-icon="i-heroicons-arrow-right"
              label="Next"
              class="cursor-pointer"
              @click="nextStep"
            />

            <UButton
              v-else
              color="primary"
              icon="i-heroicons-check"
              label="Create Event"
              class="cursor-pointer"
              :loading="isSubmitting"
              type="submit"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

// Form state
const currentStep = ref(1);
const isSubmitting = ref(false);
const errors = ref<Record<string, string>>({});

// Steps configuration
const steps = [
  { id: 1, title: "Event Info" },
  { id: 2, title: "Venue" },
  { id: 3, title: "Services" },
];

// Event form data
const eventForm = ref({
  eventName: "",
  eventType: "",
  eventDate: "",
  eventTime: "",
  expectedGuests: "",
  duration: "",
  description: "",
  budget: "",
});

// Venue selection
const venueSearch = ref("");
const selectedVenue = ref(null);
const venueFilters = ref({
  location: "",
  capacity: "",
  priceRange: "",
});

// Services selection
const selectedServices = ref<string[]>([]);

// Options data
const eventTypes = [
  { label: "Wedding", value: "wedding" },
  { label: "Corporate Event", value: "corporate" },
  { label: "Birthday Party", value: "birthday" },
  { label: "Conference", value: "conference" },
  { label: "Concert", value: "concert" },
  { label: "Exhibition", value: "exhibition" },
  { label: "Workshop", value: "workshop" },
  { label: "Social Gathering", value: "social" },
  { label: "Other", value: "other" },
];

const durationOptions = [
  { label: "2 hours", value: "2" },
  { label: "3 hours", value: "3" },
  { label: "4 hours", value: "4" },
  { label: "5 hours", value: "5" },
  { label: "6 hours", value: "6" },
  { label: "8 hours", value: "8" },
  { label: "Full Day (10+ hours)", value: "10" },
];

const budgetOptions = [
  { label: "Under R5,000", value: "under-5000" },
  { label: "R5,000 - R10,000", value: "5000-10000" },
  { label: "R10,000 - R25,000", value: "10000-25000" },
  { label: "R25,000 - R50,000", value: "25000-50000" },
  { label: "R50,000 - R100,000", value: "50000-100000" },
  { label: "Over R100,000", value: "over-100000" },
];

const locationOptions = [
  { label: "Johannesburg", value: "johannesburg" },
  { label: "Cape Town", value: "cape-town" },
  { label: "Durban", value: "durban" },
  { label: "Pretoria", value: "pretoria" },
  { label: "Port Elizabeth", value: "port-elizabeth" },
];

const capacityOptions = [
  { label: "Under 50", value: "under-50" },
  { label: "50 - 100", value: "50-100" },
  { label: "100 - 200", value: "100-200" },
  { label: "200 - 500", value: "200-500" },
  { label: "500+", value: "500-plus" },
];

const priceRangeOptions = [
  { label: "Under R500/hour", value: "under-500" },
  { label: "R500 - R1000/hour", value: "500-1000" },
  { label: "R1000 - R2000/hour", value: "1000-2000" },
  { label: "R2000+/hour", value: "2000-plus" },
];

// Mock venues data
const venues = ref([
  {
    id: 1,
    name: "Garden Estate Venue",
    location: "Johannesburg, Gauteng",
    capacity: 150,
    price: 1500,
    rating: 4.8,
    reviews: 42,
    type: "outdoor",
  },
  {
    id: 2,
    name: "Conference Center Downtown",
    location: "Cape Town, Western Cape",
    capacity: 200,
    price: 2000,
    rating: 4.6,
    reviews: 38,
    type: "conference",
  },
  {
    id: 3,
    name: "Rooftop Lounge",
    location: "Durban, KwaZulu-Natal",
    capacity: 80,
    price: 1200,
    rating: 4.9,
    reviews: 29,
    type: "lounge",
  },
]);

// Service categories and options
const serviceCategories = ref([
  {
    name: "Catering & Bar",
    services: [
      {
        id: "catering-basic",
        name: "Basic Catering Package",
        description: "Appetizers, main course, and dessert",
        price: 150,
        unit: "per person",
      },
      {
        id: "catering-premium",
        name: "Premium Catering Package",
        description: "Multi-course meal with premium options",
        price: 250,
        unit: "per person",
      },
      {
        id: "bar-service",
        name: "Professional Bar Service",
        description: "Bartender and full bar setup",
        price: 800,
        unit: "per event",
      },
    ],
  },
  {
    name: "Entertainment & Audio/Visual",
    services: [
      {
        id: "dj-service",
        name: "DJ Service",
        description: "Professional DJ with sound system",
        price: 1200,
        unit: "per event",
      },
      {
        id: "live-band",
        name: "Live Band",
        description: "4-piece live band performance",
        price: 3000,
        unit: "per event",
      },
      {
        id: "av-equipment",
        name: "Audio/Visual Equipment",
        description: "Projectors, screens, microphones",
        price: 600,
        unit: "per day",
      },
    ],
  },
  {
    name: "Decoration & Florals",
    services: [
      {
        id: "basic-decor",
        name: "Basic Decoration Package",
        description: "Table settings, centerpieces, lighting",
        price: 500,
        unit: "per event",
      },
      {
        id: "premium-decor",
        name: "Premium Decoration Package",
        description: "Complete venue transformation",
        price: 1500,
        unit: "per event",
      },
      {
        id: "floral-arrangements",
        name: "Floral Arrangements",
        description: "Custom floral designs and bouquets",
        price: 800,
        unit: "per event",
      },
    ],
  },
  {
    name: "Photography & Videography",
    services: [
      {
        id: "photography",
        name: "Professional Photography",
        description: "Event photographer for 4 hours",
        price: 2000,
        unit: "per event",
      },
      {
        id: "videography",
        name: "Professional Videography",
        description: "Event videographer with editing",
        price: 3500,
        unit: "per event",
      },
    ],
  },
]);

// Computed properties
const filteredVenues = computed(() => {
  let filtered = venues.value;

  if (venueSearch.value) {
    const search = venueSearch.value.toLowerCase();
    filtered = filtered.filter(venue =>
      venue.name.toLowerCase().includes(search) ||
      venue.location.toLowerCase().includes(search)
    );
  }

  return filtered;
});

const selectedServicesTotal = computed(() => {
  return selectedServices.value.reduce((total, serviceId) => {
    const service = getServiceById(serviceId);
    return total + (service?.price || 0);
  }, 0);
});

// Methods
const goBack = () => {
  router.back();
};

const nextStep = () => {
  if (validateCurrentStep()) {
    if (currentStep.value < steps.length) {
      currentStep.value++;
    }
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const validateCurrentStep = (): boolean => {
  errors.value = {};

  if (currentStep.value === 1) {
    if (!eventForm.value.eventName) errors.value.eventName = "Event name is required";
    if (!eventForm.value.eventType) errors.value.eventType = "Event type is required";
    if (!eventForm.value.eventDate) errors.value.eventDate = "Event date is required";
    if (!eventForm.value.eventTime) errors.value.eventTime = "Event time is required";
    if (!eventForm.value.expectedGuests) errors.value.expectedGuests = "Number of guests is required";
    if (!eventForm.value.duration) errors.value.duration = "Duration is required";
  }

  if (currentStep.value === 2) {
    if (!selectedVenue.value) errors.value.venue = "Please select a venue";
  }

  return Object.keys(errors.value).length === 0;
};

const searchVenues = () => {
  // This would typically make an API call to search venues
  console.log("Searching venues:", venueSearch.value);
};

const selectVenue = (venue: any) => {
  selectedVenue.value = venue;
};

const toggleService = (serviceId: string) => {
  const index = selectedServices.value.indexOf(serviceId);
  if (index > -1) {
    selectedServices.value.splice(index, 1);
  } else {
    selectedServices.value.push(serviceId);
  }
};

const getServiceById = (serviceId: string) => {
  for (const category of serviceCategories.value) {
    const service = category.services.find(s => s.id === serviceId);
    if (service) return service;
  }
  return null;
};

const saveDraft = () => {
  console.log("Saving draft...");
  useToast().add({
    title: "Draft Saved",
    description: "Your event has been saved as a draft",
    color: "blue",
  });
};

const handleSubmit = async () => {
  if (!validateCurrentStep()) return;

  isSubmitting.value = true;

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Event data:", {
      ...eventForm.value,
      venue: selectedVenue.value,
      services: selectedServices.value,
    });

    useToast().add({
      title: "Event Created!",
      description: "Your event has been successfully created",
      color: "green",
    });

    // Redirect to events page
    await router.push("/users/profile/upcoming-events");

  } catch (error) {
    console.error("Error creating event:", error);
    useToast().add({
      title: "Error",
      description: "Failed to create event. Please try again.",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>