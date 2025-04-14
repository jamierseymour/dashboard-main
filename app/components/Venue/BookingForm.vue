<script setup lang="ts">
defineProps({
  venue: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="pt-4 p-4 rounded-xl bg-[#032334]">
    <!-- Yellow Centered Heading -->
    <h2 class="text-2xl font-bold text-center text-yellow-400 mb-6">
      booking details
    </h2>

    <!-- Pricing Information -->
    <div class="mb-6 text-white">
      <p class="text-xl font-bold text-center">R{{ venue?.price }}</p>
      <p class="text-sm text-center text-gray-300">
        Minimum hours: {{ venue?.minimum_hours }}
      </p>
      <p class="text-sm text-center text-gray-300">
        Notice required: {{ venue?.notice_required }} days
      </p>
    </div>

    <!-- Form -->
    <form class="space-y-6">
      <!-- Date Input -->
      <div>
        <input
          type="date"
          id="date"
          name="date"
          class="mt-1 block w-full rounded-xl border border-gray-600 bg-white py-2 px-3 text-black placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-yellow-400"
        />
      </div>

      <!-- Number of Guests Input -->
      <div>
        <input
          type="number"
          id="guests"
          name="guests"
          placeholder="Enter number of guests"
          class="mt-1 block w-full rounded-xl border border-gray-600 bg-white py-2 px-3 text-black placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-yellow-400"
        />
      </div>

      <!-- Time Input -->
      <div>
        <input
          type="text"
          id="time"
          name="time"
          placeholder="Time"
          class="mt-1 block w-full rounded-xl border border-gray-600 bg-white py-2 px-3 text-black placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-yellow-400"
        />
      </div>

      <!-- Seating Preference -->
      <div>
        <input
          type="text"
          id="seating"
          name="seating"
          placeholder="Seating Preference"
          class="mt-1 block w-full rounded-xl border border-gray-600 bg-white py-2 px-3 text-black placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-yellow-400"
        />
      </div>
    </form>

    <!-- Centered Book Now Button -->
    <div class="mt-8 flex justify-center">
      <button
        type="submit"
        class="w-full max-w-xs rounded-full mx-12 bg-white py-3 px-8 text-center text-lg font-bold text-mulberry-600 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
      >
        book now
      </button>
    </div>
  </div>
</template>
