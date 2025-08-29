<script setup lang="ts">
/**
 * 付款確認頁面 - 簡潔的訂單確認與付款
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 付款確認系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/modules/order'
import { paymentApi, type CreatePaymentRequest } from '@/api/modules/payment'
import { 
  generateECPayForm, 
  generateMerchantTradeNo, 
  formatTradeDate, 
  getECPayChoosePayment,
  type ECPayParameters 
} from '@/utils/ecpay'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

// 狀態
const loading = ref(false)
const paymentLoading = ref(false)
const order = ref<any>(null)

// 計算屬性
const orderId = computed(() => Number(route.params.orderId))

// 格式化金額
const formatAmount = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'NT$ 0'
  }
  return `NT$ ${amount.toLocaleString()}`
}

// 載入訂單資料
const loadOrder = async () => {
  try {
    loading.value = true
    
    // 使用真實 API 載入訂單
    await orderStore.fetchOrderDetail(orderId.value)
    order.value = orderStore.currentOrder
    
    if (!order.value) {
      throw new Error('訂單不存在')
    }
    
  } catch (error) {
    console.error('載入訂單失敗:', error)
    alert('載入訂單資料失敗')
    router.push('/member/orders')
  } finally {
    loading.value = false
  }
}

// 確認付款並跳轉綠界
const confirmPayment = async () => {
  if (!order.value) return
  
  try {
    paymentLoading.value = true
    
    const paymentData: CreatePaymentRequest = {
      orderNumber: order.value.masterOrderNumber,
      vendorId: order.value.orders[0]?.vendorId || 1,
      paymentMethodId: 1, // 預設信用卡，實際可從訂單取得
      amount: order.value.finalAmount,
      customerEmail: order.value.recipientEmail || 'customer@example.com',
      customerPhone: order.value.recipientPhone,
      customerName: order.value.recipientName
    }
    
    console.log('發送付款請求:', paymentData)
    
    try {
      // 嘗試使用後端API
      const response = await paymentApi.createPayment(paymentData)
      console.log('付款回應:', response.data)
      
      if (response.data?.paymentUrl) {
        // 跳轉到第三方付款頁面
        // 跳轉到付款結果頁面而不是第三方付款頁面（暫時）
        router.push(`/payment/result/${order.value.masterOrderNumber}?status=success&amount=${order.value.finalAmount}`)
        return
      } else {
        throw new Error('建立付款失敗：未收到付款URL')
      }
    } catch (apiError: any) {
      console.warn('⚠️ 後端API失敗，使用直接ECPay整合:', apiError.message)
      
      // 直接使用ECPay工具函數作為後備方案
      console.log('🔄 使用直接ECPay付款...')
      
      const merchantTradeNo = generateMerchantTradeNo(paymentData.orderNumber)
      
      const ecpayParams: ECPayParameters = {
        MerchantTradeNo: merchantTradeNo,
        MerchantTradeDate: formatTradeDate(),
        PaymentType: 'aio',
        TotalAmount: paymentData.amount,
        TradeDesc: `BUY商城訂單 - ${paymentData.orderNumber}`,
        ItemName: `訂單商品 - ${paymentData.orderNumber}`,
        ReturnURL: `${window.location.origin}/payment/ecpay/callback`,
        ClientBackURL: `${window.location.origin}/payment/result/${paymentData.orderNumber}`,
        ChoosePayment: getECPayChoosePayment(1), // 信用卡
        NeedExtraPaidInfo: 'Y',
        EncryptType: 1,
        CustomField1: paymentData.orderNumber,
        CustomField2: paymentData.customerEmail,
        CustomField3: paymentData.customerName,
        CustomField4: paymentData.paymentMethodId.toString()
      }
      
      console.log('📋 ECPay參數:', ecpayParams)
      
      // 生成並顯示ECPay表單
      const ecpayFormHTML = generateECPayForm(ecpayParams)
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(ecpayFormHTML)
        newWindow.document.close()
      } else {
        // 如果無法開新視窗，則直接替換當前頁面
        document.open()
        document.write(ecpayFormHTML)
        document.close()
      }
      return
    }
    
  } catch (error: any) {
    console.error('付款處理失敗:', error)
    alert('付款處理失敗，請稍後再試')
  } finally {
    paymentLoading.value = false
  }
}

// 返回訂單詳情
const backToOrder = () => {
  router.push(`/payment/${orderId.value}`)
}

// 頁面初始化
onMounted(() => {
  loadOrder()
})
</script>

<template>
  <div class="payment-confirm-container">
    <!-- 載入中 -->
    <div v-if="loading && !order" class="loading-state">
      <div class="loading-spinner"></div>
      <p>載入訂單資訊中...</p>
    </div>

    <!-- 確認付款內容 -->
    <div v-else-if="order" class="payment-confirm-content">
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1>確認付款</h1>
        <p class="subtitle">請確認以下訂單資訊，確認無誤後進行付款</p>
      </div>

      <!-- 主要內容區域：兩欄式佈局 -->
      <div class="main-content-grid">
        <!-- 左側：訂單詳情 -->
        <div class="left-section">
          <!-- 訂單摘要 -->
          <div class="order-summary-card">
            <div class="summary-header">
              <h2>訂單摘要</h2>
              <div class="order-number">{{ order.masterOrderNumber }}</div>
            </div>
            
            <!-- 商品列表 -->
            <div class="products-section">
              <h3>購買商品</h3>
              <div class="products-list">
                <div v-for="subOrder in order.orders" :key="subOrder.id" class="vendor-group">
                  <div class="vendor-name">{{ subOrder.vendorName }}</div>
                  <div class="items-list">
                    <div v-for="item in subOrder.items" :key="item.productName" class="product-item">
                      <img :src="item.imageUrl" :alt="item.productName" class="product-image">
                      <div class="product-info">
                        <div class="product-name">{{ item.productName }}</div>
                        <div class="product-price">{{ formatAmount(item.UnitPrice || item.unitPrice || item.price) }} x {{ item.quantity }}</div>
                      </div>
                      <div class="product-subtotal">{{ formatAmount((item.UnitPrice || item.unitPrice || item.price) * item.quantity) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 收貨資訊 -->
          <div class="shipping-card">
            <h3>收貨資訊</h3>
            <div class="shipping-info">
              <div class="info-row">
                <span class="label">收件人：</span>
                <span class="value">{{ order.recipientName }}</span>
              </div>
              <div class="info-row">
                <span class="label">聯絡電話：</span>
                <span class="value">{{ order.recipientPhone }}</span>
              </div>
              <div class="info-row">
                <span class="label">收貨地址：</span>
                <span class="value">{{ order.shippingAddress }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側：付款資訊與操作 -->
        <div class="right-section">
          <!-- 費用明細 -->
          <div class="cost-card">
            <h3>費用明細</h3>
            <div class="cost-breakdown">
              <div class="cost-row">
                <span>商品總額</span>
                <span>{{ formatAmount(order.totalAmount) }}</span>
              </div>
              <div class="cost-row">
                <span>運費</span>
                <span>{{ formatAmount(order.shippingFee) }}</span>
              </div>
              <div class="cost-row" v-if="order.discountAmount > 0">
                <span>優惠折扣</span>
                <span class="discount">-{{ formatAmount(order.discountAmount) }}</span>
              </div>
              <div class="cost-row total">
                <span>應付總額</span>
                <span>{{ formatAmount(order.finalAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- 付款方式 -->
          <div class="payment-method-card">
            <h3>付款方式</h3>
            <div class="method-display">
              <span class="method-icon">💳</span>
              <span class="method-name">信用卡付款</span>
              <span class="method-desc">將跳轉至綠界金流進行付款</span>
            </div>
          </div>

          <!-- 安全提醒 -->
          <div class="security-notice">
            <div class="notice-content">
              <span class="notice-icon">🔒</span>
              <div class="notice-text">
                <p>您的付款將透過綠界金流進行安全加密傳輸</p>
                <p>請確認訂單資訊無誤後再進行付款</p>
              </div>
            </div>
          </div>

          <!-- 操作按鈕 -->
          <div class="actions">
            <button class="btn btn-secondary" @click="backToOrder" :disabled="paymentLoading">
              返回訂單
            </button>
            <button 
              class="btn btn-primary btn-large" 
              @click="confirmPayment" 
              :disabled="paymentLoading"
            >
              <span v-if="paymentLoading" class="loading-spinner small"></span>
              <span v-if="!paymentLoading">確認付款 {{ formatAmount(order.finalAmount) }}</span>
              <span v-else>處理中...</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else class="error-state">
      <div class="error-icon">❌</div>
      <h2>載入失敗</h2>
      <p>無法載入訂單資訊，請重新嘗試</p>
      <button class="btn btn-primary" @click="router.push('/member/orders')">
        返回訂單列表
      </button>
    </div>
  </div>
</template>

<style scoped>
.payment-confirm-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: #f8f9fa;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e3f2fd;
  border-top: 3px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0 8px 0 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* Grid Layout */
