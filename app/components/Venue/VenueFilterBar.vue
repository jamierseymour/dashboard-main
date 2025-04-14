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
</script>

<template>
  <div class="w-full py-4 px-2 mb-8 rounded-lg border-t">
    <div class="container mx-auto">
      <!-- Filter title -->
      <div class="flex items-center justify-between mb-4 px-4">
        <button
          v-if="activeFilter"
          class="text-sm text-mulberry hover:underline"
          @click="toggleFilter(activeFilter)"
        >
          Clear Filter
        </button>
      </div>

      <!-- Scrollable filter bar -->
      <div class="overflow-x-auto pb-2">
        <div class="flex space-x-4 px-2 min-w-max">
          <button
            v-for="eventType in availableEventTypes"
            :key="eventType.value"
            :class="[
              'flex flex-col items-center justify-center p-3  transition-all duration-200',
              activeFilter === eventType.value
                ? 'bg-mulberry text-white shadow-lg border-b'
                : ' text-gray-700 ',
            ]"
            @click="toggleFilter(eventType.value)"
          >
            <div
              class="w-10 h-10 flex items-center justify-center mb-2 cursor-pointer"
            >
              <UIcon
                :name="getIconForEventType(eventType.value)"
                size="24px"
                :class="
                  activeFilter === eventType.value
                    ? 'text-white'
                    : 'text-gray-700'
                "
              />
            </div>
            <span class="text-xs font-medium whitespace-nowrap">{{
              eventType.label
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-mulberry {
  color: #c0397a;
}

/* Custom scrollbar for the filter bar */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #c0397a;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a02e65;
}
</style>
