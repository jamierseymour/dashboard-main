// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  console.log('🔒 Auth Middleware - Route:', to.path);
  console.log('🔒 Auth hydrated:', auth.hydrated);
  console.log('🔒 Auth loggedIn:', auth.loggedIn);

  // Initialize auth if not hydrated (with timeout to prevent hanging)
  if (!auth.hydrated) {
    console.log('⏳ Auth not hydrated, initializing...');
    try {
      // Add timeout to prevent hanging
      await Promise.race([
        auth.init(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth initialization timeout')), 5000)
        )
      ]);
      console.log('✅ Auth initialized. LoggedIn:', auth.loggedIn);
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      // If init fails, redirect to home instead of hanging
      return navigateTo('/');
    }
  }

  // Check if user is authenticated
  if (!auth.loggedIn) {
    console.log('❌ User not logged in, redirecting to auth');
    // Redirect to auth page with redirect parameter
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.path)}`);
  }

  console.log('✅ Auth middleware passed');
});
