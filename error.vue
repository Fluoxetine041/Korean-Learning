<template>
  <div class="flex min-h-[70vh] flex-col items-center justify-center py-16">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {{ error.statusCode === 404 ? 'Page not found' : 'An error occurred' }}
      </h1>
      <p class="text-xl text-gray-700 dark:text-gray-300 mb-8">
        {{ error.statusCode === 404 
          ? 'Sorry, we couldn\'t find the page you\'re looking for.'
          : 'Sorry, something went wrong on our end.' 
        }}
      </p>
      <div class="flex justify-center gap-4">
        <button 
          @click="handleError" 
          class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {{ error.statusCode === 404 ? 'Go back home' : 'Try again' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  // Allow error page to be accessed without authentication
  auth: false
})

// Get the error from the app
const props = defineProps({
  error: Object
})

const error = props.error

// Function to handle error based on type
function handleError() {
  // For 404 errors, go to home page
  if (error.statusCode === 404) {
    // Use replace instead of navigateTo to avoid breaking the history
    // and preserve the authentication state
    return navigateTo('/', { replace: true })
  }
  
  // For other errors, clear the error and reload the page
  clearError({ redirect: window.location.pathname })
}
</script> 