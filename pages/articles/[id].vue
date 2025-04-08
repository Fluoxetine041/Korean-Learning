<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import FloatingTTS from '~/components/FloatingTTS.vue'

// Page meta information
definePageMeta({
  title: 'Article Details - English Learning Hub',
  description: 'Read and learn from English articles with interactive features',
  auth: false
})

// Type definitions
interface WordDefinition {
  word: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
    synonyms: string[];
  }[];
}

// Route parameters
const route = useRoute()
const id = route.params.id as string

// Fetch article data from API
const { data: article, pending, error } = useFetch(`/api/articles/${id}`, {
  key: `article-${id}-${Date.now()}`,
  cache: 'no-store'
})

// Add logging to debug
watch(article, (newArticle) => {
  console.log('Article data:', newArticle)
}, { immediate: true })

// Loading and error states
const isLoading = ref(pending.value)

// Fix for possible undefined or missing values
const articleContent = computed(() => {
  if (!article.value) return { 
    title: 'Loading...', 
    paragraphs: [], 
    authors: [],
    level: 'beginner',
    category: '',
    date: new Date().toISOString(),
    image: '',
    excerpt: ''
  }
  
  // Handle both array and string formats for paragraphs
  let paragraphs: string[] = Array.isArray(article.value.paragraphs) 
    ? article.value.paragraphs 
    : [];

  if (typeof article.value.paragraphs === 'string') {
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(article.value.paragraphs);
      paragraphs = Array.isArray(parsed) ? parsed : [article.value.paragraphs];
    } catch (e) {
      // If parsing fails, treat as a single paragraph
      paragraphs = [article.value.paragraphs];
    }
  }
  
  return {
    ...article.value,
    paragraphs,
    authors: article.value.authors || [],
    level: article.value.level || 'beginner',
    category: article.value.category || '',
    date: article.value.date || new Date().toISOString(),
    image: article.value.image || '',
    excerpt: article.value.excerpt || ''
  }
})

// Text to speech functionality
const speechSynthesis = ref<SpeechSynthesis | null>(null)
const speechUtterance = ref<SpeechSynthesisUtterance | null>(null)
const isPlaying = ref(false)
const speechRate = ref(1.0)
const wordRefs = ref<HTMLElement[]>([])
const currentParagraphIndex = ref<number | null>(null)
const currentWordIndex = ref<number | null>(null)
const highlightedWordIndex = ref<number | null>(null)
const highlightedParagraphIndex = ref<number | null>(null)

// Selected word for TTS (without starting playback)
const selectedTTSParagraphIndex = ref<number | null>(null)
const selectedTTSWordIndex = ref<number | null>(null)
const isLongPressCompleted = ref(false)

// Dictionary functionality
const showDictionary = ref(false)
const selectedWord = ref('')
const wordDefinition = ref<WordDefinition | null>(null)
const dictionaryLoading = ref(false)

// Add long press detection state variables
const longPressTimer = ref<number | null>(null)
const longPressThreshold = 500 // ms
const longPressActive = ref(false)
const longPressWordData = ref<{paragraphIndex: number, wordIndex: number} | null>(null)

// Watch for pending state changes
watch(pending, (newValue) => {
  isLoading.value = newValue
})

