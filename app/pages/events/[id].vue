<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-800">
    <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-6">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            size="sm"
            class="cursor-pointer"
            @click="goBack"
          />
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {{ event?.title }}
              </h1>
              <UBadge
                :color="getStatusColor(event?.status)"
                :label="event?.status"
                size="lg"
              />
            </div>
            <div class="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="w-5 h-5" />
                {{ formatDate(event?.date) }}
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-clock" class="w-5 h-5" />
                {{ event?.time }}
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-users" class="w-5 h-5" />
                {{ event?.guests }} guests
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              color="gray"
              variant="outline"
              icon="i-heroicons-share"
              label="Share"
              class="cursor-pointer"
              @click="shareEvent"
            />
            <UButton
              color="gray"
              variant="outline"
              icon="i-heroicons-pencil-square"
              label="Edit"
              class="cursor-pointer"
              @click="editEvent"
            />
            <UDropdownMenu :items="moreActions" :popper="{ placement: 'bottom-start' }">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-vertical"
                class="cursor-pointer"
              />
            </UDropdownMenu>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Days Until</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ getDaysUntil(event?.date) }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">RSVP Rate</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ event?.rsvpRate }}%
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-fuchsia-100 dark:bg-fuchsia-900 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  R{{ event?.budget?.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Tasks</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ event?.completedTasks }}/{{ event?.totalTasks }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Event Description -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Event Description
            </h2>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ event?.description }}
            </p>
          </div>

          <!-- Venue Information -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Venue
            </h2>
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-building-office" class="w-8 h-8 text-gray-400" />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {{ event?.venue?.name }}
                </h3>
                <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                    <span>{{ event?.venue?.address }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-users" class="w-4 h-4" />
                    <span>Capacity: {{ event?.venue?.capacity }} guests</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-banknotes" class="w-4 h-4" />
                    <span>R{{ event?.venue?.price }}/hour</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-star" class="w-4 h-4" />
                    <span>{{ event?.venue?.rating }} ({{ event?.venue?.reviews }} reviews)</span>
                  </div>
                </div>
                <div class="mt-4">
                  <UButton
                    color="gray"
                    variant="outline"
                    size="sm"
                    icon="i-heroicons-map"
                    label="View on Map"
                    class="cursor-pointer"
                    @click="viewOnMap"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Services & Add-ons -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Services & Add-ons
              </h2>
              <UButton
                color="gray"
                variant="ghost"
                size="sm"
                icon="i-heroicons-plus"
                label="Add Service"
                class="cursor-pointer"
                @click="addService"
              />
            </div>

            <div v-if="event?.services && event.services.length > 0" class="space-y-3">
              <div
                v-for="service in event.services"
                :key="service.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-fuchsia-100 dark:bg-fuchsia-900 rounded-lg flex items-center justify-center">
                    <UIcon :name="service.icon" class="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-gray-100">
                      {{ service.name }}
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ service.provider }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900 dark:text-gray-100">
                    R{{ service.price.toLocaleString() }}
                  </p>
                  <UBadge
                    :color="service.confirmed ? 'green' : 'yellow'"
                    :label="service.confirmed ? 'Confirmed' : 'Pending'"
                    size="sm"
                  />
                </div>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
                <div class="flex items-center justify-between font-semibold">
                  <span class="text-gray-900 dark:text-gray-100">Total Services:</span>
                  <span class="text-fuchsia-600 dark:text-fuchsia-400">
                    R{{ calculateServicesTotal().toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <UIcon name="i-heroicons-sparkles" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No services added yet
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Enhance your event with professional services
              </p>
              <UButton
                color="primary"
                icon="i-heroicons-plus"
                label="Add Services"
                class="cursor-pointer"
                @click="addService"
              />
            </div>
          </div>

          <!-- Event Timeline -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Event Timeline
            </h2>

            <div class="space-y-4">
              <div
                v-for="item in event?.timeline"
                :key="item.id"
                class="flex items-start gap-4"
              >
                <div class="flex-shrink-0 mt-1">
                  <div
                    class="w-3 h-3 rounded-full"
                    :class="{
                      'bg-green-500': item.completed,
                      'bg-gray-300 dark:bg-gray-600': !item.completed
                    }"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p
                      class="text-sm font-medium"
                      :class="{
                        'text-gray-900 dark:text-gray-100': item.completed,
                        'text-gray-600 dark:text-gray-400': !item.completed
                      }"
                    >
                      {{ item.title }}
                    </p>
                    <UBadge
                      v-if="item.completed"
                      color="green"
                      label="Complete"
                      size="sm"
                    />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ item.time }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Actions
            </h3>
            <div class="space-y-3">
              <UButton
                color="primary"
                variant="outline"
                icon="i-heroicons-envelope"
                label="Send Invitations"
                block
                class="cursor-pointer"
                @click="sendInvitations"
              />
              <UButton
                color="gray"
                variant="outline"
                icon="i-heroicons-document-text"
                label="View Guest List"
                block
                class="cursor-pointer"
                @click="viewGuestList"
              />
              <UButton
                color="gray"
                variant="outline"
                icon="i-heroicons-calendar"
                label="Add to Calendar"
                block
                class="cursor-pointer"
                @click="addToCalendar"
              />
              <UButton
                color="gray"
                variant="outline"
                icon="i-heroicons-chat-bubble-left-right"
                label="Message Vendors"
                block
                class="cursor-pointer"
                @click="messageVendors"
              />
            </div>
          </div>

          <!-- Event Checklist -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Event Checklist
              </h3>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ event?.completedTasks }}/{{ event?.totalTasks }} completed
              </span>
            </div>

            <div class="space-y-3">
              <div
                v-for="task in event?.checklist"
                :key="task.id"
                class="flex items-center gap-3"
              >
                <UCheckbox
                  :model-value="task.completed"
                  class="cursor-pointer"
                  @update:model-value="toggleTask(task.id)"
                />
                <span
                  class="text-sm"
                  :class="{
                    'text-gray-900 dark:text-gray-100': !task.completed,
                    'text-gray-500 dark:text-gray-400 line-through': task.completed
                  }"
                >
                  {{ task.title }}
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ Math.round((event?.completedTasks / event?.totalTasks) * 100) }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="bg-fuchsia-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(event?.completedTasks / event?.totalTasks) * 100}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Contact Information
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-phone" class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ event?.organizer?.phone }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ event?.organizer?.email }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Email</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

