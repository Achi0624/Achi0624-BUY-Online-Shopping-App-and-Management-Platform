<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { getMemberOrders, cancelOrder, type MemberOrderItem } from '@/api/modules/c-orders'

const orders = ref<MemberOrderItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// TODO: 從實際登入系統取得會員ID，這裡暫時使用測試ID
const memberId = 1

onMounted(() => {
  fetchOrders()
})

async function fetchOrders() {
  loading.value = true
  error.value = null
  
  try {
    console.log('🔄 開始載入訂單列表...')
    const response = await getMemberOrders(memberId, 1, 20)
    console.log('📥 API 完整響應:', response)
    
    if (response.success) {
      const newOrders = response.data.items
      console.log('📦 API返回的訂單數據:', newOrders)
      
      // 詳細記錄每個訂單的狀態
      newOrders.forEach((order: any, index: number) => {
        console.log(`📋 訂單 ${index + 1}:`, {
          id: order.id,
          orderNumber: order.masterOrderNumber,
          status: order.status,
          statusText: getStatusText(order.status),
          canCancel: order.status === 0 || order.status === 1
        })
      })
      
      // 強制觸發響應式更新
      orders.value = []
      await nextTick()
      orders.value = newOrders
      
      console.log('✅ 訂單列表已更新，共', orders.value.length, '筆訂單')
    } else {
      error.value = response.message || '載入訂單失敗'
      console.error('❌ API返回失敗:', response.message)
    }
  } catch (err: any) {
    error.value = err.message || '網路錯誤，請稍後再試'
    console.error('❌ 載入訂單失敗:', err)
  } finally {
    loading.value = false
  }
}

function getStatusText(status: number): string {
  const statusMap: { [key: number]: string } = {
    0: '待處理',
    1: '已付款',
    2: '處理中', 
    3: '已出貨',
    4: '已送達',
    5: '已完成',
    6: '已取消'
  }
  return statusMap[status] || '未知狀態'
}

function getStatusClass(status: number): string {
  const statusClassMap: { [key: number]: string } = {
    0: 'status-pending',
    1: 'status-paid',
    2: 'status-processing',
    3: 'status-shipped', 
    4: 'status-delivered',
    5: 'status-completed',
    6: 'status-cancelled'
  }
  return statusClassMap[status] || 'status-unknown'
}

function getPaymentStatusText(paymentStatus: number): string {
  const paymentStatusMap: { [key: number]: string } = {
    0: '待付款',
    1: '待付款',  // 修正：1=未付款，顯示「待付款」
    2: '已付款',  // 修正：2=已付款
    3: '退款中',
    4: '已退款'
  }
  return paymentStatusMap[paymentStatus] || '未知狀態'
}

function getPaymentStatusClass(paymentStatus: number): string {
  const paymentStatusClassMap: { [key: number]: string } = {
    0: 'payment-pending',
    1: 'payment-pending',   // 修正：1=未付款，使用「待付款」樣式
    2: 'payment-paid',      // 修正：2=已付款
    3: 'payment-refunding', 
    4: 'payment-refunded'
  }
  return paymentStatusClassMap[paymentStatus] || 'payment-unknown'
}

