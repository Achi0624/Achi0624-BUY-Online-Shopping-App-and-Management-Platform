<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { memberApi, type MemberProfile, type UpdateMemberProfile, type ChangePassword } from '@/api/modules/member'
import ChangePasswordModal from '@/components/member/ChangePasswordModal.vue'

const route = useRoute()
const userStore = useUserStore()


// 標籤頁狀態
const activeTab = ref('profile')

// 會員資料
const memberProfile = ref<MemberProfile | null>(null)

// 個人資料表單
const profileForm = reactive<UpdateMemberProfile>({
  name: '',
  phone: '',
  birthday: ''
})

// 變更密碼表單
const passwordForm = reactive<ChangePassword>({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const showPasswordForm = ref(false)
const showPasswordModal = ref(false)
const formErrors = ref<Record<string, string>>({})
const loading = ref(false)
const profileLoading = ref(false)
const passwordLoading = ref(false)
const success = ref('')

// 監聽路由參數變化
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'password') {
    activeTab.value = 'security'
    showPasswordForm.value = true
  }
}, { immediate: true })

// 載入會員資料
const loadMemberProfile = async () => {
  try {
    loading.value = true
    const response = await memberApi.getProfile()
    if (response.data && response.data.success) {
      memberProfile.value = response.data.data
      // 填入表單
      profileForm.name = memberProfile.value.name
      profileForm.phone = memberProfile.value.phone || ''
      profileForm.birthday = memberProfile.value.birthday || ''
    }
  } catch (error) {
    console.error('載入會員資料失敗:', error)
  } finally {
    loading.value = false
  }
}

// 載入用戶資料
onMounted(async () => {
  await loadMemberProfile()
})

// 驗證個人資料表單
const validateProfileForm = (): boolean => {
  formErrors.value = {}
  
  // 姓名驗證 (必填, 最大50字符)
  if (!profileForm.name) {
    formErrors.value.name = '請輸入姓名'
  } else if (profileForm.name.length < 2) {
    formErrors.value.name = '姓名至少需要 2 個字符'
  } else if (profileForm.name.length > 50) {
    formErrors.value.name = '姓名不能超過 50 個字符'
  }
  
  // 手機號碼驗證 (選填, 限制10碼)
  if (profileForm.phone) {
    if (!/^09\d{8}$/.test(profileForm.phone) || profileForm.phone.length !== 10) {
      formErrors.value.phone = '請輸入有效的手機號碼格式 (09xxxxxxxx)'
    }
  }
  
  // 生日驗證 (選填, 日期格式)
  if (profileForm.birthday) {
    const birthDate = new Date(profileForm.birthday)
    const today = new Date()
    
    // 檢查日期是否有效
    if (isNaN(birthDate.getTime())) {
      formErrors.value.birthday = '請輸入有效的日期格式'
      return false
    }
    
    // 檢查年齡限制
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    if (age < 13) {
      formErrors.value.birthday = '年齡必須滿 13 歲'
    } else if (age > 120) {
      formErrors.value.birthday = '請輸入有效的出生日期'
    }
  }
  
  return Object.keys(formErrors.value).length === 0
}

// 驗證密碼表單
const validatePasswordForm = (): boolean => {
  const errors: Record<string, string> = {}
  
  if (!passwordForm.currentPassword) {
    errors.currentPassword = '請輸入目前密碼'
  }
  
  if (!passwordForm.newPassword) {
    errors.newPassword = '請輸入新密碼'
  } else if (passwordForm.newPassword.length < 8) {
    errors.newPassword = '密碼至少需要 8 個字符'
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
    errors.newPassword = '密碼必須包含大寫字母、小寫字母和數字'
  }
  
  if (!passwordForm.confirmNewPassword) {
    errors.confirmNewPassword = '請確認新密碼'
  } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    errors.confirmNewPassword = '新密碼確認不一致'
  }
  
  formErrors.value = { ...formErrors.value, ...errors }
  return Object.keys(errors).length === 0
}

