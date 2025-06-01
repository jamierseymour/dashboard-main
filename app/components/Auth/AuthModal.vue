<script setup lang="ts">
import Login from "./LoginForm.vue";
import Register from "./SignupForm.vue";
import { useAuth } from "~/stores/auth";

const auth = useAuth();

const activeTab = ref<"login" | "register">("login");

// Computed properties for accessibility
const modalTitle = computed(() =>
  activeTab.value === "login" ? "Login to your account" : "Create new account"
);

const modalDescription = computed(() =>
  activeTab.value === "login"
    ? "Enter your credentials to access your dashboard"
    : "Fill in your details to create a new account"
);
</script>

<template>
  <UModal
    v-model:open="auth.modal"
    :ui="{
      wrapper: 'z-50',
      content:
        'bg-white dark:bg-gray-900 rounded-3xl shadow-2xl mb-3 z-10 max-w-lg mx-auto',
    }"
    :aria-labelledby="'auth-modal-title'"
    :aria-describedby="'auth-modal-description'"
  >
    <template #content>
      <div>
        <!-- Hidden title for screen readers -->
        <h2 id="auth-modal-title" class="sr-only">
          {{ modalTitle }}
        </h2>

        <!-- Hidden description for screen readers -->
        <p id="auth-modal-description" class="sr-only">
          {{ modalDescription }}
        </p>

        <!-- Tab Navigation -->
        <div class="flex border-b border-gray-200 dark:border-gray-700">
          <button
            class="w-1/2 py-4 cursor-pointer text-center text-xl font-bold transition-all duration-200 border-b-2"
            :class="
              activeTab === 'login'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary'
            "
            @click="activeTab = 'login'"
            :aria-pressed="activeTab === 'login'"
            role="tab"
            :aria-selected="activeTab === 'login'"
          >
            Login
          </button>
          <button
            class="w-1/2 py-4 cursor-pointer text-center text-xl font-bold transition-all duration-200 border-b-2"
            :class="
              activeTab === 'register'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary'
            "
            @click="activeTab = 'register'"
            :aria-pressed="activeTab === 'register'"
            role="tab"
            :aria-selected="activeTab === 'register'"
          >
            Register
          </button>
        </div>

        <!-- Form Content -->
        <div
          class="flex justify-center items-start"
          role="tabpanel"
          :aria-labelledby="
            activeTab === 'login' ? 'login-tab' : 'register-tab'
          "
        >
          <div class="w-full">
            <Login v-if="activeTab === 'login'" />
            <Register v-else />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
/* Screen reader only class */
/* .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
} */
</style>
