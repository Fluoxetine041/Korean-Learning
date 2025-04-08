import { defineNuxtPlugin, useRouter, navigateTo } from '#app'
import { type Ref } from 'vue'

export default defineNuxtPlugin(async (nuxtApp) => {
  console.log('Initializing auth plugin')
  
  // Initialize authentication on client side only
  const auth = useAuth()
  
  try {
    // Initialize auth state (check stored token, etc.)
    await auth.initAuth()
    console.log('Auth initialized successfully, authenticated:', auth.isAuthenticated.value)
  } catch (error) {
    console.error('Failed to initialize auth:', error)
    // Handle initialization failure by ensuring user is logged out
    auth.logout()
  }
  
  // Set up auto-refresh of auth state during navigation
  nuxtApp.hook('page:finish', () => {
    // If authenticated, verify token is still valid on page changes
    // but don't block navigation
    if (auth.isAuthenticated.value && !auth.isLoading.value) {
      auth.refreshUserData().catch(err => {
        console.error('Failed to refresh auth during navigation:', err)
      })
    }
  })
  
  // Handle token expiration errors by redirecting to login
  nuxtApp.hook('vue:error', (err: unknown) => {
    // Check if error is auth related (e.g., 401)
    // Type guard for different error structures
    interface AuthError {
      statusCode?: number;
      message?: string;
      cause?: { statusCode?: number };
    }
    
    // Try to cast the error to a useful type if possible
    const authError = err as AuthError
    
    if (authError && 
        (authError.message?.includes('Unauthorized') || 
         authError.statusCode === 401 || 
         (authError.cause && authError.cause.statusCode === 401))) {
      console.warn('Auth error detected, logging out')
      auth.logout()
      navigateTo('/login')
    }
  })
}) 