// Helper function for level badge color
function getLevelClass(level: string) {
  switch (level) {
    case 'beginner':
      return 'bg-green-500'
    case 'intermediate':
      return 'bg-blue-500'
    case 'advanced':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

// Split paragraph into words and spaces
function splitIntoParts(text: string) {
  // This regex matches words (with apostrophes/hyphens) but keeps punctuation separate
  return text.match(/[\w\-'']+|[^\w\s]/g) || []
}

// Check if an element is punctuation
function isPunctuation(text: string) {
  return /^[^\w\s]$/.test(text)
}

// Text-to-speech control functions
function playSpeech(text: string) {
  if (!speechSynthesis.value || !article.value || !('paragraphs' in article.value)) return
  
  // Cancel any ongoing speech
  if (speechSynthesis.value) {
    speechSynthesis.value.cancel()
    isPlaying.value = false
    clearHighlights()
  }
  
  // Create new utterance
  speechUtterance.value = new SpeechSynthesisUtterance(text)
  speechUtterance.value.rate = speechRate.value
  speechUtterance.value.lang = 'en-US'
  
  // Reset highlighted indices (for active word)
  highlightedWordIndex.value = null
  highlightedParagraphIndex.value = null
  
  // Setup boundary event to track word position
  if (article.value.paragraphs) {
    // Get the starting position based on selection or start from beginning
    let paragraphIndex = selectedTTSParagraphIndex.value !== null ? selectedTTSParagraphIndex.value : 0
    let wordIndex = selectedTTSWordIndex.value !== null ? selectedTTSWordIndex.value : 0
    
    // Set initial highlight position
    highlightedParagraphIndex.value = paragraphIndex
    highlightedWordIndex.value = wordIndex
    
    // Variable to count words processed for tracking
    let wordCounter = 0
    
    // Precompute words for each paragraph
    const paragraphElements = article.value.paragraphs.map((p: string) => 
      splitIntoParts(p)
    )
    
    // Calculate total words to be read (for better tracking)
    let wordsProcessed = 0
    
    // Count words up to our starting position
    for (let i = 0; i < paragraphIndex; i++) {
      wordsProcessed += paragraphElements[i].filter(w => !isPunctuation(w)).length
    }
    
    // Add words in current paragraph up to starting word
    for (let i = 0; i < wordIndex; i++) {
      if (!isPunctuation(paragraphElements[paragraphIndex][i])) {
        wordsProcessed++
      }
    }
    
    // Apply initial highlight
    highlightCurrentWord()
    
    speechUtterance.value.onboundary = (event) => {
      if (event.name === 'word') {
        // Word boundary event - move to next word
        wordCounter++
        
        // Calculate current position based on words processed + new words encountered
        let totalWords = 0
        let foundPosition = false
        
        // Find the corresponding word position in our paragraphs
        for (let pIdx = 0; pIdx < paragraphElements.length; pIdx++) {
          const words = paragraphElements[pIdx].filter(w => !isPunctuation(w))
          
          if (totalWords + words.length > wordsProcessed + wordCounter - 1) {
            // Found the paragraph
            const wordPosition = wordsProcessed + wordCounter - 1 - totalWords
            
            // Find the actual index including punctuation
            let actualIdx = 0
            let wordCount = 0
            
            for (let i = 0; i < paragraphElements[pIdx].length; i++) {
              if (!isPunctuation(paragraphElements[pIdx][i])) {
                if (wordCount === wordPosition) {
                  actualIdx = i
                  break
                }
                wordCount++
              }
            }
            
            // Update highlight position
            highlightedParagraphIndex.value = pIdx
            highlightedWordIndex.value = actualIdx
            highlightCurrentWord()
            foundPosition = true
            break
          }
          
          totalWords += words.length
        }
        
        if (!foundPosition) {
          // If position not found, clear highlight
          clearHighlights()
        }
      }
    }
  }
  
  // Add event listeners
  speechUtterance.value.onstart = () => {
    isPlaying.value = true
  }
  
  speechUtterance.value.onend = () => {
    isPlaying.value = false
    clearHighlights()
  }
  
  speechUtterance.value.onpause = () => {
    isPlaying.value = false
  }
  
  speechUtterance.value.onresume = () => {
    isPlaying.value = true
  }
  
  // Start speaking
  speechSynthesis.value.speak(speechUtterance.value)
}

// Clear all word highlights for active word (but keep selection)
function clearHighlights() {
  // Remove active class from all words
  document.querySelectorAll('.word-span.active').forEach(element => {
    element.classList.remove('active')
  })
  
  // Ensure the selected word still has its blue highlight
  if (selectedTTSParagraphIndex.value !== null && selectedTTSWordIndex.value !== null) {
    const selector = `.word-span[data-paragraph-index="${selectedTTSParagraphIndex.value}"][data-word-index="${selectedTTSWordIndex.value}"]`
    const selectedElement = document.querySelector(selector)
    if (selectedElement) {
      selectedElement.classList.add('tts-selected')
    }
  }
}

// Highlight the current word being spoken
function highlightCurrentWord() {
  if (highlightedParagraphIndex.value === null || highlightedWordIndex.value === null) return
  
  // Find the word element to highlight
  const wordElement = document.querySelector(
    `.word-span[data-paragraph-index="${highlightedParagraphIndex.value}"][data-word-index="${highlightedWordIndex.value}"]`
  )
  
  if (wordElement) {
    // Add active class without affecting tts-selected class
    wordElement.classList.add('active')
    
    // Scroll to the word if it's not visible
    wordElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }
  
  // Make sure the selected word maintains its blue highlight
  if (selectedTTSParagraphIndex.value !== null && selectedTTSWordIndex.value !== null) {
    const selectedElement = document.querySelector(
      `.word-span[data-paragraph-index="${selectedTTSParagraphIndex.value}"][data-word-index="${selectedTTSWordIndex.value}"]`
    )
    if (selectedElement) {
      selectedElement.classList.add('tts-selected')
    }
  }
}

function pauseSpeech() {
  if (speechSynthesis.value && isPlaying.value) {
    speechSynthesis.value.pause()
    isPlaying.value = false
  }
}

function resumeSpeech() {
  if (speechSynthesis.value && !isPlaying.value) {
    speechSynthesis.value.resume()
    isPlaying.value = true
  }
}

function stopSpeech() {
  if (speechSynthesis.value) {
    speechSynthesis.value.cancel()
    isPlaying.value = false
    clearHighlights()
    
    // Clear the selected TTS word when stopping with the stop button
    clearTTSSelection();
  }
}

function increaseSpeed() {
  if (speechRate.value < 2) {
    speechRate.value += 0.1
    if (speechUtterance.value) {
      speechUtterance.value.rate = speechRate.value
    }
  }
}

function decreaseSpeed() {
  if (speechRate.value > 0.5) {
    speechRate.value -= 0.1
    if (speechUtterance.value) {
      speechUtterance.value.rate = speechRate.value
    }
  }
}

// Dictionary lookup function
async function lookupWord(word: string) {
  // Clean up the word - remove punctuation
  const cleanWord = word.replace(/[^\w]/g, '').toLowerCase()
  if (!cleanWord || cleanWord.length < 2) return
  
  selectedWord.value = cleanWord
  dictionaryLoading.value = true
  showDictionary.value = true
  
  try {
    // In real app, fetch from API endpoint
    const { data } = await useFetch(`/api/dictionary/${cleanWord}`)
    
    if (data.value) {
      wordDefinition.value = data.value as WordDefinition
    } else {
      // Try with mock data as fallback
      const mockDefinitions: Record<string, WordDefinition> = {
        'language': {
          word: 'language',
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [
                {
                  definition: 'The method of human communication, either spoken or written, consisting of the use of words in a structured and conventional way.',
                  example: 'English is a widely spoken language.'
                },
                {
                  definition: 'The system of communication used by a particular community or country.',
                  example: 'She speaks several languages.'
                }
              ],
              synonyms: ['speech', 'tongue', 'dialect', 'idiom']
            }
          ]
        },
        'learning': {
          word: 'learning',
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [
                {
                  definition: 'The acquisition of knowledge or skills through experience, study, or being taught.',
                  example: 'These courses will promote effective learning.'
                }
              ],
              synonyms: ['education', 'study', 'schooling', 'training']
            },
            {
              partOfSpeech: 'verb',
              definitions: [
                {
                  definition: 'Present participle of learn.',
                  example: 'He is learning English.'
                }
              ],
              synonyms: []
            }
          ]
        },
        'cognitive': {
          word: 'cognitive',
          meanings: [
            {
              partOfSpeech: 'adjective',
              definitions: [
                {
                  definition: 'Relating to cognition, which is the mental action or process of acquiring knowledge and understanding through thought, experience, and the senses.',
                  example: 'Cognitive development occurs throughout childhood.'
                }
              ],
              synonyms: ['mental', 'intellectual', 'cerebral', 'psychological']
            }
          ]
        }
      }
      
      // Check if we have a mock definition for this word as fallback
      wordDefinition.value = cleanWord in mockDefinitions ? mockDefinitions[cleanWord] : null
    }
  } catch (error) {
    console.error('Error fetching word definition:', error)
    wordDefinition.value = null
  } finally {
    dictionaryLoading.value = false
  }
}

