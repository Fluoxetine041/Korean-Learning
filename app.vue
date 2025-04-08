<template>
  <div class="min-h-screen transition-colors duration-300" :class="[$colorMode.value]">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Access color mode
const colorMode = useColorMode()

// You can set color mode here if needed
// e.g., colorMode.preference = 'dark'
</script>

<style>
body {
  @apply bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100;
}
</style>