// 取消訂單功能
async function handleCancelOrder(order: MemberOrderItem) {
  const reason = prompt('請輸入取消原因：')
  if (!reason || reason.trim() === '') {
    return
  }
  
  if (!confirm(`確定要取消訂單 ${order.masterOrderNumber} 嗎？`)) {
    return
  }
  
  console.log('🚀 開始取消訂單流程...')
  console.log('📋 目標訂單:', {
    id: order.id,
    orderNumber: order.masterOrderNumber,
    currentStatus: order.status,
    statusText: getStatusText(order.status)
  })
  
  try {
    loading.value = true
    console.log('📤 發送取消訂單請求...')
    const response = await cancelOrder(order.id, reason.trim())
    console.log('📥 取消訂單API響應:', response)
    
    if (response.success) {
      console.log('✅ 取消訂單API呼叫成功')
      console.log('📋 取消前訂單總數:', orders.value.length)
      
      // 記錄取消前的狀態
      const canceledOrderBefore = orders.value.find(o => o.id === order.id)
      console.log('📋 取消前該訂單狀態:', canceledOrderBefore?.status)
      
      // 等待一下確保資料庫已更新，然後重新載入訂單列表
      console.log('⏳ 等待資料庫更新完成...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('🔄 重新載入訂單列表...')
      await fetchOrders()
      
      // 檢查取消後的狀態
      const canceledOrderAfter = orders.value.find(o => o.id === order.id)
      console.log('📋 重新載入後該訂單狀態:', canceledOrderAfter?.status)
      console.log('📋 重新載入後訂單總數:', orders.value.length)
      
      if (canceledOrderAfter && canceledOrderAfter.status === 6) {
        console.log('🎉 狀態更新成功！訂單已標記為已取消')
      } else {
        console.warn('⚠️ 狀態更新可能未成功，請檢查API')
      }
      
      alert('✅ 訂單取消成功')
      console.log('✅ 訂單取消成功:', order.masterOrderNumber)
    } else {
      // API返回失敗
      alert(`❌ 取消失敗：${response.message || '未知錯誤'}`)
      console.error('❌ API返回取消失敗:', response)
    }
  } catch (err: any) {
    // 網路錯誤或其他異常
    console.error('❌ 取消訂單請求失敗:', err)
    
    // 解析錯誤訊息
    let errorMessage = '取消訂單時發生錯誤'
    if (err.response) {
      // HTTP錯誤回應
      errorMessage = err.response.data?.message || 
                    err.response.statusText || 
                    `HTTP ${err.response.status} 錯誤`
    } else if (err.message) {
      errorMessage = err.message
    }
    
    alert(`❌ ${errorMessage}`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="member-orders-view">
    <div class="container">
      <h2 class="page-title">我的訂單</h2>
      
      <!-- 載入中狀態 -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>載入訂單中...</p>
      </div>
      
      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p class="error-message">{{ error }}</p>
        <button @click="fetchOrders" class="retry-btn">重試</button>
      </div>
      
      <!-- 訂單列表 -->
      <div v-else-if="orders.length > 0" class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3 class="order-number">訂單編號：{{ order.masterOrderNumber }}</h3>
              <p class="order-date">{{ new Date(order.createdAt).toLocaleDateString('zh-TW') }}</p>
            </div>
            <div class="order-status">
              <span :class="['status-badge', getStatusClass(order.status)]">
                {{ getStatusText(order.status) }}
              </span>
              <span :class="['payment-badge', getPaymentStatusClass(order.paymentStatus)]">
                {{ getPaymentStatusText(order.paymentStatus) }}
              </span>
            </div>
          </div>
          
          <div class="order-body">
            <div class="product-summary">
              <p class="summary-text">{{ order.productSummary }}</p>
              <p class="item-count">共 {{ order.totalItemCount }} 件商品</p>
            </div>
            
            <div class="order-amount">
              <p class="total-amount">總金額：<span class="amount">NT$ {{ order.finalAmount.toLocaleString() }}</span></p>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="shipping-info">
              <p class="recipient">收件人：{{ order.recipientName }}</p>
              <p class="phone">電話：{{ order.recipientPhone }}</p>
            </div>
            <div class="order-actions">
              <button class="action-btn view-btn">查看詳情</button>
              <button v-if="order.status === 0 || order.status === 1" class="action-btn cancel-btn" @click="handleCancelOrder(order)">取消訂單</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 無訂單狀態 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>尚無訂單記錄</h3>
        <p>您還沒有任何訂單，快去選購商品吧！</p>
        <button class="shop-btn" @click="$router.push('/products')">前往購物</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.member-orders-view {
  min-height: calc(100vh - 120px);
  padding: 20px 0;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

/* 載入狀態 */
.loading {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e3e3e3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 錯誤狀態 */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-message {
  color: #dc3545;
  font-size: 16px;
  margin-bottom: 20px;
}

.retry-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #0056b3;
}

/* 訂單卡片 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 訂單標題 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.order-number {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.order-date {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.order-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* 狀態標籤 */
.status-badge, .payment-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 80px;
}

/* 訂單狀態顏色 */
.status-pending { background-color: #fff3cd; color: #856404; }
.status-paid { background-color: #d1ecf1; color: #0c5460; }
.status-processing { background-color: #cce7ff; color: #004085; }
.status-shipped { background-color: #d4edda; color: #155724; }
.status-delivered { background-color: #d1ecf1; color: #0c5460; }
.status-completed { background-color: #d4edda; color: #155724; }
.status-cancelled { background-color: #f8d7da; color: #721c24; }

/* 付款狀態顏色 */
.payment-pending { background-color: #fff3cd; color: #856404; }
.payment-paid { background-color: #d4edda; color: #155724; }
.payment-failed { background-color: #f8d7da; color: #721c24; }
.payment-refunded { background-color: #e2e3e5; color: #383d41; }

/* 訂單內容 */
.order-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.product-summary .summary-text {
  color: #2c3e50;
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 5px 0;
}

.product-summary .item-count {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.total-amount {
  color: #2c3e50;
  font-size: 16px;
  margin: 0;
}

.amount {
  color: #e74c3c;
  font-weight: 600;
  font-size: 18px;
}

/* 訂單底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.shipping-info p {
  color: #6c757d;
  font-size: 14px;
  margin: 2px 0;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn {
  background-color: #007bff;
  color: white;
}

.view-btn:hover {
  background-color: #0056b3;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
}

.cancel-btn:hover {
  background-color: #c82333;
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 30px;
}

.shop-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.shop-btn:hover {
  background-color: #218838;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .order-status {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  
  .order-body {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .order-actions {
    justify-content: center;
  }
}
</style>