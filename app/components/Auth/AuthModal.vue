<script setup lang="ts">
import Login from "./LoginForm.vue";
import Register from "./SignupForm.vue";
import ForgotPassword from "./ForgotPasswordForm.vue";
import { useAuth } from "~/stores/auth";

const auth = useAuth();

const activeTab = ref<"login" | "register" | "forgot-password">("login");

// Computed properties for accessibility
const modalTitle = computed(() => {
  if (activeTab.value === "login") return "Login to your account";
  if (activeTab.value === "register") return "Create new account";
  return "Reset your password";
});

const modalDescription = computed(() => {
  if (activeTab.value === "login")
    return "Enter your credentials to access your dashboard";
  if (activeTab.value === "register")
    return "Fill in your details to create a new account";
  return "Enter your email to receive password reset instructions";
});

// Handle modal close
function handleModalClose(isOpen: boolean) {
  if (!isOpen) {
    auth.toggleModal(false);
  }
}
</script>

<template>
  <UModal
    v-model:open="auth.modal"
    :ui="{
      wrapper: 'z-50',
      content:
        'bg-white dark:bg-gray-900 rounded-3xl p-3 shadow-2xl mb-3 z-10 max-w-lg mx-auto',
    }"
    :aria-labelledby="'auth-modal-title'"
    :aria-describedby="'auth-modal-description'"
    @update:open="handleModalClose"
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

        <!-- Tab Navigation - Only show if not in forgot password mode -->
        <div
          v-if="activeTab !== 'forgot-password'"
          class="flex border-b border-gray-200 dark:border-gray-700"
        >
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

        <!-- Back button for forgot password -->
        <div
          v-else
          class="flex items-center border-b border-gray-200 dark:border-gray-700 py-4 px-4"
        >
          <button
            @click="activeTab = 'login'"
            class="flex items-center text-primary hover:text-primary-600 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
            <span class="font-medium">Back to Login</span>
          </button>
        </div>

        <!-- Form Content -->
        <div
          class="flex justify-center items-start"
          role="tabpanel"
          :aria-labelledby="
            activeTab === 'login'
              ? 'login-tab'
              : activeTab === 'register'
                ? 'register-tab'
                : 'forgot-password-tab'
          "
        >
          <div class="w-full">
            <Login
              v-if="activeTab === 'login'"
              @show-forgot-password="activeTab = 'forgot-password'"
            />
            <Register v-else-if="activeTab === 'register'" />
            <ForgotPassword
              v-else-if="activeTab === 'forgot-password'"
              @back-to-login="activeTab = 'login'"
            />
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
