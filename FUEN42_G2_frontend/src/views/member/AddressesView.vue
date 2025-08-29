<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { memberApi, type Address } from '@/api/modules/member'

const addresses = ref<Address[]>([])
const loading = ref(false)
const showAddForm = ref(false)
const editingAddress = ref<Address | null>(null)

// 地址表單
const addressForm = reactive({
  addressType: '',
  addressName: '',
  recipientName: '',
  recipientPhone: '',
  city: '',
  district: '',
  street: '',
  postalCode: '',
  isDefault: false
})

const formErrors = ref<Record<string, string>>({})

// 台灣縣市資料
const cities = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '基隆市', '新竹市', '嘉義市', '新竹縣', '苗栗縣', '彰化縣',
  '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
  '台東縣', '澎湖縣', '金門縣', '連江縣'
]

onMounted(() => {
  fetchAddresses()
})

// 載入地址列表
const fetchAddresses = async () => {
  try {
    loading.value = true
    const response = await memberApi.getAddresses()
    // 檢查響應結構並正確取得資料
    let addressData = response.data?.data || response.data || []
    
    // 確保 ID 欄位統一為小寫 id
    addressData = addressData.map((addr: any) => ({
      ...addr,
      id: addr.id || addr.Id // 支援大寫和小寫的 ID
    }))
    
    addresses.value = addressData
    console.log('Fetched addresses:', addresses.value)
  } catch (error) {
    console.error('Failed to fetch addresses:', error)
  } finally {
    loading.value = false
  }
}

// 驗證表單
const validateForm = (): boolean => {
  formErrors.value = {}
  
  if (!addressForm.addressType) {
    formErrors.value.addressType = '請選擇地址類型'
  }
  
  if (!addressForm.recipientName) {
    formErrors.value.recipientName = '請輸入收件人姓名'
  }
  
  if (!addressForm.recipientPhone) {
    formErrors.value.recipientPhone = '請輸入收件人電話'
  } else if (!/^09\d{8}$/.test(addressForm.recipientPhone)) {
    formErrors.value.recipientPhone = '請輸入有效的手機號碼'
  }
  
  if (!addressForm.city) {
    formErrors.value.city = '請選擇縣市'
  }
  
  if (!addressForm.district) {
    formErrors.value.district = '請輸入區域'
  }
  
  if (!addressForm.street) {
    formErrors.value.street = '請輸入詳細地址'
  }
  
  if (!addressForm.postalCode) {
    formErrors.value.postalCode = '請輸入郵遞區號'
  } else if (!/^\d{3,5}$/.test(addressForm.postalCode)) {
    formErrors.value.postalCode = '請輸入有效的郵遞區號'
  }
  
  return Object.keys(formErrors.value).length === 0
}

// 重置表單
const resetForm = () => {
  Object.assign(addressForm, {
    addressType: '',
    addressName: '',
    recipientName: '',
    recipientPhone: '',
    city: '',
    district: '',
    street: '',
    postalCode: '',
    isDefault: false
  })
  formErrors.value = {}
  editingAddress.value = null
}

// 新增地址
const showAddAddress = () => {
  resetForm()
  showAddForm.value = true
}

// 編輯地址
const editAddress = (address: Address) => {
  console.log('Editing address:', address)
  console.log('Address ID:', address.id)
  editingAddress.value = address
  Object.assign(addressForm, {
    addressType: address.addressType,
    addressName: address.addressName || '',
    recipientName: address.recipientName || '',
    recipientPhone: address.recipientPhone || '',
    city: address.city,
    district: address.district,
    street: address.street,
    postalCode: address.postalCode,
    isDefault: address.isDefault
  })
  showAddForm.value = true
}

