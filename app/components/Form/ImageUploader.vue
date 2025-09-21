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
          class="bg-blue-600 h-2.5 rounded-full"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
      <p class="text-center text-sm text-gray-600 mt-1">
        Uploading images... {{ uploadProgress }}%
      </p>
    </div>

    <TransitionGroup
      name="image-list"
      tag="div"
      class="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="relative group rounded-lg overflow-hidden"
        :class="{
          'border-2 border-blue-500': isDragging && draggedIndex === index,
        }"
        draggable="true"
        @dragstart="startDrag($event, index)"
        @dragend="endDrag"
        @dragover.prevent
        @drop="onDrop($event, index)"
      >
        <img
          :src="image.url"
          :alt="'Image ' + (index + 1)"
          class="w-full h-48 object-cover"
        />
        <div
          class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div class="absolute top-2 right-2 flex space-x-2">
            <button
              @click="removeImage(index)"
              class="p-1.5 bg-purple-500 rounded-full cursor-pointer text-white hover:bg-purple-600 focus:outline-none"
              :disabled="isUploading"
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
          <div class="absolute bottom-2 left-2 text-white text-sm">
            {{ index + 1 }} of {{ images.length }}
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
});

const emit = defineEmits(["update:images"]);

const auth = useAuth();
const supabase = useSupabaseClient();
const images = ref([]);
const isDragging = ref(false);
const draggedIndex = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadQueue = ref([]);
const currentUploadIndex = ref(0);
const totalUploads = ref(0);

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
  { deep: true }
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
    }
  );

  try {
    // Generate a unique filename to avoid collisions
    const fileExt = file.name.split(".").pop();
    let filePath;
    if (auth.user?.id) {
      filePath = `${auth.user.id}/${
        props.folderPath ? props.folderPath + "/" : ""
      }${Date.now()}-${file.name}`;
      console.log("👤 Using authenticated user path:", filePath);
    } else {
      filePath = `${
        props.folderPath ? props.folderPath + "/" : ""
      }${Date.now()}-${file.name}`;
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
      imageIndex
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
    (currentUploadIndex.value / totalUploads.value) * 100
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
    files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
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
        images.value.length
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
  const image = images.value[index];
  console.log("📄 Image to remove:", image);

  // If this image has a path in Supabase Storage, delete it
  if (image.path) {
    console.log("🗄️ Deleting from Supabase storage:", image.path);
    try {
      const { error } = await supabase.storage
        .from(props.bucketName)
        .remove([image.path]);

      if (error) {
        console.error("💥 Error removing image from storage:", error);
      } else {
        console.log("✅ Successfully removed from storage");
      }
    } catch (error) {
      console.error("💥 Exception removing image from storage:", error);
    }
  } else {
    console.log("ℹ️ Image has no storage path, skipping storage deletion");
  }

  // Remove from local array
  images.value.splice(index, 1);
  console.log(
    "✅ Image removed from local array. Remaining images:",
    images.value.length
  );
};

const startDrag = (event, index) => {
  console.log("🎯 Start drag for index:", index);
  if (isUploading.value) {
    console.log("⚠️ Cannot drag while uploading");
    return;
  }

  isDragging.value = true;
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", index);
  console.log("✅ Drag started");
};

const endDrag = () => {
  console.log("🏁 End drag");
  isDragging.value = false;
  draggedIndex.value = null;
};

const onDrop = (event, dropIndex) => {
  console.log("📍 Drop at index:", dropIndex);
  if (isUploading.value) {
    console.log("⚠️ Cannot drop while uploading");
    return;
  }

  const dragIndex = parseInt(event.dataTransfer.getData("text/plain"));
  console.log("📊 Drag from index:", dragIndex, "to index:", dropIndex);

  if (dragIndex === dropIndex) {
    console.log("ℹ️ Same index, no reordering needed");
    return;
  }

  const item = images.value[dragIndex];
  console.log("🔄 Reordering images:", item);
  images.value.splice(dragIndex, 1);
  images.value.splice(dropIndex, 0, item);
  console.log("✅ Images reordered");
};
</script>

<style scoped>
.image-list-move {
  transition: transform 0.5s;
}

.image-list-enter-active,
.image-list-leave-active {
  transition: all 0.5s ease;
}

.image-list-enter-from,
.image-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
