<script setup lang="ts">
definePageMeta({
  layout: "default",
});

// Show landing page first
const showLanding = ref(true);

// Current step tracking
const currentStep = ref(1);
const totalSteps = 7;
const direction = ref<'forward' | 'backward'>('forward');

// Event form data
const formData = ref({
  eventType: null as string | null,
  budgetMin: 5000,
  budgetMax: 50000,
  guestCount: 50,
  needsAccommodation: false,
  accommodationRooms: 0,
  accommodationGuests: 0,
  extraAccommodation: {
    vipRooms: 0,
    standardRooms: 0,
  },
  services: {
    decor: false,
    catering: false,
    dj: false,
    officiant: false,
    photography: false,
    transportation: false,
    other: false,
  },
  serviceDetails: {
    decor: "",
    catering: "",
    dj: "",
    officiant: "",
    photography: "",
    transportation: "",
    other: "",
  },
  otherServices: "",
  notes: "",
});

// Event type options with icons and descriptions
const eventTypes = [
  {
    value: "wedding",
    label: "Wedding",
    icon: "lucide:heart",
    description: "Celebrate your special day",
  },
  {
    value: "birthday",
    label: "Birthday",
    icon: "lucide:cake",
    description: "Make it memorable",
  },
  {
    value: "corporate",
    label: "Corporate Event",
    icon: "lucide:briefcase",
    description: "Professional gatherings",
  },
  {
    value: "party",
    label: "Party",
    icon: "lucide:party-popper",
    description: "Celebrate in style",
  },
  {
    value: "conference",
    label: "Conference",
    icon: "lucide:presentation",
    description: "Business meetings",
  },
  {
    value: "other",
    label: "Other",
    icon: "lucide:sparkles",
    description: "Custom events",
  },
];

// Services based on event type
const availableServices = computed(() => {
  const baseServices = [
    { key: "decor", label: "Decor & Styling", icon: "lucide:palette" },
    { key: "catering", label: "Food & Catering", icon: "lucide:utensils" },
    { key: "dj", label: "DJ / Music", icon: "lucide:music" },
    { key: "photography", label: "Photography / Videography", icon: "lucide:camera" },
    { key: "transportation", label: "Transportation / Shuttle", icon: "lucide:bus" },
  ];

  // Add officiant for weddings
  if (formData.value.eventType === "wedding") {
    baseServices.splice(3, 0, {
      key: "officiant",
      label: "Officiant / Celebrant",
      icon: "lucide:scroll",
    });
  }

  baseServices.push({ key: "other", label: "Other Services", icon: "lucide:plus-circle" });

  return baseServices;
});

// Budget formatting
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Step validation
const validateStep = (step: number) => {
  if (step === 1 && !formData.value.eventType) {
    return false;
  }
  if (step === 2 && formData.value.budgetMin >= formData.value.budgetMax) {
    return false;
  }
  if (step === 3 && formData.value.guestCount < 1) {
    return false;
  }
  if (step === 4 && formData.value.needsAccommodation && formData.value.accommodationGuests < 1) {
    return false;
  }
  return true;
};

// Navigation
const nextStep = () => {
  if (currentStep.value < totalSteps && validateStep(currentStep.value)) {
    direction.value = 'forward';
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    direction.value = 'backward';
    currentStep.value--;
  }
};

// Handle form submission
const submitForm = async () => {
  // TODO: Submit to your backend/Supabase
  console.log("Form submitted:", formData.value);

  // Show success message (you can add a toast notification here)
  alert("Event created successfully!");
};

// Watch accommodation toggle
watch(() => formData.value.needsAccommodation, (needsAccommodation) => {
  if (!needsAccommodation) {
    formData.value.accommodationRooms = 0;
    formData.value.accommodationGuests = 0;
    formData.value.extraAccommodation = { vipRooms: 0, standardRooms: 0 };
  }
});

// Watch other services toggle
watch(() => formData.value.services.other, (hasOther) => {
  if (!hasOther) {
    formData.value.otherServices = "";
  }
});

// Computed button text
const nextButtonText = computed(() => {
  if (currentStep.value === totalSteps) {
    return 'Create Event';
  }
  return 'Next';
});

// Can proceed check
const canProceed = computed(() => validateStep(currentStep.value));
</script>

