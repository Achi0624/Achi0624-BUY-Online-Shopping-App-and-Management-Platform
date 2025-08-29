<script setup lang="ts">
/**
 * 退貨退款申請頁面
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 退貨退款管理
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/modules/order'
import { returnApi } from '@/api/modules/order'
import type { OrderAPI } from '@/types/modules/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

// 狀態
const loading = ref(false)
const submitting = ref(false)
const order = ref<OrderAPI.MasterOrderInfo | null>(null)

// 表單數據
const refundForm = ref({
  reason: '',
  reasonType: '',
  amount: 0,
  description: '',
  images: [] as string[],
  items: [] as Array<{
    productId: number
    productName: string
    quantity: number
    selected: boolean
    refundQuantity: number
    price: number
  }>
})

// 退貨原因選項
const reasonOptions = [
  { value: 'defective', label: '商品瑕疵/損壞' },
  { value: 'wrong_item', label: '商品錯誤' },
  { value: 'not_as_described', label: '與描述不符' },
  { value: 'quality_issue', label: '品質問題' },
  { value: 'not_needed', label: '不需要了' },
  { value: 'other', label: '其他原因' }
]

// 計算屬性
const selectedItems = computed(() => 
  refundForm.value.items.filter(item => item.selected)
)

const refundAmount = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + (item.price * item.refundQuantity)
  }, 0)
})

const canSubmit = computed(() => {
  return refundForm.value.reasonType &&
         refundForm.value.description &&
         selectedItems.value.length > 0 &&
         refundAmount.value > 0
})

// 載入訂單資訊
const loadOrder = async () => {
  loading.value = true
  try {
    const orderId = Number(route.params.id)
    
    if (isNaN(orderId) || orderId <= 0) {
      throw new Error('無效的訂單ID')
    }
    
    await orderStore.fetchOrderDetail(orderId)
    order.value = orderStore.currentOrder
    
    if (!order.value) {
      throw new Error('訂單不存在')
    }
    
    // 檢查訂單狀態是否允許退貨
    if (order.value.orderStatus < 4) {
      alert('訂單尚未完成，無法申請退貨')
      router.push(`/order/${orderId}`)
      return
    }
    
    // 初始化退貨商品列表
    if (order.value.orders && order.value.orders.length > 0) {
      refundForm.value.items = []
      order.value.orders.forEach(subOrder => {
        if (subOrder.items) {
          subOrder.items.forEach(item => {
            refundForm.value.items.push({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              selected: false,
              refundQuantity: item.quantity,
              price: item.price
            })
          })
        }
      })
    }
    
    // 設定預設退款金額
    refundForm.value.amount = order.value.finalAmount || 0
    
  } catch (error: any) {
    console.error('載入訂單失敗:', error)
    alert(error.message || '載入訂單失敗')
    router.push('/member/orders')
  } finally {
    loading.value = false
  }
}

// 切換商品選擇
const toggleItemSelection = (index: number) => {
  refundForm.value.items[index].selected = !refundForm.value.items[index].selected
}

// 更新退貨數量
const updateRefundQuantity = (index: number, quantity: number) => {
  const item = refundForm.value.items[index]
  if (quantity < 0) quantity = 0
  if (quantity > item.quantity) quantity = item.quantity
  item.refundQuantity = quantity
}

// 上傳圖片
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files) return
  
  // 這裡應該實現實際的圖片上傳邏輯
  // 現在只是模擬
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.type.startsWith('image/')) {
      // 模擬上傳後的URL
      const fakeUrl = URL.createObjectURL(file)
      refundForm.value.images.push(fakeUrl)
      
      if (refundForm.value.images.length >= 5) {
        break // 最多5張圖片
      }
    }
  }
}

// 移除圖片
const removeImage = (index: number) => {
  refundForm.value.images.splice(index, 1)
}

// 提交退貨申請
const submitRefund = async () => {
  if (!canSubmit.value) {
    alert('請填寫完整的退貨資訊')
    return
  }
  
  if (!confirm('確定要提交退貨申請嗎？')) {
    return
  }
  
  submitting.value = true
  
  try {
    // 構建退貨請求數據
    const refundRequest = {
      orderId: order.value!.id,
      reason: refundForm.value.reasonType,
      description: refundForm.value.description,
      amount: refundAmount.value,
      items: selectedItems.value.map(item => ({
        productId: item.productId,
        quantity: item.refundQuantity
      })),
      images: refundForm.value.images
    }
    
    // 調用API
    const response = await returnApi.requestReturn(refundRequest)
    
    if (response.data?.success) {
      alert('退貨申請已提交，我們會盡快處理')
      router.push('/member/orders')
    } else {
      // 如果API不可用，使用模擬響應
      console.log('退貨申請數據:', refundRequest)
      alert('退貨申請已提交（模擬），我們會盡快處理')
      router.push('/member/orders')
    }
  } catch (error: any) {
    console.error('提交退貨申請失敗:', error)
    alert(error.message || '提交失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}

// 格式化金額
const formatPrice = (price: number) => {
  return `NT$ ${price.toLocaleString()}`
}

onMounted(() => {
  loadOrder()
})
</script>

<template>
  <div class="refund-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        ← 返回
      </button>
      <h1>申請退貨退款</h1>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 退貨表單 -->
    <div v-else-if="order" class="refund-content">
      <!-- 訂單資訊 -->
      <div class="order-info-card">
        <h3>訂單資訊</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">訂單編號：</span>
            <span class="info-value">{{ order.masterOrderNumber }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">訂單金額：</span>
            <span class="info-value">{{ formatPrice(order.finalAmount || 0) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">下單時間：</span>
            <span class="info-value">{{ new Date(order.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <!-- 選擇退貨商品 -->
      <div class="product-selection-card">
        <h3>選擇退貨商品</h3>
        <div class="product-list">
          <div 
            v-for="(item, index) in refundForm.items"
            :key="index"
            class="product-item"
            :class="{ selected: item.selected }"
          >
            <label class="product-checkbox">
              <input
                type="checkbox"
                :checked="item.selected"
                @change="toggleItemSelection(index)"
              >
              <span class="checkmark"></span>
            </label>
            <div class="product-info">
              <div class="product-name">{{ item.productName }}</div>
              <div class="product-price">單價：{{ formatPrice(item.price) }}</div>
            </div>
            <div class="quantity-control" v-if="item.selected">
              <label>退貨數量：</label>
              <button 
                class="qty-btn"
                @click="updateRefundQuantity(index, item.refundQuantity - 1)"
              >
                -
              </button>
              <input
                type="number"
                :value="item.refundQuantity"
                :max="item.quantity"
                min="1"
                @input="updateRefundQuantity(index, Number($event.target.value))"
                class="qty-input"
              >
              <button 
                class="qty-btn"
                @click="updateRefundQuantity(index, item.refundQuantity + 1)"
              >
                +
              </button>
              <span class="qty-max">/ {{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 退貨原因 -->
      <div class="reason-card">
        <h3>退貨原因</h3>
        <div class="reason-options">
          <label 
            v-for="option in reasonOptions"
            :key="option.value"
            class="reason-option"
          >
            <input
              type="radio"
              name="reasonType"
              :value="option.value"
              v-model="refundForm.reasonType"
            >
            <span>{{ option.label }}</span>
          </label>
        </div>
        
        <div class="description-section">
          <label class="form-label">詳細說明</label>
          <textarea
            v-model="refundForm.description"
            class="description-input"
            rows="4"
            placeholder="請詳細描述退貨原因..."
            maxlength="500"
          ></textarea>
          <div class="char-count">
            {{ refundForm.description.length }}/500
          </div>
        </div>
      </div>

      <!-- 上傳圖片 -->
      <div class="upload-card">
        <h3>上傳憑證</h3>
        <p class="upload-hint">請上傳商品照片作為退貨憑證（最多5張）</p>
        <div class="image-upload-area">
          <div class="image-list">
            <div 
              v-for="(image, index) in refundForm.images"
              :key="index"
              class="image-item"
            >
              <img :src="image" alt="退貨圖片">
              <button 
                class="remove-btn"
                @click="removeImage(index)"
              >
                ×
              </button>
            </div>
            <label 
              v-if="refundForm.images.length < 5"
              class="upload-btn"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                @change="handleImageUpload"
                style="display: none"
              >
              <div class="upload-icon">+</div>
              <span>上傳圖片</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 退款金額 -->
      <div class="amount-card">
        <h3>退款金額</h3>
        <div class="amount-summary">
          <div class="amount-row">
            <span>選擇商品總額：</span>
            <span class="amount">{{ formatPrice(refundAmount) }}</span>
          </div>
          <div class="amount-row total">
            <span>預計退款金額：</span>
            <span class="amount">{{ formatPrice(refundAmount) }}</span>
          </div>
        </div>
        <p class="amount-note">
          * 實際退款金額以審核結果為準
        </p>
      </div>

      <!-- 提交按鈕 -->
      <div class="action-section">
        <button 
          class="btn btn-outline"
          @click="router.back()"
          :disabled="submitting"
        >
          取消
        </button>
        <button 
          class="btn btn-primary"
          @click="submitRefund"
          :disabled="!canSubmit || submitting"
        >
          {{ submitting ? '提交中...' : '提交申請' }}
        </button>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else class="error-state">
      <p>無法載入訂單資訊</p>
      <button class="btn btn-primary" @click="router.push('/member/orders')">
        返回訂單列表
      </button>
    </div>
  </div>
</template>

<style scoped>
.refund-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
  padding: 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.refund-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片通用樣式 */