function closeDictionary() {
  showDictionary.value = false
  selectedWord.value = ''
  wordDefinition.value = null
}

// Function to handle word click for dictionary lookup
function handleWordClick(word: string, paragraphIndex: number, wordIndex: number) {
  // Don't trigger dictionary lookup if long press was just completed
  if (isLongPressCompleted.value) {
    isLongPressCompleted.value = false;
    return;
  }
  
  if (!isPunctuation(word)) {
    lookupWord(word);
  }
}

// Function to handle long press start
function handleLongPressStart(paragraphIndex: number, wordIndex: number, event: MouseEvent | TouchEvent) {
  // Access paragraphs safely
  const paragraphs = articleContent.value?.paragraphs;
  if (!paragraphs || !paragraphs[paragraphIndex]) return;
  
  const wordArray = splitIntoParts(paragraphs[paragraphIndex]);
  if (isPunctuation(wordArray[wordIndex])) return;
  
  event.preventDefault();
  longPressActive.value = true;
  longPressWordData.value = { paragraphIndex, wordIndex };
  
  longPressTimer.value = window.setTimeout(() => {
    if (longPressActive.value && longPressWordData.value) {
      // First remove any existing selection
      clearTTSSelection();
      
      // Make sure all tts-selected classes are removed
      document.querySelectorAll('.word-span.tts-selected').forEach(element => {
        element.classList.remove('tts-selected');
      });
      
      // Set new selection
      selectedTTSParagraphIndex.value = paragraphIndex;
      selectedTTSWordIndex.value = wordIndex;
      isLongPressCompleted.value = true;
      
      // Apply tts-selected class to the new word
      const selectedWordElement = document.querySelector(
        `.word-span[data-paragraph-index="${paragraphIndex}"][data-word-index="${wordIndex}"]`
      );
      if (selectedWordElement) {
        selectedWordElement.classList.add('tts-selected');
      }
      
      // Stop any current speech
      if (isPlaying.value) {
        stopSpeech();
      }
    }
    longPressActive.value = false;
    longPressWordData.value = null;
  }, longPressThreshold);
}

