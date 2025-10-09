<script setup lang="ts">
const props = defineProps({
  venue: {
    type: Object,
    required: true,
  },
});

const selectedDate = ref();
const guests = ref(1);

async function goToRequest() {
  console.log('Navigating to:', `/venues/${props.venue.id}/request`);
  await navigateTo(`/venues/${props.venue.id}/request`);
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
    <!-- Pricing Header -->
    <div class="mb-4">
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-semibold">R{{ venue?.price }}</span>
        <span class="text-gray-600">per night</span>
      </div>
    </div>

    <!-- Date Selection -->
    <div class="mb-4 rounded-lg border border-gray-300 cursor-pointer">
      <div class="p-3">
        <div class="text-xs font-semibold uppercase">Select date</div>
        <div class="text-sm text-gray-600">
          {{ selectedDate ? new Date(selectedDate).toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" }) : "Add date" }}
        </div>
      </div>
      <div class="border-t border-gray-300 p-3">
        <div class="text-xs font-semibold uppercase">Guests</div>
        <input
          v-model.number="guests"
          type="number"
          :min="venue?.min_capacity || 1"
          :max="venue?.max_capacity || 100"
          class="w-full border-0 p-0 text-sm text-gray-600 focus:ring-0"
          placeholder="1 guest"
        />
      </div>
    </div>

    <!-- Calendar -->
    <div class="mb-4">
      <UCalendar v-model="selectedDate" />
    </div>

    <!-- Request Button -->
    <UButton
      block
      size="xl"
      color="primary"
      label="Request to book"
      class="mb-4 cursor-pointer"
      @click="goToRequest"
    />

    <p class="mb-4 text-center text-sm text-gray-600">
      You won't be charged yet
    </p>
  </div>
</template>
