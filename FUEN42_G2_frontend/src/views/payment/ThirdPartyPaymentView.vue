<script setup lang="ts">
/**
 * 第三方支付模擬頁面 (LINE Pay / 街口支付 / 信用卡)
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 付款整合系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 狀態
const loading = ref(false)
const countdown = ref(300) // 5分鐘倒計時
const countdownInterval = ref<NodeJS.Timeout | null>(null)

// 從路由參數獲取支付方式和交易ID
const paymentMethod = computed(() => route.params.method as string)
const transactionId = computed(() => route.params.transactionId as string)

// 支付方式配置
const methodConfig = computed(() => {
  const configs: Record<string, any> = {
    'line_pay': {
      name: 'LINE Pay',
      color: '#00c300',
      logo: '💚',
      bgColor: '#f0fff0',
      description: '使用 LINE Pay 安全付款'
    },
    'jko_pay': {
      name: '街口支付',
      color: '#ff6b35',
      logo: '🟡',
      bgColor: '#fff8f0',
      description: '街口支付 App 快速付款'
    },
    'credit_card': {
      name: '信用卡',
      color: '#2196f3',
      logo: '💳',
      bgColor: '#f0f8ff',
      description: '安全的信用卡付款'
    }
  }
  return configs[paymentMethod.value] || configs['credit_card']
})

// 倒計時顯示
const countdownDisplay = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// 模擬訂單資訊
const orderInfo = ref({
  orderNumber: 'ORD202501150001',
  amount: 15680,
  merchantName: 'BUY 商城',
  items: [
    { name: 'iPhone 15', quantity: 1, price: 15680 }
  ]
})

// 開始倒計時
const startCountdown = () => {
  if (countdownInterval.value) return
  
  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval.value!)
      countdownInterval.value = null
      handleTimeout()
    }
  }, 1000)
}

// 停止倒計時
const stopCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
}

// 處理超時
const handleTimeout = () => {
  alert('付款時間已過期')
  handlePaymentResult('expired')
}

// 處理付款結果
const handlePaymentResult = (status: 'success' | 'failed' | 'cancelled' | 'expired') => {
  stopCountdown()
  
  // 構建回調 URL
  const callbackUrl = `/payment/callback?transactionId=${transactionId.value}&status=${status}&amount=${orderInfo.value.amount}&thirdPartyId=TPY${Date.now()}`
  
  // 跳轉到回調處理頁面
  window.location.href = callbackUrl
}

// 模擬付款成功
const simulateSuccess = async () => {
  loading.value = true
  
  // 模擬付款處理延遲
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  handlePaymentResult('success')
}

// 模擬付款失敗
const simulateFailed = () => {
  handlePaymentResult('failed')
}

// 取消付款
const cancelPayment = () => {
  if (confirm('確定要取消付款嗎？')) {
    handlePaymentResult('cancelled')
  }
}

// 格式化金額
const formatAmount = (amount: number) => {
  return `NT$ ${amount.toLocaleString()}`
}

// 頁面初始化
onMounted(() => {
  startCountdown()
})

// 頁面銷毀前清理
onBeforeUnmount(() => {
  stopCountdown()
})
</script>

<template>
  <div class="third-party-container">
    <div class="payment-wrapper">
      <!-- 支付品牌頭部 -->
      <div 
        class="payment-header"
        :style="{ 
          backgroundColor: methodConfig.bgColor,
          borderColor: methodConfig.color 
        }"
      >
        <div class="brand-logo" :style="{ color: methodConfig.color }">
          {{ methodConfig.logo }}
        </div>
        <h1 class="brand-name" :style="{ color: methodConfig.color }">
          {{ methodConfig.name }}
        </h1>
        <p class="brand-description">{{ methodConfig.description }}</p>
        
        <!-- 倒計時 -->
        <div class="countdown-timer">
          <span class="timer-icon">⏰</span>
          <span class="timer-text">剩餘時間：{{ countdownDisplay }}</span>
        </div>
      </div>

      <!-- 訂單資訊 -->
      <div class="order-section">
        <h2>訂單資訊</h2>
        <div class="order-details">
          <div class="merchant-info">
            <div class="merchant-name">{{ orderInfo.merchantName }}</div>
            <div class="order-number">訂單號：{{ orderInfo.orderNumber }}</div>
          </div>
          
          <div class="order-items">
            <div v-for="item in orderInfo.items" :key="item.name" class="order-item">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-quantity">x {{ item.quantity }}</span>
              <span class="item-price">{{ formatAmount(item.price) }}</span>
            </div>
          </div>
          
          <div class="total-amount">
            <span class="total-label">總金額</span>
            <span class="total-value">{{ formatAmount(orderInfo.amount) }}</span>
          </div>
        </div>
      </div>

      <!-- 付款方式特定內容 -->
      <div class="payment-method-section">
        <!-- LINE Pay -->
        <div v-if="paymentMethod === 'line_pay'" class="line-pay-content">
          <div class="qr-code-section">
            <h3>請使用 LINE App 掃描 QR Code</h3>
            <div class="qr-code">
              <img 
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=linepay:${transactionId}`" 
                alt="LINE Pay QR Code"
              >
            </div>
            <p class="qr-instruction">
              1. 開啟 LINE App<br>
              2. 點選右上角掃描圖示<br>
              3. 掃描上方 QR Code<br>
              4. 確認付款資訊並完成付款
            </p>
          </div>
        </div>

        <!-- 街口支付 -->
        <div v-else-if="paymentMethod === 'jko_pay'" class="jko-pay-content">
          <div class="qr-code-section">
            <h3>請使用街口支付 App 掃描付款</h3>
            <div class="qr-code">
              <img 
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=jkopay:${transactionId}`" 
                alt="街口支付 QR Code"
              >
            </div>
            <p class="qr-instruction">
              1. 開啟街口支付 App<br>
              2. 點選「掃碼付款」<br>
              3. 掃描上方 QR Code<br>
              4. 輸入密碼完成付款
            </p>
          </div>
        </div>

        <!-- 信用卡 -->
        <div v-else-if="paymentMethod === 'credit_card'" class="credit-card-content">
          <div class="card-form">
            <h3>請輸入信用卡資訊</h3>
            <form class="card-details-form">
              <div class="form-group">
                <label>卡號</label>
                <input type="text" placeholder="**** **** **** 1234" class="card-input" readonly>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>有效期限</label>
                  <input type="text" placeholder="MM/YY" class="card-input" readonly>
                </div>
                <div class="form-group">
                  <label>安全碼</label>
                  <input type="text" placeholder="CVV" class="card-input" readonly>
                </div>
              </div>
              <div class="form-group">
                <label>持卡人姓名</label>
                <input type="text" placeholder="CARD HOLDER" class="card-input" readonly>
              </div>
            </form>
            <p class="demo-notice">
              ℹ️ 這是模擬付款環境，無需輸入真實信用卡資訊
            </p>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="payment-actions">
        <button class="btn btn-cancel" @click="cancelPayment" :disabled="loading">
          取消付款
        </button>
        
        <!-- 模擬按鈕 (開發用) -->
        <div class="simulation-buttons">
          <button 
            class="btn btn-success" 
            @click="simulateSuccess" 
            :disabled="loading"
          >
            <span v-if="loading && paymentMethod === 'success'" class="loading-spinner"></span>
            模擬付款成功
          </button>
          <button 
            class="btn btn-danger" 
            @click="simulateFailed" 
            :disabled="loading"
          >
            模擬付款失敗
          </button>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="security-notice">
        <div class="security-icon">🔒</div>
        <p>您的付款資訊受到 SSL 加密保護</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.third-party-container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.payment-wrapper {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.payment-header {
  padding: 32px 24px;
  text-align: center;
  border-bottom: 2px solid;
}

.brand-logo {
  font-size: 48px;
  margin-bottom: 12px;
}

.brand-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
}

.brand-description {
  color: #666;
  margin: 0 0 20px;
}

.countdown-timer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
}

.timer-icon {
  color: #ff6b35;
}

.order-section {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.order-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #1a1a1a;
}

.merchant-info {
  margin-bottom: 16px;
}

.merchant-name {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.order-number {
  font-size: 14px;
  color: #666;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.item-name {
  flex: 1;
  color: #1a1a1a;
}

.item-quantity {
  color: #666;
  margin: 0 12px;
}

.item-price {
  color: #e53e3e;
  font-weight: 500;
}

.total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
}

.total-label {
  font-weight: 600;
  color: #1a1a1a;
}

.total-value {
  font-size: 20px;
  font-weight: 600;
  color: #e53e3e;
}

.payment-method-section {
  padding: 24px;
}

.qr-code-section {
  text-align: center;
}

.qr-code-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 24px;
  color: #1a1a1a;
}

.qr-code {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.qr-code img {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-instruction {
  text-align: left;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.card-form h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #1a1a1a;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.card-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-size: 14px;
  background: #f8f8f8;
  color: #999;
}

.demo-notice {
  background: #e8f4fd;
  border: 1px solid #b3d9f7;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 20px;
  font-size: 13px;
  color: #1565c0;
}

.payment-actions {
  padding: 24px;
  border-top: 1px solid #f0f0f0;
}

.simulation-buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
  width: 100%;
  margin-bottom: 8px;
}

.btn-cancel:hover:not(:disabled) {
  background: #e5e5e5;
}

.btn-success {
  background: #4caf50;
  color: white;
  flex: 1;
}

.btn-success:hover:not(:disabled) {
  background: #43a047;
}

.btn-danger {
  background: #f44336;
  color: white;
  flex: 1;
}

.btn-danger:hover:not(:disabled) {
  background: #e53935;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #f8f9fa;
  font-size: 12px;
  color: #666;
}

.security-icon {
  color: #4caf50;
}

@media (max-width: 768px) {
  .third-party-container {
    padding: 12px;
  }

  .payment-header {
    padding: 24px 20px;
  }

  .brand-logo {
    font-size: 40px;
  }

  .brand-name {
    font-size: 20px;
  }

  .simulation-buttons {
    flex-direction: column;
  }
}
</style>