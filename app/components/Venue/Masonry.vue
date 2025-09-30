<script setup>
// Props
const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  venueName: {
    type: String,
    default: "Beautiful Venue",
  },
  maxImages: {
    type: Number,
    default: 8,
  },
});

console.log("Masonry images:", props.images);

// Reactive state
const selectedImageIndex = ref(null);
const isLiked = ref(false);

// Normalize images to handle both URL strings and objects
const normalizeImages = (images) => {
  return images.map((image, index) => {
    // If it's a string (URL), convert to object
    if (typeof image === 'string') {
      return {
        url: image,
        alt: `${props.venueName} - Photo ${index + 1}`
      };
    }
    // If it's already an object, return as is
    return image;
  });
};

// Sample images for demo (replace with your actual images)
const sampleImages = props.images.length > 0 ? normalizeImages(props.images) : [];

// Computed
const displayImages = computed(() => sampleImages.slice(0, props.maxImages));

// Methods
const openLightbox = (index) => {
  selectedImageIndex.value = index;
};

const closeLightbox = () => {
  selectedImageIndex.value = null;
};

const nextImage = () => {
  selectedImageIndex.value =
    selectedImageIndex.value === displayImages.value.length - 1
      ? 0
      : selectedImageIndex.value + 1;
};

const prevImage = () => {
  selectedImageIndex.value =
    selectedImageIndex.value === 0
      ? displayImages.value.length - 1
      : selectedImageIndex.value - 1;
};

const setSelectedIndex = (index) => {
  selectedImageIndex.value = index;
};

const handleShare = async () => {
  if (process.client) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: props.venueName,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Sharing failed:", err);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast notification here
        console.log("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  }
};

// Keyboard navigation
const handleKeyDown = (e) => {
  if (selectedImageIndex.value === null) return;

  if (e.key === "Escape") {
    closeLightbox();
  } else if (e.key === "ArrowLeft") {
    prevImage();
  } else if (e.key === "ArrowRight") {
    nextImage();
  }
};

// Lifecycle hooks
onMounted(() => {
  if (process.client) {
    document.addEventListener("keydown", handleKeyDown);
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener("keydown", handleKeyDown);
  }
});

// Watch for lightbox state to handle body scroll
watch(selectedImageIndex, (newValue) => {
  if (process.client) {
    if (newValue !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }
});

// SEO and meta
definePageMeta({
  title: "Venue Gallery",
});
</script>

<!-- <style scoped>
/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-4 {
    @apply grid-cols-2 grid-rows-3 h-80;
  }
}

@media (max-width: 480px) {
  .grid-cols-4 {
    @apply grid-cols-1 gap-1;
    grid-template-rows: 200px repeat(4, 100px);
    height: auto;
  }

  .col-span-2 {
    @apply col-span-1;
  }

  .row-span-2 {
    @apply row-span-1;
  }
}
</style> -->
<template>
  <div class="w-full max-w-6xl mx-auto">
    <!-- Header with actions -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-900">{{ venueName }}</h2>
      <div class="flex space-x-2">
        <button
          @click="handleShare"
          class="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Icon name="lucide:share-2" size="16" />
          <span class="hidden sm:inline">Share</span>
        </button>
        <button
          @click="isLiked = !isLiked"
          :class="[
            'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors',
            isLiked
              ? 'border-red-500 bg-red-50 text-red-600'
              : 'border-gray-300 hover:bg-gray-50',
          ]"
        >
          <Icon
            name="lucide:heart"
            size="16"
            :class="isLiked ? 'fill-current' : ''"
          />
          <span class="hidden sm:inline">Save</span>
        </button>
      </div>
    </div>

    <!-- Masonry Grid -->
    <div class="relative">
      <!-- Single image layout -->
      <div
        v-if="displayImages.length === 1"
        class="w-full h-96 rounded-2xl overflow-hidden cursor-pointer group relative"
      >
        <NuxtImg
          :src="displayImages[0].url"
          :alt="displayImages[0].alt"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          @click="openLightbox(0)"
          loading="lazy"
        />
      </div>

      <!-- Two images layout -->
      <div
        v-else-if="displayImages.length === 2"
        class="grid grid-cols-2 gap-2 h-96 rounded-2xl overflow-hidden"
      >
        <div
          v-for="(image, index) in displayImages"
          :key="index"
          class="cursor-pointer group relative overflow-hidden"
        >
          <NuxtImg
            :src="image.url"
            :alt="image.alt"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            @click="openLightbox(index)"
            loading="lazy"
          />
        </div>
      </div>

      <!-- 3+ images masonry layout -->
      <div
        v-else-if="displayImages.length >= 3"
        class="grid grid-cols-4 grid-rows-2 gap-2 h-96 md:grid-cols-4 sm:grid-cols-2 sm:grid-rows-3 sm:h-80"
      >
        <!-- Main large image -->
        <div
          class="col-span-2 row-span-2 cursor-pointer group relative overflow-hidden rounded-2xl sm:col-span-2 sm:row-span-2"
        >
          <NuxtImg
            :src="displayImages[0].url"
            :alt="displayImages[0].alt"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            @click="openLightbox(0)"
            loading="lazy"
            :placeholder="[400, 400, 75, 5]"
          />
        </div>

        <!-- Top right images -->
        <div class="cursor-pointer group relative overflow-hidden rounded-2xl">
          <NuxtImg
            :src="displayImages[1]?.url || displayImages[0].url"
            :alt="displayImages[1]?.alt || displayImages[0].alt"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            @click="openLightbox(1)"
            loading="lazy"
          />
        </div>

        <div class="cursor-pointer group relative overflow-hidden rounded-2xl">
          <NuxtImg
            :src="displayImages[2]?.url || displayImages[0].url"
            :alt="displayImages[2]?.alt || displayImages[0].alt"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            @click="openLightbox(2)"
            loading="lazy"
          />
        </div>

        <!-- Bottom right images -->
        <div class="cursor-pointer group relative overflow-hidden rounded-2xl">
          <NuxtImg
            :src="displayImages[3]?.url || displayImages[0].url"
            :alt="displayImages[3]?.alt || displayImages[0].alt"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            @click="openLightbox(3)"
            loading="lazy"
          />
        </div>

        <div class="cursor-pointer group relative overflow-hidden rounded-2xl">
          <NuxtImg
            :src="displayImages[4]?.url || displayImages[0].url"
            :alt="displayImages[4]?.alt || displayImages[0].alt"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            @click="openLightbox(4)"
            loading="lazy"
          />

          <!-- Show more overlay if there are more than 5 images -->
          <div
            v-if="displayImages.length > 5"
            class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl"
          >
            <span class="text-white font-semibold text-lg">
              +{{ displayImages.length - 5 }} more
            </span>
          </div>
        </div>
      </div>

      <!-- View all photos button -->
      <button
        v-if="displayImages.length > 1"
        @click="openLightbox(0)"
        class="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm flex items-center space-x-2"
      >
        <Icon name="lucide:more-horizontal" size="16" />
        <span>View all {{ displayImages.length }} photos</span>
      </button>
    </div>

    <!-- Lightbox Modal -->
    <LazyVenueLightboxModal
      v-if="selectedImageIndex !== null"
      :images="displayImages"
      :selected-index="selectedImageIndex"
      @close="closeLightbox"
      @prev="prevImage"
      @next="nextImage"
      @select="setSelectedIndex"
    />
  </div>
</template>
