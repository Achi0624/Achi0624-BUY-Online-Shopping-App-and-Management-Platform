<script setup lang="ts">
/**
 * 金流回調處理頁面
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 付款整合系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/modules/payment'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

const processing = ref(true)
const error = ref<string | null>(null)

// 處理金流回調
const handleCallback = async () => {
  try {
    processing.value = true
    error.value = null

    // 從 URL 參數獲取回調數據
    const callbackData = {
      transactionId: route.query.transactionId as string,
      status: route.query.status as 'success' | 'failed' | 'cancelled',
      amount: route.query.amount ? Number(route.query.amount) : undefined,
      thirdPartyId: route.query.thirdPartyId as string,
      message: route.query.message as string
    }

    // 驗證必要參數
    if (!callbackData.transactionId || !callbackData.status) {
      throw new Error('缺少必要的回調參數')
    }

    // 處理回調
    await paymentStore.handlePaymentCallback(callbackData)

    // 模擬處理延遲
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 跳轉到結果頁面
    const paymentId = await findPaymentIdByTransaction(callbackData.transactionId)
    router.replace(`/payment/result?paymentId=${paymentId}&status=${callbackData.status}`)

  } catch (err: any) {
    console.error('處理金流回調失敗:', err)
    error.value = err.message || '處理回調失敗'
    
    // 3秒後跳轉到錯誤頁面
    setTimeout(() => {
      router.replace('/payment/result?status=failed')
    }, 3000)
  }
}

// 根據交易編號查找付款ID
const findPaymentIdByTransaction = async (transactionId: string): Promise<number> => {
  // 模擬查找邏輯
  const payment = paymentStore.payments.find(p => p.transactionId === transactionId)
  return payment?.id || Date.now()
}

onMounted(() => {
  handleCallback()
})
</script>

<template>
  <div class="callback-container">
    <div class="callback-content">
      <!-- 處理中 -->
      <div v-if="processing && !error" class="processing-state">
        <div class="loading-spinner"></div>
        <h2>處理付款結果中...</h2>
        <p>正在確認您的付款狀態，請稍候</p>
        <div class="progress-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h2>處理失敗</h2>
        <p>{{ error }}</p>
        <p class="redirect-text">將自動跳轉到結果頁面...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.callback-content {
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.processing-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e3f2fd;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.processing-state h2,
.error-state h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #1a1a1a;
}

.processing-state p,
.error-state p {
  color: #666;
  margin: 0 0 24px;
  line-height: 1.5;
}

.progress-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2196f3;
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h2 {
  color: #e53e3e;
}

.redirect-text {
  font-size: 14px;
  color: #999 !important;
  font-style: italic;
}

@media (max-width: 768px) {
  .callback-content {
    padding: 32px 24px;
  }

  .processing-state h2,
  .error-state h2 {
    font-size: 20px;
  }
}
</style>