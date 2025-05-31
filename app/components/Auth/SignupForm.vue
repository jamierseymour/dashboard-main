<script setup>
import { useAuth } from "~/stores/auth";

const toast = useToast();
const client = useSupabaseClient();
const auth = useAuth();
const router = useRouter();

const form = ref({
  name: "",
  email: "",
  password: "",
  tnc: false,
  eventUpdates: false,
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
    // Step 1: Sign up the user with Supabase Auth
    const { data: authData, error: signUpError } = await client.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        data: {
          name: form.value.name,
          event_updates: form.value.eventUpdates,
        },
      },
    });

    if (signUpError) throw signUpError;

    if (!authData.user) {
      throw new Error("User registration failed");
    }

    // Step 2: Update the profile in the profiles table
    // Note: This might be automatically handled by the trigger we set up,
    // but we'll update with additional fields
    const { error: profileError } = await client.from("profiles").upsert({
      id: authData.user.id,
      name: form.value.name,
      email: form.value.email,
      username: form.value.email.split("@")[0], // Default username from email
      event_updates: form.value.eventUpdates,
      terms_accepted: form.value.tnc,
    });

    if (profileError) throw profileError;

    // Step 3: Initialize the auth store with new user data
    await auth.init();

    // Step 4: Show success message and redirect
    toast.add({
      title: `Welcome ${form.value.name}`,
      description: "Your account has been created successfully.",
      color: "success",
    });

    // Close modal if it's being used
    auth.toggleModal(false);

    // Navigate to dashboard
    await router.push("/dashboard");
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific error messages for better user feedback
    if (error.message.includes("email") || error.message.includes("Email")) {
      errorMsg.value = "This email is already registered or invalid";
    } else if (error.message.includes("password")) {
      errorMsg.value = "Password must be at least 6 characters";
    } else {
      errorMsg.value =
        error.message || "Registration failed. Please try again.";
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
      color="red"
      variant="soft"
      icon="i-lucide-alert-triangle"
      class="mb-4"
    >
      <p>{{ errorMsg }}</p>
    </UAlert>

    <form class="space-y-4 w-full" @submit.prevent="register">
      <!-- Name Field with Label -->
      <div class="space-y-1">
        <label for="name" class="block text-white text-sm font-medium"
          >Full Name</label
        >
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="Enter your full name"
          class="w-full px-3 py-2 text-sm border rounded-lg bg-white text-black placeholder-gray-500 focus:ring focus:ring-indigo-300"
          required
        />
      </div>

      <!-- Email Field with Label -->
      <div class="space-y-1">
        <label for="email" class="block text-white text-sm font-medium"
          >Email Address</label
        >
        <input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="Enter your email address"
          class="w-full px-3 py-2 text-sm border rounded-lg bg-white text-black placeholder-gray-500 focus:ring focus:ring-indigo-300"
          required
        />
      </div>

      <!-- Password Field with Label -->
      <div class="space-y-1">
        <label for="password" class="block text-white text-sm font-medium"
          >Password</label
        >
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Create a password"
          class="w-full px-3 py-2 text-sm border rounded-lg bg-white text-black placeholder-gray-500 focus:ring focus:ring-indigo-300"
          required
        />
      </div>

      <!-- Checkboxes -->
      <div class="flex items-center space-x-2 mt-4">
        <UCheckbox
          v-model="form.tnc"
          name="tncs"
          color="yellow"
          class="cursor-pointer"
        >
          <template #label>
            <span class="text-white">I agree to the Terms & Conditions</span>
          </template>
        </UCheckbox>
      </div>

      <div class="flex items-center space-x-2">
        <UCheckbox
          v-model="form.eventUpdates"
          name="eventUpdates"
          color="yellow"
          class="cursor-pointer"
        >
          <template #label>
            <span class="text-white"
              >Count me in for event updates and perks</span
            >
          </template>
        </UCheckbox>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-center items-center mt-6">
        <button
          type="submit"
          :disabled="!isFormValid || loading"
          class="py-2 w-1/2 text-center cursor-pointer text-black bg-[#FFBE61] rounded-full disabled:bg-gray-400 relative"
        >
          <span
            v-if="loading"
            class="absolute inset-0 flex items-center justify-center"
          >
            <svg
              class="animate-spin h-5 w-5 text-black"
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
          </span>
          <span v-else>Register</span>
        </button>
      </div>
    </form>
  </div>
</template>
