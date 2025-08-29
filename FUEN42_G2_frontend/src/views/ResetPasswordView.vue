<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { memberApi } from '@/api/modules/member'

const router = useRouter()
const route = useRoute()

const email = ref('')
const token = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const loading = ref(false)
const verifying = ref(true)
const success = ref(false)
const error = ref('')
const tokenValid = ref(false)

// 驗證重設密碼表單
const validateForm = (): boolean => {
  if (!newPassword.value) {
    error.value = '請輸入新密碼'
    return false
  }
  if (newPassword.value.length < 6) {
    error.value = '新密碼長度至少 6 字元'
    return false
  }
  if (!confirmNewPassword.value) {
    error.value = '請確認新密碼'
    return false
  }
  if (newPassword.value !== confirmNewPassword.value) {
    error.value = '新密碼與確認密碼不一致'
    return false
  }
  return true
}

// 驗證 token 是否有效
const verifyToken = async () => {
  try {
    verifying.value = true
    await memberApi.verifyResetToken({
      email: email.value,
      token: token.value
    })
    tokenValid.value = true
  } catch (err: any) {
    error.value = err.response?.data?.message || '重設密碼連結已過期或無效'
    tokenValid.value = false
  } finally {
    verifying.value = false
  }
}

// 處理重設密碼
const handleSubmit = async () => {
  error.value = ''
  
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    await memberApi.resetPassword({
      email: email.value,
      token: token.value,
      newPassword: newPassword.value,
      confirmNewPassword: confirmNewPassword.value
    })
    success.value = true
  } catch (err: any) {
    error.value = err.response?.data?.message || '重設密碼失敗'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

// 初始化
onMounted(() => {
  email.value = route.query.email as string || ''
  token.value = route.query.token as string || ''
  
  if (!email.value || !token.value) {
    error.value = '無效的重設密碼連結'
    tokenValid.value = false
    verifying.value = false
  } else {
    verifyToken()
  }
})
</script>

<template>
  <div class="reset-password-view">
    <div class="container">
      <div class="form-card">
        <div class="form-header">
          <h1>重設密碼</h1>
          <p>為您的帳號設定新密碼</p>
        </div>

        <!-- 驗證中狀態 -->
        <div v-if="verifying" class="loading-state">
          <div class="loading-spinner large"></div>
          <p>驗證重設密碼連結中...</p>
        </div>

        <!-- 成功狀態 -->
        <div v-else-if="success" class="success-message">
          <div class="success-icon">✓</div>
          <h3>密碼重設成功</h3>
          <p>您的密碼已成功重設，現在可以使用新密碼登入。</p>
          <button class="btn btn-primary" @click="goToLogin">
            前往登入
          </button>
        </div>

        <!-- Token 無效狀態 -->
        <div v-else-if="!tokenValid" class="error-state">
          <div class="error-icon">✕</div>
          <h3>連結已過期或無效</h3>
          <p>{{ error || '請重新申請重設密碼連結' }}</p>
          <button class="btn btn-secondary" @click="router.push('/forgot-password')">
            重新申請
          </button>
        </div>

        <!-- 重設密碼表單 -->
        <form v-else @submit.prevent="handleSubmit">
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="form-group">
            <label for="email">電子信箱</label>
            <input
              id="email"
              v-model="email"
              type="email"
              readonly
              disabled
            >
          </div>

          <div class="form-group">
            <label for="newPassword">新密碼</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              :class="{ 'error': error && error.includes('密碼') }"
              placeholder="請輸入新密碼 (至少 6 字元)"
              autocomplete="new-password"
              required
            >
          </div>

          <div class="form-group">
            <label for="confirmNewPassword">確認新密碼</label>
            <input
              id="confirmNewPassword"
              v-model="confirmNewPassword"
              type="password"
              :class="{ 'error': error && error.includes('確認') }"
              placeholder="請再次輸入新密碼"
              autocomplete="new-password"
              required
            >
          </div>

          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '重設中...' : '重設密碼' }}
          </button>

          <div class="form-footer">
            <p>
              記起密碼了？
              <button type="button" class="link-button" @click="goToLogin">
                返回登入
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-password-view {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 450px;
}

.form-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.form-header p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.loading-state {
  text-align: center;
  padding: 40px 0;
}

.loading-state p {
  color: #666;
  margin-top: 16px;
}

.success-message,
.error-state {
  text-align: center;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 20px;
}

.error-icon {
  width: 60px;
  height: 60px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 20px;
}

.success-message h3,
.error-state h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 12px;
}

.success-message p,
.error-state p {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #feb2b2;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

input.error {
  border-color: #ef4444;
}

.btn {
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #5a6269;
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(107, 114, 128, 0.3);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.loading-spinner.large {
  width: 32px;
  height: 32px;
  border-width: 3px;
  border-top-color: #667eea;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.form-footer p {
  color: #6b7280;
  font-size: 14px;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.link-button:hover {
  color: #5a67d8;
}

/* 響應式設計 */
@media (max-width: 480px) {
  .reset-password-view {
    padding: 10px;
  }
  
  .form-card {
    padding: 30px 20px;
  }
  
  .form-header h1 {
    font-size: 24px;
  }
}
</style>