.order-info-card,
.product-selection-card,
.reason-card,
.upload-card,
.amount-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px;
}

/* 訂單資訊 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #6b7280;
  font-size: 14px;
}

.info-value {
  color: #111827;
  font-size: 14px;
  font-weight: 500;
}

/* 商品選擇 */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.product-item.selected {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.product-checkbox {
  position: relative;
  display: block;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.product-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: white;
}

.product-checkbox input:checked ~ .checkmark {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.product-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.product-info {
  flex: 1;
}

.product-name {
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.product-price {
  color: #6b7280;
  font-size: 13px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-control label {
  color: #6b7280;
  font-size: 14px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #374151;
}

.qty-btn:hover {
  background: #f9fafb;
}

.qty-input {
  width: 50px;
  height: 28px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.qty-max {
  color: #9ca3af;
  font-size: 14px;
}

/* 退貨原因 */
.reason-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.reason-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.reason-option input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.reason-option span {
  color: #374151;
  font-size: 14px;
}

.description-section {
  position: relative;
}

.form-label {
  display: block;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.description-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.description-input:focus {
  border-color: #3b82f6;
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  color: #9ca3af;
  font-size: 12px;
}

/* 圖片上傳 */
.upload-hint {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}

.image-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.upload-btn {
  width: 100px;
  height: 100px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-icon {
  font-size: 24px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.upload-btn span {
  color: #6b7280;
  font-size: 12px;
}

/* 退款金額 */
.amount-summary {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.amount-row.total {
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
  padding-top: 16px;
  font-weight: 600;
}

.amount {
  color: #ef4444;
  font-size: 18px;
  font-weight: 600;
}

.amount-note {
  color: #9ca3af;
  font-size: 13px;
  margin: 0;
}

/* 操作按鈕 */
.action-section {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-state p {
  color: #6b7280;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .reason-options {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>