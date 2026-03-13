<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
    >
      <!-- Close button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full hover:bg-white hover:bg-opacity-20 cursor-pointer"
        aria-label="Close gallery"
      >
        <Icon name="lucide:x" size="32" />
      </button>

      <!-- Image counter -->
      <div
        class="absolute top-4 left-4 text-white text-sm z-10 bg-black bg-opacity-50 px-3 py-1 rounded-full"
      >
        {{ selectedIndex + 1 }} / {{ images.length }}
      </div>

      <!-- Navigation buttons -->
      <template v-if="images.length > 1">
        <button
          @click="$emit('prev')"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-3 rounded-full hover:bg-white hover:bg-opacity-20 cursor-pointer"
          aria-label="Previous image"
        >
          <Icon name="lucide:chevron-left" size="48" />
        </button>
        <button
          @click="$emit('next')"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-3 rounded-full hover:bg-white hover:bg-opacity-20 cursor-pointer"
          aria-label="Next image"
        >
          <Icon name="lucide:chevron-right" size="48" />
        </button>
      </template>

      <!-- Image container -->
      <div class="max-w-7xl max-h-full mx-auto px-4 py-12 md:px-16">
        <NuxtImg
          :src="currentImage.url"
          :alt="currentImage.alt"
          class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          loading="eager"
        />
      </div>

      <!-- Image description -->
      <div
        class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center max-w-2xl px-4"
      >
        <p
          class="text-sm opacity-80 bg-black bg-opacity-50 px-4 py-2 rounded-full"
        >
          {{ currentImage.alt }}
        </p>
      </div>

      <!-- Thumbnail strip for larger screens -->
      <div
        v-if="images.length > 1 && images.length <= 10"
        class="absolute bottom-20 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <div class="flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg">
          <button
            v-for="(image, index) in images"
            :key="index"
            @click="$emit('select', index)"
            :class="[
              'w-16 h-16 rounded overflow-hidden transition-all duration-200 cursor-pointer',
              index === selectedIndex
                ? 'ring-2 ring-white scale-110'
                : 'opacity-70 hover:opacity-100',
            ]"
          >
            <NuxtImg
              :src="image.url"
              :alt="image.alt"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        </div>
      </div>

      <!-- Touch/swipe area for mobile -->
      <div
        class="absolute inset-0 md:hidden"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      ></div>
    </div>
  </Teleport>
</template>

<script setup>
// Props
const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  selectedIndex: {
    type: Number,
    required: true,
  },
});

// Emits
const emit = defineEmits(["close", "prev", "next", "select"]);

// Computed
const currentImage = computed(
  () => props.images[props.selectedIndex] || props.images[0]
);

// Touch handling for mobile swipe
const touchStartX = ref(0);
const touchEndX = ref(0);

const handleTouchStart = (e) => {
  touchStartX.value = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
  touchEndX.value = e.changedTouches[0].screenX;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeThreshold = 50;
  const swipeLength = touchEndX.value - touchStartX.value;

  if (Math.abs(swipeLength) > swipeThreshold) {
    if (swipeLength > 0) {
      // Swipe right - go to previous image
      emit("prev");
    } else {
      // Swipe left - go to next image
      emit("next");
    }
  }
};

// Prevent body scroll when modal is open
onMounted(() => {
  if (process.client) {
    document.body.style.overflow = "hidden";
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    document.body.style.overflow = "unset";
  }
});
</script>