// Get event ID from route params
const eventId = route.params.id;

// Mock event data - replace with actual API call
const event = ref({
  id: eventId,
  title: "Summer Wedding Reception",
  status: "Confirmed",
  date: "2024-07-15",
  time: "6:00 PM",
  guests: 150,
  rsvpRate: 85,
  budget: 25000,
  completedTasks: 8,
  totalTasks: 12,
  description: "A beautiful outdoor wedding reception for Sarah & Mike featuring a garden ceremony followed by dinner and dancing under the stars. The event will include live music, professional photography, and a premium catering service with both vegetarian and non-vegetarian options.",
  venue: {
    name: "Garden Estate Venue",
    address: "123 Garden Lane, Johannesburg, Gauteng",
    capacity: 200,
    price: 1500,
    rating: 4.8,
    reviews: 42,
  },
  services: [
    {
      id: 1,
      name: "Professional Photography",
      provider: "Studio Focus",
      price: 3500,
      confirmed: true,
      icon: "i-heroicons-camera",
    },
    {
      id: 2,
      name: "Premium Catering Package",
      provider: "Gourmet Catering Co.",
      price: 18750,
      confirmed: true,
      icon: "i-heroicons-cake",
    },
    {
      id: 3,
      name: "Live Band Performance",
      provider: "The Wedding Band",
      price: 4500,
      confirmed: false,
      icon: "i-heroicons-musical-note",
    },
  ],
  timeline: [
    {
      id: 1,
      title: "Guests arrive and cocktail hour begins",
      time: "5:30 PM",
      completed: false,
    },
    {
      id: 2,
      title: "Wedding ceremony starts",
      time: "6:00 PM",
      completed: false,
    },
    {
      id: 3,
      title: "Photography session",
      time: "6:30 PM",
      completed: false,
    },
    {
      id: 4,
      title: "Dinner service begins",
      time: "7:30 PM",
      completed: false,
    },
    {
      id: 5,
      title: "Speeches and toasts",
      time: "8:30 PM",
      completed: false,
    },
    {
      id: 6,
      title: "First dance and party begins",
      time: "9:00 PM",
      completed: false,
    },
  ],
  checklist: [
    { id: 1, title: "Send invitations", completed: true },
    { id: 2, title: "Confirm venue booking", completed: true },
    { id: 3, title: "Finalize catering menu", completed: true },
    { id: 4, title: "Book photographer", completed: true },
    { id: 5, title: "Order flowers", completed: true },
    { id: 6, title: "Confirm live band", completed: false },
    { id: 7, title: "Plan seating arrangements", completed: true },
    { id: 8, title: "Arrange transportation", completed: false },
    { id: 9, title: "Final headcount", completed: false },
    { id: 10, title: "Setup decorations", completed: false },
    { id: 11, title: "Sound check", completed: true },
    { id: 12, title: "Final venue walkthrough", completed: true },
  ],
  organizer: {
    name: "Sarah Johnson",
    phone: "+27 11 123 4567",
    email: "sarah@email.com",
  },
});

