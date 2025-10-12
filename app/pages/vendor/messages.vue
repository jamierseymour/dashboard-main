<script setup lang="ts">
definePageMeta({
  layout: "vendor",
  middleware: "auth",
});

const auth = useAuth();

// Sample messages data
const messages = ref([
  {
    id: 1,
    customer_name: "John Smith",
    customer_avatar: "https://ui-avatars.com/api/?name=John+Smith&background=FFBE61&color=000000",
    last_message: "Hi, I'm interested in booking your Garden Palace venue for my wedding...",
    unread: true,
    timestamp: "2 hours ago",
    venue_name: "Garden Palace",
  },
  {
    id: 2,
    customer_name: "Sarah Johnson",
    customer_avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=4F46E5&color=FFFFFF",
    last_message: "Thank you for the quote. Can we schedule a site visit?",
    unread: false,
    timestamp: "5 hours ago",
    venue_name: "City Conference Center",
  },
  {
    id: 3,
    customer_name: "Mike Wilson",
    customer_avatar: "https://ui-avatars.com/api/?name=Mike+Wilson&background=10B981&color=FFFFFF",
    last_message: "The event was perfect! Thank you so much for everything.",
    unread: false,
    timestamp: "Yesterday",
    venue_name: "Sunset Lounge",
  },
]);

const selectedMessage = ref(null);

const selectMessage = (message: any) => {
  selectedMessage.value = message;
  if (message.unread) {
    message.unread = false;
  }
};

const unreadCount = computed(() => {
  return messages.value.filter(m => m.unread).length;
});
</script>

<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Messages
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Chat with your customers
          <span v-if="unreadCount > 0" class="ml-2 text-primary font-semibold">
            ({{ unreadCount }} unread)
          </span>
        </p>
      </div>
    </div>

    <!-- Messages Interface -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
        <!-- Messages List -->
        <div class="lg:col-span-1 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div class="p-4">
            <div class="relative">
              <UInput
                icon="i-heroicons-magnifying-glass"
                placeholder="Search messages..."
                class="mb-4"
              />
            </div>
          </div>

          <!-- Message Items -->
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="message in messages"
              :key="message.id"
              class="p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              :class="{
                'bg-gray-50 dark:bg-gray-800': selectedMessage?.id === message.id,
                'bg-blue-50 dark:bg-blue-900/20': message.unread
              }"
              @click="selectMessage(message)"
            >
              <div class="flex items-start gap-3">
                <div class="relative">
                  <UAvatar
                    :src="message.customer_avatar"
                    :alt="message.customer_name"
                    size="md"
                  />
                  <div
                    v-if="message.unread"
                    class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-gray-900"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <h4
                      class="text-sm font-semibold text-gray-900 dark:text-white truncate"
                      :class="{ 'font-bold': message.unread }"
                    >
                      {{ message.customer_name }}
                    </h4>
                    <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      {{ message.timestamp }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {{ message.venue_name }}
                  </p>
                  <p
                    class="text-sm text-gray-600 dark:text-gray-400 truncate"
                    :class="{ 'font-semibold': message.unread }"
                  >
                    {{ message.last_message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Thread -->
        <div class="lg:col-span-2 flex flex-col">
          <div v-if="!selectedMessage" class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <UIcon
                name="i-heroicons-chat-bubble-left-right"
                class="w-16 h-16 text-gray-400 mx-auto mb-4"
              />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No conversation selected
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Choose a message from the list to start chatting
              </p>
            </div>
          </div>

          <div v-else class="flex-1 flex flex-col">
            <!-- Conversation Header -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="selectedMessage.customer_avatar"
                  :alt="selectedMessage.customer_name"
                  size="md"
                />
                <div>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                    {{ selectedMessage.customer_name }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ selectedMessage.venue_name }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Messages Area -->
            <div class="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
              <div class="space-y-4">
                <!-- Sample Message -->
                <div class="flex items-start gap-3">
                  <UAvatar
                    :src="selectedMessage.customer_avatar"
                    :alt="selectedMessage.customer_name"
                    size="sm"
                  />
                  <div class="flex-1">
                    <div class="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm">
                      <p class="text-sm text-gray-900 dark:text-white">
                        {{ selectedMessage.last_message }}
                      </p>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                      {{ selectedMessage.timestamp }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-2">
                <UInput
                  placeholder="Type your message..."
                  class="flex-1"
                />
                <UButton
                  icon="i-heroicons-paper-airplane"
                  color="primary"
                  variant="solid"
                  square
                >
                  Send
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
