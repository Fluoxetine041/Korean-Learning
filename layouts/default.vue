<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-primary-600 dark:text-primary-400">
          English Learning Hub
        </NuxtLink>
        
        <div class="flex items-center space-x-4">
          <nav class="hidden md:flex space-x-6">
            <NuxtLink to="/" class="hover:text-primary-600 dark:hover:text-primary-400">Home</NuxtLink>
            <NuxtLink to="/articles" class="hover:text-primary-600 dark:hover:text-primary-400">Articles</NuxtLink>
            <NuxtLink to="/dictionary" class="hover:text-primary-600 dark:hover:text-primary-400">Dictionary</NuxtLink>
          </nav>
          
          <!-- Color mode toggle -->
          <button @click="toggleColorMode" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg v-if="$colorMode.value === 'dark'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          
          <!-- Login/User Profile -->
          <template v-if="isLoading">
            <div class="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </template>
          <template v-else>
            <NuxtLink v-if="!isAuthenticated" to="/login" class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
              Sign In
            </NuxtLink>
            <div v-else class="relative">
              <button 
                @click="isUserMenuOpen = !isUserMenuOpen" 
                class="user-menu-button flex items-center space-x-2 focus:outline-none px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  {{ userInitial }}
                </div>
                <span class="text-gray-800 dark:text-white">{{ username }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- User dropdown menu -->
              <div 
                v-if="isUserMenuOpen" 
                class="user-menu-dropdown absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50"
              >
                <NuxtLink 
                  to="/profile" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Profile
                </NuxtLink>
                <NuxtLink 
                  to="/settings" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Settings
                </NuxtLink>
                <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button 
                  @click="handleLogout" 
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </header>
    
    <!-- Main content -->
    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-100 dark:bg-gray-800 py-6">
      <div class="container mx-auto px-4">
        <div class="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {{ new Date().getFullYear() }} English Learning Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// Get auth state
const { user: authUser, isAuthenticated, isLoading, logout } = useAuth()

// User menu state
const isUserMenuOpen = ref(false)

// Logout handler
async function handleLogout() {
  await logout()
  isUserMenuOpen.value = false
  navigateTo('/')
}

// Toggle color mode
const colorMode = useColorMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Close dropdown when clicking outside
onClickOutside(isUserMenuOpen, () => {
  isUserMenuOpen.value = false
})

// Helper function to safely get user initial
const userInitial = computed(() => {
  if (!authUser.value) return 'U'
  return authUser.value.username?.charAt(0).toUpperCase() || 'U'
})

// Helper function to safely get username
const username = computed(() => {
  if (!authUser.value) return 'User'
  return authUser.value.username || 'User'
})

// Fix for composable usage in template
function onClickOutside(ref: Ref<boolean>, callback: () => void) {
  onMounted(() => {
    if (!process.client) return
    
    const listener = (event: MouseEvent) => {
      if (ref.value && event.target) {
        const element = document.querySelector('.user-menu-dropdown')
        const button = document.querySelector('.user-menu-button')
        if (element && 
            !element.contains(event.target as Node) && 
            button && 
            !button.contains(event.target as Node)) {
          callback()
        }
      }
    }
    
    document.addEventListener('click', listener)
    onBeforeUnmount(() => {
      document.removeEventListener('click', listener)
    })
  })
}

// Initialize auth state on client side
onMounted(() => {
  if (process.client) {
    useAuth().initAuth()
  }
})
</script> 