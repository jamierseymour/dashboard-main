<script setup>
const toast = useToast();

const client = useSupabaseClient();

const auth = useAuth();

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
const successMsg = ref("");
const loading = ref(false);

const register = async () => {
  loading.value = true;
  console.log(form.value);

  try {
    // Sign up the user
    const { data: AuthData, error: signUpError } = await client.auth.signUp({
      email: form.value.email,
      password: form.value.password,
    });

    console.log("AuthData", AuthData);

    if (signUpError) throw signUpError;

    // If sign-up is successful, insert user info into the auth table
    const { error: insertError } = await client.from("users").insert([
      {
        user_id: AuthData.user.id,
        email: form.value.email,
        name: form.value.name,
        picUrl: null,
        tnc: form.value.tnc,
        eventUpdates: form.value.eventUpdates,
      }, // Adjust the fields as per your table schema
    ]);

    if (insertError) {
      console.log("insert error", insertError);
      errorMsg.value = insertError.message;

      throw insertError;
    } else {
      // await navigateTo("/dash");
      // toast.add("Registered Succesfully!");
      auth.modal = false;

      // If successful, set a success message
      successMsg.value = "User information successfully added to the database!";
      console.log(successMsg.value); // Optional: Log the success message
    }
  } catch (error) {
    console.log(error);
    errorMsg.value = error;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="w-full mx-auto p-8 shadow-lg rounded-lg">
    <div v-if="errorMsg" class="text-center justify-center text-error-200 mb-3">
      {{ errorMsg }}
    </div>
    <form @submit.prevent="register" class="space-y-4 w-full">
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
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
          <span v-else>Register</span>
        </button>
      </div>
    </form>
  </div>
</template>
