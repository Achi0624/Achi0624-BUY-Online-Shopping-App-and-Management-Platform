<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { memberApi, type Address, type CreateUpdateAddress } from '@/api/modules/member'

interface Props {
  modelValue: boolean
  address?: Address | null
  isEdit?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  address: null,
  isEdit: false
})

const emit = defineEmits<Emits>()

const loading = ref(false)
const errors = ref<Record<string, string>>({})
const success = ref('')

const form = reactive<CreateUpdateAddress>({
  addressType: '住宅',
  addressName: '',
  recipientName: '',
  recipientPhone: '',
  companyName: '',
  city: '',
  district: '',
  street: '',
  postalCode: '',
  isDefault: false
})

// 地址類型選項
const addressTypes = [
  { value: '住宅', label: '住宅' },
  { value: '公司', label: '公司' },
  { value: '其他', label: '其他' }
]

// 台灣縣市選項
const cities = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '新竹縣', '新竹市', '苗栗縣', '彰化縣', '南投縣', '雲林縣',
  '嘉義縣', '嘉義市', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣',
  '澎湖縣', '金門縣', '連江縣'
]

// 計算標題
const modalTitle = computed(() => {
  return props.isEdit ? '編輯地址' : '新增地址'
})

// 監聽地址數據變化
watch(() => props.address, (newAddress) => {
  if (newAddress && props.isEdit) {
    form.addressType = newAddress.addressType
    form.addressName = newAddress.addressName || ''
    form.recipientName = newAddress.recipientName || ''
    form.recipientPhone = newAddress.recipientPhone || ''
    form.companyName = newAddress.companyName || ''
    form.city = newAddress.city
    form.district = newAddress.district
    form.street = newAddress.street
    form.postalCode = newAddress.postalCode
    form.isDefault = newAddress.isDefault
  }
}, { immediate: true })

// 監聽彈窗開關狀態
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && !props.isEdit) {
    // 新增模式時重置表單
    resetForm()
  }
})

// 重置表單
const resetForm = () => {
  form.addressType = '住宅'
  form.addressName = ''
  form.recipientName = ''
  form.recipientPhone = ''
  form.companyName = ''
  form.city = ''
  form.district = ''
  form.street = ''
  form.postalCode = ''
  form.isDefault = false
  errors.value = {}
  success.value = ''
}

// 驗證表單
const validateForm = (): boolean => {
  errors.value = {}
  
  if (!form.addressType) {
    errors.value.addressType = '請選擇地址類型'
  }
  
  if (!form.recipientName?.trim()) {
    errors.value.recipientName = '請輸入收件人姓名'
  } else if (form.recipientName.length > 50) {
    errors.value.recipientName = '收件人姓名不能超過 50 字元'
  }
  
  if (!form.recipientPhone?.trim()) {
    errors.value.recipientPhone = '請輸入收件人電話'
  } else if (!/^09\d{8}$/.test(form.recipientPhone.replace(/[-\s]/g, ''))) {
    errors.value.recipientPhone = '請輸入有效的手機號碼 (09xxxxxxxx)'
  }
  
  if (!form.city) {
    errors.value.city = '請選擇縣市'
  }
  
  if (!form.district?.trim()) {
    errors.value.district = '請輸入區域'
  } else if (form.district.length > 20) {
    errors.value.district = '區域名稱不能超過 20 字元'
  }
  
  if (!form.street?.trim()) {
    errors.value.street = '請輸入詳細地址'
  } else if (form.street.length > 100) {
    errors.value.street = '詳細地址不能超過 100 字元'
  }
  
  if (!form.postalCode?.trim()) {
    errors.value.postalCode = '請輸入郵遞區號'
  } else if (!/^\d{3,5}$/.test(form.postalCode)) {
    errors.value.postalCode = '請輸入有效的郵遞區號 (3-5位數字)'
  }
  
  if (form.addressName && form.addressName.length > 50) {
    errors.value.addressName = '地址名稱不能超過 50 字元'
  }
  
  if (form.companyName && form.companyName.length > 100) {
    errors.value.companyName = '公司名稱不能超過 100 字元'
  }
  
  return Object.keys(errors.value).length === 0
}