// More actions dropdown
const moreActions = [
  [
    {
      label: "Duplicate Event",
      icon: "i-heroicons-document-duplicate",
      click: duplicateEvent,
    },
    {
      label: "Export Details",
      icon: "i-heroicons-document-arrow-down",
      click: exportEvent,
    },
  ],
  [
    {
      label: "Cancel Event",
      icon: "i-heroicons-x-circle",
      click: cancelEvent,
    },
  ],
];

// Utility functions
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getDaysUntil = (dateString: string) => {
  if (!dateString) return 0;
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "green";
    case "planning":
      return "yellow";
    case "pending":
      return "orange";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
};

const calculateServicesTotal = () => {
  return event.value?.services?.reduce((total, service) => total + service.price, 0) || 0;
};

// Action handlers
const goBack = () => {
  router.back();
};

const editEvent = () => {
  navigateTo(`/events/${eventId}/edit`);
};

const shareEvent = () => {
  navigator.clipboard.writeText(window.location.href);
  useToast().add({
    title: "Link Copied",
    description: "Event link copied to clipboard",
    color: "green",
  });
};

const viewOnMap = () => {
  useToast().add({
    title: "Opening Map",
    description: "Redirecting to map view...",
    color: "blue",
  });
};

const addService = () => {
  navigateTo(`/events/${eventId}/services`);
};

const sendInvitations = () => {
  useToast().add({
    title: "Invitations",
    description: "Opening invitation manager...",
    color: "blue",
  });
};

const viewGuestList = () => {
  navigateTo(`/events/${eventId}/guests`);
};

const addToCalendar = () => {
  useToast().add({
    title: "Calendar",
    description: "Adding event to calendar...",
    color: "green",
  });
};

const messageVendors = () => {
  useToast().add({
    title: "Messages",
    description: "Opening vendor messages...",
    color: "blue",
  });
};

const toggleTask = (taskId: number) => {
  const task = event.value?.checklist?.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    // Update completed tasks count
    if (event.value) {
      event.value.completedTasks = event.value.checklist?.filter(t => t.completed).length || 0;
    }
  }
};

// More actions
function duplicateEvent() {
  useToast().add({
    title: "Duplicate Event",
    description: "Creating a copy of this event...",
    color: "blue",
  });
}

function exportEvent() {
  useToast().add({
    title: "Export Event",
    description: "Preparing event details for export...",
    color: "blue",
  });
}

function cancelEvent() {
  useToast().add({
    title: "Cancel Event",
    description: "Event cancellation process started",
    color: "red",
  });
}
</script>