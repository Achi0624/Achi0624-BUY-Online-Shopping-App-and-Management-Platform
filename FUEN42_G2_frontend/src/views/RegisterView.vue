<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/modules/auth'
import type { AuthAPI } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()

// 註冊表單
const registerForm = reactive<AuthAPI.RegisterRequest>({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  birthday: '',
  agreesToTerms: false
})

// 表單驗證錯誤
const formErrors = ref<Record<string, string>>({})
const loading = ref(false)
const success = ref(false)

// 驗證表單
const validateForm = async (): Promise<boolean> => {
  formErrors.value = {}
  
  // Email 驗證
  if (!registerForm.email) {
    formErrors.value.email = '請輸入電子信箱'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    formErrors.value.email = '請輸入有效的電子信箱格式'
  } else {
    // 檢查 Email 是否已存在
    try {
      const response = await authApi.checkEmailExists(registerForm.email)
      if (response.data.data) {
        formErrors.value.email = '此電子信箱已被註冊'
      }
    } catch (error) {
      console.error('Check email error:', error)
    }
  }
  
  // 姓名驗證
  if (!registerForm.name) {
    formErrors.value.name = '請輸入姓名'
  } else if (registerForm.name.length < 2) {
    formErrors.value.name = '姓名至少需要 2 個字符'
  }
  
  // 手機驗證 - 選填，但填入時限制十碼
  if (registerForm.phone && (!/^09\d{8}$/.test(registerForm.phone) || registerForm.phone.length !== 10)) {
    formErrors.value.phone = '手機號碼必須為十碼，格式：09xxxxxxxx'
  } else if (registerForm.phone) {
    // 檢查手機號碼是否已存在
    try {
      const response = await authApi.checkPhoneExists(registerForm.phone)
      if (response.data.data) {
        formErrors.value.phone = '此手機號碼已被註冊'
      }
    } catch (error) {
      console.error('Check phone error:', error)
    }
  }
  
  // 密碼驗證
  if (!registerForm.password) {
    formErrors.value.password = '請輸入密碼'
  } else if (registerForm.password.length < 8) {
    formErrors.value.password = '密碼至少需要 8 個字符'
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerForm.password)) {
    formErrors.value.password = '密碼必須包含大寫字母、小寫字母和數字'
  }
  
  // 確認密碼驗證
  if (!registerForm.confirmPassword) {
    formErrors.value.confirmPassword = '請確認密碼'
  } else if (registerForm.password !== registerForm.confirmPassword) {
    formErrors.value.confirmPassword = '密碼確認不一致'
  }
  
  // 生日驗證 - 選填，但填入時必須滿18歲
  if (registerForm.birthday) {
    const birthDate = new Date(registerForm.birthday)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const dayDiff = today.getDate() - birthDate.getDate()
    
    // 精確計算年齡
    let actualAge = age
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge--
    }
    
    if (actualAge < 18) {
      formErrors.value.birthday = '必須年滿18歲才能註冊'
    }
  }
  
  // 同意條款驗證
  if (!registerForm.agreesToTerms) {
    formErrors.value.agreesToTerms = '請同意會員條款'
  }
  
  return Object.keys(formErrors.value).length === 0
}

// 註冊處理
const handleRegister = async () => {
  const isValid = await validateForm()
  if (!isValid) {
    return
  }

  try {
    loading.value = true
    const response = await userStore.register(registerForm)
    
    success.value = true
    
    if (response.requireEmailVerification) {
      // 需要 Email 驗證
      alert('註冊成功！請檢查您的電子信箱並點擊驗證連結。')
    } else {
      // 直接註冊成功
      alert('註冊成功！您現在可以登入了。')
      router.push('/login')
    }
  } catch (error) {
    console.error('Registration failed:', error)
  } finally {
    loading.value = false
  }
}

// 手機號碼輸入過濾和格式化
const formatPhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value
  
  // 只允許數字
  value = value.replace(/\D/g, '')
  
  // 限制最大長度為10碼
  if (value.length > 10) {
    value = value.substring(0, 10)
  }
  
  // 更新表單值
  registerForm.phone = value
  target.value = value
}

// 手機號碼輸入驗證（按鍵時）
const validatePhoneInput = (event: KeyboardEvent) => {
  const char = event.key
  const target = event.target as HTMLInputElement
  const currentValue = target.value
  
  // 允許的特殊鍵（退格、刪除、箭頭鍵等）
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter']
  
  // 如果是特殊鍵，允許通過
  if (allowedKeys.includes(char)) {
    return
  }
  
  // 如果不是數字，阻止輸入
  if (!/\d/.test(char)) {
    event.preventDefault()
    return
  }
  
  // 如果已經達到10碼上限，阻止輸入
  if (currentValue.length >= 10) {
    event.preventDefault()
    return
  }
}

