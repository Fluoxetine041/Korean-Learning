<template>
  <div
    class="fixed right-6 top-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-40 flex flex-col items-center space-y-3 tts-control-panel"
    :class="{ 'opacity-75 hover:opacity-100': !isPlaying }"
  >
    <!-- Selected Word Indicator -->
    <div v-if="hasSelectedWord" class="relative text-xs text-blue-600 dark:text-blue-400 font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full mb-1">
      Word Selected
      <button
        @click="clearSelection"
        class="absolute -right-2 -top-2 bg-gray-200 dark:bg-gray-700 rounded-full p-0.5 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
        title="Clear selection"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Play/Pause Button -->
    <button
      @click="togglePlay"
      class="p-3 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors"
      :title="isPlaying ? 'Pause' : (hasSelectedWord ? 'Play from selected word' : 'Play')"
      :disabled="!hasContent"
    >
      <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>

    <!-- Stop Button -->
    <button
      @click="stop"
      class="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      title="Stop"
      :disabled="!isPlaying"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    </button>

    <!-- Speed Controls -->
    <div class="w-full px-1 flex flex-col items-center">
      <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Speed: {{ rate.toFixed(1) }}x</div>
      <div class="flex w-full items-center justify-between">
        <button
          @click="decreaseSpeed"
          class="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          :disabled="rate <= 0.5"
          title="Slow down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          @click="increaseSpeed"
          class="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          :disabled="rate >= 2"
          title="Speed up"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  },
  rate: {
    type: Number,
    default: 1.0
  },
  hasContent: {
    type: Boolean,
    default: true
  },
  hasSelectedWord: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['play', 'pause', 'stop', 'increase-speed', 'decrease-speed', 'clear-selection']);

function togglePlay() {
  if (props.isPlaying) {
    emit('pause');
  } else {
    emit('play');
  }
}

function stop() {
  emit('stop');
}

function increaseSpeed() {
  emit('increase-speed');
}

function decreaseSpeed() {
  emit('decrease-speed');
}

function clearSelection() {
  emit('clear-selection');
}
</script>

<style scoped>
.tts-control-panel {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .tts-control-panel {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Add a little animation for hover effect */
.tts-control-panel:hover {
  transform: translateX(-5px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 