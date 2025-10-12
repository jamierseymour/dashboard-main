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

// Close modal
function closeModal() {
  auth.toggleModal(false);
}

// Prevent background scroll when modal is open
watch(() => auth.modal, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
    // Reset to login tab when modal closes
    activeTab.value = 'login';
  }
});

// Clean up on unmount
onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <!-- Custom Modal Overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="auth.modal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="closeModal"
        ></div>

        <!-- Modal Content -->
        <div
          class="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Close button -->
          <button
            type="button"
            class="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            @click="closeModal"
            aria-label="Close modal"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>

          <!-- Modal Body -->
          <div class="p-6">
            <!-- Accessibility title -->
            <h2 id="auth-modal-title" class="sr-only">
              {{ modalTitle }}
            </h2>

            <!-- Tab Navigation - Only show if not in forgot password mode -->
            <div
              v-if="activeTab !== 'forgot-password'"
              class="flex border-b border-gray-200 dark:border-gray-700 mb-6"
            >
              <button
                class="w-1/2 py-4 cursor-pointer text-center text-xl font-bold transition-all duration-200 border-b-2"
                :class="
                  activeTab === 'login'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary'
                "
                @click="activeTab = 'login'"
                type="button"
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
                type="button"
                role="tab"
                :aria-selected="activeTab === 'register'"
              >
                Register
              </button>
            </div>

            <!-- Back button for forgot password -->
            <div
              v-else
              class="flex items-center border-b border-gray-200 dark:border-gray-700 py-4 mb-6"
            >
              <button
                @click="activeTab = 'login'"
                type="button"
                class="flex items-center text-primary hover:text-primary-600 transition-colors cursor-pointer"
              >
                <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
                <span class="font-medium">Back to Login</span>
              </button>
            </div>

            <!-- Form Content -->
            <div
              role="tabpanel"
              :aria-labelledby="
                activeTab === 'login'
                  ? 'login-tab'
                  : activeTab === 'register'
                    ? 'register-tab'
                    : 'forgot-password-tab'
              "
            >
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
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
