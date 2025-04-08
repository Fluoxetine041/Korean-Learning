export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  // If authentication is still loading, wait
  if (isLoading.value) {
    return
  }
  
  // Skip authentication check if the page explicitly specifies auth: false
  if (to.meta.auth === false) {
    return
  }
  
  // If the page requires authentication (explicitly or implicitly by middleware: 'auth')
  // and user is not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}) 