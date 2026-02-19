<script setup lang="ts">
import type { BookingWithDetails } from "~/types/booking";

const props = defineProps<{
  booking: BookingWithDetails | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  accept: [bookingId: string];
  decline: [bookingId: string];
}>();

function closeModal() {
  emit("close");
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format date and time
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
    case "declined":
      return "error";
    case "completed":
      return "primary";
    default:
      return "neutral";
  }
};

// Prevent background scroll when modal is open
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);

onUnmounted(() => {
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && booking"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="closeModal"
        />

        <!-- Modal Content -->
        <div
          class="modal-content relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Close button -->
          <button
            type="button"
            class="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            aria-label="Close modal"
            @click="closeModal"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>

          <!-- Modal Body -->
          <div class="p-6">
            <!-- Header -->
            <div class="mb-6 pr-12">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Viewing Request Details
              </h2>
              <UBadge
                :color="getStatusColor(booking.booking_status)"
                variant="subtle"
                size="lg"
                class="capitalize"
              >
                {{ booking.booking_status }}
              </UBadge>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Left Column -->
              <div class="space-y-6">
                <!-- Venue Information -->
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Venue
                  </h3>
                  <div v-if="booking.venue?.photos?.[0]" class="mb-4 rounded-lg overflow-hidden">
                    <img
                      :src="booking.venue.photos[0]"
                      :alt="booking.venue.venue_name"
                      class="w-full h-48 object-cover"
                    />
                  </div>
                  <div class="space-y-2">
                    <div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Venue name</p>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ booking.venue?.venue_name || "N/A" }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Address</p>
                      <p class="font-medium text-gray-900 dark:text-white text-sm">
                        {{ booking.venue?.address || "N/A" }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Guest / Couple Information -->
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      Enquirer
                    </h3>
                    <NuxtLink
                      v-if="booking.user_id"
                      :to="`/users/profile/${booking.user_id}`"
                      class="text-sm text-primary hover:text-primary-600 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <UIcon name="i-heroicons-user-circle" class="w-4 h-4" />
                      View Profile
                    </NuxtLink>
                  </div>
                  <div class="space-y-2">
                    <div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ booking.guest?.name || "Guest" }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ booking.guest?.email || "N/A" }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Message from Guest -->
                <div
                  v-if="booking.message_to_host"
                  class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
                >
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Message
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300 text-sm">
                    {{ booking.message_to_host }}
                  </p>
                </div>

                <!-- Host Response -->
                <div
                  v-if="booking.host_response_message"
                  class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
                >
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Your Response
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300 text-sm">
                    {{ booking.host_response_message }}
                  </p>
                </div>
              </div>

              <!-- Right Column -->
              <div class="space-y-6">
                <!-- Viewing & Event Details -->
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Event Details
                  </h3>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Preferred viewing date</span>
                      <span class="font-medium text-gray-900 dark:text-white">
                        {{ formatDate(booking.check_in_date) }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Event / wedding date</span>
                      <span class="font-medium text-gray-900 dark:text-white">
                        {{ formatDate(booking.check_out_date) }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Expected guests</span>
                      <span class="font-medium text-gray-900 dark:text-white">
                        {{ booking.number_of_guests }} guests
                      </span>
                    </div>
                    <div
                      v-if="booking.accommodation_needed > 0"
                      class="flex justify-between items-center"
                    >
                      <span class="text-sm text-gray-600 dark:text-gray-400">Accommodation needed</span>
                      <span class="font-medium text-gray-900 dark:text-white">Yes</span>
                    </div>
                  </div>
                </div>

                <!-- Timeline -->
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Timeline
                  </h3>
                  <div class="space-y-2 text-sm">
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Requested:</span>
                      <span class="font-medium text-gray-900 dark:text-white ml-2">
                        {{ formatDateTime(booking.created_at) }}
                      </span>
                    </div>
                    <div v-if="booking.confirmed_at">
                      <span class="text-gray-600 dark:text-gray-400">Confirmed:</span>
                      <span class="font-medium text-gray-900 dark:text-white ml-2">
                        {{ formatDateTime(booking.confirmed_at) }}
                      </span>
                    </div>
                    <div v-if="booking.cancelled_at">
                      <span class="text-gray-600 dark:text-gray-400">Declined:</span>
                      <span class="font-medium text-gray-900 dark:text-white ml-2">
                        {{ formatDateTime(booking.cancelled_at) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Cancellation Info -->
                <div
                  v-if="booking.cancellation_reason"
                  class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4"
                >
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Declined Details
                  </h3>
                  <div class="space-y-2 text-sm">
                    <div v-if="booking.cancelled_by">
                      <span class="text-gray-600 dark:text-gray-400">Declined by:</span>
                      <span class="font-medium text-gray-900 dark:text-white ml-2 capitalize">
                        {{ booking.cancelled_by }}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Reason:</span>
                      <p class="font-medium text-gray-900 dark:text-white mt-1">
                        {{ booking.cancellation_reason }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div
              v-if="booking.booking_status === 'pending'"
              class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div class="flex flex-wrap justify-end gap-3">
                <UButton
                  color="error"
                  variant="outline"
                  size="lg"
                  class="cursor-pointer"
                  icon="i-heroicons-x-mark"
                  @click="emit('decline', booking.id)"
                >
                  Not a Fit
                </UButton>
                <UButton
                  color="neutral"
                  variant="soft"
                  size="lg"
                  class="cursor-pointer"
                  icon="i-heroicons-chat-bubble-left-ellipsis"
                >
                  Message Couple
                </UButton>
                <UButton
                  color="success"
                  variant="solid"
                  size="lg"
                  class="cursor-pointer"
                  icon="i-heroicons-calendar-days"
                  @click="emit('accept', booking.id)"
                >
                  Accept &amp; Propose Time
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-content {
  scrollbar-width: thin;
  scrollbar-color: rgb(156 163 175) transparent;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
  margin: 12px 0;
}

.modal-content::-webkit-scrollbar-thumb {
  background-color: rgb(156 163 175);
  border-radius: 20px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background-color: rgb(107 114 128);
}

.dark .modal-content {
  scrollbar-color: rgb(75 85 99) transparent;
}

.dark .modal-content::-webkit-scrollbar-thumb {
  background-color: rgb(75 85 99);
}

.dark .modal-content::-webkit-scrollbar-thumb:hover {
  background-color: rgb(107 114 128);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
  opacity: 0;
}
</style>
