<script setup lang="ts">
import { useAuth } from "~/stores/auth";

import Login from "./LoginForm.vue";
import Register from "./SignupForm.vue";

const auth = useAuth();

const activeTab = ref<"login" | "register">("login");
</script>

<template>
  <!-- <div
      class="bg-gradient-to-b from-[#032334] via-[#063B57] to-[#094F74] rounded-xl shadow-xl"
    >
      <div class="flex">
        <button
          @click="activeTab = 'login'"
          class="w-1/2 py-4 text-center text-2xl font-bold transition border-b-2 mx-4"
          :class="
            activeTab === 'login'
              ? 'border-[#FFBE61] text-[#FFBE61]'
              : 'border-transparent text-light-200 hover:text-gray-100'
          "
        >
          login
        </button>
        <button
          @click="activeTab = 'register'"
          class="w-1/2 py-4 text-center text-2xl font-bold transition border-b-2 mx-4"
          :class="
            activeTab === 'register'
              ? 'border-[#FFBE61] text-[#FFBE61]'
              : 'border-transparent text-light-200 hover:text-gray-100'
          "
        >
          register
        </button>
      </div>

      <div class="mt-6 flex justify-center items-center">
        <Login v-if="activeTab === 'login'" />
        <Register v-else />
      </div>
    </div> -->
  <UModal
    v-model:open="auth.modal"
    :ui="{
      content:
        'bg-gradient-to-b from-[#032334] via-[#063B57] to-[#094F74] rounded-3xl shadow-xl z-10',
    }"
  >
    <template #content>
      <div class="flex">
        <button
          @click="activeTab = 'login'"
          class="w-1/2 py-4 cursor-pointer text-center text-2xl font-bold transition border-b-2 mx-4"
          :class="
            activeTab === 'login'
              ? 'border-[#FFBE61] text-[#FFBE61]'
              : 'border-transparent text-light-200 hover:text-gray-100'
          "
        >
          login
        </button>
        <button
          @click="activeTab = 'register'"
          class="w-1/2 py-4 cursor-pointer text-center text-2xl font-bold transition border-b-2 mx-4"
          :class="
            activeTab === 'register'
              ? 'border-[#FFBE61] text-[#FFBE61]'
              : 'border-transparent text-light-200 hover:text-gray-100'
          "
        >
          register
        </button>
      </div>

      <div class="mt-6 flex justify-center items-center">
        <Login v-if="activeTab === 'login'" />
        <Register v-else />
      </div>
    </template>
  </UModal>
</template>