.main-content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 20px;
}

/* Card Styles */
.order-summary-card,
.shipping-card,
.cost-card,
.payment-method-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.shipping-card h3,
.cost-card h3,
.payment-method-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.summary-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.order-number {
  font-size: 14px;
  color: #666;
  font-family: monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 6px;
}

.products-section {
  margin-bottom: 0;
}

.products-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px;
}

.vendor-group {
  margin-bottom: 16px;
}

.vendor-name {
  font-size: 14px;
  font-weight: 500;
  color: #2196f3;
  margin-bottom: 8px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
  font-size: 14px;
}

.product-price {
  font-size: 13px;
  color: #666;
}

.product-subtotal {
  font-weight: 600;
  color: #e53e3e;
  font-size: 14px;
}

.shipping-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  gap: 8px;
}

.info-row .label {
  color: #666;
  font-size: 14px;
  min-width: 80px;
}

.info-row .value {
  color: #1a1a1a;
  font-weight: 500;
  font-size: 14px;
  flex: 1;
}

.cost-breakdown {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.cost-row.total {
  font-size: 18px;
  font-weight: 600;
  color: #e53e3e;
  border-top: 1px solid #e0e0e0;
  margin-top: 8px;
  padding-top: 16px;
}

.discount {
  color: #2e7d32;
}

.method-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9ff;
  border: 2px solid #2196f3;
  border-radius: 12px;
}

.method-icon {
  font-size: 24px;
}

.method-name {
  font-weight: 600;
  color: #1a1a1a;
}

.method-desc {
  font-size: 13px;
  color: #666;
  margin-left: auto;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
}

.btn {
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1976d2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-large {
  padding: 18px 36px;
  font-size: 18px;
  min-width: 200px;
}

.security-notice {
  background: #e8f5e8;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 16px;
}

.notice-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notice-icon {
  font-size: 20px;
  margin-top: 2px;
}

.notice-text {
  flex: 1;
}

.notice-text p {
  margin: 0 0 8px;
  font-size: 14px;
  color: #2e7d32;
  line-height: 1.4;
}

.notice-text p:last-child {
  margin-bottom: 0;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h2 {
  color: #e53e3e;
  margin: 0 0 12px;
}

.error-state p {
  color: #666;
  margin: 0 0 24px;
}

@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .right-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .payment-confirm-container {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .method-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .method-desc {
    margin-left: 0;
  }

  .product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .product-subtotal {
    align-self: flex-end;
  }
}
</style>