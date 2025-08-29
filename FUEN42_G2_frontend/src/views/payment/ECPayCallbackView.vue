<script setup lang="ts">
/**
 * 綠界ECPay付款回調處理頁面
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 綠界金流回調處理
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyECPayCallback } from '@/utils/ecpay'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const processing = ref(true)
const result = ref<{
  success: boolean
  message: string
  orderNumber?: string
  tradeNo?: string
  amount?: number
  paymentDate?: string
  paymentType?: string
}>({
  success: false,
  message: '處理中...'
})

onMounted(async () => {
  try {
    console.log('🔄 處理綠界ECPay付款回調...')
    console.log('📋 回調參數:', route.query)
    
    // 取得所有URL參數
    const callbackParams = { ...route.query }
    
    // 驗證必要參數
    if (!callbackParams.RtnCode) {
      throw new Error('缺少必要的回調參數')
    }
    
    // 驗證MAC值 (如果有CheckMacValue)
    if (callbackParams.CheckMacValue) {
      const isValid = verifyECPayCallback(callbackParams)
      if (!isValid) {
        throw new Error('MAC驗證失敗，回調資料可能被篡改')
      }
      console.log('✅ MAC驗證通過')
    }
    
    // 解析付款結果
    const rtnCode = callbackParams.RtnCode as string
    const rtnMsg = callbackParams.RtnMsg as string || ''
    const tradeNo = callbackParams.MerchantTradeNo as string
    const tradeAmt = Number(callbackParams.TradeAmt) || 0
    const paymentDate = callbackParams.PaymentDate as string
    const paymentType = callbackParams.PaymentType as string
    
    // 從自訂欄位取得原始資料
    const originalOrderNumber = callbackParams.CustomField1 as string
    const customerEmail = callbackParams.CustomField2 as string
    const customerName = callbackParams.CustomField3 as string
    const paymentMethodId = callbackParams.CustomField4 as string
    
    console.log('📊 付款結果分析:')
    console.log('- 回傳代碼:', rtnCode)
    console.log('- 回傳訊息:', rtnMsg)
    console.log('- 商店交易編號:', tradeNo)
    console.log('- 交易金額:', tradeAmt)
    console.log('- 原始訂單編號:', originalOrderNumber)
    
    // 判斷付款是否成功
    const isSuccess = rtnCode === '1' || rtnCode === '10100073' // 1=付款成功, 10100073=Apple Pay成功
    
    if (isSuccess) {
      result.value = {
        success: true,
        message: '付款成功！',
        orderNumber: originalOrderNumber,
        tradeNo: tradeNo,
        amount: tradeAmt,
        paymentDate: paymentDate,
        paymentType: paymentType
      }
      
      console.log('🎉 付款成功!')
      
      // TODO: 這裡可以調用後端API更新訂單狀態
      // await updateOrderPaymentStatus(originalOrderNumber, {
      //   status: 'paid',
      //   transactionId: tradeNo,
      //   paidAmount: tradeAmt,
      //   paidAt: paymentDate,
      //   paymentMethod: paymentType
      // })
      
    } else {
      result.value = {
        success: false,
        message: `付款失敗: ${rtnMsg}`,
        orderNumber: originalOrderNumber,
        tradeNo: tradeNo
      }
      
      console.log('❌ 付款失敗:', rtnMsg)
    }
    
  } catch (error: any) {
    console.error('❌ 處理綠界回調失敗:', error)
    result.value = {
      success: false,
      message: `處理失敗: ${error.message}`
    }
  } finally {
    processing.value = false
    loading.value = false
    
    // 3秒後自動跳轉
    setTimeout(() => {
      if (result.value.success) {
        // 成功則跳轉到訂單詳情
        router.push(`/order/${result.value.orderNumber}`)
      } else {
        // 失敗則跳轉到訂單列表
        router.push('/member/orders')
      }
    }, 3000)
  }
})
</script>

<template>
  <div class="ecpay-callback-page">
    <div class="callback-container">
      <!-- 處理中狀態 -->
      <div v-if="processing" class="processing-card">
        <div class="processing-spinner">
          <div class="spinner"></div>
        </div>
        <h2>處理付款結果中...</h2>
        <p>請稍候，正在驗證您的付款資訊</p>
      </div>
      
      <!-- 處理完成狀態 -->
      <div v-else class="result-card" :class="{ success: result.success, failed: !result.success }">
        <!-- 成功圖示 -->
        <div v-if="result.success" class="result-icon success-icon">
          <div class="checkmark">
            <div class="checkmark-circle"></div>
            <div class="checkmark-stem"></div>
            <div class="checkmark-kick"></div>
          </div>
        </div>
        
        <!-- 失敗圖示 -->
        <div v-else class="result-icon failed-icon">
          <div class="cross">
            <div class="cross-circle"></div>
            <div class="cross-line1"></div>
            <div class="cross-line2"></div>
          </div>
        </div>
        
        <!-- 結果訊息 -->
        <h2 class="result-title">
          {{ result.success ? '付款成功！' : '付款失敗' }}
        </h2>
        
        <p class="result-message">{{ result.message }}</p>
        
        <!-- 付款詳情 -->
        <div v-if="result.success && result.orderNumber" class="payment-details">
          <div class="detail-row">
            <span class="detail-label">訂單編號：</span>
            <span class="detail-value">{{ result.orderNumber }}</span>
          </div>
          <div v-if="result.tradeNo" class="detail-row">
            <span class="detail-label">交易編號：</span>
            <span class="detail-value">{{ result.tradeNo }}</span>
          </div>
          <div v-if="result.amount" class="detail-row">
            <span class="detail-label">付款金額：</span>
            <span class="detail-value amount">NT$ {{ result.amount.toLocaleString() }}</span>
          </div>
          <div v-if="result.paymentDate" class="detail-row">
            <span class="detail-label">付款時間：</span>
            <span class="detail-value">{{ result.paymentDate }}</span>
          </div>
          <div v-if="result.paymentType" class="detail-row">
            <span class="detail-label">付款方式：</span>
            <span class="detail-value">{{ result.paymentType }}</span>
          </div>
        </div>
        
        <!-- 自動跳轉提示 -->
        <div class="auto-redirect">
          <p>頁面將在 3 秒後自動跳轉...</p>
          <div class="redirect-buttons">
            <button 
              v-if="result.success && result.orderNumber" 
              class="btn btn-primary"
              @click="router.push(`/order/${result.orderNumber}`)"
            >
              查看訂單詳情
            </button>
            <button 
              class="btn btn-outline"
              @click="router.push('/member/orders')"
            >
              返回訂單列表
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ecpay-callback-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.callback-container {
  max-width: 500px;
  width: 100%;
}

.processing-card,
.result-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.processing-spinner {
  margin-bottom: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-icon {
  margin-bottom: 20px;
}

/* 成功勾勾動畫 */
.checkmark {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  position: relative;
}

