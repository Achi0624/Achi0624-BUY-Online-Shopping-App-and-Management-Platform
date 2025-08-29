<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import GoogleLoginButton from '@/components/auth/GoogleLoginButton.vue'
import type { AuthAPI } from '@/types/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 登入表單
const loginForm = reactive<AuthAPI.LoginRequest>({
  email: '',
  password: '',
  rememberMe: false
})

// 表單驗證錯誤
const formErrors = ref<Record<string, string>>({})

// 驗證表單
const validateForm = (): boolean => {
  formErrors.value = {}
  
  if (!loginForm.email) {
    formErrors.value.email = '請輸入電子信箱'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
    formErrors.value.email = '請輸入有效的電子信箱格式'
  }
  
  if (!loginForm.password) {
    formErrors.value.password = '請輸入密碼'
  } else if (loginForm.password.length < 6) {
    formErrors.value.password = '密碼至少需要 6 個字符'
  }
  
  return Object.keys(formErrors.value).length === 0
}

// 登入處理
const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  try {
    await userStore.login(loginForm)
    
    // 登入成功，導向目標頁面或首頁
    const redirectTo = (route.query.redirect as string) || '/'
    router.push(redirectTo)
  } catch (error) {
    // 錯誤訊息已在 store 中處理
    console.error('Login failed:', error)
  }
}

// 導向註冊頁面
const goToRegister = () => {
  router.push('/register')
}

// 導向忘記密碼頁面
const goToForgotPassword = () => {
  router.push('/forgot-password')
}

// 清除表單
const clearForm = () => {
  loginForm.email = ''
  loginForm.password = ''
  loginForm.rememberMe = false
  formErrors.value = {}
}

// 處理 Google 登入成功
const handleGoogleLoginSuccess = (userData: any) => {
  console.log('Google 登入成功:', userData)
  // 登入成功，導向目標頁面或首頁
  const redirectTo = (route.query.redirect as string) || '/'
  router.push(redirectTo)
}

// 處理 Google 登入錯誤
const handleGoogleLoginError = (error: string) => {
  console.error('Google 登入錯誤:', error)
  // 錯誤已經在 GoogleLoginButton 組件中顯示，這裡可以做額外處理
}
</script>

<template>
  <div class="login-view">
    <div class="container">
      <div class="login-form">
        <div class="form-header">
          <h1>會員登入</h1>
          <p>歡迎回來！請登入您的帳號</p>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="userStore.error" class="error-message">
          {{ userStore.error }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">電子信箱</label>
            <input
              id="email"
              v-model="loginForm.email"
              type="email"
              :class="{ 'error': formErrors.email }"
              placeholder="請輸入您的電子信箱"
              autocomplete="email"
              required
            >
            <span v-if="formErrors.email" class="field-error">{{ formErrors.email }}</span>
          </div>

          <div class="form-group">
            <label for="password">密碼</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              :class="{ 'error': formErrors.password }"
              placeholder="請輸入您的密碼"
              autocomplete="current-password"
              required
            >
            <span v-if="formErrors.password" class="field-error">{{ formErrors.password }}</span>
          </div>

          <div class="form-options">
            <label class="checkbox-container">
              <input v-model="loginForm.rememberMe" type="checkbox">
              <span class="checkmark"></span>
              記住我
            </label>
            <button type="button" class="link-button" @click="goToForgotPassword">
              忘記密碼？
            </button>
          </div>

          <button 
            type="submit" 
            class="login-button"
            :disabled="userStore.loading"
          >
            <span v-if="userStore.loading" class="loading-spinner"></span>
            {{ userStore.loading ? '登入中...' : '登入' }}
          </button>
        </form>

        <!-- 分隔線 -->
        <div class="divider">
          <span>或</span>
        </div>

        <!-- Google 登入按鈕 -->
        <GoogleLoginButton
          :disabled="userStore.loading"
          @success="handleGoogleLoginSuccess"
          @error="handleGoogleLoginError"
        />

  <!-- API 連接狀態 已移除 -->

        <div class="form-footer">
          <p>
            還沒有帳號？
            <button type="button" class="link-button" @click="goToRegister">
              立即註冊
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 黑白灰主題 ===== */
.login-view {
  --bg: #f5f5f5;             /* 背景淺灰 */
  --card-bg: #ffffff;         /* 卡片白 */
  --text-1: #111111;          /* 主文字黑 */
  --text-2: #555555;          /* 次要文字深灰 */
  --line: #e5e5e5;            /* 邊框/分隔線灰 */
  --input-bg: #ffffff;        /* 輸入框白 */
  --input-bd: #dddddd;        /* 輸入框邊框灰 */
  --input-focus: #111111;     /* 輸入聚焦邊框(黑) */
  --btn-bg: #000000;          /* 按鈕黑 */
  --btn-bg-hover: #333333;    /* 按鈕 hover 灰黑 */
  --btn-text: #ffffff;        /* 按鈕文字白 */
  --shadow: rgba(0, 0, 0, 0.18);
  --ring: rgba(0, 0, 0, 0.12);

  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 400px;
}

.login-form {
  background: var(--card-bg);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 12px 32px var(--shadow);
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 8px;
}

.form-header p {
  color: var(--text-2);
  font-size: 14px;
}

/* 錯誤訊息（維持紅色以保可用性） */
.error-message {
  background: #fef2f2;
  color: #b91c1c;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-1);
  font-size: 14px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--input-bd);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
  box-sizing: border-box;
  background: var(--input-bg);
  color: var(--text-1);
}

input[type="email"]::placeholder,
input[type="password"]::placeholder {
  color: #9ca3af; /* placeholder 灰 */
}

input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: var(--input-focus);
  box-shadow: 0 0 0 3px var(--ring);
}

input.error {
  border-color: #ef4444;
}

.field-error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-1);
}

.checkbox-container input[type="checkbox"] {
  margin-right: 8px;
  width: auto;
}

.link-button {
  background: none;
  border: none;
  color: var(--text-1);
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.link-button:hover {
  color: #000000;
}

/* 主要動作按鈕：黑底白字 */
.login-button {
  width: 100%;
  padding: 14px;
  background: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: var(--btn-bg-hover);
  box-shadow: 0 6px 24px var(--shadow);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid var(--btn-text);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 分隔線 */
.divider {
  margin: 24px 0;
  text-align: center;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--line);
}

.divider span {
  background: var(--card-bg);
  padding: 0 16px;
  color: #6b7280;
  font-size: 14px;
  position: relative;
}

/* footer */
.form-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.form-footer p {
  color: #6b7280;
  font-size: 14px;
}

/* API 連接狀態（轉為中性灰階） */
.api-status {
  background: #f7f7f7;
  border: 1px solid #d4d4d4;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  text-align: center;
}

.status-text {
  color: #444444;
  font-size: 13px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #6b7280;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.api-status small {
  color: #666666;
  font-size: 11px;
  display: block;
  margin-top: 8px;
  line-height: 1.4;
  opacity: 0.9;
}

/* 響應式 */
@media (max-width: 480px) {
  .login-view { padding: 10px; }
  .login-form { padding: 30px 20px; }
  .form-header h1 { font-size: 24px; }
}
</style>
