<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { memberApi } from '@/api/modules/member'

const router = useRouter()

const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const validateEmail = (): boolean => {
  if (!email.value) {
    error.value = '請輸入電子信箱'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = '請輸入有效的電子信箱格式'
    return false
  }
  return true
}

const handleSubmit = async () => {
  error.value = ''
  
  if (!validateEmail()) {
    return
  }

  try {
    loading.value = true
    await memberApi.forgotPassword({ email: email.value })
    success.value = true
  } catch (err: any) {
    error.value = err.response?.data?.message || '發送重設密碼連結失敗'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="forgot-password-view">
    <div class="container">
      <div class="form-card">
        <div class="form-header">
          <h1>忘記密碼</h1>
          <p>輸入您的電子信箱，我們將發送重設密碼的連結給您</p>
        </div>

        <div v-if="success" class="success-message">
          <div class="success-icon">✓</div>
          <h3>重設連結已發送</h3>
          <p>請檢查您的電子信箱 <strong>{{ email }}</strong>，並點擊連結重設密碼。</p>
          <button class="btn btn-primary" @click="goToLogin">
            返回登入
          </button>
        </div>

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
              :class="{ 'error': error }"
              placeholder="請輸入您的電子信箱"
              autocomplete="email"
              required
            >
          </div>

          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '發送中...' : '發送重設連結' }}
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
.forgot-password-view {
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

.success-message {
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

.success-message h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 12px;
}

.success-message p {
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

input[type="email"] {
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

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
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
  .forgot-password-view {
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
