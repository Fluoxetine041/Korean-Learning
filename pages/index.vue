<template>
  <div>
    <!-- Hero Section -->
    <section class="py-12 md:py-20 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Improve Your English Skills With Interactive Learning
          </h1>
          <p class="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8">
            Read articles, listen to pronunciation, and learn new vocabulary with our interactive tools.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <NuxtLink to="/articles" class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Browse Articles
            </NuxtLink>
            <NuxtLink to="/dictionary" class="px-6 py-3 bg-white text-primary-600 rounded-lg border border-primary-600 hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-gray-700">
              Open Dictionary
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Learning Features
        </h2>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Interactive Articles</h3>
            <p class="text-gray-700 dark:text-gray-300">
              Read engaging articles on various topics to improve your reading comprehension and vocabulary.
            </p>
          </div>
          
          <!-- Feature 2 -->
          <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Text-to-Speech</h3>
            <p class="text-gray-700 dark:text-gray-300">
              Listen to clear pronunciation of words and entire articles to improve your listening and speaking skills.
            </p>
          </div>
          
          <!-- Feature 3 -->
          <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Built-in Dictionary</h3>
            <p class="text-gray-700 dark:text-gray-300">
              Click on any word to see its definition, examples, and pronunciation without leaving the article.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Get Started Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Ready to improve your English?</h2>
          <p class="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Sign up for free and start your learning journey today!
          </p>
          <NuxtLink to="/login" class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-block">
            Get Started for Free
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Home - English Learning Hub',
  description: 'Improve your English skills with interactive articles, audio pronunciation, and a built-in dictionary.',
  auth: false
})
</script> 