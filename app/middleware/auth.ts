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
    // Redirect to auth page with redirect parameter
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.path)}`);
  }
});
