<script setup lang="ts">
/**
 * 付款結果頁面
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
import { usePaymentStore, PaymentStatus } from '@/stores/modules/payment'
import { paymentApi } from '@/api/modules/payment'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

// 狀態
const loading = ref(true)
const payment = ref<any>(null)
const statusPollingInterval = ref<NodeJS.Timeout | null>(null)

// 從 URL 參數獲取狀態和相關資訊
const urlStatus = computed(() => route.query.status as string)
const paymentId = computed(() => Number(route.query.paymentId))
const orderNumber = computed(() => route.params.orderNumber as string || route.query.orderNumber as string || route.query.MerchantTradeNo as string)
const transactionId = computed(() => route.query.transactionId as string || route.query.TradeNo as string)

// 結果狀態配置
const resultConfig = computed(() => {
  if (!payment.value) {
    return {
      status: 'loading',
      icon: '⏳',
      title: '處理中...',
      message: '正在確認付款結果',
      color: '#2196f3',
      bgColor: '#e3f2fd'
    }
  }

  switch (payment.value.status) {
    case PaymentStatus.Success:
      return {
        status: 'success',
        icon: '✅',
        title: '付款成功',
        message: '您的付款已成功完成，感謝您的購買！',
        color: '#4caf50',
        bgColor: '#e8f5e8'
      }
    
    case PaymentStatus.Failed:
      return {
        status: 'failed',
        icon: '❌',
        title: payment.value.statusName === '無付款資訊' ? '請查看訂單列表' : '付款失敗',
        message: payment.value.failedReason || '付款處理失敗，請稍後重試',
        color: '#f44336',
        bgColor: '#ffebee'
      }
    
    case PaymentStatus.Cancelled:
      return {
        status: 'cancelled',
        icon: '⚠️',
        title: '付款取消',
        message: '您已取消付款，如需重新付款請回到訂單頁面',
        color: '#ff9800',
        bgColor: '#fff3e0'
      }
    
    case PaymentStatus.Expired:
      return {
        status: 'expired',
        icon: '⏰',
        title: '付款超時',
        message: '付款時間已過期，請重新下單',
        color: '#607d8b',
        bgColor: '#f5f5f5'
      }
    
    case PaymentStatus.Processing:
    case PaymentStatus.Pending:
    default:
      return {
        status: 'processing',
        icon: '⏳',
        title: '付款處理中',
        message: '正在處理您的付款，請稍候...',
        color: '#2196f3',
        bgColor: '#e3f2fd'
      }
  }
})

// 格式化金額
const formatAmount = (amount: number) => {
  return `NT$ ${amount.toLocaleString()}`
}

// 格式化時間
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 開始狀態輪詢
const startStatusPolling = () => {
  if (statusPollingInterval.value) return
  
  // 只有處理中或待付款狀態才需要輪詢
  if (!payment.value || 
      (payment.value.status !== PaymentStatus.Pending && 
       payment.value.status !== PaymentStatus.Processing)) {
    return
  }

  statusPollingInterval.value = setInterval(async () => {
    try {
      console.log('輪詢查詢付款狀態:', orderNumber.value)
      const response = await paymentApi.getPaymentStatusByOrderNumber(orderNumber.value)
      
      if (response.data && response.data.data) {
        const statusData = response.data.data
        
        console.log('🔍 檢查 statusData.status 的值和類型:', {
          status: statusData.status,
          statusType: typeof statusData.status,
          isString1: statusData.status === '1',
          isNumber1: statusData.status === 1,
          rawStatusData: statusData
        })
        
        // 更新付款狀態 (修正：後端 0=待付款, 1=未付款, 2=已付款)
        const newStatus = (statusData.status === '2' || statusData.status === 2) 
                         ? PaymentStatus.Success   // 2=已付款
                         : (statusData.status === '0' || statusData.status === 0)
                         ? PaymentStatus.Pending   // 0=待付款
                         : (statusData.status === '1' || statusData.status === 1)
                         ? PaymentStatus.Pending   // 1=未付款，顯示為待付款
                         : PaymentStatus.Processing // 其他狀態
        
        if (payment.value) {
          const oldStatus = payment.value.status
          payment.value.status = newStatus
          payment.value.statusName = statusData.statusText || (newStatus === PaymentStatus.Success ? '已付款' : '處理中')
          payment.value.paidAt = statusData.paidAt
          
          console.log('狀態更新詳情:', { 
            oldStatus, 
            newStatus, 
            statusData,
            PaymentStatusSuccess: PaymentStatus.Success,
            PaymentStatusProcessing: PaymentStatus.Processing,
            shouldStopPolling: newStatus !== PaymentStatus.Pending && newStatus !== PaymentStatus.Processing
          })
        }
        
        // 如果狀態已確定，停止輪詢
        if (newStatus === PaymentStatus.Success || newStatus === PaymentStatus.Failed || newStatus === PaymentStatus.Cancelled) {
          console.log('✅ 付款狀態確定，停止輪詢:', newStatus)
          stopStatusPolling()
        } else {
          console.log('⏳ 付款狀態未確定，繼續輪詢:', newStatus)
        }
      }
    } catch (error) {
      console.error('查詢付款狀態失敗:', error)
    }
  }, 3000) // 每3秒查詢一次
}

// 停止狀態輪詢
const stopStatusPolling = () => {
  if (statusPollingInterval.value) {
    clearInterval(statusPollingInterval.value)
    statusPollingInterval.value = null
  }
}

// 專題展示 - 快速付款成功
const triggerDemoSuccess = async () => {
  try {
    console.log('🎭 專題展示模式 - 觸發付款成功:', orderNumber.value)
    
    // 調用模擬付款成功API - 這會真正更新資料庫
    const response = await fetch(`/api/C_Payments/test/simulate-payment-success/${orderNumber.value}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('✅ 模擬付款成功完成，重新查詢真實資料')
      
      // 等待一下確保資料庫更新完成
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 重新查詢真實的付款狀態資料
      try {
        const statusResponse = await paymentApi.getPaymentStatusByOrderNumber(orderNumber.value)
        
        if (statusResponse.data && statusResponse.data.data) {
          const statusData = statusResponse.data.data
          console.log('📊 查詢到真實付款資料:', statusData)
          
          // 使用真實資料更新顯示
          payment.value = {
            orderNumber: orderNumber.value,
            status: PaymentStatus.Success,
            statusName: '已付款',
            amount: statusData.amount || 0,
            paidAt: statusData.paidAt || new Date().toISOString(),
            paymentMethod: statusData.paymentMethod || 'Credit_CreditCard',
            transactionId: statusData.transactionId || statusData.tradeNo
          }
        } else {
          console.warn('⚠️ 無法查詢到付款資料，使用基本成功狀態')
          payment.value = {
            orderNumber: orderNumber.value,
            status: PaymentStatus.Success,
            statusName: '已付款',
            amount: 0,
            paidAt: new Date().toISOString(),
            paymentMethod: 'Credit_CreditCard',
            transactionId: `PAID${Date.now()}`
          }
        }
      } catch (queryError) {
        console.error('❌ 查詢付款資料失敗:', queryError)
        // 即使查詢失敗，資料庫已經更新，顯示基本成功狀態
        payment.value = {
          orderNumber: orderNumber.value,
          status: PaymentStatus.Success,
          statusName: '已付款',
          amount: 0,
          paidAt: new Date().toISOString(),
          paymentMethod: 'Credit_CreditCard',
          transactionId: `PAID${Date.now()}`
        }
      }
      
      loading.value = false
      return true
    }
  } catch (error) {
    console.error('❌ 專題展示模式失敗:', error)
  }
  return false
}

// 載入付款結果
const loadPaymentResult = async () => {
  try {
    loading.value = true

    console.log('載入付款結果，URL參數:', route.query)
    
    // 🎭 專題展示模式：檢查demo參數
    if (route.query.demo === '1' || route.query.demo === 'true') {
      console.log('🎭 進入專題展示模式 - 自動觸發付款成功')
      const success = await triggerDemoSuccess()
      if (success) return
    }

    // 優先使用訂單號碼查詢付款狀態
    if (orderNumber.value) {
      try {
        console.log('使用訂單號碼查詢付款狀態:', orderNumber.value)
        const response = await paymentApi.getPaymentStatusByOrderNumber(orderNumber.value)
        
        if (response.data) {
          const statusData = response.data.data || response.data
          
          console.log('🔍 初始載入 - 檢查 statusData.status:', {
            status: statusData.status,
            statusType: typeof statusData.status,
            isString1: statusData.status === '1',
            isNumber1: statusData.status === 1,
            rawStatusData: statusData,
            fullResponse: response.data
          })
          
          // 修正：後端 0=待付款, 1=未付款, 2=已付款
          const initialStatus = (statusData.status === '2' || statusData.status === 2) ? PaymentStatus.Success : 
                               (statusData.status === '0' || statusData.status === 0) ? PaymentStatus.Pending :
                               (statusData.status === '1' || statusData.status === 1) ? PaymentStatus.Pending :
                               statusData.status === 'failed' ? PaymentStatus.Failed :
                               statusData.status === 'cancelled' ? PaymentStatus.Cancelled :
                               PaymentStatus.Processing
          
          console.log('🎯 初始狀態判斷結果:', {
            statusData_status: statusData.status,
            判斷結果: initialStatus,
            PaymentStatus_Success: PaymentStatus.Success,
            PaymentStatus_Processing: PaymentStatus.Processing
          })
          
          payment.value = {
            id: Date.now(),
            orderId: Number(route.query.orderId) || 1,
            orderNumber: orderNumber.value,
            amount: statusData.amount || Number(route.query.amount) || 0,
            paymentMethod: 1,
            paymentMethodName: '信用卡',
            status: initialStatus,
            statusName: statusData.statusText || '處理中',
            transactionId: transactionId.value || statusData.transactionId || `TXN${Date.now()}`,
            createdAt: new Date().toISOString(),
            paidAt: statusData.paidAt || ((statusData.status === '1' || statusData.status === 1) ? new Date().toISOString() : undefined)
          }
          
          console.log('API查詢成功，付款資料:', payment.value)
        } else {
          throw new Error('API 回應格式錯誤')
        }
      } catch (apiError: any) {
        console.warn('API查詢失敗，使用URL參數創建付款記錄:', apiError.message)
        
        // API失敗時使用URL參數創建記錄
        payment.value = {
          id: Date.now(),
          orderId: Number(route.query.orderId) || 1,
          orderNumber: orderNumber.value,
          amount: Number(route.query.TotalAmount || route.query.amount) || 0,
          paymentMethod: 1,
          paymentMethodName: route.query.PaymentMethod || '信用卡',
          status: urlStatus.value === 'success' || route.query.RtnCode === '1' ? PaymentStatus.Success : 
                  urlStatus.value === 'failed' ? PaymentStatus.Failed :
                  urlStatus.value === 'cancelled' ? PaymentStatus.Cancelled :
                  PaymentStatus.Processing,
          statusName: route.query.RtnMsg as string || '處理完成',
          transactionId: transactionId.value || route.query.TradeNo as string || `TXN${Date.now()}`,
          createdAt: new Date().toISOString(),
          paidAt: (urlStatus.value === 'success' || route.query.RtnCode === '1') ? new Date().toISOString() : undefined,
          failedReason: route.query.RtnCode !== '1' ? route.query.RtnMsg as string : undefined
        }
        
        console.log('使用URL參數創建的付款記錄:', payment.value)
      }
    } else if (paymentId.value) {
      // 使用付款 ID 查詢
      console.log('使用付款ID查詢:', paymentId.value)
      payment.value = await paymentStore.queryPaymentStatus(paymentId.value)
    } else {
      // 沒有足夠的參數，創建一個通用的付款結果頁面
      console.warn('缺少查詢參數，顯示一般付款指引頁面')
      payment.value = {
        id: Date.now(),
        orderId: 0,
        orderNumber: '請查看訂單列表',
        amount: 0,
        paymentMethod: 1,
        paymentMethodName: '請查看訂單詳情',
        status: PaymentStatus.Failed,
        statusName: '無付款資訊',
        transactionId: '請查看訂單列表',
        createdAt: new Date().toISOString(),
        failedReason: '此頁面需要從付款流程進入才能顯示正確資訊'
      }
    }

    if (!payment.value) {
      throw new Error('無法載入付款資訊')
    }

    // 開始狀態輪詢（只有處理中狀態才需要）
    if (payment.value.status === PaymentStatus.Processing || payment.value.status === PaymentStatus.Pending) {
      startStatusPolling()
    }

  } catch (error: any) {
    console.error('載入付款結果失敗:', error)
    payment.value = {
      id: 0,
      orderId: 0,
      orderNumber: orderNumber.value || 'ERROR',
      amount: 0,
      paymentMethod: 1,
      paymentMethodName: '未知',
      status: PaymentStatus.Failed,
      statusName: '載入失敗',
      transactionId: transactionId.value || 'ERROR',
      createdAt: new Date().toISOString(),
      failedReason: error.message || '無法載入付款資訊'
    }
  } finally {
    loading.value = false
  }
}

// 重新付款
const retryPayment = () => {
  if (payment.value?.orderId && payment.value.orderId > 0) {
    router.push(`/payment/${payment.value.orderId}`)
  } else {
    router.push('/member/orders')
  }
}

// 查看訂單
const viewOrder = () => {
  // 直接導向會員訂單列表頁面
  router.push('/member/orders')
}

// 回到首頁
const goHome = () => {
  router.push('/')
}

// 複製交易編號
const copyTransactionId = () => {
  if (payment.value?.transactionId) {
    navigator.clipboard.writeText(payment.value.transactionId)
    alert('交易編號已複製到剪貼板')
  }
}

// 頁面初始化
onMounted(() => {
  loadPaymentResult()
})

// 頁面銷毀前清理
onBeforeUnmount(() => {
  stopStatusPolling()
})
</script>

<template>
  <div class="payment-result-container">
    <!-- 載入中 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>載入付款結果中...</p>
    </div>

    <!-- 結果內容 -->
    <div v-else class="result-content">
      <!-- 結果狀態 -->
      <div 
        class="result-status"
        :style="{ 
          backgroundColor: resultConfig.bgColor,
          borderColor: resultConfig.color 
        }"
      >
        <div class="status-icon" :style="{ color: resultConfig.color }">
          {{ resultConfig.icon }}
        </div>
        <h1 class="status-title" :style="{ color: resultConfig.color }">
          {{ resultConfig.title }}
        </h1>
        <p class="status-message">{{ resultConfig.message }}</p>
        
        <!-- 處理中狀態顯示進度 -->
        <div v-if="resultConfig.status === 'processing'" class="processing-indicator">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <p class="processing-text">正在與銀行確認中，請稍候...</p>
        </div>
      </div>

      <!-- 付款詳情 -->
      <div class="payment-details" v-if="payment">
        <h2>付款詳情</h2>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">訂單編號</span>
            <span class="value">{{ payment.orderNumber }}</span>
          </div>
          <div class="detail-item">
            <span class="label">付款金額</span>
            <span class="value amount">{{ formatAmount(payment.amount) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">付款方式</span>
            <span class="value">{{ payment.paymentMethodName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">交易編號</span>
            <span class="value transaction-id" @click="copyTransactionId">
              {{ payment.transactionId }}
              <span class="copy-icon">📋</span>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">建立時間</span>
            <span class="value">{{ formatTime(payment.createdAt) }}</span>
          </div>
          <div class="detail-item" v-if="payment.paidAt">
            <span class="label">付款時間</span>
            <span class="value">{{ formatTime(payment.paidAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 失敗原因 -->
      <div class="error-details" v-if="resultConfig.status === 'failed' && payment?.failedReason">
        <h3>{{ payment.statusName === '無付款資訊' ? '如何查看付款狀態' : '失敗原因' }}</h3>
        <p>{{ payment.failedReason }}</p>
        <div class="error-solutions">
          <h4>{{ payment.statusName === '無付款資訊' ? '建議操作：' : '建議解決方案：' }}</h4>
          <ul v-if="payment.statusName === '無付款資訊'">
            <li>前往「我的訂單」查看所有訂單狀態</li>
            <li>從訂單詳情頁面進行付款</li>
            <li>如有疑問請聯繫客服</li>
          </ul>
          <ul v-else>
            <li>檢查信用卡資訊是否正確</li>
            <li>確認信用卡額度是否足夠</li>
            <li>聯絡您的發卡銀行確認交易</li>
            <li>嘗試使用其他付款方式</li>
          </ul>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="result-actions">
        <!-- 成功狀態 -->
        <template v-if="resultConfig.status === 'success'">
          <button class="btn btn-primary" @click="viewOrder">
            查看訂單
          </button>
          <button class="btn btn-secondary" @click="goHome">
            繼續購物
          </button>
        </template>

        <!-- 失敗狀態 -->
        <template v-else-if="resultConfig.status === 'failed'">
          <button class="btn btn-primary" @click="router.push('/member/orders')">
            查看我的訂單
          </button>
          <button class="btn btn-secondary" @click="goHome">
            回到首頁
          </button>
        </template>

        <!-- 取消狀態 -->
        <template v-else-if="resultConfig.status === 'cancelled'">
          <button class="btn btn-primary" @click="retryPayment">
            重新付款
          </button>
          <button class="btn btn-secondary" @click="router.push('/member/orders')">
            訂單列表
          </button>
        </template>

        <!-- 過期狀態 -->
        <template v-else-if="resultConfig.status === 'expired'">
          <button class="btn btn-primary" @click="router.push('/cart')">
            重新下單
          </button>
          <button class="btn btn-secondary" @click="goHome">
            返回首頁
          </button>
        </template>

        <!-- 處理中狀態 -->
        <template v-else>
          <button class="btn btn-secondary" @click="viewOrder">
            查看訂單狀態
          </button>
          <button class="btn btn-ghost" @click="goHome">
            返回首頁
          </button>
        </template>
      </div>

      <!-- 客服聯絡 -->
      <div class="support-section">
        <p>如有疑問，請聯絡客服：</p>
        <div class="support-contacts">
          <a href="tel:0800-123-456" class="support-link">
            📞 0800-123-456
          </a>
          <a href="mailto:support@buyshop.com" class="support-link">
            ✉️ support@buyshop.com
          </a>
        </div>
      </div>

      <!-- 隱藏的專題展示按鈕 - F12開發者工具使用 -->
      <div class="demo-controls" style="display: none;">
        <button 
          id="demo-success-btn" 
          @click="triggerDemoSuccess" 
          class="btn btn-success"
        >
          🎭 專題展示：強制付款成功
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-result-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-status {
  background: white;
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  border: 2px solid;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.status-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 12px;
}

.status-message {
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.processing-indicator {
  margin-top: 24px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, #2196f3, #21cbf3);
  animation: loading 2s ease-in-out infinite;
}

@keyframes loading {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

.processing-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.payment-details {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.payment-details h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px;
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-size: 14px;
  color: #666;
}

.detail-item .value {
  font-weight: 500;
  color: #1a1a1a;
  text-align: right;
}

.detail-item .value.amount {
  font-size: 18px;
  font-weight: 600;
  color: #e53e3e;
}

.transaction-id {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.transaction-id:hover {
  color: #2196f3;
}

.copy-icon {
  font-size: 12px;
  opacity: 0.6;
}

.error-details {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 12px;
  padding: 20px;
}

.error-details h3 {
  color: #e53e3e;
  margin: 0 0 12px;
  font-size: 16px;
}

.error-details p {
  color: #c53030;
  margin: 0 0 16px;
}

.error-solutions h4 {
  color: #e53e3e;
  margin: 0 0 8px;
  font-size: 14px;
}

.error-solutions ul {
  margin: 0;
  padding-left: 20px;
  color: #c53030;
}

.error-solutions li {
  margin-bottom: 4px;
  font-size: 14px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
  text-align: center;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-secondary {
  background: white;
  color: #2196f3;
  border: 1px solid #2196f3;
}

.btn-secondary:hover {
  background: #f8f9ff;
}

.btn-ghost {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-ghost:hover {
  background: #f5f5f5;
}

.support-section {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.support-section p {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
}

.support-contacts {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.support-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #2196f3;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.support-link:hover {
  background: #f8f9ff;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .payment-result-container {
    padding: 16px;
  }

  .result-status {
    padding: 32px 20px;
  }

  .status-icon {
    font-size: 48px;
  }

  .status-title {
    font-size: 24px;
  }

  .result-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .support-contacts {
    flex-direction: column;
    align-items: center;
  }
}
</style>