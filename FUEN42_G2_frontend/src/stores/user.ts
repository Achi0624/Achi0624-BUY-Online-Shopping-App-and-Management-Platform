import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/modules/auth'
import type { AuthAPI } from '@/types/api'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<AuthAPI.MemberInfo | null>(null)
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.memberLevel?.levelCode || '')
  const memberId = computed(() => user.value?.memberId || user.value?.id || null)

  // Actions
  const login = async (loginData: AuthAPI.LoginRequest) => {
    try {
      loading.value = true
      error.value = null

      console.log('🔐 開始登入流程:', {
        email: loginData.email,
        hasPassword: !!loginData.password
      })

      const response = await authApi.login(loginData)
      
      console.log('📥 API 響應完整內容:', JSON.stringify(response, null, 2))
      console.log('📥 API 響應數據:', JSON.stringify(response.data, null, 2))
      console.log('📥 響應狀態:', response.status)
      console.log('📥 響應數據類型:', typeof response.data)
      if (response.data && typeof response.data === 'object') {
        console.log('📥 響應數據鍵值:', Object.keys(response.data))
      }

      // 處理不同的響應格式
      let userData, authToken, newRefreshToken

      if (response.data.success) {
        console.log('🔍 成功響應，解析數據結構')
        const { data } = response.data
        
        // 根據實際響應結構解析
        if (data.token) {
          // 實際格式: { success: true, data: { token, userId, email, name, memberId, ... } }
          console.log('🔍 使用實際格式: data 直接包含用戶信息和令牌')
          authToken = data.token
          
          // 構建用戶數據對象
          userData = {
            id: data.memberId || data.userId,
            userId: data.userId,
            name: data.name,
            email: data.email,
            memberId: data.memberId,
            phone: data.phone || '',
            birthday: data.birthday || '',
            defaultAddressId: data.defaultAddressId,
            memberLevelId: data.memberLevelId,
            memberLevel: data.memberLevel,
            totalSpending: data.totalSpending || 0,
            points: data.points || 0,
            isActive: data.isActive !== false,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString()
          }
          
          newRefreshToken = data.refreshToken || ''
        } else {
          // 舊格式處理
          userData = data.user
          authToken = data.token
          newRefreshToken = data.refreshToken
        }
      } else if (response.data.user && response.data.token) {
        // 格式2: 直接包含 user, token, refreshToken
        console.log('🔍 使用格式2: 直接包含 user/token')
        userData = response.data.user
        authToken = response.data.token
        newRefreshToken = response.data.refreshToken
      } else if (response.data.data) {
        // 格式3: { data: { user, token, refreshToken } }
        console.log('🔍 使用格式3: data 包裝')
        userData = response.data.data.user
        authToken = response.data.data.token
        newRefreshToken = response.data.data.refreshToken
      } else {
        console.error('❌ 未知的響應格式:', response.data)
        throw new Error('API 響應格式不正確')
      }

      console.log('🔍 解析結果:', {
        userData: userData,
        authToken: authToken ? '存在' : '缺失',
        newRefreshToken: newRefreshToken ? '存在' : '缺失'
      })

      // 驗證必要的數據
      if (!userData || !authToken) {
        console.error('❌ 數據驗證失敗:', {
          hasUserData: !!userData,
          hasAuthToken: !!authToken,
          userData,
          authToken: authToken ? 'exists' : 'missing'
        })
        throw new Error('API 響應缺少必要的用戶數據或令牌')
      }

      // 儲存用戶資料和 tokens
      user.value = userData
      token.value = authToken
      refreshToken.value = newRefreshToken || ''

      // 儲存到 localStorage
      localStorage.setItem('access_token', authToken)
      localStorage.setItem('refresh_token', newRefreshToken || '')
      localStorage.setItem('user_info', JSON.stringify(userData))

      console.log('✅ 登入成功:', {
        user: userData.name || userData.userName || '用戶',
        email: userData.email,
        isLoggedIn: !!token.value && !!user.value,
        responseStructure: Object.keys(response.data)
      })

      return {
        user: userData,
        token: authToken,
        refreshToken: newRefreshToken,
        expiresIn: response.data.expiresIn || 3600
      }
    } catch (err: any) {
      console.error('❌ 登入失敗:', err)
      console.error('❌ 錯誤詳情:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        hasRequest: !!err.request
      })
      
      // 處理不同類型的錯誤
      if (err.response) {
        const { status, data } = err.response
        console.log('🔍 伺服器響應:', { status, data })
        
        switch (status) {
          case 401:
            error.value = '帳號或密碼錯誤，請重新輸入'
            break
          case 400:
            error.value = data?.message || '請求格式錯誤'
            break
          case 422:
            error.value = data?.message || '輸入資料驗證失敗'
            break
          case 404:
            error.value = '帳號不存在'
            break
          case 500:
            error.value = '伺服器內部錯誤，請稍後再試'
            break
          default:
            error.value = data?.message || `伺服器錯誤 (${status})`
        }
      } else if (err.request) {
        error.value = '無法連接到後端伺服器，請確認後端服務是否啟動'
        console.warn('💡 請檢查後端服務器是否在 https://localhost:7044 運行')
      } else {
        error.value = err.message || '登入處理過程中發生錯誤'
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (registerData: AuthAPI.RegisterRequest) => {
    try {
      loading.value = true
      error.value = null

      const response = await authApi.register(registerData)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '註冊失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await authApi.logout()
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // 清除所有狀態
      user.value = null
      token.value = ''
      refreshToken.value = ''
      error.value = null

      // 清除 localStorage (修正key名稱對應http.ts)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_info')
    }
  }

  const loadFromStorage = () => {
    const savedToken = localStorage.getItem('access_token')
    const savedRefreshToken = localStorage.getItem('refresh_token')
    const savedUser = localStorage.getItem('user_info')

    console.log('🔄 loadFromStorage 執行:', {
      savedToken: savedToken ? '存在' : '不存在',
      savedUser: savedUser ? '存在' : '不存在'
    })

    if (savedToken && savedUser) {
      token.value = savedToken
      refreshToken.value = savedRefreshToken || ''
      try {
        user.value = JSON.parse(savedUser)
        console.log('✅ 從 localStorage 載入用戶狀態:', {
          user: user.value?.name,
          email: user.value?.email,
          isLoggedIn: !!token.value && !!user.value
        })
      } catch (err) {
        console.error('Failed to parse user data:', err)
        logout()
      }
    } else {
      console.log('ℹ️ localStorage 中沒有找到用戶數據')
    }
  }

  const refreshTokens = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }

      const response = await authApi.refreshToken(refreshToken.value)
      const { token: newToken, refreshToken: newRefreshToken } = response.data

      token.value = newToken
      refreshToken.value = newRefreshToken

      localStorage.setItem('access_token', newToken)
      localStorage.setItem('refresh_token', newRefreshToken)

      return response.data
    } catch (err) {
      console.error('Token refresh failed:', err)
      logout()
      throw err
    }
  }

  const updateProfile = async (profileData: AuthAPI.UpdateProfileRequest) => {
    try {
      loading.value = true
      error.value = null

      const response = await authApi.updateProfile(profileData)
      user.value = response.data

      // 更新 localStorage 中的用戶資料
      localStorage.setItem('user_info', JSON.stringify(response.data))

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新個人資料失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData: AuthAPI.ChangePasswordRequest) => {
    try {
      loading.value = true
      error.value = null

      await authApi.changePassword(passwordData)
    } catch (err: any) {
      error.value = err.response?.data?.message || '變更密碼失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  const googleLogin = async (idToken: string, rememberMe: boolean = false) => {
    try {
      loading.value = true
      error.value = null

      console.log('🔐 開始 Google 登入流程')

      const response = await authApi.googleLogin({
        idToken,
        rememberMe
      })
      
      console.log('📥 Google API 響應:', JSON.stringify(response, null, 2))

      return await handleGoogleLoginResponse(response.data)
    } catch (err: any) {
      console.error('❌ Google 登入失敗:', err)
      
      if (err.response) {
        const { status, data } = err.response
        switch (status) {
          case 401:
            error.value = 'Google 認證失敗，請重新嘗試'
            break
          case 400:
            error.value = data?.message || 'Google 登入請求格式錯誤'
            break
          case 404:
            error.value = 'Google 帳號未註冊，請先使用 Email 註冊'
            break
          case 500:
            error.value = '伺服器內部錯誤，請稍後再試'
            break
          default:
            error.value = data?.message || `Google 登入失敗 (${status})`
        }
      } else if (err.request) {
        error.value = '無法連接到伺服器，請檢查網路連線'
      } else {
        error.value = err.message || 'Google 登入處理過程中發生錯誤'
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  const handleGoogleLoginResponse = async (responseData: any) => {
    try {
      console.log('🔍 處理 Google 登入響應:', responseData)

      let userData, authToken, newRefreshToken

      if (responseData.success) {
        const { data } = responseData
        if (data.token) {
          authToken = data.token
          userData = {
            id: data.memberId || data.userId,
            userId: data.userId,
            name: data.name,
            email: data.email,
            memberId: data.memberId,
            phone: data.phone || '',
            birthday: data.birthday || '',
            defaultAddressId: data.defaultAddressId,
            memberLevelId: data.memberLevelId,
            memberLevel: data.memberLevel,
            totalSpending: data.totalSpending || 0,
            points: data.points || 0,
            isActive: data.isActive !== false,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString()
          }
          newRefreshToken = data.refreshToken || ''
        }
      } else if (responseData.user && responseData.token) {
        userData = responseData.user
        authToken = responseData.token
        newRefreshToken = responseData.refreshToken
      } else if (responseData.data) {
        userData = responseData.data.user
        authToken = responseData.data.token
        newRefreshToken = responseData.data.refreshToken
      }

      if (!userData || !authToken) {
        throw new Error('Google 登入響應缺少必要的用戶數據或令牌')
      }

      // 儲存用戶資料和 tokens
      user.value = userData
      token.value = authToken
      refreshToken.value = newRefreshToken || ''

      // 儲存到 localStorage
      localStorage.setItem('access_token', authToken)
      localStorage.setItem('refresh_token', newRefreshToken || '')
      localStorage.setItem('user_info', JSON.stringify(userData))

      console.log('✅ Google 登入成功:', {
        user: userData.name || userData.userName || '用戶',
        email: userData.email,
        isLoggedIn: !!token.value && !!user.value
      })

      return {
        user: userData,
        token: authToken,
        refreshToken: newRefreshToken,
        expiresIn: responseData.expiresIn || 3600
      }
    } catch (err) {
      console.error('❌ 處理 Google 登入響應失敗:', err)
      throw err
    }
  }

  const getProfile = async () => {
    try {
      const response = await authApi.getProfile()
      user.value = response.data
      localStorage.setItem('user_info', JSON.stringify(response.data))
      return response.data
    } catch (err) {
      console.error('Failed to get profile:', err)
      throw err
    }
  }

  return {
    // State
    user,
    token,
    refreshToken,
    loading,
    error,

    // Getters
    isLoggedIn,
    userRole,
    memberId,

    // Actions
    login,
    register,
    googleLogin,
    logout,
    loadFromStorage,
    refreshTokens,
    updateProfile,
    changePassword,
    getProfile,
    handleGoogleLoginResponse
  }
})