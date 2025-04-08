<script setup lang="ts">
import { ref, computed } from 'vue'

// Page meta information
definePageMeta({
  title: 'Articles - English Learning Hub',
  description: 'Browse articles to improve your English reading skills.',
  auth: false
})

// Type definition for an article
interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  level: string;
  image: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
}

// Articles filter state
const filters = ref({
  level: '',
  category: '',
  search: ''
})

// Fetch articles with error handling
const { data: articles, error, pending } = useFetch('/api/articles', {
  key: `articles-list-${Date.now()}`,
  cache: 'no-store'
})

// Articles list with reactive filtering
const articlesList = computed(() => articles.value || [])

// Filter articles based on selected filters
const filteredArticles = computed(() => {
  return articlesList.value.filter(article => {
    // Filter by level
    if (filters.value.level && article.level !== filters.value.level) {
      return false
    }
    
    // Filter by category
    if (filters.value.category && article.category !== filters.value.category) {
      return false
    }
    
    // Filter by search term
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      return (
        article.title.toLowerCase().includes(searchTerm) ||
        article.excerpt.toLowerCase().includes(searchTerm) ||
        article.category.toLowerCase().includes(searchTerm)
      )
    }
    
    return true
  })
})

// Helper to get appropriate CSS class for level badge
function getLevelClass(level: string) {
  switch (level) {
    case 'S':
      return 'bg-red-600'
    case 'A':
      return 'bg-orange-500'
    case 'B':
      return 'bg-purple-600'
    case 'C':
      return 'bg-blue-500'
    case 'D':
      return 'bg-green-500' 
    case 'E':
      return 'bg-gray-500'
    case 'F':
      return 'bg-white text-gray-800 border border-gray-300'
    default:
      return 'bg-gray-500'
  }
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Articles for English Learning</h1>
      <p class="text-gray-700 dark:text-gray-300">Improve your reading skills with our collection of engaging articles.</p>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8">
      <div class="flex flex-wrap gap-4">
        <div class="w-full md:w-auto">
          <label for="level" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty Level</label>
          <select 
            id="level" 
            v-model="filters.level" 
            class="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
          >
            <option value="">All Levels</option>
            <option value="S">S - 專業級水平</option>
            <option value="A">A - 高級水平</option>
            <option value="B">B - 中高級水平</option>
            <option value="C">C - 中級水平</option>
            <option value="D">D - 中初級水平</option>
            <option value="E">E - 初級水平</option>
            <option value="F">F - 入門級水平</option>
          </select>
        </div>
        
        <div class="w-full md:w-auto">
          <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select 
            id="category" 
            v-model="filters.category"
            class="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
          >
            <option value="">All Categories</option>
            <option value="business-finance">商業財經</option>
            <option value="entertainment">影視偶像</option>
            <option value="art-design">藝術設計</option>
            <option value="literature">文學小說</option>
            <option value="religion-astrology">宗教命理</option>
            <option value="news-events">新聞時事</option>
            <option value="travel-leisure">休閒旅遊</option>
            <option value="technology">科技新知</option>
            <option value="food-cuisine">美食精選</option>
            <option value="sports">體育賽事</option>
          </select>
        </div>
        
        <div class="w-full md:flex-1">
          <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
          <input 
            id="search" 
            type="text" 
            v-model="filters.search" 
            placeholder="Search articles" 
            class="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="py-12 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Loading articles...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-12 text-center">
      <div class="bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-4 text-red-600 dark:text-red-300 inline-block">
        <p>Sorry, we couldn't load the articles. Please try again later.</p>
      </div>
    </div>

    <!-- Articles Grid - Only show when data is loaded -->
    <div v-else>
      <!-- Articles Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article 
          v-for="article in filteredArticles" 
          :key="article.id" 
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="h-48 overflow-hidden relative">
            <img :src="article.image" :alt="article.title" class="w-full h-full object-cover" />
            <div class="absolute top-2 right-2">
              <span class="px-2 py-1 text-xs rounded-full text-white" :class="getLevelClass(article.level)">
                {{ article.level }}
              </span>
            </div>
          </div>
          
          <div class="p-4">
            <div class="mb-1 text-sm text-gray-500 dark:text-gray-400">{{ article.category }}</div>
            <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{{ article.title }}</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{{ article.excerpt }}</p>
            
            <NuxtLink 
              :to="`/articles/${article.id}`" 
              class="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center"
            >
              Read Article
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-if="filteredArticles.length === 0" class="py-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-1">No articles found</h3>
        <p class="text-gray-600 dark:text-gray-400">Try adjusting your filters or search term</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Article card hover effect */
article:hover {
  transform: translateY(-2px);
}

/* Line clamp for article excerpts */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 