// Function to handle long press end
function handleLongPressEnd() {
  if (longPressTimer.value !== null) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  longPressActive.value = false
  longPressWordData.value = null
}

// Function to handle long press cancel (e.g., move)
function handleLongPressCancel() {
  handleLongPressEnd()
}

// Function to play the full article or from selected word
function playFullArticle() {
  if (!article.value || !('paragraphs' in article.value)) return;
  
  // If a word is selected for TTS, play from that word
  if (selectedTTSParagraphIndex.value !== null && selectedTTSWordIndex.value !== null) {
    playFromWord(selectedTTSParagraphIndex.value, selectedTTSWordIndex.value);
    return;
  }
  
  // Otherwise play the full article from the beginning
  const fullText = article.value.paragraphs.join(' ');
  playSpeech(fullText);
}

// Function to play from a specific word
function playFromWord(paragraphIndex: number, wordIndex: number) {
  if (!article.value || !('paragraphs' in article.value) || !speechSynthesis.value) return
  
  // Stop any current speech
  if (speechSynthesis.value) {
    speechSynthesis.value.cancel()
    isPlaying.value = false
    clearHighlights()
  }
  
  // Set the initial highlight position for active word (current reading position)
  highlightedParagraphIndex.value = paragraphIndex
  highlightedWordIndex.value = wordIndex
  
  // Get all paragraphs from the clicked position to the end
  const startParagraph = article.value.paragraphs[paragraphIndex]
  const startParagraphWords = splitIntoParts(startParagraph)
  
  // Get the text from the clicked word to the end of its paragraph
  const startWordText = startParagraphWords.slice(wordIndex)
  
  // Convert the array of words back to text with proper spacing
  let remainingText = ''
  startWordText.forEach((word, i) => {
    if (isPunctuation(word)) {
      remainingText += word
    } else if (i < startWordText.length - 1) {
      remainingText += word + ' '
    } else {
      remainingText += word
    }
  })
  
  // Get the remaining paragraphs
  const remainingParagraphs = article.value.paragraphs.slice(paragraphIndex + 1)
  
  // Combine into a single text to speak
  const textToSpeak = [remainingText, ...remainingParagraphs].join(' ')
  
  // Clear the selection after starting playback
  // We'll do this after starting speech so the initial word is correctly highlighted
  setTimeout(() => {
    // Save the active word position before clearing selection
    const activeParaIndex = highlightedParagraphIndex.value;
    const activeWordIndex = highlightedWordIndex.value;
    
    // Clear the blue selection
    selectedTTSParagraphIndex.value = null;
    selectedTTSWordIndex.value = null;
    
    // Remove blue highlight from all words
    document.querySelectorAll('.word-span.tts-selected').forEach(element => {
      element.classList.remove('tts-selected');
    });
    
    // Restore active highlight
    if (activeParaIndex !== null && activeWordIndex !== null) {
      highlightedParagraphIndex.value = activeParaIndex;
      highlightedWordIndex.value = activeWordIndex;
      highlightCurrentWord();
    }
  }, 100);
  
  // Start speaking
  playSpeech(textToSpeak)
  
  // Manually highlight the first word since the speech event might take a moment
  highlightCurrentWord()
}

