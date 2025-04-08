<template>
  <div class="max-w-4xl mx-auto py-12">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="p-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ $t('yourProfile') }}</h1>
        
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        </div>
        
        <div v-else-if="userProfile">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{{ $t('profileInformation') }}</h2>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $t('username') }}</label>
                  <p class="text-gray-800 dark:text-white">{{ userProfile.username }}</p>
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $t('email') }}</label>
                  <p class="text-gray-800 dark:text-white">{{ userProfile.email }}</p>
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $t('fullName') }}</label>
                  <p class="text-gray-800 dark:text-white">{{ userProfile.fullName || '-' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $t('lastLogin') }}</label>
                  <p class="text-gray-800 dark:text-white">{{ formatDate(userProfile.lastLogin) }}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{{ $t('learningStatistics') }}</h2>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p class="text-gray-600 dark:text-gray-400">
                  {{ $t('statisticsDesc') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface UserProfile {
  id: string
  email: string
  username: string
  fullName: string | null
  lastLogin?: string | Date | null
}

const { user, isLoading } = useAuth()
const userProfile = computed<UserProfile | null>(() => user.value as UserProfile | null)

function formatDate(dateString?: string | Date | null) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}
</script> 