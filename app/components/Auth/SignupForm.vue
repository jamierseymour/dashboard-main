<script setup>
import { useAuth } from "~/stores/auth";

const toast = useToast();
const client = useSupabaseClient();
const auth = useAuth();

const form = ref({
  name: "",
  email: "",
  password: "",
  tnc: true,
  eventUpdates: true,
});

const isFormValid = computed(() => {
  return (
    form.value.name && form.value.email && form.value.password && form.value.tnc
  );
});

const errorMsg = ref("");
const loading = ref(false);

const register = async () => {
  loading.value = true;
  errorMsg.value = "";

  try {
    // Debug: Check what functions are available
    console.log("Auth store functions:", Object.keys(auth));
    console.log("signUp function:", typeof auth.signUp);

    // Use the auth store's signUp function
    const result = await auth.signUp({
      email: form.value.email,
      password: form.value.password,
      name: form.value.name,
      eventUpdates: form.value.eventUpdates,
      termsAccepted: form.value.tnc,
    });

    if (result.error) {
      throw result.error;
    }

    // Show success message
    toast.add({
      title: `Welcome ${form.value.name}!`,
      description: "Your account has been created successfully.",
      color: "success",
    });

    // Reset form
    form.value = {
      name: "",
      email: "",
      password: "",
      tnc: false,
      eventUpdates: false,
    };
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific error messages for better user feedback
    const errorMessage = error?.message || "";

    if (errorMessage.includes("email") || errorMessage.includes("Email")) {
      errorMsg.value = "This email is already registered or invalid";
    } else if (errorMessage.includes("password")) {
      errorMsg.value = "Password must be at least 6 characters";
    } else if (errorMessage.includes("User already registered")) {
      errorMsg.value = "An account with this email already exists";
    } else {
      errorMsg.value = errorMessage || "Registration failed. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="w-full mx-auto p-8 shadow-lg rounded-lg">
    <!-- Error message display -->
    <UAlert
      v-if="errorMsg"
      color="error"
      variant="subtle"
      icon="i-heroicons-exclamation-triangle"
      class="mb-4"
      :title="errorMsg"
    />

    <!-- Debug: Show error message value -->
    <!-- <div
      v-if="errorMsg"
      class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
    >
      <p class="text-sm text-red-800 font-medium">Error:</p>
      <p class="text-sm text-red-700">{{ errorMsg }}</p>
    </div> -->

    <form class="space-y-4 w-full" @submit.prevent="register">
      <!-- Name Field with Label -->
      <div class="space-y-1">
        <label
          for="name"
          class="block text-gray-900 dark:text-white text-sm font-medium"
        >
          Full Name
        </label>
        <UInput
          id="name"
          v-model="form.name"
          type="text"
          placeholder="Enter your full name"
          color="primary"
          variant="outline"
          class="w-full"
          required
        />
      </div>

      <!-- Email Field with Label -->
      <div class="space-y-1">
        <label
          for="email"
          class="block text-gray-900 dark:text-white text-sm font-medium"
        >
          Email Address
        </label>
        <UInput
          id="email"
          v-model="form.email"
          type="email"
          placeholder="Enter your email address"
          color="primary"
          variant="outline"
          class="w-full"
          required
        />
      </div>

      <!-- Password Field with Label -->
      <div class="space-y-1">
        <label
          for="password"
          class="block text-gray-900 dark:text-white text-sm font-medium"
        >
          Password
        </label>
        <UInput
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Create a password"
          color="primary"
          variant="outline"
          class="w-full"
          required
        />
      </div>

      <!-- Checkboxes Section -->
      <div class="space-y-4 mt-6">
        <UCheckbox
          v-model="form.tnc"
          name="tncs"
          label="I agree to the Terms & Conditions"
        />

        <UCheckbox
          v-model="form.eventUpdates"
          name="eventUpdates"
          label="Count me in for event updates and perks"
        />
      </div>

      <!-- Submit Button -->
      <div class="flex justify-center items-center mt-8 pt-4">
        <UButton
          type="submit"
          :loading="loading"
          :disabled="!isFormValid || loading"
          class="py-3 px-8 text-black bg-[#FFBE61] hover:bg-[#FFD700] rounded-full disabled:bg-gray-400 transition-colors flex items-center justify-center min-w-[150px]"
        >
          <!-- <span v-if="loading" class="flex items-center justify-center">
            <svg
              class="animate-spin h-5 w-5 text-black mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Registering...
          </span> -->
          <span>Register</span>
        </UButton>
      </div>
    </form>
  </div>
</template>
