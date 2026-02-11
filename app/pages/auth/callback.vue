<script setup lang="ts">
// This page handles OAuth callback redirects from Google/Facebook
const auth = useAuth();
const route = useRoute();
const supabase = useSupabaseClient();
const toast = useToast();

onMounted(async () => {
  console.log('🔄 OAuth Callback - Processing...');
  console.log('🔄 Route query:', route.query);

  try {
    // Exchange the code for a session
    const code = route.query.code as string;

    if (code) {
      console.log('✅ Code found, exchanging for session...');

      // Exchange the OAuth code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('❌ Error exchanging code:', exchangeError);
        throw exchangeError;
      }

      console.log('✅ Session established:', data.session);
    }

    // Get the current session (auth already initialized by app.vue)
    const { data: { session } } = await supabase.auth.getSession();
    console.log('📝 Session:', session);

    if (session?.user) {
      console.log('✅ User authenticated:', session.user.email);

      // Create user profile in database if it doesn't exist
      try {
        const { data: existingUser, error: fetchError } = await (supabase.from('users') as any)
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!existingUser || fetchError?.code === 'PGRST116') {
          // User doesn't exist, create profile
          console.log('📝 Creating user profile...');

          const { error: insertError } = await (supabase.from('users') as any)
            .insert({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
              email: session.user.email,
              avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
              bio: '',
              event_updates: false,
              terms_accepted: true,
            });

          if (insertError) {
            console.warn('⚠️ Error creating user profile:', insertError);
          } else {
            console.log('✅ User profile created');
          }
        } else {
          console.log('✅ User profile already exists');
        }
      } catch (profileError) {
        console.warn('⚠️ Error handling user profile:', profileError);
      }

      // Refresh auth state by fetching profile
      await auth.fetchUserProfile();

      // Show success message
      toast.add({
        title: 'Welcome!',
        description: 'Successfully signed in with Google',
        color: 'success',
      });

      // Redirect to dashboard or intended page
      const redirectTo = (route.query.redirect as string) || '/dashboard';
      console.log('🔄 Redirecting to:', redirectTo);
      await navigateTo(redirectTo);
    } else {
      console.log('❌ No session found, redirecting to home');

      toast.add({
        title: 'Sign in failed',
        description: 'Could not complete Google sign in',
        color: 'error',
      });

      await navigateTo('/');
    }
  } catch (error) {
    console.error('❌ OAuth callback error:', error);

    toast.add({
      title: 'Error',
      description: 'An error occurred during sign in',
      color: 'error',
    });

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
