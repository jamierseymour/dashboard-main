<script setup lang="ts">
useSeoMeta({
  title: "Login",
});

const emit = defineEmits<{
  showForgotPassword: [];
}>();

const auth = useAuth();
const toast = useToast();

const email = ref("");
const password = ref("");
const loading = ref(false);
const authError = ref("");

const validate = () => {
  const errors: Record<string, string> = {};
  if (!email.value) errors.email = "Email is required";
  if (!password.value) errors.password = "Password is required";
  return errors;
};

const login = async () => {
  const errors = validate();
  if (Object.keys(errors).length) {
    authError.value = Object.values(errors).join(" \n");
    setTimeout(() => (authError.value = ""), 5000);
    return;
  }

  loading.value = true;

  try {
    // Use direct Supabase call for login, but then let auth store handle the state
    const client = useSupabaseClient();
    const { error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      authError.value = "Invalid login credentials";
      setTimeout(() => (authError.value = ""), 5000);
    } else {
      // The auth store will automatically update via onAuthStateChange listener
      toast.add({
        title: `Welcome back!`,
        description: "Successfully logged in.",
        color: "success",
      });

      // Modal will be closed automatically by auth store listener
      await navigateTo("/dashboard");
    }
  } catch (error) {
    authError.value = "Login failed. Please try again.";
    setTimeout(() => (authError.value = ""), 5000);
  } finally {
    loading.value = false;
  }
};

const oauthLoading = ref(false);

const signInWithGoogle = async () => {
  oauthLoading.value = true;
  authError.value = "";

  try {
    const result = await auth.signInWithOAuth("google");
    if (result.error) {
      authError.value = "Failed to sign in with Google. Please try again.";
      setTimeout(() => (authError.value = ""), 5000);
    }
    // OAuth will redirect automatically, no need to handle success here
  } catch (error) {
    authError.value = "Failed to sign in with Google. Please try again.";
    setTimeout(() => (authError.value = ""), 5000);
  } finally {
    oauthLoading.value = false;
  }
};

const signInWithFacebook = async () => {
  oauthLoading.value = true;
  authError.value = "";

  try {
    const result = await auth.signInWithOAuth("facebook");
    if (result.error) {
      authError.value = "Failed to sign in with Facebook. Please try again.";
      setTimeout(() => (authError.value = ""), 5000);
    }
    // OAuth will redirect automatically, no need to handle success here
  } catch (error) {
    authError.value = "Failed to sign in with Facebook. Please try again.";
    setTimeout(() => (authError.value = ""), 5000);
  } finally {
    oauthLoading.value = false;
  }
};
</script>

<template>
  <div class="mx-auto w-full p-3">
    <UAlert
      v-if="authError"
      color="error"
      variant="soft"
      icon="i-lucide-alert-triangle"
      class="mb-4"
    >
      <p class="text-red-800 dark:text-red-200">{{ authError }}</p>
    </UAlert>

    <!-- Divider -->

    <form class="space-y-4" @submit.prevent="login">
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

      <div class="space-y-1">
        <label
          for="password"
          class="block text-gray-900 dark:text-white text-sm font-medium"
        >
          Password
        </label>
        <UInput
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
          color="primary"
          variant="outline"
          class="w-full"
          required
        />
      </div>

      <button
        type="button"
        @click="emit('showForgotPassword')"
        class="text-sm text-primary-500 line block text-right cursor-pointer"
      >
        Forgot password?
      </button>

      <div class="flex justify-center items-center">
        <UButton
          type="submit"
          color="primary"
          size="lg"
          class="mb-3 w-full rounded-full flex items-center justify-center"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin mr-2">&#9696;</span>
          <span>{{ loading ? "Logging in..." : "Login" }}</span>
        </UButton>
      </div>
    </form>

    <!-- divider -->
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-2 dark:bg-gray-900 bg-light-50 text-gray-500"
          >Or continue with email</span
        >
      </div>
    </div>

    <!-- OAuth Buttons -->
    <div class="space-y-3 mb-4">
      <button
        @click="signInWithGoogle"
        :disabled="oauthLoading || loading"
        class="w-full py-3 px-4 bg-white dark:bg-gray-800 text-dark-800 dark:text-gray-200 border border-dark-800 dark:border-gray-600 hover:bg-light-200 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg flex items-center justify-center relative transition-all duration-200 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        <span v-if="!oauthLoading" class="font-bold text-sm"
          >Continue with Google</span
        >
        <span v-else>Loading...</span>
      </button>

      <button
        @click="signInWithFacebook"
        :disabled="oauthLoading || loading"
        class="w-full py-3 px-4 bg-white dark:bg-gray-800 text-dark-800 dark:text-gray-200 border border-dark-800 dark:border-gray-600 hover:bg-light-200 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg flex items-center justify-center relative transition-all duration-200 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5 absolute left-4" fill="#1877F2" viewBox="0 0 24 24">
          <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
        <span v-if="!oauthLoading" class="font-bold text-sm">
          Continue with Facebook</span
        >
        <span v-else>Loading...</span>
      </button>
    </div>
  </div>
</template>