// 更新個人資料
const updateProfile = async () => {
  if (!validateProfileForm()) {
    return
  }

  try {
    profileLoading.value = true
    const response = await memberApi.updateProfile(profileForm)
    if (response.data && response.data.success) {
      success.value = '個人資料更新成功！'
      // 重新載入資料
      await loadMemberProfile()
    }
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (error) {
    console.error('Update profile failed:', error)
  } finally {
    profileLoading.value = false
  }
}

// 變更密碼
const changePassword = async () => {
  if (!validatePasswordForm()) {
    return
  }

  try {
    passwordLoading.value = true
    const response = await memberApi.changePassword(passwordForm)
    if (response.data && response.data.success) {
      // 清空密碼表單
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmNewPassword = ''
      showPasswordForm.value = false
      
      success.value = '密碼變更成功！'
      setTimeout(() => {
        success.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Change password failed:', error)
  } finally {
    passwordLoading.value = false
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
  profileForm.phone = value
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

// 取消變更密碼
const cancelPasswordChange = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmNewPassword = ''
  showPasswordForm.value = false
  
  // 清除密碼相關錯誤
  if (formErrors.value.currentPassword) delete formErrors.value.currentPassword
  if (formErrors.value.newPassword) delete formErrors.value.newPassword
  if (formErrors.value.confirmNewPassword) delete formErrors.value.confirmNewPassword
}
</script>

<template>
  <div class="profile-view">
    <div class="profile-header">
      <h2>個人資料</h2>
      <p>管理您的個人資訊和安全設定</p>
    </div>

    <!-- 標籤頁導航 -->
    <div class="tabs-nav">
      <button 
        class="tab-button"
        :class="{ active: activeTab === 'profile' }"
        @click="activeTab = 'profile'"
      >
        <span class="tab-icon">👤</span>
        基本資料
      </button>
      <button 
        class="tab-button"
        :class="{ active: activeTab === 'security' }"
        @click="activeTab = 'security'"
      >
        <span class="tab-icon">🔒</span>
        安全設定
      </button>
    </div>

    <!-- 成功訊息 -->
    <div v-if="success" class="success-message">
      {{ success }}
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="userStore.error" class="error-message">
      {{ userStore.error }}
    </div>

    <div class="profile-content">
      <!-- 個人資料標籤頁 -->
      <div v-show="activeTab === 'profile'" class="tab-content">
        <div class="profile-section">
          <h3>基本資料</h3>
          <form @submit.prevent="updateProfile">
            <div class="form-row">
              <div class="form-group">
                <label for="email">電子信箱</label>
                <input
                  id="email"
                  type="email"
                  :value="userStore.user?.email"
                  disabled
                  class="disabled-input"
                >
                <small class="help-text">電子信箱無法修改，若需變更請聯繫客服</small>
              </div>
            </div>


            <div class="form-row">
              <div class="form-group">
                <label for="name">姓名 *</label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  :class="{ 'error': formErrors.name }"
                  placeholder="請輸入您的姓名"
                  maxlength="50"
                  required
                >
                <small class="help-text">最多 50 個字符</small>
                <span v-if="formErrors.name" class="field-error">{{ formErrors.name }}</span>
              </div>

              <div class="form-group">
                <label for="phone">手機號碼</label>
                <input
                  id="phone"
                  v-model="profileForm.phone"
                  type="tel"
                  :class="{ 'error': formErrors.phone }"
                  placeholder="09xxxxxxxx (選填)"
                  maxlength="10"
                  pattern="[0-9]{10}"
                  @keydown="validatePhoneInput"
                  @input="formatPhoneInput"
                >
                <small class="help-text">選填，最多 10 個字符</small>
                <span v-if="formErrors.phone" class="field-error">{{ formErrors.phone }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="birthday">生日</label>
                <input
                  id="birthday"
                  v-model="profileForm.birthday"
                  type="date"
                  :class="{ 'error': formErrors.birthday }"
                >
                <small class="help-text">選填，用於生日優惠通知</small>
                <span v-if="formErrors.birthday" class="field-error">{{ formErrors.birthday }}</span>
              </div>

              <div class="form-group">
                <label>會員等級</label>
                <input
                  type="text"
                  :value="userStore.user?.memberLevel?.name || '一般會員'"
                  disabled
                  class="disabled-input"
                >
                <small class="help-text">會員等級由系統根據消費金額自動調整</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>累計消費金額</label>
                <input
                  type="text"
                  :value="`NT$ ${userStore.user?.totalSpending?.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`"
                  disabled
                  class="disabled-input"
                >
                <small class="help-text">消費金額將影響會員等級</small>
              </div>

              <div class="form-group">
                <label>點數餘額</label>
                <input
                  type="text"
                  :value="`${userStore.user?.points?.toLocaleString() || '0'} 點`"
                  disabled
                  class="disabled-input"
                >
                <small class="help-text">點數可於結帳時抵用，1點 = NT$1</small>
              </div>
            </div>

            <div class="button-group">
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="loading-spinner"></span>
                {{ loading ? '更新中...' : '更新資料' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 安全設定標籤頁 -->
      <div v-show="activeTab === 'security'" class="tab-content">
        <div class="profile-section">
          <h3>安全設定</h3>
          
          <div v-if="!showPasswordForm" class="password-info">
            <div class="security-overview">
              <div class="security-item">
                <div class="security-icon">🔐</div>
                <div class="security-content">
                  <h4>登入密碼</h4>
                  <p>為了保護您的帳號安全，建議定期更新密碼</p>
                </div>
                <button 
                  type="button" 
                  class="btn btn-outline"
                  @click="showPasswordModal = true"
                >
                  變更密碼
                </button>
              </div>
            </div>
          </div>

          <form v-else @submit.prevent="changePassword">
            <div class="form-row">
              <div class="form-group">
                <label for="currentPassword">目前密碼 *</label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  :class="{ 'error': formErrors.currentPassword }"
                  placeholder="請輸入目前的密碼"
                  required
                >
                <span v-if="formErrors.currentPassword" class="field-error">{{ formErrors.currentPassword }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="newPassword">新密碼 *</label>
                <input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  :class="{ 'error': formErrors.newPassword }"
                  placeholder="至少 8 字符，包含大小寫字母和數字"
                  required
                >
                <span v-if="formErrors.newPassword" class="field-error">{{ formErrors.newPassword }}</span>
              </div>

              <div class="form-group">
                <label for="confirmPassword">確認新密碼 *</label>
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  :class="{ 'error': formErrors.confirmPassword }"
                  placeholder="請再次輸入新密碼"
                  required
                >
                <span v-if="formErrors.confirmPassword" class="field-error">{{ formErrors.confirmPassword }}</span>
              </div>
            </div>

            <div class="button-group">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="cancelPasswordChange"
              >
                取消
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="loading-spinner"></span>
                {{ loading ? '變更中...' : '變更密碼' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 變更密碼彈窗 -->
    <ChangePasswordModal 
      v-model="showPasswordModal"
      @success="() => { success = '密碼變更成功！'; setTimeout(() => success = '', 3000) }"
    />
  </div>
</template>

<style scoped>
.profile-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  margin-bottom: 30px;
  text-align: center;
}

.profile-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.profile-header p {
  color: #666;
  font-size: 16px;
}

/* 標籤頁導航 */
.tabs-nav {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.tab-button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  color: #6b7280;
}

.tab-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tab-button:hover:not(.active) {
  background: #f3f4f6;
  color: #374151;
}

.tab-icon {
  font-size: 1.2em;
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #feb2b2;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.profile-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 10px;
}

.form-row {
  display: flex;
  gap: 20px;
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
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
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

.disabled-input {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.disabled-input:focus {
  border-color: #e5e7eb;
  box-shadow: none;
}

.help-text {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.field-error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.password-info {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.password-info p {
  color: #475569;
  margin-bottom: 16px;
  line-height: 1.5;
}

/* 安全設定樣式 */
.security-overview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.security-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  flex-shrink: 0;
}

.security-content {
  flex: 1;
}

.security-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.security-content p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


/* 響應式設計 */
@media (max-width: 768px) {
  .profile-view {
    padding: 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .tabs-nav {
    padding: 4px;
  }
  
  .tab-button {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .security-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

/* 載入動畫 */
.loading-spinner::before {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


/* 額外響應式設計 */
@media (max-width: 768px) {
  .profile-view {
    padding: 15px;
  }
  
  .profile-section {
    padding: 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .profile-header h2 {
    font-size: 24px;
  }
  
  .profile-section h3 {
    font-size: 18px;
  }
}
</style>