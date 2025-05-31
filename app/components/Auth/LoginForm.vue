<script setup lang="ts">
useSeoMeta({
  title: "Login",
});

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
</script>

<template>
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

      <NuxtLink
        to="/"
        class="text-sm text-[#FFBE61] hover:underline block text-right"
      >
        Forgot password?
      </NuxtLink>

      <div class="flex justify-center items-center">
        <UButton
          type="submit"
          class="w-1/2 py-2 text-black bg-[#FFBE61] mb-3 hover:bg-[#FFD700] rounded-full disabled:bg-gray-400 flex items-center justify-center transition-colors"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin mr-2">&#9696;</span>
          {{ loading ? "Logging in..." : "Login" }}
        </UButton>
      </div>
    </form>
  </div>
</template>
