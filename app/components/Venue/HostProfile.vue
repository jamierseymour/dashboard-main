<template>
  <div class="border-t border-gray-200 pt-8 mt-8">
    <h2 class="text-2xl font-semibold mb-6">Meet your host</h2>

    <div class="flex flex-col md:flex-row gap-8">
      <!-- Host Card -->
      <div class="flex-shrink-0">
        <div
          class="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 w-full md:w-80"
        >
          <div class="flex flex-col items-center text-center">
            <!-- Avatar with verification badge -->
            <div class="relative mb-4">
              <div
                class="w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
              >
                <img
                  v-if="host?.avatar_url"
                  :src="host.avatar_url"
                  :alt="host.name || 'Host'"
                  class="w-full h-full object-cover"
                />
                <Icon
                  v-else
                  name="lucide:user"
                  size="48"
                  class="text-gray-400"
                />
              </div>
              <!-- Verification badge -->
              <div
                v-if="isVerified"
                class="absolute bottom-0 right-0 bg-pink-500 rounded-full p-2 border-4 border-white"
              >
                <Icon name="lucide:check" size="20" class="text-white" />
              </div>
            </div>

            <!-- Host name -->
            <h3 class="text-3xl font-semibold mb-1">
              {{ host?.name || "Host" }}
            </h3>
            <p class="text-sm text-gray-600 mb-6">Host</p>

            <!-- Stats -->
            <div class="w-full space-y-3 mb-6">
              <div class="flex items-center justify-center gap-2">
                <Icon name="lucide:star" size="20" />
                <span class="text-lg font-semibold">{{ rating }}</span>
                <span class="text-gray-600">Rating</span>
              </div>
              <div class="border-t border-gray-200 pt-3">
                <div class="text-lg font-semibold">{{ reviewCount }}</div>
                <div class="text-sm text-gray-600">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Host Details -->
      <div class="flex-1">
        <div class="space-y-6">
          <!-- Response rate and time -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-600">Response rate</div>
              <div class="font-semibold">{{ responseRate }}%</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Response time</div>
              <div class="font-semibold">{{ responseTime }}</div>
            </div>
          </div>

          <!-- Bio -->
          <div v-if="host?.bio" class="space-y-2">
            <p class="text-gray-700 leading-relaxed">
              {{ host.bio }}
            </p>
          </div>

          <!-- Location -->
          <div v-if="location" class="flex items-start gap-3">
            <Icon name="lucide:map-pin" size="20" class="text-gray-600 mt-1" />
            <div>
              <div class="font-medium">Lives in {{ location }}</div>
            </div>
          </div>

          <!-- Message host button -->
          <div class="pt-4">
            <UButton
              color="primary"
              size="lg"
              @click="$emit('message-host')"
              class="cursor-pointer"
            >
              <Icon name="lucide:message-circle" size="20" class="mr-2" />
              Message host
            </UButton>
          </div>

          <!-- Payment protection notice -->
          <div
            class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <Icon
              name="lucide:shield-check"
              size="24"
              class="text-pink-500 flex-shrink-0 mt-0.5"
            />
            <p class="text-sm text-gray-700">
              To help protect your payment, always use the platform to send
              money and communicate with hosts.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Host {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  username?: string;
  created_at?: string;
}

const props = defineProps({
  host: {
    type: Object as () => Host | null,
    default: null,
  },
  location: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  responseRate: {
    type: Number,
    default: 100,
  },
  responseTime: {
    type: String,
    default: "within an hour",
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["message-host"]);
</script>
