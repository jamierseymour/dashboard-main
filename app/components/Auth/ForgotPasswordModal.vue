<script setup lang="ts">
import { useAuth } from "~/stores/auth";

const auth = useAuth();

useSeoMeta({
  title: "Forgot Password",
});

const toast = useToast();

const email = ref("");
const loading = ref(false);
const authError = ref("");
const successMessage = ref("");

const validate = () => {
  const errors: Record<string, string> = {};
  if (!email.value) errors.email = "Email is required";
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = "Please enter a valid email address";
  }
  return errors;
};

const sendResetEmail = async () => {
  const errors = validate();
  if (Object.keys(errors).length) {
    authError.value = Object.values(errors).join(" \n");
    setTimeout(() => (authError.value = ""), 5000);
    return;
  }

  loading.value = true;
  authError.value = "";
  successMessage.value = "";

  try {
    const client = useSupabaseClient();
    const { error } = await client.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      authError.value = "Failed to send reset email. Please try again.";
      setTimeout(() => (authError.value = ""), 5000);
    } else {
      successMessage.value =
        "Password reset email sent! Please check your inbox.";
      toast.add({
        title: "Email Sent",
        description: "Check your inbox for password reset instructions.",
        color: "success",
      });

      // Clear the email field after successful send
      email.value = "";
    }
  } catch (error) {
    authError.value = "Something went wrong. Please try again.";
    setTimeout(() => (authError.value = ""), 5000);
  } finally {
    loading.value = false;
  }
};
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
      <div class="mx-auto w-5/6 p-4 pb-0">
        <UAlert
          v-if="authError"
          color="error"
          variant="soft"
          icon="i-lucide-alert-triangle"
          class="mb-4"
        >
          <p>{{ authError }}</p>
        </UAlert>

        <UAlert
          v-if="successMessage"
          color="success"
          variant="soft"
          icon="i-lucide-check-circle"
          class="mb-4"
        >
          <p>{{ successMessage }}</p>
        </UAlert>

        <div class="mb-6 text-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Forgot Password?
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="sendResetEmail">
          <div class="space-y-1">
            <label
              for="email"
              class="block text-gray-900 dark:text-white text-sm font-medium"
            >
              Email Address
            </label>
            <UInput
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              color="primary"
              variant="outline"
              class="w-full"
              required
            />
          </div>

          <div class="flex justify-center items-center">
            <UButton
              type="submit"
              class="w-1/2 py-2 text-black bg-[#FFBE61] mb-3 hover:bg-[#FFD700] rounded-full disabled:bg-gray-400 flex items-center justify-center transition-colors"
              :disabled="loading"
            >
              <span v-if="loading" class="animate-spin mr-2">&#9696;</span>
              {{ loading ? "Sending..." : "Send Reset Email" }}
            </UButton>
          </div>
        </form>

        <div class="text-center mt-4">
          <NuxtLink to="/login" class="text-sm text-[#FFBE61] hover:underline">
            Back to Login
          </NuxtLink>
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
