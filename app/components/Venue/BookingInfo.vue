<template>
  <div class="mt-6">
    <hr class="border-gray-200 mt-6" />

    <div class="text-2xl font-semibold mt-6">Booking Information</div>

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
import Browsing2 from "@/components/svgs/Browsing2.vue";
import Calendar7 from "@/components/svgs/Calendar7.vue";
import Lock4 from "@/components/svgs/Lock4.vue";
import Payment20 from "@/components/svgs/Payment20.vue";
import Watch7 from "@/components/svgs/Watch7.vue";

const rentalInfo = [
  {
    icon: Watch7,
    text: "Venue hosts typically respond to viewing requests within 24 hours.",
  },
  {
    icon: Calendar7,
    text: "Choose a preferred date and the host will confirm or propose an alternative time.",
  },
  {
    icon: Browsing2,
    text: "Host contact details are provided once your viewing is confirmed.",
  },
  {
    icon: Lock4,
    text: "Viewings are completely free — no payment or commitment required.",
  },
  {
    icon: Payment20,
    text: "Compare multiple venues before deciding — it's the best way to find your perfect match.",
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