// 提交表單
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    
    let response
    if (props.isEdit && props.address) {
      response = await memberApi.updateAddress(props.address.id, form)
    } else {
      response = await memberApi.createAddress(form)
    }
    
    if (response.data && response.data.success) {
      success.value = props.isEdit ? '地址更新成功！' : '地址新增成功！'
      
      setTimeout(() => {
        closeModal()
        emit('success')
      }, 1500)
    }
  } catch (error: any) {
    if (error.response?.data?.message) {
      errors.value.general = error.response.data.message
    } else {
      errors.value.general = '操作失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}

// 關閉彈窗
const closeModal = () => {
  resetForm()
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
        <h3>{{ modalTitle }}</h3>
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

          <div class="form-row">
            <div class="form-group">
              <label for="addressType">地址類型 <span class="required">*</span></label>
              <select
                id="addressType"
                v-model="form.addressType"
                :class="{ 'error': errors.addressType }"
              >
                <option value="">請選擇地址類型</option>
                <option 
                  v-for="type in addressTypes" 
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </option>
              </select>
              <span v-if="errors.addressType" class="error-text">
                {{ errors.addressType }}
              </span>
            </div>

            <div class="form-group">
              <label for="addressName">地址名稱</label>
              <input
                id="addressName"
                v-model="form.addressName"
                type="text"
                :class="{ 'error': errors.addressName }"
                placeholder="如：家、公司 (選填)"
              >
              <span v-if="errors.addressName" class="error-text">
                {{ errors.addressName }}
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="recipientName">收件人姓名 <span class="required">*</span></label>
              <input
                id="recipientName"
                v-model="form.recipientName"
                type="text"
                :class="{ 'error': errors.recipientName }"
                placeholder="請輸入收件人姓名"
              >
              <span v-if="errors.recipientName" class="error-text">
                {{ errors.recipientName }}
              </span>
            </div>

            <div class="form-group">
              <label for="recipientPhone">收件人電話 <span class="required">*</span></label>
              <input
                id="recipientPhone"
                v-model="form.recipientPhone"
                type="tel"
                :class="{ 'error': errors.recipientPhone }"
                placeholder="09xxxxxxxx"
              >
              <span v-if="errors.recipientPhone" class="error-text">
                {{ errors.recipientPhone }}
              </span>
            </div>
          </div>

          <div v-if="form.addressType === '公司'" class="form-group">
            <label for="companyName">公司名稱</label>
            <input
              id="companyName"
              v-model="form.companyName"
              type="text"
              :class="{ 'error': errors.companyName }"
              placeholder="請輸入公司名稱"
            >
            <span v-if="errors.companyName" class="error-text">
              {{ errors.companyName }}
            </span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">縣市 <span class="required">*</span></label>
              <select
                id="city"
                v-model="form.city"
                :class="{ 'error': errors.city }"
              >
                <option value="">請選擇縣市</option>
                <option 
                  v-for="city in cities" 
                  :key="city"
                  :value="city"
                >
                  {{ city }}
                </option>
              </select>
              <span v-if="errors.city" class="error-text">
                {{ errors.city }}
              </span>
            </div>

            <div class="form-group">
              <label for="district">區域 <span class="required">*</span></label>
              <input
                id="district"
                v-model="form.district"
                type="text"
                :class="{ 'error': errors.district }"
                placeholder="如：信義區"
              >
              <span v-if="errors.district" class="error-text">
                {{ errors.district }}
              </span>
            </div>

            <div class="form-group">
              <label for="postalCode">郵遞區號 <span class="required">*</span></label>
              <input
                id="postalCode"
                v-model="form.postalCode"
                type="text"
                :class="{ 'error': errors.postalCode }"
                placeholder="如：110"
              >
              <span v-if="errors.postalCode" class="error-text">
                {{ errors.postalCode }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="street">詳細地址 <span class="required">*</span></label>
            <input
              id="street"
              v-model="form.street"
              type="text"
              :class="{ 'error': errors.street }"
              placeholder="請輸入詳細地址"
            >
            <span v-if="errors.street" class="error-text">
              {{ errors.street }}
            </span>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="form.isDefault"
                type="checkbox"
              >
              <span class="checkmark"></span>
              設為預設地址
            </label>
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
              {{ loading ? '儲存中...' : '確認儲存' }}
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
  max-width: 600px;
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
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

input, select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input.error, select.error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 0;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
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
@media (max-width: 640px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-header {
    padding: 20px 20px 0;
  }
  
  .modal-body {
    padding: 0 20px 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>