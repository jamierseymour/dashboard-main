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
const images = ref([]);
const isDragging = ref(false);
const isDragOver = ref(false);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadQueue = ref([]);
const currentUploadIndex = ref(0);
const totalUploads = ref(0);

// Touch support variables
const touchStartIndex = ref(null);
const touchStartPos = ref({ x: 0, y: 0 });
const touchCurrentPos = ref({ x: 0, y: 0 });

// Initialize with any existing images
onMounted(() => {
  console.log("🔧 Component mounted");
  console.log("📝 Props:", props);
  console.log("👤 Auth user:", auth.user);
  console.log("🗄️ Supabase client:", supabase);

  if (props.initialImages && props.initialImages.length > 0) {
    console.log("🖼️ Initializing with existing images:", props.initialImages);
    images.value = props.initialImages.map((url, index) => ({
      id: `existing-${index}`,
      url,
      cdnUrl: url, // For existing images, the url is already the CDN url
      path: extractPathFromUrl(url),
    }));
    console.log("✅ Images initialized:", images.value);
  } else {
    console.log("ℹ️ No initial images provided");
  }
});

// Extract the storage path from a Supabase URL
function extractPathFromUrl(url) {
  console.log("🔗 Extracting path from URL:", url);

  if (!url) {
    console.log("❌ No URL provided");
    return null;
  }

  try {
    // For URLs like: https://your-project.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    const path = match ? match[1] : null;
    console.log("📁 Extracted path:", path);
    return path;
  } catch (e) {
    console.error("💥 Error extracting path from URL:", e);
    return null;
  }
}

// Watch for changes to images array and emit updated CDN URLs
watch(
  () => images.value,
  (newImages) => {
    console.log("👀 Images array changed:", newImages);
    const imageUrls = newImages.map((img) => img.cdnUrl).filter((url) => url);
    console.log("📤 Emitting image URLs:", imageUrls);
    emit("update:images", imageUrls);
  },
  { deep: true },
);

const processUploadQueue = async () => {
  console.log("🚀 Processing upload queue");
  console.log("📊 Queue status:", {
    queueLength: uploadQueue.value.length,
    currentIndex: currentUploadIndex.value,
    totalUploads: totalUploads.value,
  });

  if (
    uploadQueue.value.length === 0 ||
    currentUploadIndex.value >= uploadQueue.value.length
  ) {
    console.log("✅ Upload queue completed");
    isUploading.value = false;
    uploadProgress.value = 0;
    uploadQueue.value = [];
    currentUploadIndex.value = 0;
    totalUploads.value = 0;
    return;
  }

  const currentItem = uploadQueue.value[currentUploadIndex.value];
  const { file, imageId } = currentItem;

  console.log(
    `📤 Uploading file ${currentUploadIndex.value + 1}/${totalUploads.value}:`,
    {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      imageId: imageId,
    },
  );

  try {
    // Generate a unique filename to avoid collisions
    const fileExt = file.name.split(".").pop();
    let filePath;
    if (auth.user?.id) {
      filePath = `${
        props.folderPath ? props.folderPath + "/" : ""
      }/${auth.user.id}/${props.id}/${Date.now()}-${file.name}`;
      console.log("👤 Using authenticated user path:", filePath);
    } else {
      filePath = `${
        props.folderPath ? props.folderPath + "/" : ""
      }/${props.id}/${Date.now()}-${file.name}`;
      console.log("🔓 Using anonymous path:", filePath);
    }

    console.log("⬆️ Starting Supabase upload...");
    console.log("🪣 Bucket:", props.bucketName);
    console.log("📁 File path:", filePath);

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(props.bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("💥 Supabase upload error:", error);
      throw error;
    }

    console.log("✅ Upload successful:", data);

    // Get the public URL
    console.log("🔗 Getting public URL...");
    const { data: urlData } = supabase.storage
      .from(props.bucketName)
      .getPublicUrl(filePath);

    console.log("🌐 Public URL data:", urlData);

    // Update the image object with the CDN URL
    const imageIndex = images.value.findIndex((img) => img.id === imageId);
    console.log(
      "🔍 Finding image index for ID",
      imageId,
      "found at:",
      imageIndex,
    );

    if (imageIndex !== -1) {
      console.log("📝 Updating image object with CDN URL:", urlData.publicUrl);
      images.value[imageIndex].cdnUrl = urlData.publicUrl;
      images.value[imageIndex].path = filePath;
      console.log("✅ Updated image object:", images.value[imageIndex]);
    } else {
      console.error("❌ Could not find image with ID:", imageId);
    }
  } catch (error) {
    console.error("💥 Error uploading image:", error);
    console.error("📊 Error details:", {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error,
    });

    // Remove the failed image from the array
    const imageIndex = images.value.findIndex((img) => img.id === imageId);
    if (imageIndex !== -1) {
      console.log("🗑️ Removing failed image from array at index:", imageIndex);
      images.value.splice(imageIndex, 1);
    }
  }

  // Update progress
  currentUploadIndex.value++;
  uploadProgress.value = Math.floor(
    (currentUploadIndex.value / totalUploads.value) * 100,
  );

  console.log("📈 Upload progress:", uploadProgress.value + "%");

  // Process next item in queue
  await processUploadQueue();
};

