<script setup lang="ts">
const router = useRouter();
const toast = useToast();

// Inject clearDraft function from the page component
const clearDraft = inject<(() => void) | undefined>("clearDraft", undefined);

const handleExit = () => {
  router.push("/");
};

const handleClearDraft = () => {
  if (clearDraft) {
    clearDraft();
    toast.add({
      title: "Draft Cleared",
      description: "Your venue draft has been cleared.",
      color: "primary",
    });
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header with logo and exit button -->
    <header class="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo on the left -->
        <NuxtLink to="/">
          <NuxtImg src="logos/logo.svg" class="py-2" height="120" width="120" />
        </NuxtLink>

        <!-- Buttons on the right -->
        <div class="flex items-center gap-3">
          <UButton
            v-if="clearDraft"
            label="Clear Draft"
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            size="md"
            class="rounded-full cursor-pointer"
            @click="handleClearDraft"
          />
          <UButton
            label="Exit"
            icon="i-lucide-x"
            colour="error"
            class="rounded-full text-dark-900 border cursor-pointer bg-light-50 border-dark-400 hover:border-dark-900 !hover:bg-light-400"
            @click="handleExit"
          />
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
