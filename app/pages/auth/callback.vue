<script setup lang="ts">
// This page handles OAuth callback redirects from Google/Facebook
const auth = useAuth();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  // Initialize auth if needed
  if (!auth.hydrated) {
    await auth.init();
  }

  // Wait a moment for auth state to update
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if user is now logged in
  if (auth.loggedIn) {
    // Redirect to dashboard or home
    const redirectTo = (route.query.redirect as string) || '/dashboard';
    await navigateTo(redirectTo);
  } else {
    // If login failed, redirect to home
    await navigateTo('/');
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Completing sign in...</p>
    </div>
  </div>
</template>
