<template>
  <div class="mt-6">
    <hr class="border-gray-200 mt-6" />

    <div class="text-2xl font-semibold mt-6">Rental Information</div>

    <!-- Desktop Grid -->
    <div class="mt-6 hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(item, index) in rentalInfo"
        :key="index"
        class="bg-white rounded-xl shadow p-6 flex flex-col justify-between border border-gray-100"
      >
        <component :is="item.icon" class="w-8 h-8 text-gray-700 mb-4" />
        <p class="text-sm text-gray-600">{{ item.text }}</p>
      </div>
    </div>

    <!-- Mobile Carousel -->
    <div class="mt-6 md:hidden">
      <div class="relative overflow-hidden rounded-xl">
        <div
          class="flex transition-transform duration-500"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div
            v-for="(item, index) in rentalInfo"
            :key="index"
            class="flex-shrink-0 w-full flex flex-col items-center justify-center h-[40vh] bg-white rounded-xl p-6 border border-gray-100"
          >
            <component :is="item.icon" class="w-10 h-10 mb-4 text-gray-700" />
            <p class="text-center text-gray-600 text-sm">{{ item.text }}</p>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button
          class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow"
          @click="prevSlide"
        >
          ‹
        </button>
        <button
          class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow"
          @click="nextSlide"
        >
          ›
        </button>

        <!-- Dots -->
        <div
          class="absolute bottom-3 left-0 right-0 flex justify-center space-x-2"
        >
          <span
            v-for="(item, index) in rentalInfo"
            :key="index"
            class="w-2 h-2 rounded-full"
            :class="index === currentIndex ? 'bg-gray-800' : 'bg-gray-400'"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Watch7 from "@/public/svgs/Watch7.vue";
import Payment20 from "@/public/svgs/Payment20.vue";
import Calendar7 from "@/public/svgs/Calendar7.vue";
import Lock4 from "@/public/svgs/Lock4.vue";
import Browsing2 from "@/public/svgs/Browsing2.vue";

const rentalInfo = [
  {
    icon: Watch7,
    text: "Lenders typically confirm the request within 48 hours.",
  },
  {
    icon: Payment20,
    text: "You will be charged only once the lender has accepted your request.",
  },
  {
    icon: Calendar7,
    text: "Free cancellation up until 48 hours before the rental.",
  },
  {
    icon: Lock4,
    text: "Money back guarantee within 24 hours of collection if you don't receive what's promised.",
  },
  {
    icon: Browsing2,
    text: "Information about the lender will be provided once the request is accepted.",
  },
];

const currentIndex = ref(0);

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % rentalInfo.length;
};

const prevSlide = () => {
  currentIndex.value =
    (currentIndex.value - 1 + rentalInfo.length) % rentalInfo.length;
};
</script>
