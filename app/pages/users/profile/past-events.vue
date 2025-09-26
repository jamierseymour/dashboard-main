<template>
  <div class="p-6">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Past Events
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Your completed events and event history
          </p>
        </div>
        <USelectMenu
          v-model="sortBy"
          :options="sortOptions"
          class="w-40"
        />
      </div>

      <!-- Events List -->
      <div v-if="pastEvents.length > 0" class="space-y-4">
        <div
          v-for="event in sortedPastEvents"
          :key="event.id"
          class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 opacity-90"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ event.title }}
                </h3>
                <UBadge
                  color="gray"
                  variant="soft"
                  label="Completed"
                />
                <UBadge
                  v-if="event.rating"
                  color="yellow"
                  variant="soft"
                >
                  <template #label>
                    <div class="flex items-center gap-1">
                      <UIcon name="i-heroicons-star" class="w-3 h-3" />
                      {{ event.rating }}
                    </div>
                  </template>
                </UBadge>
              </div>

              <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                  {{ formatDate(event.date) }}
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                  {{ event.time }}
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                  {{ event.venue }}
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-users" class="w-4 h-4" />
                  {{ event.guests }} guests
                </div>
              </div>

              <p class="text-gray-700 dark:text-gray-300 mb-4">
                {{ event.description }}
              </p>

              <!-- Event Stats -->
              <div v-if="event.stats" class="flex items-center gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {{ event.stats.attendance }}%
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Attendance</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {{ event.stats.feedback }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Feedback Score</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    ${{ event.stats.revenue?.toLocaleString() }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <UButton
                  color="gray"
                  variant="soft"
                  size="sm"
                  icon="i-heroicons-eye"
                  label="View Details"
                  class="cursor-pointer"
                  @click="viewEvent(event)"
                />
                <UButton
                  v-if="event.photos"
                  color="gray"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-photo"
                  label="Photos ({{ event.photos }})"
                  class="cursor-pointer"
                  @click="viewPhotos(event)"
                />
                <UButton
                  v-if="event.feedback"
                  color="gray"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-chat-bubble-left-right"
                  label="Feedback"
                  class="cursor-pointer"
                  @click="viewFeedback(event)"
                />
                <UButton
                  color="gray"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-arrow-path"
                  label="Book Again"
                  class="cursor-pointer"
                  @click="bookAgain(event)"
                />
              </div>
            </div>

            <div class="flex flex-col items-end gap-2 ml-4">
              <div class="text-right">
                <div class="text-sm text-gray-500 dark:text-gray-400">Days ago</div>
                <div class="text-lg font-medium text-gray-600 dark:text-gray-400">
                  {{ getDaysSince(event.date) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <UIcon name="i-heroicons-archive-box" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No past events
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Your completed events will appear here once you start hosting events.
        </p>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          label="Create Your First Event"
          class="cursor-pointer"
          @click="createEvent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const sortBy = ref("recent");

const sortOptions = [
  { label: "Most Recent", value: "recent" },
  { label: "Oldest First", value: "oldest" },
  { label: "Highest Rating", value: "rating" },
  { label: "Largest Events", value: "size" },
];

// Mock data - replace with actual API calls
const pastEvents = ref([
  {
    id: 1,
    title: "Spring Gala Fundraiser",
    description: "Charity gala event raising funds for local education programs with silent auction and dinner.",
    date: "2024-04-20",
    time: "6:30 PM",
    venue: "Grand Ballroom Hotel",
    guests: 200,
    rating: 4.8,
    photos: 45,
    feedback: true,
    stats: {
      attendance: 95,
      feedback: 4.8,
      revenue: 25000,
    },
  },
  {
    id: 2,
    title: "Product Launch Event",
    description: "Company product launch with presentations, demos, and networking reception.",
    date: "2024-03-15",
    time: "2:00 PM",
    venue: "Tech Innovation Hub",
    guests: 120,
    rating: 4.6,
    photos: 28,
    feedback: true,
    stats: {
      attendance: 88,
      feedback: 4.6,
      revenue: 15000,
    },
  },
  {
    id: 3,
    title: "Holiday Office Party",
    description: "Annual company holiday celebration with dinner, entertainment, and awards ceremony.",
    date: "2023-12-15",
    time: "7:00 PM",
    venue: "Downtown Event Center",
    guests: 75,
    rating: 4.9,
    photos: 32,
    feedback: true,
    stats: {
      attendance: 97,
      feedback: 4.9,
      revenue: 8000,
    },
  },
]);

// Computed property for sorted events
const sortedPastEvents = computed(() => {
  const events = [...pastEvents.value];

  switch (sortBy.value) {
    case "recent":
      return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    case "oldest":
      return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    case "rating":
      return events.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "size":
      return events.sort((a, b) => b.guests - a.guests);
    default:
      return events;
  }
});

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getDaysSince = (dateString: string) => {
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - eventDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Event actions
const viewEvent = (event: any) => {
  navigateTo(`/events/${event.id}`);
};

const viewPhotos = (event: any) => {
  console.log("Viewing photos for:", event);
  useToast().add({
    title: "Event Photos",
    description: `Viewing ${event.photos} photos from ${event.title}`,
    color: "blue",
  });
};

const viewFeedback = (event: any) => {
  console.log("Viewing feedback for:", event);
  useToast().add({
    title: "Event Feedback",
    description: `Viewing feedback for ${event.title}`,
    color: "blue",
  });
};

const bookAgain = (event: any) => {
  console.log("Booking again:", event);
  useToast().add({
    title: "Book Again",
    description: `Creating similar event based on ${event.title}`,
    color: "green",
  });
};

const createEvent = () => {
  navigateTo("/create-event");
};
</script>