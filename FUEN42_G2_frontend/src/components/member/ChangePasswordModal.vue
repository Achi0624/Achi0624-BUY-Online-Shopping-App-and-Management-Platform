<script setup lang="ts">
import { ref, reactive } from 'vue'
import { memberApi, type ChangePassword } from '@/api/modules/member'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const errors = ref<Record<string, string>>({})
const success = ref('')

const form = reactive<ChangePassword>({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

// 驗證表單
const validateForm = (): boolean => {
  errors.value = {}
  
  if (!form.currentPassword) {
    errors.value.currentPassword = '請輸入目前密碼'
  }
  
  if (!form.newPassword) {
    errors.value.newPassword = '請輸入新密碼'
  } else if (form.newPassword.length < 6) {
    errors.value.newPassword = '新密碼長度至少 6 字元'
  }
  
  if (!form.confirmNewPassword) {
    errors.value.confirmNewPassword = '請確認新密碼'
  } else if (form.newPassword !== form.confirmNewPassword) {
    errors.value.confirmNewPassword = '新密碼與確認密碼不一致'
  }
  
  return Object.keys(errors.value).length === 0
}

// 提交變更密碼
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    const response = await memberApi.changePassword(form)
    
    if (response.data && response.data.success) {
      success.value = '密碼變更成功！'
      
      // 重置表單
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmNewPassword = ''
      errors.value = {}
      
      setTimeout(() => {
        closeModal()
        emit('success')
      }, 1500)
    }
  } catch (error: any) {
    if (error.response?.data?.message) {
      errors.value.general = error.response.data.message
    } else {
      errors.value.general = '密碼變更失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}

// 關閉彈窗
const closeModal = () => {
  // 重置表單和錯誤
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmNewPassword = ''
  errors.value = {}
  success.value = ''
  
  emit('update:modelValue', false)
}

// 取消操作
const handleCancel = () => {
  closeModal()
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>變更密碼</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <!-- 成功訊息 -->
        <div v-if="success" class="success-message">
          <div class="success-icon">✓</div>
          <p>{{ success }}</p>
        </div>

        <!-- 表單 -->
        <form v-else @submit.prevent="handleSubmit">
          <!-- 一般錯誤訊息 -->
          <div v-if="errors.general" class="error-message">
            {{ errors.general }}
          </div>

          <div class="form-group">
            <label for="currentPassword">目前密碼 <span class="required">*</span></label>
            <input
              id="currentPassword"
              v-model="form.currentPassword"
              type="password"
              :class="{ 'error': errors.currentPassword }"
              placeholder="請輸入目前密碼"
              autocomplete="current-password"
            >
            <span v-if="errors.currentPassword" class="error-text">
              {{ errors.currentPassword }}
            </span>
          </div>

          <div class="form-group">
            <label for="newPassword">新密碼 <span class="required">*</span></label>
            <input
              id="newPassword"
              v-model="form.newPassword"
              type="password"
              :class="{ 'error': errors.newPassword }"
              placeholder="請輸入新密碼 (至少 6 字元)"
              autocomplete="new-password"
            >
            <span v-if="errors.newPassword" class="error-text">
              {{ errors.newPassword }}
            </span>
          </div>

          <div class="form-group">
            <label for="confirmNewPassword">確認新密碼 <span class="required">*</span></label>
            <input
              id="confirmNewPassword"
              v-model="form.confirmNewPassword"
              type="password"
              :class="{ 'error': errors.confirmNewPassword }"
              placeholder="請再次輸入新密碼"
              autocomplete="new-password"
            >
            <span v-if="errors.confirmNewPassword" class="error-text">
              {{ errors.confirmNewPassword }}
            </span>
          </div>

          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="handleCancel"
              :disabled="loading"
            >
              取消
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="loading"
            >
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? '變更中...' : '確認變更' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 0 24px 24px;
}

.success-message {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  width: 48px;
  height: 48px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin: 0 auto 16px;
}

.success-message p {
  color: #10b981;
  font-weight: 500;
  margin: 0;
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
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

input {
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

.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 14px;
  height: 14px;
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

/* 響應式設計 */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-header {
    padding: 20px 20px 0;
  }
  
  .modal-body {
    padding: 0 20px 20px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>