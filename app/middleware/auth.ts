// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth();

  // Initialize auth if not hydrated
  if (!auth.hydrated) {
    // Let the page handle auth initialization
    return;
  }

  // Check if user is authenticated
  if (!auth.loggedIn) {
    // Store the intended destination
    const redirectTo = to.fullPath;

    // Redirect to home with return path
    return navigateTo({
      path: "/",
      query: { redirect: redirectTo },
    });
  }
});