.checkmark-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #10b981;
  background: #ecfdf5;
  animation: scale-in 0.5s ease-in-out;
}

.checkmark-stem,
.checkmark-kick {
  position: absolute;
  background: #10b981;
  height: 4px;
  border-radius: 2px;
  animation: draw 0.5s ease-in-out 0.5s both;
}

.checkmark-stem {
  width: 20px;
  top: 36px;
  left: 28px;
  transform: rotate(45deg);
}

.checkmark-kick {
  width: 12px;
  top: 44px;
  left: 20px;
  transform: rotate(-45deg);
}

/* 失敗叉叉動畫 */
.cross {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  position: relative;
}

.cross-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #ef4444;
  background: #fef2f2;
  animation: scale-in 0.5s ease-in-out;
}

.cross-line1,
.cross-line2 {
  position: absolute;
  width: 30px;
  height: 4px;
  background: #ef4444;
  top: 38px;
  left: 25px;
  border-radius: 2px;
  animation: draw 0.5s ease-in-out 0.5s both;
}

.cross-line1 {
  transform: rotate(45deg);
}

.cross-line2 {
  transform: rotate(-45deg);
}

@keyframes scale-in {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

@keyframes draw {
  0% { width: 0; }
  100% { width: 30px; }
}

.result-title {
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: 600;
}

.result-card.success .result-title {
  color: #10b981;
}

.result-card.failed .result-title {
  color: #ef4444;
}

.result-message {
  color: #666;
  margin-bottom: 20px;
}

.payment-details {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  color: #333;
  font-weight: 600;
}

.detail-value.amount {
  color: #10b981;
}

.auto-redirect {
  margin-top: 30px;
}

.auto-redirect p {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.redirect-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-outline {
  background: white;
  color: #666;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
}

@media (max-width: 480px) {
  .processing-card,
  .result-card {
    padding: 20px;
  }
  
  .redirect-buttons {
    flex-direction: column;
  }
}
</style>