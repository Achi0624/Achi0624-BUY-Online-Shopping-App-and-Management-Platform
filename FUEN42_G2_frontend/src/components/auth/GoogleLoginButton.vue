<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/modules/auth'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  success: [userData: any]
  error: [error: string]
}>()

const userStore = useUserStore()
const loading = ref(false)
const errorMessage = ref('')

// Google Client ID - 需要從環境變數或配置中獲取
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'

let google: any = null

onMounted(async () => {
  try {
    // 動態載入 Google Identity Services
    await loadGoogleScript()
    await initializeGoogle()
  } catch (error) {
    console.error('Google 登入初始化失敗:', error)
    errorMessage.value = 'Google 登入初始化失敗'
  }
})

const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-identity-script')) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.id = 'google-identity-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'))
    document.head.appendChild(script)
  })
}

const initializeGoogle = async (): Promise<void> => {
  await nextTick()
  
  if (typeof window !== 'undefined' && (window as any).google) {
    google = (window as any).google
    
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: false,  // 禁用 FedCM，使用傳統彈窗
      itp_support: true  // 支援 ITP (Intelligent Tracking Prevention)
    })
  } else {
    throw new Error('Google Identity Services 未載入')
  }
}

const handleGoogleResponse = async (response: any) => {
  try {
    loading.value = true
    errorMessage.value = ''
    
    console.log('🔐 Google 登入響應:', response)

    if (!response.credential) {
      throw new Error('Google 認證失敗：未收到認證憑證')
    }

    // 呼叫後端 Google 登入 API
    const loginResponse = await authApi.googleLogin({
      idToken: response.credential,
      rememberMe: true
    })

    console.log('📥 後端 Google 登入響應:', loginResponse)

    // 使用 userStore 處理登入成功
    await userStore.handleGoogleLoginResponse(loginResponse.data)
    
    emit('success', loginResponse.data)
    
  } catch (error: any) {
    console.error('❌ Google 登入處理失敗:', error)
    const message = error.response?.data?.message || error.message || 'Google 登入失敗'
    errorMessage.value = message
    emit('error', message)
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = () => {
  if (!google) {
    errorMessage.value = 'Google 登入服務尚未準備就緒'
    return
  }

  if (loading.value || props.disabled) {
    return
  }

  try {
    errorMessage.value = ''
    
    // 直接使用 renderButton 方案，避免 FedCM 問題
    tryRenderButtonLogin()
    
  } catch (error) {
    console.error('啟動 Google 登入失敗:', error)
    errorMessage.value = '啟動 Google 登入失敗，請重新整理頁面後再試'
  }
}

// 使用 renderButton 方式進行登入
const tryRenderButtonLogin = () => {
  try {
    console.log('使用 renderButton 方式進行 Google 登入...')
    
    // 清除任何現有的 Google 按鈕容器
    const existingContainer = document.getElementById('google-signin-button-temp')
    if (existingContainer) {
      existingContainer.remove()
    }
    
    // 創建一個臨時的隱藏容器來渲染 Google 按鈕
    const buttonContainer = document.createElement('div')
    buttonContainer.id = 'google-signin-button-temp'
    buttonContainer.style.position = 'absolute'
    buttonContainer.style.top = '-9999px'
    buttonContainer.style.left = '-9999px'
    buttonContainer.style.visibility = 'hidden'
    document.body.appendChild(buttonContainer)
    
    // 使用 renderButton API，這不需要設定 redirect_uri
    if (google?.accounts?.id?.renderButton) {
      google.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: '300'
      })
      
      // 等待按鈕渲染完成後自動觸發點擊
      setTimeout(() => {
        const googleButton = buttonContainer.querySelector('div[role="button"]') as HTMLElement
        if (googleButton) {
          console.log('觸發 Google 登入按鈕...')
          googleButton.click()
          
          // 清理臨時容器
          setTimeout(() => {
            if (document.getElementById('google-signin-button-temp')) {
              document.getElementById('google-signin-button-temp')?.remove()
            }
          }, 2000)
        } else {
          console.error('找不到 Google 登入按鈕元素')
          errorMessage.value = 'Google 登入按鈕渲染失敗'
          buttonContainer.remove()
        }
      }, 1000)
    } else {
      console.error('Google renderButton API 不可用')
      errorMessage.value = 'Google 登入服務不可用，請重新整理頁面後再試'
      buttonContainer.remove()
    }
    
  } catch (error) {
    console.error('renderButton 登入方案失敗:', error)
    errorMessage.value = 'Google 登入暫時無法使用，請重新整理頁面後再試'
  }
}
</script>

<template>
  <div class="google-login">
    <button
      type="button"
      class="google-login-button"
      :class="{ 'loading': loading, 'disabled': disabled }"
      :disabled="loading || disabled"
      @click="handleGoogleLogin"
    >
      <div class="button-content">
        <div v-if="loading" class="loading-spinner"></div>
        <svg
          v-else
          class="google-icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span class="button-text">
          {{ loading ? '登入中...' : '使用 Google 帳號登入' }}
        </span>
      </div>
    </button>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.google-login {
  width: 100%;
}

.google-login-button {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.google-login-button:hover:not(:disabled) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  border-color: #dadce0;
}

.google-login-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
}

.google-login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.google-login-button.loading {
  pointer-events: none;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.google-icon {
  flex-shrink: 0;
}

.button-text {
  white-space: nowrap;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin-top: 8px;
  color: #d73027;
  font-size: 12px;
  text-align: center;
  padding: 8px;
  background-color: #ffeaea;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
}

/* 響應式設計 */
@media (max-width: 480px) {
  .google-login-button {
    padding: 14px 16px;
    font-size: 16px; /* 防止 iOS Safari 縮放 */
  }
  
  .button-content {
    gap: 8px;
  }
  
  .button-text {
    font-size: 14px;
  }
}
</style>