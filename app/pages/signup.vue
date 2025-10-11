<script setup lang="ts">
import Login from "~/components/Auth/LoginForm.vue";
import Register from "~/components/Auth/SignupForm.vue";
import ForgotPassword from "~/components/Auth/ForgotPasswordForm.vue";

const activeTab = ref<"login" | "register" | "forgot-password">("login");

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
</template>
