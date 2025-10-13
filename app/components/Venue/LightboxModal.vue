<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-default"
      @click.self="$emit('close')"
    >
      <!-- Close button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 flex flex-row text-white transition-colors z-20 p-2 rounded-md hover:bg-gray-600 hover:bg-opacity-20 cursor-pointer"
        aria-label="Close gallery"
      >
        <Icon name="lucide:x" size="24" />
        Close
      </button>

      <!-- Image counter -->
      <div
        class="absolute top-4 left-4 text-white text-sm z-20 bg-black bg-opacity-70 px-4 py-2 rounded-full font-medium"
      >
        {{ selectedIndex + 1 }} / {{ images.length }}
      </div>

      <!-- Navigation buttons -->
      <template v-if="images.length > 1">
        <button
          @click="$emit('prev')"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-20 p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 cursor-pointer"
          aria-label="Previous image"
        >
          <Icon name="lucide:chevron-left" size="48" />
        </button>
        <button
          @click="$emit('next')"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-20 p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 cursor-pointer"
          aria-label="Next image"
        >
          <Icon name="lucide:chevron-right" size="48" />
        </button>
      </template>

      <!-- Fullscreen Image Container -->
      <div class="w-full h-full flex items-center justify-center p-4 md:p-8">
        <Transition
          enter-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-300"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <NuxtImg
            :key="selectedIndex"
            :src="currentImage.url"
            :alt="currentImage.alt"
            class="max-w-full max-h-full w-auto h-auto object-contain"
            loading="eager"
          />
        </Transition>
      </div>

      <!-- Dot indicators -->
      <div
        v-if="images.length > 1"
        class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-20"
      >
        <button
          v-for="(image, index) in images"
          :key="index"
          @click="$emit('select', index)"
          :class="[
            'rounded-full transition-all duration-200 cursor-pointer',
            index === selectedIndex
              ? 'bg-white w-8 h-2'
              : 'bg-white bg-opacity-40 hover:bg-opacity-60 w-2 h-2',
          ]"
          :aria-label="`Go to image ${index + 1}`"
        ></button>
      </div>

      <!-- Thumbnail strip for larger screens -->
      <div
        v-if="images.length > 1 && images.length <= 10"
        class="absolute bottom-16 left-1/2 transform -translate-x-1/2 hidden md:block z-20"
      >
        <div
          class="flex space-x-2 bg-black bg-opacity-70 p-3 rounded-lg backdrop-blur-sm"
        >
          <button
            v-for="(image, index) in images"
            :key="index"
            @click="$emit('select', index)"
            :class="[
              'w-20 h-20 rounded overflow-hidden transition-all duration-200 border-2 cursor-pointer',
              index === selectedIndex
                ? 'border-white scale-110 shadow-lg'
                : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-400',
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
        class="absolute inset-0 md:hidden z-10"
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
  () => props.images[props.selectedIndex] || props.images[0],
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
  if (import.meta.client) {
    document.body.style.overflow = "hidden";
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = "unset";
  }
});
</script>
