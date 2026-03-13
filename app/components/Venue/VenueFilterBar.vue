<script setup lang="ts">
// Define the EventType type
type EventType = string;

// Use the provided event types
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

// Map event types to appropriate icons using mdi icons
const getIconForEventType = (type: EventType): string => {
  switch (type) {
    case "Wedding":
      return "mdi:ring";
    case "Conference":
      return "mdi:presentation";
    case "Corporate Event":
    case "Corporate":
      return "mdi:office-building";
    case "Birthday":
      return "mdi:cake-variant";
    case "Concert":
      return "mdi:music";
    case "Exhibition":
      return "mdi:image";
    case "Workshop":
      return "mdi:tools";
    case "Social":
      return "mdi:account-group";
    case "Private Party":
      return "mdi:party-popper";
    case "Team Building":
      return "mdi:account-multiple";
    case "Other":
      return "mdi:dots-horizontal";
    default:
      return "mdi:help-circle";
  }
};

// Active filter state
const activeFilter = ref<EventType | null>(null);

// Carousel state
const currentIndex = ref(0);
const isLargeScreen = ref(true);

// Responsive breakpoint check
const checkScreenSize = () => {
  if (typeof window !== "undefined") {
    isLargeScreen.value = window.innerWidth >= 1024;
    if (isLargeScreen.value) {
      currentIndex.value = 0; // Reset carousel on large screens
    }
  }
};

// Items per page based on screen size
const itemsPerPage = computed(() => {
  if (isLargeScreen.value) {
    return availableEventTypes.length; // Show all items on large screens
  }
  // On smaller screens, show 4 items at a time
  return 4;
});

// Computed properties for carousel
const totalPages = computed(() =>
  Math.ceil(availableEventTypes.length / itemsPerPage.value)
);

const visibleItems = computed(() => {
  if (isLargeScreen.value) {
    return availableEventTypes; // Show all items on large screens
  }
  const start = currentIndex.value * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return availableEventTypes.slice(start, end);
});

const canGoPrevious = computed(
  () => !isLargeScreen.value && currentIndex.value > 0
);
const canGoNext = computed(
  () => !isLargeScreen.value && currentIndex.value < totalPages.value - 1
);
const showCarouselControls = computed(
  () => !isLargeScreen.value && totalPages.value > 1
);

// Navigation functions
const goToPrevious = () => {
  if (canGoPrevious.value) {
    currentIndex.value--;
  }
};

const goToNext = () => {
  if (canGoNext.value) {
    currentIndex.value++;
  }
};

// Toggle filter function
const toggleFilter = (type: EventType) => {
  if (activeFilter.value === type) {
    activeFilter.value = null; // Clear filter if already active
  } else {
    activeFilter.value = type; // Set new filter
  }

  // Emit event for parent component to handle filtering
  emit("filter-change", activeFilter.value);
};

// Define emits
const emit = defineEmits(["filter-change"]);

// Handle screen size changes
onMounted(() => {
  checkScreenSize();
  if (typeof window !== "undefined") {
    window.addEventListener("resize", checkScreenSize);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", checkScreenSize);
  }
});
</script>

<template>
  <div class="w-full py-6 px-2 mb-8 rounded-lg">
    <div class="container mx-auto">
      <!-- Filter title -->
      <div class="flex items-center justify-between mb-6 px-4">
        <button
          v-if="activeFilter"
          class="text-sm text-mulberry hover:text-mulberry-dark transition-colors duration-200 hover:underline cursor-pointer"
          @click="toggleFilter(activeFilter)"
        >
          Clear Filter
        </button>
      </div>

      <!-- Carousel container -->
      <div class="relative">
        <!-- Left Arrow -->
        <button
          v-if="canGoPrevious"
          @click="goToPrevious"
          class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 cursor-pointer"
        >
          <UIcon
            name="i-heroicons-chevron-left"
            class="h-5 w-5 text-gray-700"
          />
        </button>

        <!-- Right Arrow -->
        <button
          v-if="canGoNext"
          @click="goToNext"
          class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 cursor-pointer"
        >
          <UIcon
            name="i-heroicons-chevron-right"
            class="h-5 w-5 text-gray-700"
          />
        </button>

        <!-- Items container -->
        <div :class="showCarouselControls ? 'px-12' : 'px-2'">
          <div
            class="transition-all duration-300"
            :class="[
              isLargeScreen
                ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-2'
                : 'grid grid-cols-4 gap-4',
            ]"
          >
            <button
              v-for="eventType in visibleItems"
              :key="eventType.value"
              :class="[
                'flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 transform',
                activeFilter === eventType.value
                  ? 'text-mulberry scale-105'
                  : 'text-gray-600 hover:text-gray-400 hover:scale-102',
              ]"
              @click="toggleFilter(eventType.value)"
            >
              <div
                class="w-12 h-12 flex items-center justify-center mb-3 transition-all duration-300"
              >
                <UIcon
                  :name="getIconForEventType(eventType.value)"
                  size="28px"
                  :class="[
                    'transition-all duration-300',
                    activeFilter === eventType.value
                      ? 'text-mulberry'
                      : 'text-gray-600 group-hover:text-gray-400',
                  ]"
                />
              </div>
              <span class="text-sm font-medium whitespace-nowrap text-center">{{
                eventType.label
              }}</span>
            </button>
          </div>
        </div>

        <!-- Pagination dots -->
        <div
          v-if="showCarouselControls"
          class="flex justify-center mt-4 space-x-2"
        >
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentIndex = page - 1"
            :class="[
              'w-2 h-2 rounded-full transition-all duration-200 cursor-pointer',
              currentIndex === page - 1
                ? 'bg-mulberry'
                : 'bg-gray-300 hover:bg-gray-400',
            ]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-mulberry {
  color: #c0397a;
}

.bg-mulberry {
  background-color: #c0397a;
}

.text-mulberry-dark {
  color: #a02e65;
}

.hover\:scale-102:hover {
  transform: scale(1.02);
}
</style>
