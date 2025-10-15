// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  console.log('🔒 Auth Middleware - Route:', to.path);
  console.log('🔒 Auth hydrated:', auth.hydrated);
  console.log('🔒 Auth loggedIn:', auth.loggedIn);

  // Initialize auth if not hydrated
  if (!auth.hydrated) {
    console.log('⏳ Auth not hydrated, initializing...');
    await auth.init();
    console.log('✅ Auth initialized. LoggedIn:', auth.loggedIn);
  }

  // Check if user is authenticated
  if (!auth.loggedIn) {
    console.log('❌ User not logged in, redirecting to auth');
    // Redirect to auth page with redirect parameter
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.path)}`);
  }

  console.log('✅ Auth middleware passed');
});
