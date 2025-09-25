<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="My Events" description="View and manage your upcoming and past events">
        <template #right>
          <USelectMenu
            v-model="activeTab"
            :options="tabOptions"
            class="w-40"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardPanelContent>
        <UTabs v-model="activeTab" :items="tabs" class="w-full">
          <!-- Upcoming Events Tab -->
          <template #upcoming>
            <div class="space-y-4">
              <div v-if="upcomingEvents.length > 0" class="space-y-4">
                <div
                  v-for="event in upcomingEvents"
                  :key="event.id"
                  class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {{ event.title }}
                        </h3>
                        <UBadge
                          :color="getEventStatusColor(event.status)"
                          :label="event.status"
                        />
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

                      <div class="flex items-center gap-2">
                        <UButton
                          color="primary"
                          variant="soft"
                          size="sm"
                          icon="i-heroicons-eye"
                          label="View Details"
                          @click="viewEvent(event)"
                        />
                        <UButton
                          color="gray"
                          variant="ghost"
                          size="sm"
                          icon="i-heroicons-pencil-square"
                          label="Edit"
                          @click="editEvent(event)"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col items-end gap-2 ml-4">
                      <div class="text-right">
                        <div class="text-sm text-gray-500 dark:text-gray-400">Days until event</div>
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {{ getDaysUntil(event.date) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-12">
                <UIcon name="i-heroicons-calendar-plus" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No upcoming events
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  You don't have any events scheduled yet. Start planning your next event!
                </p>
                <UButton
                  color="primary"
                  icon="i-heroicons-plus"
                  label="Create Event"
                  @click="createEvent"
                />
              </div>
            </div>
          </template>

          <!-- Past Events Tab -->
          <template #past>
            <div class="space-y-4">
              <div v-if="pastEvents.length > 0" class="space-y-4">
                <div
                  v-for="event in pastEvents"
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

                      <div class="flex items-center gap-2">
                        <UButton
                          color="gray"
                          variant="soft"
                          size="sm"
                          icon="i-heroicons-eye"
                          label="View Details"
                          @click="viewEvent(event)"
                        />
                        <UButton
                          v-if="event.photos"
                          color="gray"
                          variant="ghost"
                          size="sm"
                          icon="i-heroicons-photo"
                          label="Photos"
                          @click="viewPhotos(event)"
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

              <div v-else class="text-center py-12">
                <UIcon name="i-heroicons-archive-box" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No past events
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                  Your completed events will appear here once you start hosting events.
                </p>
              </div>
            </div>
          </template>
        </UTabs>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { useAuth } from "~/stores/auth";

definePageMeta({
  layout: "dashboard",
});

const auth = useAuth();

const activeTab = ref("upcoming");

const tabs = [
  {
    key: "upcoming",
    label: "Upcoming Events",
    icon: "i-heroicons-calendar-days",
  },
  {
    key: "past",
    label: "Past Events",
    icon: "i-heroicons-archive-box",
  },
];

const tabOptions = tabs.map(tab => ({
  label: tab.label,
  value: tab.key,
}));

// Mock data - replace with actual API calls
const upcomingEvents = ref([
  {
    id: 1,
    title: "Summer Wedding Reception",
    description: "Beautiful outdoor wedding reception for Sarah & Mike with garden ceremony and dinner under the stars.",
    date: "2024-07-15",
    time: "6:00 PM",
    venue: "Garden Estate Venue",
    guests: 150,
    status: "Confirmed",
  },
  {
    id: 2,
    title: "Corporate Team Building Event",
    description: "Annual company retreat with team building activities, workshops, and networking dinner.",
    date: "2024-08-22",
    time: "9:00 AM",
    venue: "Conference Center Downtown",
    guests: 85,
    status: "Planning",
  },
  {
    id: 3,
    title: "Birthday Party Celebration",
    description: "Surprise 30th birthday party with cocktails, dinner, and live music entertainment.",
    date: "2024-09-10",
    time: "7:00 PM",
    venue: "Rooftop Lounge",
    guests: 45,
    status: "Pending",
  },
]);

const pastEvents = ref([
  {
    id: 4,
    title: "Spring Gala Fundraiser",
    description: "Charity gala event raising funds for local education programs with silent auction and dinner.",
    date: "2024-04-20",
    time: "6:30 PM",
    venue: "Grand Ballroom Hotel",
    guests: 200,
    photos: true,
  },
  {
    id: 5,
    title: "Product Launch Event",
    description: "Company product launch with presentations, demos, and networking reception.",
    date: "2024-03-15",
    time: "2:00 PM",
    venue: "Tech Innovation Hub",
    guests: 120,
    photos: true,
  },
]);

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getDaysUntil = (dateString: string) => {
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getDaysSince = (dateString: string) => {
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - eventDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getEventStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "green";
    case "planning":
      return "yellow";
    case "pending":
      return "orange";
    default:
      return "gray";
  }
};

// Event actions
const viewEvent = (event: any) => {
  // Navigate to event detail page or open modal
  console.log("Viewing event:", event);
  useToast().add({
    title: "Event Details",
    description: `Viewing details for ${event.title}`,
    color: "blue",
  });
};

const editEvent = (event: any) => {
  // Navigate to edit event page or open modal
  console.log("Editing event:", event);
  useToast().add({
    title: "Edit Event",
    description: `Editing ${event.title}`,
    color: "blue",
  });
};

const createEvent = () => {
  // Navigate to create event page
  console.log("Creating new event");
  useToast().add({
    title: "Create Event",
    description: "Opening event creation form",
    color: "green",
  });
};

const viewPhotos = (event: any) => {
  // Open photos modal or gallery
  console.log("Viewing photos for:", event);
  useToast().add({
    title: "Event Photos",
    description: `Viewing photos from ${event.title}`,
    color: "blue",
  });
};
</script>