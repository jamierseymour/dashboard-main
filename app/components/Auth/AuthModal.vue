<script setup lang="ts">
import Login from "./LoginForm.vue";
import Register from "./SignupForm.vue";
import { useAuth } from "~/stores/auth";

const auth = useAuth();

const activeTab = ref<"login" | "register">("login");
</script>

<template>
  <UModal
    v-model:open="auth.modal"
    :ui="{
      wrapper: 'z-50',
      content:
        'bg-white dark:bg-gray-900 rounded-3xl shadow-2xl mb-3 z-10 max-w-lg mx-auto',
    }"
  >
    <template #content>
      <div>
        <!-- Tab Navigation -->
        <div class="flex border-b border-gray-200 dark:border-gray-700">
          <button
            class="w-1/2 py-4 cursor-pointer text-center text-xl font-bold transition-all duration-200 border-b-2"
            :class="
              activeTab === 'login'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary'
            "
            @click="activeTab = 'login'"
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
          >
            Register
          </button>
        </div>

        <!-- Form Content -->
        <div class="flex justify-center items-start">
          <div class="w-full">
            <Login v-if="activeTab === 'login'" />
            <Register v-else />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