<template>
  <!-- Landing Page -->
  <div v-if="showLanding" class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>

    <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
      <div class="text-center mb-16">
        <!-- Icon/Badge -->
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-8 shadow-xl transform hover:scale-110 transition-transform">
          <Icon name="lucide:sparkles" class="w-10 h-10 text-white" />
        </div>

        <!-- Headline -->
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Let Us Help You Plan Your
          <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dream Event
          </span>
        </h1>

        <!-- Subheadline -->
        <p class="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          List what you're looking for and let venues and service providers apply to you.
          Sit back while the perfect options come to you.
        </p>

        <!-- CTA Button -->
        <button
          @click="showLanding = false"
          class="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 cursor-pointer"
        >
          <Icon name="lucide:plus-circle" class="w-6 h-6" />
          Create Your Event
          <Icon name="lucide:arrow-right" class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <!-- Features Grid -->
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <!-- Feature 1 -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-purple-100">
          <div class="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
            <Icon name="lucide:list-checks" class="w-7 h-7 text-purple-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">
            Tell Us What You Need
          </h3>
          <p class="text-gray-600 leading-relaxed">
            Share your event details, budget, guest count, and services you're looking for in just a few minutes.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-purple-100">
          <div class="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
            <Icon name="lucide:users" class="w-7 h-7 text-pink-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">
            Receive Proposals
          </h3>
          <p class="text-gray-600 leading-relaxed">
            Qualified venues and service providers will review your requirements and send you personalized proposals.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-purple-100">
          <div class="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
            <Icon name="lucide:check-circle" class="w-7 h-7 text-purple-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">
            Choose the Best Fit
          </h3>
          <p class="text-gray-600 leading-relaxed">
            Compare offers, chat with providers, and select the perfect match for your special event.
          </p>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mt-16 text-center">
        <div class="inline-flex items-center gap-8 bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-purple-100">
          <div class="flex items-center gap-2">
            <Icon name="lucide:clock" class="w-5 h-5 text-purple-600" />
            <span class="text-gray-700 font-medium">Takes 5 minutes</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:shield-check" class="w-5 h-5 text-purple-600" />
            <span class="text-gray-700 font-medium">100% Free</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:zap" class="w-5 h-5 text-purple-600" />
            <span class="text-gray-700 font-medium">No commitment</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Stepper Form -->
  <div v-else class="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <!-- Back to Landing (Optional) -->
      <button
        @click="showLanding = true"
        class="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
        <span class="text-sm">Back to overview</span>
      </button>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
            :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Step Content with Transitions -->
      <div class="relative min-h-[500px]">
        <Transition :name="direction === 'forward' ? 'slide-left' : 'slide-right'" mode="out-in">
          <!-- Step 1: Event Type -->
          <div v-if="currentStep === 1" key="step1" class="space-y-8">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                What type of event are you planning?
              </h1>
              <p class="text-lg text-gray-600">
                Select the category that best fits your event
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <button
                v-for="type in eventTypes"
                :key="type.value"
                type="button"
                @click="formData.eventType = type.value"
                :class="[
                  'relative p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] text-left cursor-pointer',
                  formData.eventType === type.value
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                ]"
              >
                <div class="flex flex-col items-center text-center gap-3 pointer-events-none">
                  <div
                    :class="[
                      'w-14 h-14 rounded-full flex items-center justify-center',
                      formData.eventType === type.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    <Icon :name="type.icon" class="w-7 h-7" />
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ type.label }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ type.description }}</p>
                  </div>
                </div>
                <div
                  v-if="formData.eventType === type.value"
                  class="absolute top-3 right-3 pointer-events-none"
                >
                  <Icon name="lucide:check-circle" class="w-6 h-6 text-purple-500" />
                </div>
              </button>
            </div>
          </div>

          <!-- Step 2: Budget -->
          <div v-else-if="currentStep === 2" key="step2" class="space-y-8">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                What's your budget?
              </h1>
              <p class="text-lg text-gray-600">
                Set your budget range to help us find the perfect options
              </p>
            </div>

            <div class="space-y-8">
              <!-- Budget Display -->
              <div class="flex items-center justify-between gap-4">
                <div class="bg-gray-50 rounded-2xl px-6 py-5 flex-1 border-2 border-gray-200">
                  <p class="text-sm text-gray-500 mb-1">Minimum</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ formatCurrency(formData.budgetMin) }}
                  </p>
                </div>
                <Icon name="lucide:arrow-right" class="w-6 h-6 text-gray-400" />
                <div class="bg-purple-50 rounded-2xl px-6 py-5 flex-1 border-2 border-purple-200">
                  <p class="text-sm text-purple-600 mb-1">Maximum</p>
                  <p class="text-2xl font-bold text-purple-600">
                    {{ formatCurrency(formData.budgetMax) }}
                  </p>
                </div>
              </div>

              <!-- Min Budget Slider -->
              <div>
                <label class="block text-base font-medium text-gray-700 mb-3">
                  Minimum Budget
                </label>
                <input
                  v-model.number="formData.budgetMin"
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <!-- Max Budget Slider -->
              <div>
                <label class="block text-base font-medium text-gray-700 mb-3">
                  Maximum Budget
                </label>
                <input
                  v-model.number="formData.budgetMax"
                  type="range"
                  min="0"
                  max="500000"
                  step="5000"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>

          <!-- Step 3: Guest Count -->
          <div v-else-if="currentStep === 3" key="step3" class="space-y-8">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                How many guests are you expecting?
              </h1>
              <p class="text-lg text-gray-600">
                Approximate number of attendees
              </p>
            </div>

            <div class="flex items-center justify-center gap-6 py-12">
              <button
                type="button"
                @click="formData.guestCount = Math.max(1, formData.guestCount - 10)"
                class="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 text-gray-600 hover:text-purple-600 font-bold text-2xl transition-all"
              >
                -
              </button>

              <div class="text-center">
                <input
                  v-model.number="formData.guestCount"
                  type="number"
                  min="1"
                  class="w-32 text-center text-5xl font-bold text-gray-900 border-0 border-b-4 border-gray-200 focus:border-purple-500 focus:outline-none pb-2"
                />
                <p class="text-lg text-gray-500 mt-4">guests</p>
              </div>

              <button
                type="button"
                @click="formData.guestCount += 10"
                class="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 text-gray-600 hover:text-purple-600 font-bold text-2xl transition-all"
              >
                +
              </button>
            </div>
          </div>

          <!-- Step 4: Accommodation -->
          <div v-else-if="currentStep === 4" key="step4" class="space-y-8">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Do you need accommodation?
              </h1>
              <p class="text-lg text-gray-600">
                We can help arrange rooms for your guests
              </p>
            </div>

            <!-- Toggle Switch -->
            <label class="flex items-center justify-between cursor-pointer p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition-all">
              <span class="text-xl font-medium text-gray-900">
                Accommodation Required
              </span>
              <div class="relative">
                <input
                  v-model="formData.needsAccommodation"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="w-16 h-9 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 transition-colors"
                ></div>
                <div
                  class="absolute left-1 top-1 w-7 h-7 bg-white rounded-full transition-transform peer-checked:translate-x-7 shadow-md"
                ></div>
              </div>
            </label>

            <!-- Accommodation Details (shown when toggle is on) -->
            <div
              v-if="formData.needsAccommodation"
              class="space-y-4 animate-fade-in"
            >
              <div class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <label class="block text-base font-medium text-gray-700 mb-3">
                  Number of guests needing accommodation
                </label>
                <input
                  v-model.number="formData.accommodationGuests"
                  type="number"
                  min="0"
                  class="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  placeholder="e.g., 20"
                />
              </div>

              <div class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <label class="block text-base font-medium text-gray-700 mb-3">
                  Estimated number of rooms needed
                </label>
                <input
                  v-model.number="formData.accommodationRooms"
                  type="number"
                  min="0"
                  class="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  placeholder="e.g., 10"
                />
                <p class="text-sm text-gray-500 mt-2">
                  Typically 2 people per room
                </p>
              </div>

              <!-- Extra Accommodation -->
              <div class="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="lucide:star" class="w-5 h-5 text-purple-600" />
                  Extra Accommodation Options
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      VIP / Suite Rooms
                    </label>
                    <input
                      v-model.number="formData.extraAccommodation.vipRooms"
                      type="number"
                      min="0"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Additional Standard Rooms
                    </label>
                    <input
                      v-model.number="formData.extraAccommodation.standardRooms"
                      type="number"
                      min="0"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Services -->
          <div v-else-if="currentStep === 5" key="step5" class="space-y-8">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                What services do you need?
              </h1>
              <p class="text-lg text-gray-600">
                Select all that apply
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                v-for="service in availableServices"
                :key="service.key"
                class="relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02]"
                :class="[
                  formData.services[service.key as keyof typeof formData.services]
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                ]"
              >
                <input
                  v-model="formData.services[service.key as keyof typeof formData.services]"
                  type="checkbox"
                  class="sr-only"
                />

                <div class="flex items-center gap-4 flex-1">
                  <div
                    :class="[
                      'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                      formData.services[service.key as keyof typeof formData.services]
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    <Icon :name="service.icon" class="w-6 h-6" />
                  </div>

                  <span class="font-medium text-gray-900">
                    {{ service.label }}
                  </span>
                </div>

                <div
                  v-if="formData.services[service.key as keyof typeof formData.services]"
                  class="absolute top-3 right-3"
                >
                  <Icon name="lucide:check-circle" class="w-5 h-5 text-purple-500" />
                </div>
              </label>
            </div>

            <!-- Other Services Text Input -->
            <div
              v-if="formData.services.other"
              class="animate-fade-in"
            >
              <label class="block text-base font-medium text-gray-700 mb-3">
                Please specify other services
              </label>
              <textarea
                v-model="formData.otherServices"
                rows="4"
                class="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Describe any additional services you need..."
              ></textarea>
            </div>
          </div>

          <!-- Step 6: Service Details -->
          <div v-else-if="currentStep === 6" key="step6" class="space-y-8">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Tell us about your service requirements
              </h1>
              <p class="text-lg text-gray-600">
                Provide details for each service you've selected
              </p>
            </div>

            <div class="space-y-6">
              <!-- Decor Details -->
              <div v-if="formData.services.decor" class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <label class="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="lucide:palette" class="w-5 h-5 text-purple-600" />
                  Decor & Styling
                </label>
                <textarea
                  v-model="formData.serviceDetails.decor"
                  rows="3"
                  class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="What style or theme are you envisioning? Any specific colors, decorations, or ambiance preferences?"
                ></textarea>
              </div>

              <!-- Catering Details -->
              <div v-if="formData.services.catering" class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <label class="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="lucide:utensils" class="w-5 h-5 text-purple-600" />
                  Food & Catering
                </label>
                <textarea
                  v-model="formData.serviceDetails.catering"
                  rows="3"
                  class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="What type of cuisine or menu style? Any dietary restrictions or preferences (vegetarian, halal, kosher, etc.)?"
                ></textarea>
              </div>

              <!-- DJ/Music Details -->
              <div v-if="formData.services.dj" class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <label class="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="lucide:music" class="w-5 h-5 text-purple-600" />
                  DJ / Music
                </label>
                <textarea
                  v-model="formData.serviceDetails.dj"
                  rows="3"
                  class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="What genre or style of music? Any specific songs or artists you'd like included? Live band or DJ?"
                ></textarea>
              </div>

              <!-- Officiant Details -->
              <div v-if="formData.services.officiant" class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <label class="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="lucide:scroll" class="w-5 h-5 text-purple-600" />
                  Officiant / Celebrant
                </label>
                <textarea
                  v-model="formData.serviceDetails.officiant"
                  rows="3"
                  class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="What type of ceremony? Any religious or cultural requirements? Traditional or modern style?"
                ></textarea>
              </div>

              <!-- Photography Details -->
              <div v-if="formData.services.photography" class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <label class="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="lucide:camera" class="w-5 h-5 text-purple-600" />
                  Photography / Videography
                </label>
                <textarea
                  v-model="formData.serviceDetails.photography"
                  rows="3"
                  class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Photo, video, or both? Any specific shots or moments you want captured? Style preference (candid, posed, artistic)?"
                ></textarea>
              </div>

              <!-- Transportation Details -->
              <div v-if="formData.services.transportation" class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <label class="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="lucide:bus" class="w-5 h-5 text-purple-600" />
                  Transportation / Shuttle
                </label>
                <textarea
                  v-model="formData.serviceDetails.transportation"
                  rows="3"
                  class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="How many people need transportation? Pick-up and drop-off locations? Special vehicle requirements?"
                ></textarea>
              </div>

              <!-- Other Services Details -->
              <div v-if="formData.services.other" class="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <label class="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="lucide:plus-circle" class="w-5 h-5 text-purple-600" />
                  Other Services
                </label>
                <textarea
                  v-model="formData.serviceDetails.other"
                  rows="3"
                  class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Please provide details about the other services you mentioned..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 7: Notes -->
          <div v-else-if="currentStep === 7" key="step7" class="space-y-8">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Any additional details?
              </h1>
              <p class="text-lg text-gray-600">
                Tell us more about your vision (optional)
              </p>
            </div>

            <textarea
              v-model="formData.notes"
              rows="10"
              class="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Share your vision, preferences, dietary restrictions, theme ideas, or any other important details..."
            ></textarea>
          </div>
        </Transition>
      </div>

      <!-- Navigation Buttons -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <!-- Back Button -->
          <button
            v-if="currentStep > 1"
            type="button"
            @click="prevStep"
            class="flex items-center gap-2 px-6 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all underline"
          >
            <Icon name="lucide:arrow-left" class="w-5 h-5" />
            Back
          </button>
          <div v-else></div>

          <!-- Next/Submit Button -->
          <button
            v-if="currentStep < totalSteps"
            type="button"
            @click="nextStep"
            :disabled="!canProceed"
            :class="[
              'px-8 py-4 font-bold rounded-xl transition-all flex items-center gap-2 text-lg',
              canProceed
                ? 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
          >
            Next
            <Icon name="lucide:arrow-right" class="w-5 h-5" />
          </button>
          <button
            v-else
            type="button"
            @click="submitForm"
            class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-lg shadow-lg cursor-pointer"
          >
            <Icon name="lucide:sparkles" class="w-5 h-5" />
            Create Event
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Blob Animation */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}


/* Slide Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar for textareas */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

textarea::-webkit-scrollbar-thumb {
  background: #c084fc;
  border-radius: 10px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #a855f7;
}

/* Custom range slider styling */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #9333ea;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #9333ea;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Toggle switch animation */
input[type="checkbox"]:checked + div {
  transition: background-color 0.3s ease;
}

/* Remove number input arrows for cleaner look */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
