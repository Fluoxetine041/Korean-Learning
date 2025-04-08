<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
    >
      <span>{{ currentLocale.name }}</span>
      <svg
        class="w-4 h-4 ml-2 -mr-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <div
      v-if="isOpen"
      @click.outside="isOpen = false"
      class="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg dark:bg-gray-800 z-10"
    >
      <div class="py-1">
        <a
          v-for="locale in availableLocales"
          :key="locale.code"
          @click.prevent="switchLanguage(locale.code)"
          href="#"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
          :class="{ 'bg-gray-100 dark:bg-gray-700': locale.code === currentLocaleCode }"
        >
          {{ locale.name }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNuxtApp } from '#app'

const { locale } = useI18n()
const nuxtApp = useNuxtApp()
const localeCodes = computed(() => nuxtApp.$i18n.locales.value)

const isOpen = ref(false)
const currentLocaleCode = computed(() => locale.value)
const currentLocale = computed(() => {
  return nuxtApp.$i18n.locales.value.find((l: any) => l.code === locale.value) || { name: 'English' }
})

const availableLocales = computed(() => {
  return nuxtApp.$i18n.locales.value.filter((l: any) => l.code !== locale.value)
})

const switchLanguage = (code: string) => {
  locale.value = code
  isOpen.value = false
}
</script> 