// Function to clear TTS word selection
function clearTTSSelection() {
  selectedTTSParagraphIndex.value = null;
  selectedTTSWordIndex.value = null;
}

// Lifecycle hooks
onMounted(() => {
  if (window) {
    speechSynthesis.value = window.speechSynthesis
  }
})

onBeforeUnmount(() => {
  stopSpeech()
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Loading article...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="py-12 text-center">
      <div class="bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-4 text-red-600 dark:text-red-300 inline-block">
        <p>Sorry, we couldn't load this article. Please try again later.</p>
      </div>
      <NuxtLink to="/articles" class="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Articles
      </NuxtLink>
    </div>
    
    <!-- Article Content -->
    <div v-else class="article-container mx-auto">
      <!-- Floating TTS Controls -->
      <FloatingTTS 
        :is-playing="isPlaying"
        :rate="speechRate"
        :has-content="!!articleContent.paragraphs && articleContent.paragraphs.length > 0"
        :has-selected-word="selectedTTSParagraphIndex !== null && selectedTTSWordIndex !== null"
        @play="playFullArticle"
        @pause="pauseSpeech"
        @stop="stopSpeech"
        @increase-speed="increaseSpeed"
        @decrease-speed="decreaseSpeed"
        @clear-selection="clearTTSSelection"
      />

      <!-- Article Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span 
              class="inline-block px-3 py-1 text-xs rounded-full text-white mr-2" 
              :class="getLevelClass(articleContent.level)"
            >
              {{ articleContent.level }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ articleContent.category }}</span>
          </div>
          
          <!-- Date Display -->
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ new Date(articleContent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </div>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">{{ articleContent.title }}</h1>
        
        <!-- Authors -->
        <div class="flex items-center space-x-4 mb-4">
          <div v-for="author in articleContent.authors" :key="author.id" class="flex items-center">
            <img 
              :src="author.avatar" 
              :alt="author.name" 
              class="w-10 h-10 rounded-full mr-2" 
            />
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ author.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Author</div>
            </div>
          </div>
        </div>
        
        <!-- Featured Image -->
        <div class="mb-6 rounded-lg overflow-hidden">
          <img 
            :src="articleContent.image" 
            :alt="articleContent.title" 
            class="w-full h-64 object-cover" 
          />
        </div>
      </div>
      
      <!-- Read Controls -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between">
        <div class="text-gray-700 dark:text-gray-300 font-medium mb-2 md:mb-0">Reading Tools:</div>
        
        <div class="flex space-x-3">
          <!-- Text to Speech Controls -->
          <div class="flex items-center space-x-2">
            <button 
              @click="isPlaying ? pauseSpeech() : articleContent.paragraphs && articleContent.paragraphs.length > 0 ? playSpeech(articleContent.paragraphs.join(' ')) : null" 
              class="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!articleContent.paragraphs || articleContent.paragraphs.length === 0"
            >
              <span v-if="isPlaying">Pause</span>
              <span v-else>Listen</span>
            </button>
            
            <button 
              @click="stopSpeech" 
              class="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!isPlaying"
            >
              Stop
            </button>
          </div>
          
          <!-- Speed Controls -->
          <div class="flex items-center space-x-1">
            <button 
              @click="decreaseSpeed" 
              class="p-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              :disabled="speechRate <= 0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span class="text-sm text-gray-700 dark:text-gray-200 min-w-[60px] text-center">
              {{ speechRate.toFixed(1) }}x
            </span>
            
            <button 
              @click="increaseSpeed" 
              class="p-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              :disabled="speechRate >= 2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Article Body -->
      <div class="article-content prose dark:prose-invert prose-lg max-w-none mb-8">
        <p v-if="articleContent.excerpt" class="text-xl font-medium mb-6 text-gray-700 dark:text-gray-300">
          {{ articleContent.excerpt }}
        </p>
        
        <div v-for="(paragraph, paragraphIndex) in articleContent.paragraphs" :key="paragraphIndex" class="mb-6 leading-relaxed">
          <p>
            <span 
              v-for="(word, wordIndex) in splitIntoParts(paragraph)" 
              :key="`${paragraphIndex}-${wordIndex}`"
              :class="[
                'word-span',
                isPunctuation(word) ? 'punctuation' : 'word',
                (highlightedParagraphIndex === paragraphIndex && highlightedWordIndex === wordIndex) ? 'active' : '',
                (selectedTTSParagraphIndex === paragraphIndex && selectedTTSWordIndex === wordIndex) ? 'tts-selected' : '',
                longPressActive && longPressWordData && longPressWordData.paragraphIndex === paragraphIndex && longPressWordData.wordIndex === wordIndex ? 'long-press-active' : ''
              ]"
              :data-paragraph-index="paragraphIndex"
              :data-word-index="wordIndex"
              @click="handleWordClick(word, paragraphIndex, wordIndex)"
              @mousedown="(e) => handleLongPressStart(paragraphIndex, wordIndex, e)"
              @mouseup="handleLongPressEnd"
              @mouseleave="handleLongPressCancel"
              @touchstart="(e) => handleLongPressStart(paragraphIndex, wordIndex, e)"
              @touchend="handleLongPressEnd"
              @touchcancel="handleLongPressCancel"
            >
              {{ word }}{{ isPunctuation(word) ? '' : ' ' }}
            </span>
          </p>
        </div>
      </div>
      
      <!-- Navigation -->
      <div class="border-t dark:border-gray-700 pt-6 mt-6 flex justify-between">
        <NuxtLink to="/articles" class="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </NuxtLink>
      </div>
      
      <!-- Dictionary Popup -->
      <Teleport to="body">
        <div v-if="showDictionary" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-auto">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ selectedWord }}</h3>
              
              <!-- Play word pronunciation button -->
              <div class="flex items-center gap-2">
                <button 
                  @click="playSpeech(selectedWord)"
                  class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400"
                  title="Pronounce Word"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
                
                <button 
                  @click="closeDictionary"
                  class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  title="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="p-5">
              <!-- Loading indicator -->
              <div v-if="dictionaryLoading" class="flex justify-center py-10">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
              </div>
              
              <!-- Dictionary content -->
              <div v-else-if="wordDefinition">
                <div v-for="(meaning, index) in wordDefinition.meanings" :key="index" class="mb-6">
                  <div class="text-sm text-gray-500 dark:text-gray-400 mb-1 italic">{{ meaning.partOfSpeech }}</div>
                  
                  <div v-for="(definition, defIndex) in meaning.definitions" :key="defIndex" class="mb-3">
                    <div class="text-gray-900 dark:text-gray-100 mb-1">{{ defIndex + 1 }}. {{ definition.definition }}</div>
                    
                    <div v-if="definition.example" class="text-sm text-gray-600 dark:text-gray-400 pl-5 border-l-2 border-gray-200 dark:border-gray-700 italic">
                      "{{ definition.example }}"
                    </div>
                  </div>
                  
                  <div v-if="meaning.synonyms && meaning.synonyms.length" class="mt-2">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Synonyms: </span>
                    <span v-for="(synonym, synIndex) in meaning.synonyms" :key="synIndex" class="text-sm">
                      {{ synonym }}{{ synIndex < meaning.synonyms.length - 1 ? ', ' : '' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- No definition found -->
              <div v-else class="py-6 text-center text-gray-500 dark:text-gray-400">
                No definition found for "{{ selectedWord }}".
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.word-span {
  @apply inline-block cursor-pointer px-0.5 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:text-black dark:hover:text-white transition-colors duration-150;
  position: relative;
}

.word-span.active {
  @apply bg-primary-200 dark:bg-primary-800 text-primary-900 dark:text-primary-100 font-semibold transform scale-105 px-1;
  box-shadow: 0 0 0.5rem rgba(3, 105, 161, 0.3);
}

.word-span.tts-selected {
  @apply bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-medium;
  box-shadow: 0 0 0.25rem rgba(59, 130, 246, 0.5);
  /* Keep the border even when active */
  border: 1px solid rgba(59, 130, 246, 0.7);
}

/* When a word has both active and selected states */
.word-span.active.tts-selected {
  /* Use a gradient background to show both states */
  background: linear-gradient(135deg, rgba(219, 234, 254, 1) 0%, rgba(191, 219, 254, 1) 100%);
  /* Combine the shadows */
  box-shadow: 
    0 0 0.5rem rgba(3, 105, 161, 0.3),
    0 0 0.25rem rgba(59, 130, 246, 0.5);
  /* Keep the border */
  border: 1px solid rgba(59, 130, 246, 0.7);
  /* Give it a little extra emphasis */
  transform: scale(1.1);
}

.word-span.long-press-active {
  @apply bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100;
  transform: scale(1.1);
  transition: all 0.3s ease;
}

.word-span:not(.punctuation):hover::after {
  content: "Click: Dictionary | Long press: Select for TTS";
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}

.word-punctuation {
  @apply cursor-text;
  /* Remove hover effects from punctuation */
  &:hover {
    @apply bg-transparent text-inherit;
  }
}

/* Floating control panel styles */
.tts-control-panel {
  transition: opacity 0.3s ease;
  opacity: 0.75;
}

.tts-control-panel:hover {
  opacity: 1;
}

/* Override prose styles for our specific use case */
.prose :deep(p) {
  @apply my-6;
  line-height: 1.8;
}
</style> 