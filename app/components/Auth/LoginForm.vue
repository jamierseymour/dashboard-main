<script setup lang="ts">
useSeoMeta({
  title: "Login",
});

const auth = useAuth();
// const toast = useToast();

const email = ref("");
const password = ref("");
const loading = ref(false);
const authError = ref("");
const user = useSupabaseUser();
const client = useSupabaseClient();

// watchEffect(async () => {
//   if (user.value) {
//     toast.add({ title: "Hello world!" });
//     auth.modal = false;
//     await navigateTo("/");
//   }
// });

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
  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  loading.value = false;

  if (error) {
    authError.value = "Invalid login credentials";
    setTimeout(() => (authError.value = ""), 5000);
  }
};
</script>

<template>
  <div class="mx-auto w-5/6 p-4">
    <p v-if="authError" class="text-red-500 text-center mb-4">
      {{ authError }}
    </p>

    <form @submit.prevent="login" class="space-y-4">
      <div>
        <!-- <label for="email" class="block text-gray-700 mb-1">Email</label> -->
        <input
          id="email"
          v-model="email"
          type="email"
          class="w-full px-3 py-2 text-sm border rounded-lg bg-white text-black placeholder-gray-500 focus:ring focus:ring-indigo-300"
          placeholder="Enter your email"
          required
        />
        <!-- <UInput
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          required
          class="w-full px-3 py-2 text-sm rounded-lg"
          variant="outline"
        /> -->
      </div>

      <div>
        <!-- <label for="password" class="block text-gray-700 mb-1">Password</label> -->
        <input
          id="password"
          v-model="password"
          type="password"
          class="w-full px-3 py-2 text-sm border rounded-lg bg-white text-black placeholder-gray-500 focus:ring focus:ring-indigo-300"
          placeholder="Enter your password"
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
        <!-- <button
          type="submit"
          class="w-full py-2 text-white bg-indigo-600 rounded-full disabled:bg-gray-400 flex items-center justify-center"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin mr-2">&#9696;</span>
          {{ loading ? "Logging in..." : "Login" }}
        </button> -->

        <UButton
          type="submit"
          class="w-1/2 py-2 text-black bg-[#FFBE61] rounded-full disabled:bg-gray-400 flex items-center justify-center"
          :disabled="loading"
          :ui="{ rounded: 'rounded-full' }"
        >
          <span v-if="loading" class="animate-spin mr-2">&#9696;</span>
          {{ loading ? "Logging in..." : "Login" }}</UButton
        >
      </div>
    </form>
  </div>
</template>