const handleFileUpload = async (event) => {
  console.log("📁 File upload triggered");
  const files = Array.from(event.target.files);
  console.log(
    "📎 Selected files:",
    files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
  );

  if (files.length === 0) {
    console.log("ℹ️ No files selected");
    return;
  }

  // Filter out files that would exceed the 8 image limit
  const availableSlots = 8 - images.value.length;
  const filesToProcess = files.slice(0, availableSlots);

  console.log("📊 Slot availability:", {
    currentImages: images.value.length,
    availableSlots: availableSlots,
    selectedFiles: files.length,
    filesToProcess: filesToProcess.length,
  });

  if (filesToProcess.length === 0) {
    console.log("⚠️ No files to process (limit reached)");
    return;
  }

  console.log("🚀 Starting upload process");
  isUploading.value = true;
  uploadProgress.value = 0;
  uploadQueue.value = [];
  currentUploadIndex.value = 0;

  // Prepare the upload queue and add image previews
  console.log("📋 Preparing upload queue...");
  for (const file of filesToProcess) {
    const imageId = Date.now() + Math.random();
    console.log("🆔 Generated image ID:", imageId, "for file:", file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      console.log("🖼️ File reader loaded preview for:", file.name);
      images.value.push({
        id: imageId,
        url: e.target.result, // Local preview URL
        file,
        cdnUrl: null, // Will be populated after upload
        path: null, // Will be populated after upload
      });
      console.log(
        "📝 Added image to array. Current images count:",
        images.value.length,
      );
    };

    reader.onerror = (e) => {
      console.error("💥 FileReader error for", file.name, ":", e);
    };

    reader.readAsDataURL(file);
    uploadQueue.value.push({ file, imageId });
  }

  totalUploads.value = uploadQueue.value.length;
  console.log("📊 Upload queue prepared:", {
    totalUploads: totalUploads.value,
    queueItems: uploadQueue.value.map((item) => ({
      fileName: item.file.name,
      imageId: item.imageId,
    })),
  });

  // Start processing the upload queue
  console.log("🎬 Starting upload queue processing...");
  await processUploadQueue();

  // Reset input
  event.target.value = "";
  console.log("🔄 Input reset");
};

const removeImage = async (index) => {
  console.log("🗑️ Removing image at index:", index);

  // Validate index
  if (index < 0 || index >= images.value.length) {
    console.error("❌ Invalid index for image removal:", index);
    return;
  }

  const image = images.value[index];
  console.log("📄 Image to remove:", image);

  // Remove from local array first (immediate UI feedback)
  images.value.splice(index, 1);
  console.log(
    "✅ Image removed from local array. Remaining images:",
    images.value.length,
  );

  // Then handle Supabase storage cleanup in background
  if (image.path) {
    console.log("🗄️ Deleting from Supabase storage:", image.path);
    try {
      const { error } = await supabase.storage
        .from(props.bucketName)
        .remove([image.path]);

      if (error) {
        console.error("💥 Error removing image from storage:", error);
        // Note: We don't re-add the image to the array even if storage deletion fails
        // The image is already gone from the UI, which is the primary concern
      } else {
        console.log("✅ Successfully removed from storage");
      }
    } catch (error) {
      console.error("💥 Exception removing image from storage:", error);
    }
  } else {
    console.log("ℹ️ Image has no storage path, skipping storage deletion");
  }
};

// Enhanced drag and drop functions
const startDrag = (event, index) => {
  console.log("🎯 Start drag for index:", index);
  if (isUploading.value) {
    console.log("⚠️ Cannot drag while uploading");
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

  console.log("✅ Drag started");
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
  console.log("🏁 End drag");
  isDragging.value = false;
  isDragOver.value = false;
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const onDrop = (event, dropIndex) => {
  console.log("📍 Drop at index:", dropIndex);
  event.preventDefault();

  if (isUploading.value) {
    console.log("⚠️ Cannot drop while uploading");
    return;
  }

  const dragIndex = parseInt(event.dataTransfer.getData("text/plain"));
  console.log("📊 Drag from index:", dragIndex, "to index:", dropIndex);

  if (dragIndex === dropIndex || isNaN(dragIndex)) {
    console.log("ℹ️ Same index or invalid drag, no reordering needed");
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
  console.log("🔄 Moving image from", fromIndex, "to", toIndex);

  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= images.value.length ||
    toIndex >= images.value.length
  ) {
    console.log("❌ Invalid move operation");
    return;
  }

  const item = images.value[fromIndex];
  console.log("📦 Moving item:", item);

  // Remove item from original position and insert at new position
  images.value.splice(fromIndex, 1);
  images.value.splice(toIndex, 0, item);

  console.log("✅ Images reordered successfully");
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
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
      <p class="text-center text-sm text-gray-600 mt-1">
        Uploading images... {{ uploadProgress }}%
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
