<template>
  <div class="max-w-md mx-auto py-12">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h1>
          <p class="text-gray-600 dark:text-gray-300">Start your personalized English learning journey</p>
        </div>
        
        <!-- Registration Form -->
        <form @submit.prevent="register" class="mb-6">
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
            <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.email }}</p>
          </div>
          
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input 
              v-model="username" 
              type="text" 
              id="username" 
              name="username" 
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Choose a username"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.username }}</p>
          </div>
          
          <div class="mb-4">
            <label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name (Optional)</label>
            <input 
              v-model="fullName" 
              type="text" 
              id="fullName" 
              name="fullName"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Your full name"
            />
          </div>
          
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              v-model="password" 
              type="password" 
              id="password" 
              name="password" 
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="At least 8 characters"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.password }}</p>
          </div>
          
          <div class="mb-6">
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <input 
              v-model="confirmPassword" 
              type="password" 
              id="confirm-password" 
              name="confirm-password" 
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Re-enter your password"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.confirmPassword }}</p>
          </div>
          
          <div class="mb-6">
            <div class="flex items-center">
              <input 
                v-model="agreeToTerms" 
                id="agree-terms" 
                name="agree-terms" 
                type="checkbox" 
                required
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
              <label for="agree-terms" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the 
                <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a> and 
                <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
              </label>
            </div>
            <p v-if="errors.agreeToTerms" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.agreeToTerms }}</p>
          </div>
          
          <button 
            type="submit" 
            class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
          
          <p v-if="generalError" class="mt-3 text-sm text-red-600 dark:text-red-400">
            {{ generalError }}
          </p>
          
          <p v-if="successMessage" class="mt-3 text-sm text-green-600 dark:text-green-400 font-semibold text-center animate-pulse">
            {{ successMessage }}
          </p>
        </form>
      </div>
      
      <div class="bg-gray-50 dark:bg-gray-700 py-4 px-8 border-t border-gray-200 dark:border-gray-600">
        <p class="text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account? 
          <NuxtLink to="/login" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Register - English Learning Hub',
  description: 'Create your account for English Learning Hub to track your progress and save your preferences.'
})

// Get auth composable
const { register: registerUser } = useAuth()

// Form data
const email = ref('')
const username = ref('')
const fullName = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeToTerms = ref(false)
const isLoading = ref(false)
const generalError = ref('')
const successMessage = ref('')
const errors = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: ''
})

// Get auth composable
// Validation function
function validateForm() {
  let isValid = true
  
  // Reset errors
  errors.email = ''
  errors.username = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.agreeToTerms = ''
  
  // Email validation
  if (!email.value) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Username validation
  if (!username.value) {
    errors.username = 'Username is required'
    isValid = false
  } else if (username.value.length < 3) {
    errors.username = 'Username must be at least 3 characters'
    isValid = false
  }
  
  // Password validation
  if (!password.value) {
    errors.password = 'Password is required'
    isValid = false
  } else if (password.value.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  }
  
  // Confirm password validation
  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  // Terms agreement validation
  if (!agreeToTerms.value) {
    errors.agreeToTerms = 'You must agree to the terms and conditions'
    isValid = false
  }
  
  return isValid
}

// Registration function
async function register() {
  try {
    generalError.value = ''
    successMessage.value = ''
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    isLoading.value = true
    
    // Call register using the auth composable
    const success = await registerUser({
      email: email.value,
      username: username.value,
      password: password.value,
      fullName: fullName.value || undefined
    })
    
    if (success) {
      // Show success message
      successMessage.value = `Account created successfully! Welcome, ${username.value}!`
      
      // Give the user a moment to see the success message before redirecting
      setTimeout(() => {
        // Redirect to home page
        navigateTo('/')
      }, 1500)
    } else {
      generalError.value = 'Registration failed. Please try again.'
    }
  } catch (err) {
    console.error('Registration error:', err)
    generalError.value = 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script> 