// 儲存地址
const saveAddress = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    
    if (editingAddress.value) {
      // 編輯模式
      console.log('Updating address with ID:', editingAddress.value.id)
      console.log('editingAddress.value:', editingAddress.value)
      console.log('addressForm:', addressForm)
      await memberApi.updateAddress(editingAddress.value.id, addressForm)
    } else {
      // 新增模式
      console.log('Adding new address:', addressForm)
      await memberApi.addAddress(addressForm)
    }
    
    await fetchAddresses()
    showAddForm.value = false
    resetForm()
  } catch (error) {
    console.error('Failed to save address:', error)
  } finally {
    loading.value = false
  }
}

// 刪除地址
const deleteAddress = async (id: number) => {
  if (!confirm('確定要刪除這個地址嗎？')) {
    return
  }

  try {
    loading.value = true
    await memberApi.deleteAddress(id)
    await fetchAddresses()
  } catch (error) {
    console.error('Failed to delete address:', error)
  } finally {
    loading.value = false
  }
}

// 設定預設地址
const setDefaultAddress = async (id: number) => {
  try {
    loading.value = true
    await memberApi.setDefaultAddress(id)
    await fetchAddresses()
  } catch (error) {
    console.error('Failed to set default address:', error)
  } finally {
    loading.value = false
  }
}

// 取消編輯
const cancelEdit = () => {
  showAddForm.value = false
  resetForm()
}
</script>

