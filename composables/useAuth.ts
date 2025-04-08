import { ref, readonly } from 'vue'

export interface User {
  id: string
  email: string
  username: string
  fullName: string | null
}

// State that will be shared between all instances
const user = ref<User | null>(null)
const isAuthenticated = ref(false)
const isLoading = ref(true)
const authToken = ref<string | null>(null)

export function useAuth() {
  // Check if we have stored auth info in localStorage
  const initAuth = async () => {
    isLoading.value = true
    
    try {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        // Set as authenticated with stored data initially
        user.value = JSON.parse(storedUser)
        authToken.value = storedToken
        isAuthenticated.value = true
        
        // Verify token with the server - but don't block UI on this
        refreshUserData().catch(err => {
          console.error('Background refresh failed:', err)
        })
      } else {
        logout()
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      logout()
    } finally {
      isLoading.value = false
    }
  }
  
  // Function to refresh user data from the server
  const refreshUserData = async () => {
    try {
      if (!authToken.value) {
        const storedToken = localStorage.getItem('auth_token')
        if (!storedToken) {
          throw new Error('No auth token available')
        }
        authToken.value = storedToken
      }
      
      console.log('Refreshing user data with token:', authToken.value.substring(0, 10) + '...')
      
      // Use $fetch directly instead of useFetch for more control
      const userData = await $fetch<User>('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken.value}`
        },
        // Prevent caching
        method: 'GET'
      })
      
      console.log('Successfully retrieved user data:', userData)
      
      // If we got here, the request was successful
      user.value = userData
      isAuthenticated.value = true
      
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(userData))
      
      return userData
    } catch (err: any) {
      console.error('Error refreshing user data:', err)
      
      // Only logout on 401/403 errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('Authentication error, logging out')
        logout()
      }
      
      throw err
    }
  }
  
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true
    
    try {
      interface LoginResponse {
        token: string;
        user: User;
      }
      
      // Clear any existing token to avoid interference
      authToken.value = null
      
      console.log('Making login request to /api/auth/login')
      
      // Use $fetch directly instead of useFetch for more control
      const response = await $fetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      console.log('Login response received:', response ? 'Success' : 'Empty response')
      
      // Validate the response contains the expected data
      if (!response || !response.token || !response.user) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response from server')
      }
      
      console.log('Setting auth token and user data')
      
      // Store token in memory and localStorage
      authToken.value = response.token
      
      // Store in localStorage
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Update state
      user.value = response.user
      isAuthenticated.value = true
      
      return true
    } catch (err: any) {
      console.error('Login error in composable:', err)
      // Reset auth state on error
      logout()
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Register function
  const register = async (userData: { 
    email: string; 
    username: string; 
    password: string; 
    fullName?: string;
  }): Promise<boolean> => {
    isLoading.value = true
    
    try {
      interface RegisterResponse {
        token: string;
        user: User;
      }
      
      console.log('Making registration request to /api/auth/register')
      
      // Use $fetch directly instead of useFetch for more control
      const response = await $fetch<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: userData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      console.log('Registration response received:', response ? 'Success' : 'Empty response')
      
      // Validate the response contains the expected data
      if (!response || !response.token || !response.user) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response from server')
      }
      
      console.log('Setting auth token and user data after registration')
      
      // Store token in memory
      authToken.value = response.token
      
      // Store in localStorage
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Update state
      user.value = response.user
      isAuthenticated.value = true
      
      return true
    } catch (err: any) {
      console.error('Registration error in composable:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 啟動Google OAuth登入流程
   * 建立彈出視窗引導用戶進行Google身份驗證
   * @returns {Promise<boolean>} 登入是否成功
   */
  const signInWithGoogle = async (): Promise<boolean> => {
    isLoading.value = true
    
    try {
      // TODO: 確保這裡的googleClientId鍵名與nuxt.config.ts中的配置相符
      const config = useRuntimeConfig()
      const clientId = config.public.googleClientId || config.public.GOOGLE_CLIENT_ID || ''
      
      // 檢查是否配置了Google Client ID
      if (!clientId) {
        console.error('Google Client ID not configured')
        throw new Error('Google Client ID not configured')
      }
      
      // 生成隨機狀態以防止CSRF攻擊
      const state = Math.random().toString(36).substring(2, 15)
      localStorage.setItem('google_auth_state', state)
      
      // 建立OAuth URL
      const redirectUri = `${window.location.origin}/api/auth/google/callback`
      const scope = 'email profile'
      
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      googleAuthUrl.searchParams.append('client_id', clientId)
      googleAuthUrl.searchParams.append('redirect_uri', redirectUri)
      googleAuthUrl.searchParams.append('response_type', 'code')
      googleAuthUrl.searchParams.append('scope', scope)
      googleAuthUrl.searchParams.append('state', state)
      googleAuthUrl.searchParams.append('access_type', 'offline')
      googleAuthUrl.searchParams.append('prompt', 'consent')
      
      // 使用window.open開啟Google登入頁面
      const newWindow = window.open(googleAuthUrl.toString(), '_blank', 'width=600,height=700')
      
      if (!newWindow) {
        throw new Error('Could not open Google authentication window. Please check if popups are blocked.')
      }
      
      // 設定接收消息的事件監聽器
      return new Promise<boolean>((resolve) => {
        const handleMessage = async (event: MessageEvent) => {
          // 只處理來自我們應用的消息
          if (event.origin !== window.location.origin) return
          
          // 處理從回調頁面發送的授權結果
          if (event.data.type === 'google-auth-result') {
            window.removeEventListener('message', handleMessage)
            
            if (event.data.error) {
              console.error('Google authentication error:', event.data.error)
              isLoading.value = false
              resolve(false)
              return
            }
            
            try {
              // 使用後端API來處理Google回傳的授權碼
              const response = await $fetch<{token: string, user: User}>('/api/auth/google', {
                method: 'POST',
                body: {
                  code: event.data.code,
                  state: event.data.state
                }
              })
              
              // 確認收到有效回應
              if (!response || !response.token || !response.user) {
                throw new Error('Invalid response from server')
              }
              
              // 儲存令牌及用戶資訊
              authToken.value = response.token
              localStorage.setItem('auth_token', response.token)
              localStorage.setItem('user', JSON.stringify(response.user))
              
              // 更新驗證狀態
              user.value = response.user
              isAuthenticated.value = true
              
              resolve(true)
            } catch (err) {
              console.error('Error processing Google authentication:', err)
              resolve(false)
            } finally {
              isLoading.value = false
            }
          }
        }
        
        window.addEventListener('message', handleMessage)
        
        // 設定超時時間，以防用戶未完成授權流程
        setTimeout(() => {
          window.removeEventListener('message', handleMessage)
          isLoading.value = false
          resolve(false)
        }, 300000) // 5分鐘超時
      })
    } catch (err) {
      console.error('Google sign-in error:', err)
      isLoading.value = false
      return false
    }
  }
  
  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    
    // Reset state
    authToken.value = null
    user.value = null
    isAuthenticated.value = false
  }
  
  // Get the current auth token (useful for making authenticated requests)
  const getAuthToken = (): string | null => {
    if (authToken.value) {
      return authToken.value
    }
    
    // Try to get from localStorage if not in memory
    return localStorage.getItem('auth_token')
  }
  
  // Return the composable interface
  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    login,
    register,
    logout,
    initAuth,
    refreshUserData,
    getAuthToken,
    signInWithGoogle
  }
} 