<script setup lang="ts">
import Login from "~/components/Auth/LoginForm.vue";
import Register from "~/components/Auth/SignupForm.vue";
import ForgotPassword from "~/components/Auth/ForgotPasswordForm.vue";

const activeTab = ref<"login" | "register" | "forgot-password">("register");

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "Sign up",
  description: "Create an account to get started",
});
</script>

<template>
  <div class="w-full">
    <!-- <div class="flex items-center justify-center font-bold text-dark-900">
      Login or Sign Up
    </div> -->

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
    <!-- <USeparator class="my-4" /> -->
    <Login
      v-if="activeTab === 'login'"
      @show-forgot-password="activeTab = 'forgot-password'"
      @redirect="
        (val: string) => {
          navigateTo(val);
        }
      "
    />
    <Register
      v-else-if="activeTab === 'register'"
      @redirect="
        (val: string) => {
          navigateTo(val);
        }
      "
    />
    <ForgotPassword
      v-else-if="activeTab === 'forgot-password'"
      @back-to-login="activeTab = 'login'"
    />
  </div>
</template>
