<script setup>
import { ref, watch, onMounted } from "vue";
import { useSupabaseClient } from "#imports";
import { useAuth } from "#imports";

const props = defineProps({
  initialImages: {
    type: Array,
    default: () => [],
  },
  bucketName: {
    type: String,
    default: "venue-photos",
  },
  folderPath: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:images"]);

const auth = useAuth();
const supabase = useSupabaseClient();
const toast = useToast();
const images = ref([]);
const isDragging = ref(false);
const isDragOver = ref(false);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const isUploading = ref(false);
const uploadQueue = ref([]);
const currentUploadIndex = ref(0);
const totalUploads = ref(0);

// Compress and resize an image file before upload.
// Reduces large camera photos (often 10MB+) to a few hundred KB.
function compressImage(file, maxWidth = 1920, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" })),
          "image/jpeg",
          quality,
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Touch support variables
const touchStartIndex = ref(null);
const touchStartPos = ref({ x: 0, y: 0 });
const touchCurrentPos = ref({ x: 0, y: 0 });

// Initialize with any existing images
onMounted(() => {
  if (props.initialImages && props.initialImages.length > 0) {
    images.value = props.initialImages.map((url, index) => ({
      id: `existing-${index}`,
      url,
      cdnUrl: url, // For existing images, the url is already the CDN url
      path: extractPathFromUrl(url),
    }));
  }
});

// Extract the storage path from a Supabase URL
function extractPathFromUrl(url) {
  if (!url) return null;

  try {
    // For URLs like: https://your-project.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch (e) {
    console.error("Error extracting path from URL:", e);
    return null;
  }
}

// Watch for changes to images array and emit updated CDN URLs
watch(
  () => images.value,
  (newImages) => {
    const imageUrls = newImages.map((img) => img.cdnUrl).filter((url) => url);
    emit("update:images", imageUrls);
  },
  { deep: true },
);

const processUploadQueue = async () => {
  if (
    uploadQueue.value.length === 0 ||
    currentUploadIndex.value >= uploadQueue.value.length
  ) {
    isUploading.value = false;
    uploadQueue.value = [];
    currentUploadIndex.value = 0;
    totalUploads.value = 0;
    return;
  }

  const currentItem = uploadQueue.value[currentUploadIndex.value];
  const { file, imageId } = currentItem;

  try {
    // Compress before upload — converts large camera shots to ~200–500 KB JPEG
    const compressed = await compressImage(file);

    // Sanitise filename: strip spaces and special chars, force .jpg extension
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/\.[^.]+$/, ".jpg")}`;
    const basePath = props.folderPath ? `${props.folderPath}/` : "";
    const filePath = auth.user?.id
      ? `${basePath}${auth.user.id}/${props.id}/${safeName}`
      : `${basePath}${props.id}/${safeName}`;

    const { error } = await supabase.storage
      .from(props.bucketName)
      .upload(filePath, compressed, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg",
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(props.bucketName)
      .getPublicUrl(filePath);

    const imageIndex = images.value.findIndex((img) => img.id === imageId);
    if (imageIndex !== -1) {
      images.value[imageIndex].cdnUrl = urlData.publicUrl;
      images.value[imageIndex].path = filePath;
      images.value = [...images.value];
      const imageUrls = images.value.map((img) => img.cdnUrl).filter(Boolean);
      emit("update:images", imageUrls);
    }
  } catch (err) {
    console.error("💥 Upload failed:", err?.message ?? err);
    toast.add({
      title: "Photo upload failed",
      description: err?.message ?? "Check your internet connection and try again.",
      color: "error",
    });
    // Remove the failed placeholder
    const imageIndex = images.value.findIndex((img) => img.id === imageId);
    if (imageIndex !== -1) {
      images.value.splice(imageIndex, 1);
      images.value = [...images.value];
    }
  }

  currentUploadIndex.value++;
  await processUploadQueue();
};

const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files);

  if (files.length === 0) return;

  // Filter out files that would exceed the 8 image limit
  const availableSlots = 8 - images.value.length;
  const filesToProcess = files.slice(0, availableSlots);

  if (filesToProcess.length === 0) {
    console.log("⚠️ Maximum 8 images reached");
    return;
  }

  console.log(`📁 Uploading ${filesToProcess.length} file(s)...`);

  isUploading.value = true;
  uploadQueue.value = [];
  currentUploadIndex.value = 0;

  // Use Promise.all to wait for all FileReader operations to complete
  const fileReadPromises = filesToProcess.map((file) => {
    return new Promise((resolve, reject) => {
      const imageId = Date.now() + Math.random();
      const reader = new FileReader();

      reader.onload = (e) => {
        images.value.push({
          id: imageId,
          url: e.target.result, // Local preview URL
          file,
          cdnUrl: null, // Will be populated after upload
          path: null, // Will be populated after upload
        });
        resolve({ file, imageId });
      };

      reader.onerror = (e) => {
        console.error("FileReader error:", file.name, e);
        reject(e);
      };

      reader.readAsDataURL(file);
    });
  });

  // Wait for all file reads to complete
  try {
    const readResults = await Promise.all(fileReadPromises);
    uploadQueue.value = readResults;
    totalUploads.value = uploadQueue.value.length;

    // Start processing the upload queue
    await processUploadQueue();
  } catch (error) {
    console.error("Error reading files:", error);
    isUploading.value = false;
  }

  // Reset input
  event.target.value = "";
};

const removeImage = async (index) => {
  if (index < 0 || index >= images.value.length) return;

  const image = images.value[index];

  // Remove from local array first (immediate UI feedback)
  images.value.splice(index, 1);

  // Then handle Supabase storage cleanup in background
  if (image.path) {
    try {
      await supabase.storage.from(props.bucketName).remove([image.path]);
    } catch (error) {
      console.error("Error removing from storage:", error);
    }
  }
};

// Enhanced drag and drop functions
const startDrag = (event, index) => {
  if (isUploading.value) {
    event.preventDefault();
    return;
  }

  isDragging.value = true;
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", index.toString());

  // Create a custom drag image that looks like a floating card
  const originalCard = event.target;
  const dragCard = originalCard.cloneNode(true);

  // Style the drag image to look like a floating card
  dragCard.style.position = "absolute";
  dragCard.style.top = "-1000px";
  dragCard.style.left = "-1000px";
  dragCard.style.width = originalCard.offsetWidth + "px";
  dragCard.style.height = originalCard.offsetHeight + "px";
  dragCard.style.transform = "rotate(3deg) scale(1.05)";
  dragCard.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
  dragCard.style.borderRadius = "8px";
  dragCard.style.zIndex = "9999";
  dragCard.style.opacity = "0.9";

  document.body.appendChild(dragCard);

  // Set the custom drag image
  event.dataTransfer.setDragImage(
    dragCard,
    originalCard.offsetWidth / 2,
    originalCard.offsetHeight / 2,
  );

  // Remove the temporary drag image after a short delay
  setTimeout(() => {
    if (document.body.contains(dragCard)) {
      document.body.removeChild(dragCard);
    }
  }, 0);
};

const onDragOver = (event, index) => {
  if (isUploading.value) return;

  isDragOver.value = true;
  dragOverIndex.value = index;
  event.dataTransfer.dropEffect = "move";
};

const onDragLeave = () => {
  isDragOver.value = false;
  dragOverIndex.value = null;
};

const endDrag = () => {
  isDragging.value = false;
  isDragOver.value = false;
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const onDrop = (event, dropIndex) => {
  event.preventDefault();

  if (isUploading.value) return;

  const dragIndex = parseInt(event.dataTransfer.getData("text/plain"));

  if (dragIndex === dropIndex || isNaN(dragIndex)) {
    endDrag();
    return;
  }

  moveImage(dragIndex, dropIndex);
  endDrag();
};

// Touch support for mobile devices
const onTouchStart = (event, index) => {
  if (isUploading.value) return;

  touchStartIndex.value = index;
  const touch = event.touches[0];
  touchStartPos.value = { x: touch.clientX, y: touch.clientY };
  touchCurrentPos.value = { x: touch.clientX, y: touch.clientY };
};

const onTouchMove = (event) => {
  if (isUploading.value || touchStartIndex.value === null) return;

  event.preventDefault();
  const touch = event.touches[0];
  touchCurrentPos.value = { x: touch.clientX, y: touch.clientY };

  // Add visual feedback for touch drag
  const deltaX = Math.abs(touch.clientX - touchStartPos.value.x);
  const deltaY = Math.abs(touch.clientY - touchStartPos.value.y);

  if (deltaX > 10 || deltaY > 10) {
    isDragging.value = true;
    draggedIndex.value = touchStartIndex.value;
  }
};

const onTouchEnd = (event) => {
  if (isUploading.value || touchStartIndex.value === null) return;

  // Find the element under the touch point
  const touch = event.changedTouches[0];
  const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);

  if (elementUnder) {
    const targetContainer = elementUnder.closest('[draggable="true"]');
    if (targetContainer) {
      const allContainers = Array.from(
        document.querySelectorAll('[draggable="true"]'),
      );
      const targetIndex = allContainers.indexOf(targetContainer);

      if (targetIndex !== -1 && targetIndex !== touchStartIndex.value) {
        moveImage(touchStartIndex.value, targetIndex);
      }
    }
  }

  // Reset touch state
  touchStartIndex.value = null;
  isDragging.value = false;
  draggedIndex.value = null;
};

// Utility function to move images (used by both drag/drop and button clicks)
const moveImage = (fromIndex, toIndex) => {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= images.value.length ||
    toIndex >= images.value.length
  ) {
    return;
  }

  const item = images.value[fromIndex];

  // Remove item from original position and insert at new position
  images.value.splice(fromIndex, 1);
  images.value.splice(toIndex, 0, item);
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-6">
      <label
        class="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
        :class="{ 'opacity-50 cursor-not-allowed': images.length >= 8 }"
      >
        <span class="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span class="font-medium text-gray-600">
            {{
              images.length >= 8
                ? "Maximum images reached"
                : "Drop files to upload or browse"
            }}
          </span>
        </span>
        <input
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileUpload"
          :disabled="images.length >= 8 || isUploading"
          multiple
        />
      </label>
    </div>

    <div v-if="isUploading" class="mb-4">
      <UProgress animation="carousel" color="primary" />
      <p class="text-center text-sm text-gray-500 mt-2">
        Compressing &amp; uploading photo {{ currentUploadIndex + 1 }} of {{ totalUploads }}…
      </p>
    </div>

    <!-- Reorder instructions -->
    <div
      v-if="images.length > 1 && !isUploading"
      class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
    >
      <div class="flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
        <p class="text-sm text-blue-700">
          <span class="font-medium">Tip:</span> Drag and drop images to reorder
          them
        </p>
      </div>
    </div>

    <TransitionGroup
      name="image-list"
      tag="div"
      class="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="relative group rounded-lg overflow-hidden transition-all duration-200"
        :class="{
          'cursor-move': !isUploading,
          'cursor-not-allowed': isUploading,
          'opacity-30': isDragging && draggedIndex === index,
          'border-2 border-dashed border-blue-400 bg-blue-50':
            isDragOver && dragOverIndex === index && draggedIndex !== index,
          'transform scale-95 opacity-75': isDragging && draggedIndex !== index,
        }"
        draggable="true"
        @dragstart="startDrag($event, index)"
        @dragend="endDrag"
        @dragover.prevent="onDragOver($event, index)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, index)"
        @touchstart="onTouchStart($event, index)"
        @touchmove="onTouchMove($event)"
        @touchend="onTouchEnd($event)"
      >
        <img
          :src="image.url"
          :alt="'Image ' + (index + 1)"
          class="w-full h-48 object-cover transition-all duration-200"
          :class="{ 'pointer-events-none': isDragging }"
        />

        <!-- Drag handle indicator -->
        <div
          v-if="!isUploading"
          class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div class="p-1 bg-white bg-opacity-80 rounded-full shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>
        </div>

        <div
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          :class="{ 'opacity-100': isDragging && draggedIndex === index }"
          style="background-color: rgba(0, 0, 0, 0.5)"
        >
          <div class="absolute top-2 right-2 flex space-x-2">
            <button
              @click="removeImage(index)"
              class="p-1.5 bg-red-500 rounded-full cursor-pointer text-white hover:bg-red-600 focus:outline-none transition-colors duration-200"
              :disabled="isUploading"
              :class="{ 'opacity-50 cursor-not-allowed': isUploading }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            class="absolute bottom-2 left-2 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded"
          >
            {{ index + 1 }} of {{ images.length }}
          </div>
        </div>

        <!-- Reorder arrows for mobile/accessibility -->
        <div
          v-if="images.length > 1 && !isUploading"
          class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div class="flex space-x-1">
            <button
              v-if="index > 0"
              @click="moveImage(index, index - 1)"
              class="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200"
              title="Move left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              v-if="index < images.length - 1"
              @click="moveImage(index, index + 1)"
              class="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200"
              title="Move right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <p v-if="images.length === 0" class="text-center text-gray-500 mt-4">
      No images uploaded yet
    </p>
    <p v-else-if="images.length < 8" class="text-center text-gray-500 mt-4">
      {{ 8 - images.length }} more
      {{ 8 - images.length === 1 ? "image" : "images" }} can be added
    </p>
  </div>
</template>

<style scoped>
.image-list-move {
  transition: transform 0.3s ease;
}

.image-list-enter-active,
.image-list-leave-active {
  transition: all 0.3s ease;
}

.image-list-enter-from,
.image-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

/* Enhanced drag feedback */
.image-list-item:hover {
  transform: translateY(-2px);
}

/* Custom drag ghost styling */
.drag-ghost {
  transform: rotate(3deg) scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  opacity: 0.9;
  z-index: 9999;
}
</style>
