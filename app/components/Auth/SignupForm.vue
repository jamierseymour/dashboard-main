<script setup>
import { useAuth } from "~/stores/auth";

const toast = useToast();
const client = useSupabaseClient();
const auth = useAuth();
const route = useRoute();

const emits = defineEmits(["redirect"]);

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

  const isVendor = route.query.redirect === "new-venue";

  try {
    // Debug: Check what functions are available

    // Use the auth store's signUp function
    const result = await auth.signUp({
      email: form.value.email,
      password: form.value.password,
      name: form.value.name,
      eventUpdates: form.value.eventUpdates,
      termsAccepted: form.value.tnc,
      is_vendor: isVendor,
    });

    console.log("relusr", result);

    if (result.error) {
      throw result.error;
    }

    // Show success message
    toast.add({
      title: `Welcome ${form.value.name}!`,
      description: "Your account has been created successfully.",
      color: "success",
    });

    auth.modal = false;
    console.log("route no?", route.query.redirect);
    if (route.query.redirect) {
      emits("redirect", route.query.redirect);
    } else {
      // navigateTo("/");
    }

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

const oauthLoading = ref(false);

const signInWithGoogle = async () => {
  oauthLoading.value = true;
  errorMsg.value = "";

  try {
    const result = await auth.signInWithOAuth("google");
    if (result.error) {
      errorMsg.value = "Failed to sign in with Google. Please try again.";
    }
    // OAuth will redirect automatically
  } catch (error) {
    errorMsg.value = "Failed to sign in with Google. Please try again.";
  } finally {
    oauthLoading.value = false;
  }
};

const signInWithFacebook = async () => {
  oauthLoading.value = true;
  errorMsg.value = "";

  try {
    const result = await auth.signInWithOAuth("facebook");
    if (result.error) {
      errorMsg.value = "Failed to sign in with Facebook. Please try again.";
    }
    // OAuth will redirect automatically
  } catch (error) {
    errorMsg.value = "Failed to sign in with Facebook. Please try again.";
  } finally {
    oauthLoading.value = false;
  }
};
</script>

<template>
  <div class="w-full p-3">
    <!-- Error message display -->
    <UAlert
      v-if="errorMsg"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      class="mb-4"
    >
      <p class="text-red-800 dark:text-red-200">{{ errorMsg }}</p>
    </UAlert>

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
          color="primary"
          size="lg"
          :loading="loading"
          :disabled="!isFormValid || loading"
          class="bg-gradient-to-r cursor-pointer h-12 hover:opacity-85 from-violet-400 to-purple-700 rounded-md w-full flex items-center justify-center text-md font-bold"
        >
          <span>Register</span>
        </UButton>
      </div>
    </form>

    <!-- Divider -->
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-2 bg-white dark:bg-gray-900 text-gray-500"
          >Or register with email</span
        >
      </div>
    </div>

    <!-- OAuth Buttons -->
    <div class="space-y-3 mb-4">
      <button
        @click="signInWithGoogle"
        :disabled="oauthLoading || loading"
        class="w-full py-3 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg flex items-center justify-center relative transition-all duration-200 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span v-if="!oauthLoading">Continue with Google</span>
        <span v-else>Loading...</span>
      </button>

      <button
        @click="signInWithFacebook"
        :disabled="oauthLoading || loading"
        class="w-full py-3 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg flex items-center justify-center relative transition-all duration-200 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5 absolute left-4" fill="#1877F2" viewBox="0 0 24 24">
          <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
        <span v-if="!oauthLoading">Continue with Facebook</span>
        <span v-else>Loading...</span>
      </button>
    </div>
  </div>
</template>