<template>
  <div class="addresses-view">
    <div class="addresses-header">
      <h2>地址管理</h2>
      <button class="btn btn-primary" @click="showAddAddress">
        <span class="icon">+</span>
        新增地址
      </button>
    </div>

    <!-- 地址列表 -->
    <div v-if="loading && !showAddForm" class="loading">
      <div class="loading-spinner"></div>
      載入中...
    </div>

    <div v-else-if="addresses.length === 0 && !showAddForm" class="empty-state">
      <div class="empty-icon">📍</div>
      <h3>還沒有儲存任何地址</h3>
      <p>新增您的第一個配送地址</p>
      <button class="btn btn-primary" @click="showAddAddress">
        新增地址
      </button>
    </div>

    <div v-else-if="!showAddForm" class="addresses-grid">
      <div
        v-for="address in addresses"
        :key="address.id"
        class="address-card"
        :class="{ 'default': address.isDefault }"
      >
        <div class="address-header">
          <div class="address-type">
            {{ address.addressType || '一般地址' }}
          </div>
          <div v-if="address.isDefault" class="default-badge">
            預設
          </div>
        </div>

        <div class="address-info">
          <div class="recipient">
            <strong>{{ address.recipientName }}</strong>
            <span class="phone">{{ address.recipientPhone }}</span>
          </div>
          <div class="location">
            {{ address.postalCode }} {{ address.city }}{{ address.district }}
          </div>
          <div class="street">
            {{ address.street }}
          </div>
        </div>

        <div class="address-actions">
          <button 
            v-if="!address.isDefault"
            class="btn btn-outline btn-sm"
            @click="setDefaultAddress(address.id)"
          >
            設為預設
          </button>
          <button 
            class="btn btn-outline btn-sm"
            @click="editAddress(address)"
          >
            編輯
          </button>
          <button 
            class="btn btn-danger btn-sm"
            @click="deleteAddress(address.id)"
          >
            刪除
          </button>
        </div>
      </div>
    </div>

    <!-- 新增/編輯地址表單 -->
    <div v-if="showAddForm" class="address-form">
      <h3>{{ editingAddress ? '編輯地址' : '新增地址' }}</h3>
      
      <form @submit.prevent="saveAddress">
        <div class="form-row">
          <div class="form-group">
            <label for="addressType">地址類型 *</label>
            <select 
              id="addressType" 
              v-model="addressForm.addressType"
              :class="{ 'error': formErrors.addressType }"
              required
            >
              <option value="">請選擇地址類型</option>
              <option value="home">住家</option>
              <option value="office">公司</option>
              <option value="other">其他</option>
            </select>
            <span v-if="formErrors.addressType" class="field-error">{{ formErrors.addressType }}</span>
          </div>
          <div class="form-group">
            <label for="addressName">地址名稱 (選填)</label>
            <input
              id="addressName"
              v-model="addressForm.addressName"
              type="text"
              placeholder="例：家裡、公司"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="recipientName">收件人姓名 *</label>
            <input
              id="recipientName"
              v-model="addressForm.recipientName"
              type="text"
              :class="{ 'error': formErrors.recipientName }"
              placeholder="請輸入收件人姓名"
              required
            >
            <span v-if="formErrors.recipientName" class="field-error">{{ formErrors.recipientName }}</span>
          </div>

          <div class="form-group">
            <label for="recipientPhone">收件人電話 *</label>
            <input
              id="recipientPhone"
              v-model="addressForm.recipientPhone"
              type="tel"
              :class="{ 'error': formErrors.recipientPhone }"
              placeholder="09xxxxxxxx"
              required
            >
            <span v-if="formErrors.recipientPhone" class="field-error">{{ formErrors.recipientPhone }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="city">縣市 *</label>
            <select 
              id="city" 
              v-model="addressForm.city"
              :class="{ 'error': formErrors.city }"
              required
            >
              <option value="">請選擇縣市</option>
              <option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
            <span v-if="formErrors.city" class="field-error">{{ formErrors.city }}</span>
          </div>

          <div class="form-group">
            <label for="district">區域 *</label>
            <input
              id="district"
              v-model="addressForm.district"
              type="text"
              :class="{ 'error': formErrors.district }"
              placeholder="例：信義區"
              required
            >
            <span v-if="formErrors.district" class="field-error">{{ formErrors.district }}</span>
          </div>

          <div class="form-group">
            <label for="postalCode">郵遞區號 *</label>
            <input
              id="postalCode"
              v-model="addressForm.postalCode"
              type="text"
              :class="{ 'error': formErrors.postalCode }"
              placeholder="例：110"
              required
            >
            <span v-if="formErrors.postalCode" class="field-error">{{ formErrors.postalCode }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label for="street">詳細地址 *</label>
            <input
              id="street"
              v-model="addressForm.street"
              type="text"
              :class="{ 'error': formErrors.street }"
              placeholder="請輸入詳細地址"
              required
            >
            <span v-if="formErrors.street" class="field-error">{{ formErrors.street }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="checkbox-container">
              <input v-model="addressForm.isDefault" type="checkbox">
              <span class="checkmark"></span>
              設為預設地址
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="cancelEdit">
            取消
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '儲存中...' : (editingAddress ? '更新地址' : '新增地址') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.addresses-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.addresses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 20px;
}

.addresses-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

.addresses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.address-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  position: relative;
}

.address-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.address-card.default {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.address-type {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.default-badge {
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.address-info {
  margin-bottom: 16px;
}

.recipient {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.recipient strong {
  color: #111827;
}

.phone {
  color: #6b7280;
  font-size: 14px;
}

.location, .street {
  color: #374151;
  line-height: 1.5;
  margin-bottom: 4px;
}

.address-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.address-form {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 30px;
  margin-top: 20px;
}

.address-form h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 0;
}

.form-row .form-group {
  flex: 1;
}

.form-group.full-width {
  flex: 1 1 100%;
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

input[type="text"],
input[type="tel"],
select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

input:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input.error,
select.error {
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
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 8px;
  width: auto;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
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

.btn-danger {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-danger:hover {
  background: #ef4444;
  color: white;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.icon {
  font-size: 16px;
  font-weight: bold;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .addresses-view {
    padding: 15px;
  }
  
  .addresses-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .addresses-grid {
    grid-template-columns: 1fr;
  }
  
  .address-form {
    padding: 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
  }
  
  .address-actions {
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .addresses-header h2 {
    font-size: 24px;
  }
  
  .address-form h3 {
    font-size: 18px;
  }
}
</style>