// 導向登入頁面
const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-view">
    <div class="container">
      <div class="register-form">
        <div class="form-header">
          <h1>會員註冊</h1>
          <p>建立您的帳號，開始購物之旅</p>
        </div>

        <!-- 成功訊息 -->
        <div v-if="success" class="success-message">
          註冊成功！請檢查您的電子信箱進行驗證。
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="userStore.error" class="error-message">
          {{ userStore.error }}
        </div>

        <form @submit.prevent="handleRegister">
          <div class="form-row">
            <div class="form-group">
              <label for="email">電子信箱 *</label>
              <input
                id="email"
                v-model="registerForm.email"
                type="email"
                :class="{ 'error': formErrors.email }"
                placeholder="請輸入電子信箱"
                autocomplete="email"
                required
              >
              <span v-if="formErrors.email" class="field-error">{{ formErrors.email }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="name">姓名 *</label>
              <input
                id="name"
                v-model="registerForm.name"
                type="text"
                :class="{ 'error': formErrors.name }"
                placeholder="請輸入您的姓名"
                autocomplete="name"
                required
              >
              <span v-if="formErrors.name" class="field-error">{{ formErrors.name }}</span>
            </div>

            <div class="form-group">
              <label for="phone">手機號碼 *</label>
              <input
                id="phone"
                v-model="registerForm.phone"
                type="tel"
                :class="{ 'error': formErrors.phone }"
                placeholder="09xxxxxxxx"
                autocomplete="tel"
                maxlength="10"
                pattern="[0-9]{10}"
                @keydown="validatePhoneInput"
                @input="formatPhoneInput"
                required
              >
              <span v-if="formErrors.phone" class="field-error">{{ formErrors.phone }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">密碼 *</label>
              <input
                id="password"
                v-model="registerForm.password"
                type="password"
                :class="{ 'error': formErrors.password }"
                placeholder="至少 8 字符，包含大小寫字母和數字"
                autocomplete="new-password"
                required
              >
              <span v-if="formErrors.password" class="field-error">{{ formErrors.password }}</span>
            </div>

            <div class="form-group">
              <label for="confirmPassword">確認密碼 *</label>
              <input
                id="confirmPassword"
                v-model="registerForm.confirmPassword"
                type="password"
                :class="{ 'error': formErrors.confirmPassword }"
                placeholder="請再次輸入密碼"
                autocomplete="new-password"
                required
              >
              <span v-if="formErrors.confirmPassword" class="field-error">{{ formErrors.confirmPassword }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="birthday">生日 (選填)</label>
              <input
                id="birthday"
                v-model="registerForm.birthday"
                type="date"
                :class="{ 'error': formErrors.birthday }"
                autocomplete="bday"
              >
              <span v-if="formErrors.birthday" class="field-error">{{ formErrors.birthday }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-container">
              <input 
                v-model="registerForm.agreesToTerms" 
                type="checkbox"
                :class="{ 'error': formErrors.agreesToTerms }"
                required
              >
              <span class="checkmark"></span>
              我同意 <a href="/terms" target="_blank">會員條款</a> 和 <a href="/privacy" target="_blank">隱私政策</a>
            </label>
            <span v-if="formErrors.agreesToTerms" class="field-error">{{ formErrors.agreesToTerms }}</span>
          </div>

          <button 
            type="submit" 
            class="register-button"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '註冊中...' : '註冊' }}
          </button>
        </form>

        <div class="form-footer">
          <p>
            已經有帳號？
            <button type="button" class="link-button" @click="goToLogin">
              立即登入
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-view {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 600px;
}

.register-form {
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
  margin-bottom: 8px;
}

.form-header p {
  color: #666;
  font-size: 14px;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
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

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 0;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

input[type="email"],
input[type="text"],
input[type="tel"],
input[type="password"],
input[type="date"] {
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

.field-error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 8px;
  margin-top: 2px;
  width: auto;
  flex-shrink: 0;
}

.checkbox-container a {
  color: #667eea;
  text-decoration: underline;
}

.checkbox-container a:hover {
  color: #5a67d8;
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

.register-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.register-button:disabled {
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

/* 響應式設計 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}

@media (max-width: 480px) {
  .register-view {
    padding: 10px;
  }
  
  .register-form {
    padding: 30px 20px;
  }
  
  .form-header h1 {
    font-size: 24px;
  }
}
</style>