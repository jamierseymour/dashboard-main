<script setup lang="ts">
// Define the prize data structure
interface PrizeEntry {
  position: string;
  amount: string;
}

// Prize data based on the image provided
const prizeData: PrizeEntry[] = [
  { position: "1st", amount: "R 300,000" },
  { position: "2nd", amount: "R 150,000" },
  { position: "3rd", amount: "R 100,000" },
  { position: "4th", amount: "R 50,000" },
  { position: "5th", amount: "R 30,000" },
  { position: "6 to 10", amount: "R 20,000" },
  { position: "11 to 15", amount: "R 10,000" },
  { position: "16 to 20", amount: "R 7,000" },
  { position: "21 to 25", amount: "R 6,000" },
  { position: "26 to 30", amount: "R 5,000" },
  { position: "31 to 35", amount: "R 4,000" },
  { position: "36 to 40", amount: "R 3,000" },
  { position: "41 to 50", amount: "R 2,000" },
  { position: "51 to 60", amount: "R 1,500" },
  { position: "61 to 80", amount: "R 1,000" },
  { position: "81 to 100", amount: "R 500" },
  { position: "101 - 200", amount: "R 200" },
  { position: "201 to 300", amount: "R 100" },
];
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Header -->
    <div class="grid grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
      <div
        class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-600"
      >
        Position
      </div>
      <div
        class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right"
      >
        Prize Amount
      </div>
    </div>

    <!-- Prize entries -->
    <div
      class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded-b-lg"
    >
      <div
        v-for="(entry, index) in prizeData"
        :key="index"
        class="grid grid-cols-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
      >
        <div
          class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700"
        >
          {{ entry.position }}
        </div>
        <div
          class="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 text-right"
        >
          {{ entry.amount }}
        </div>
      </div>
    </div>
  </div>
</template>
