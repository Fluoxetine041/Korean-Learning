<template>
  <div class="max-w-md mx-auto py-12">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to your account</h1>
          <p class="text-gray-600 dark:text-gray-300">Access your personalized learning experience</p>
        </div>
        
        <!-- Login Form -->
        <form @submit.prevent="loginWithEmail" class="mb-6">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              v-model="email" 
              type="email" 
              id="email" 
              name="email" 
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="your@email.com"
            />
          </div>
          
          <div class="mb-5">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              v-model="password" 
              type="password" 
              id="password" 
              name="password" 
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Your password"
            />
          </div>
          
          <div class="mb-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" v-model="rememberMe" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                <label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Remember me</label>
              </div>
              <div class="text-sm">
                <a href="#" class="font-medium text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</a>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
          
          <p v-if="error" class="mt-3 text-sm text-red-600 dark:text-red-400">
            {{ error }}
          </p>
        </form>
        
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>
        
        <!-- Google login button -->
        <button 
          @click="signInWithGoogle" 
          class="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md transition-colors shadow-sm"
          :disabled="isLoadingGoogle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span v-if="isLoadingGoogle">處理中...</span>
          <span v-else>Sign in with Google</span>
        </button>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            By signing in, you agree to our 
            <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a> and 
            <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
      
      <div class="bg-gray-50 dark:bg-gray-700 py-4 px-8 border-t border-gray-200 dark:border-gray-600">
        <p class="text-sm text-center text-gray-600 dark:text-gray-400">
          Don't have an account? 
          <NuxtLink to="/register" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">Create an account</NuxtLink>
        </p>
      </div>
    </div>
    
    <!-- Login Benefits Cards -->
    <div class="mt-12 grid md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Save Progress</h3>
        <p class="text-gray-600 dark:text-gray-400">Track completed articles and save your learning progress.</p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Personalized Experience</h3>
        <p class="text-gray-600 dark:text-gray-400">Get content recommendations based on your reading history.</p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Track Learning Streaks</h3>
        <p class="text-gray-600 dark:text-gray-400">Build consistent learning habits with streak tracking.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Sign In - English Learning Hub',
  description: 'Sign in to your English Learning Hub account to track your progress.'
})

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const isLoadingGoogle = ref(false)
const error = ref('')

// Get auth composable
const { login, isAuthenticated, signInWithGoogle: authSignInWithGoogle } = useAuth()

// Email login function
async function loginWithEmail() {
  try {
    error.value = ''
    isLoading.value = true
    
    // Validate form
    if (!email.value || !password.value) {
      error.value = 'Email and password are required'
      return
    }
    
    // Log the attempt (to help with debugging)
    console.log('Attempting login with email:', email.value)
    
    // Use the auth composable login function
    const success = await login(email.value, password.value)
    
    if (success) {
      console.log('Login successful, redirecting...')
      // Redirect to the original target page or home
      const route = useRoute()
      const redirectPath = route.query.redirect as string || '/'
      navigateTo(redirectPath)
    } else {
      console.error('Login failed without error')
      error.value = 'Failed to sign in. Please check your credentials.'
    }
  } catch (err) {
    console.error('Login error:', err)
    // More detailed error handling
    if (err instanceof Error) {
      error.value = err.message || 'An unexpected error occurred'
    } else {
      error.value = 'An unexpected error occurred'
    }
  } finally {
    isLoading.value = false
  }
}

/**
 * 使用Google進行第三方登入
 * 調用useAuth composable中的signInWithGoogle方法
 * 處理成功/失敗後的導航邏輯
 */
async function signInWithGoogle() {
  try {
    isLoadingGoogle.value = true
    error.value = ''
    
    // 調用composable中的Google登入方法
    console.log('啟動Google登入流程')
    const success = await authSignInWithGoogle()
    
    if (success) {
      console.log('Google登入成功，準備導航')
      
      // 確定導航目標，可能是原本想要訪問的頁面或首頁
      const route = useRoute()
      const redirectPath = route.query.redirect as string || '/'
      navigateTo(redirectPath)
    } else {
      // 登入失敗處理
      console.error('Google登入失敗')
      error.value = '使用Google登入失敗，請稍後再試'
    }
  } catch (err) {
    // 異常處理
    console.error('Google登入過程中發生錯誤:', err)
    if (err instanceof Error) {
      error.value = err.message || '登入過程中發生意外錯誤'
    } else {
      error.value = '登入過程中發生意外錯誤'
    }
  } finally {
    isLoadingGoogle.value = false
  }
}
</script> 