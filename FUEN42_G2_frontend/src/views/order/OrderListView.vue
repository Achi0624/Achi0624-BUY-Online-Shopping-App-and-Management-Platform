<script setup lang="ts">
/**
 * 訂單列表頁面
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 訂單管理系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/modules/order'
import { useUserStore } from '@/stores/user'
// import { mockOrders } from '@/utils/mockData' // 停用假資料
import type { OrderStatus } from '@/types/modules/order'

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

// 狀態
const loading = ref(false)
const currentTab = ref<'all' | 'pending' | 'processing' | 'completed'>('all')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 訂單狀態映射
const orderStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待處理', color: 'gray' },
  1: { label: '已確認', color: 'blue' },
  2: { label: '處理中', color: 'yellow' },
  3: { label: '已出貨', color: 'purple' },
  4: { label: '已送達', color: 'green' },
  5: { label: '已完成', color: 'green' },
  6: { label: '已取消', color: 'red' }
}

// 付款狀態映射 (修正為與後端資料庫一致)
const paymentStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待付款', color: 'gray' },
  1: { label: '待付款', color: 'gray' },    // 修正：1=未付款，顯示「待付款」
  2: { label: '已付款', color: 'green' },   // 修正：2=已付款
  3: { label: '退款中', color: 'yellow' },
  4: { label: '已退款', color: 'purple' }
}

// 標籤統計  
const tabCounts = computed(() => {
  const orders = orderStore.orders
  return {
    all: orders.length,
    pending: orders.filter(o => (o.status || o.orderStatus) <= 1).length,
    processing: orders.filter(o => (o.status || o.orderStatus) >= 2 && (o.status || o.orderStatus) <= 3).length,
    completed: orders.filter(o => (o.status || o.orderStatus) >= 4).length
  }
})

// 過濾後的訂單
const filteredOrders = computed(() => {
  let orders = [...orderStore.orders]
  
  // 按標籤過濾
  switch (currentTab.value) {
    case 'pending':
      orders = orders.filter(o => (o.status || o.orderStatus) <= 1)
      break
    case 'processing':
      orders = orders.filter(o => (o.status || o.orderStatus) >= 2 && (o.status || o.orderStatus) <= 3)
      break
    case 'completed':
      orders = orders.filter(o => (o.status || o.orderStatus) >= 4)
      break
  }
  
  // 搜索過濾
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    orders = orders.filter(o => 
      (o.orderNumber || o.masterOrderNumber || '').toLowerCase().includes(query) ||
      (o.memberName || '').toLowerCase().includes(query) ||
      (o.orders || []).some(subOrder => 
        (subOrder.vendorName || '').toLowerCase().includes(query) ||
        (subOrder.items || []).some(item => 
          (item.productName || '').toLowerCase().includes(query)
        )
      )
    )
  }
  
  // 按時間倒序
  orders.sort((a, b) => 
    new Date(b.orderDate || b.createdAt).getTime() - new Date(a.orderDate || a.createdAt).getTime()
  )
  
  return orders
})

// 分頁後的訂單
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

// 總頁數
const totalPages = computed(() => 
  Math.ceil(filteredOrders.value.length / pageSize.value)
)

// 切換標籤
const changeTab = (tab: typeof currentTab.value) => {
  currentTab.value = tab
  currentPage.value = 1
}

// 查看訂單詳情
const viewOrder = (orderId: number) => {
  router.push(`/order/${orderId}`)
}

// 取消訂單
const cancelOrder = async (orderId: number) => {
  if (!confirm('確定要取消此訂單嗎？')) return
  
  try {
    loading.value = true
    console.log('🚀 開始取消訂單:', orderId)
    
    // 調用取消訂單 API
    await orderStore.cancelOrder(orderId, '用戶取消')
    console.log('✅ 取消訂單成功，重新載入訂單列表')
    
    // 重新載入訂單列表確保狀態同步
    const currentMemberId = userStore.user?.id || userStore.user?.memberId
    await orderStore.fetchOrders({
      page: 1,
      limit: 100,
      userId: currentMemberId
    })
    
    alert('訂單已取消')
  } catch (error) {
    console.error('❌ 取消訂單失敗:', error)
    alert('取消訂單失敗')
  } finally {
    loading.value = false
  }
}

// 確認收貨
const confirmReceived = async (orderId: number) => {
  if (!confirm('確定已收到商品嗎？')) return
  
  try {
    loading.value = true
    // TODO: 調用確認收貨 API
    const order = orderStore.orders.find(o => o.id === orderId)
    if (order) {
      order.orderStatus = 5 // 已完成
    }
    alert('已確認收貨')
  } catch (error) {
    alert('確認收貨失敗')
  } finally {
    loading.value = false
  }
}

// 申請退款
const requestRefund = (orderId: number) => {
  router.push(`/order/${orderId}/refund`)
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '無日期'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '無效日期'
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化載入訂單
// C組 (蔡易霖) 修改: 使用真實 API
onMounted(async () => {
  loading.value = true
  try {
    // 調用真實 API，使用當前登入會員的ID
    const currentMemberId = userStore.user?.id || userStore.user?.memberId
    console.log('📋 查詢會員', currentMemberId, '的訂單')
    console.log('📊 完整用戶資訊:', userStore.user)
    
    await orderStore.fetchOrders({
      page: 1,
      limit: 100, // 取得更多資料
      userId: currentMemberId
    })
  } catch (error: any) {
    console.error('載入訂單失敗:', error)
    
    // 顯示友善的錯誤訊息
    if (error?.response?.status === 500) {
      alert('訂單資料載入失敗，可能是會員資料有問題。請聯繫客服或稍後再試。')
    } else if (error?.response?.status === 404) {
      alert('找不到您的訂單資料，可能您還沒有下過訂單。')
    } else {
      alert('載入訂單時發生錯誤，請稍後再試。')
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="order-list-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1>我的訂單</h1>
      <p class="subtitle">管理您的所有訂單</p>
    </div>

    <!-- 搜索欄 -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索訂單編號、商品名稱或廠商..."
        class="search-input"
      >
      <button class="search-btn">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- 標籤切換 -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'all' }"
        @click="changeTab('all')"
      >
        全部訂單 ({{ tabCounts.all }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'pending' }"
        @click="changeTab('pending')"
      >
        待處理 ({{ tabCounts.pending }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'processing' }"
        @click="changeTab('processing')"
      >
        處理中 ({{ tabCounts.processing }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'completed' }"
        @click="changeTab('completed')"
      >
        已完成 ({{ tabCounts.completed }})
      </button>
    </div>

    <!-- 訂單列表 -->
    <div v-if="loading" class="loading">
      載入中...
    </div>
    
    <div v-else-if="paginatedOrders.length === 0" class="empty-state">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" stroke="#E5E7EB" stroke-width="2"/>
        <path d="M35 45h30M35 55h20" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p>暫無訂單記錄</p>
    </div>
    
    <div v-else class="order-list">
      <div v-for="order in paginatedOrders" :key="order.id" class="order-card">
        <!-- 訂單標題 -->
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">{{ order.orderNumber || order.masterOrderNumber }}</span>
            <span class="order-date">{{ formatDate(order.orderDate || order.createdAt) }}</span>
          </div>
          <div class="order-status">
            <span 
              class="status-badge"
              :class="`status-${orderStatusMap[order.status || order.orderStatus]?.color || 'gray'}`"
            >
              {{ orderStatusMap[order.status || order.orderStatus]?.label || `未知狀態(${order.status || order.orderStatus})` }}
            </span>
            <span 
              class="status-badge"
              :class="`status-${paymentStatusMap[order.paymentStatus]?.color || 'gray'}`"
            >
              {{ paymentStatusMap[order.paymentStatus ?? 0]?.label || '待付款' }}
            </span>
          </div>
        </div>

        <!-- 訂單商品 -->
        <div class="order-items">
          <div class="simple-item-info">
            <span class="item-count">
              <!-- 顯示商品摘要 -->
              <template v-if="order.productSummary">
                {{ order.productSummary }}
              </template>
              <template v-else-if="order.note && order.note.trim()">
                備註：{{ order.note }}
              </template>
              <template v-else>
                查看詳情了解商品資訊
              </template>
            </span>
            <span class="member-info">收件人：{{ order.recipientName || '未知' }}</span>
          </div>
        </div>

        <!-- 訂單金額與操作 -->
        <div class="order-footer">
          <div class="order-amount">
            <span class="amount-label">訂單金額：</span>
            <span class="amount-value">NT$ {{ (order.finalAmount || order.totalAmount || 0).toLocaleString() }}</span>
          </div>
          <div class="order-actions">
            <button class="btn btn-outline" @click="viewOrder(order.id)">
              查看詳情
            </button>
            <button 
              v-if="(order.status || order.orderStatus) === 0 || (order.status || order.orderStatus) === 1"
              class="btn btn-danger"
              @click="cancelOrder(order.id)"
            >
              取消訂單
            </button>
            <button 
              v-if="(order.status || order.orderStatus) === 3 || (order.status || order.orderStatus) === 4"
              class="btn btn-primary"
              @click="confirmReceived(order.id)"
            >
              確認收貨
            </button>
            <button 
              v-if="(order.status || order.orderStatus) === 5"
              class="btn btn-outline"
              @click="requestRefund(order.id)"
            >
              申請退款
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        上一頁
      </button>
      <span class="page-info">
        第 {{ currentPage }} / {{ totalPages }} 頁
      </span>
      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        下一頁
      </button>
    </div>
  </div>
</template>

<style scoped>
.order-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

.search-bar {
  display: flex;
  margin-bottom: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
}

.search-btn {
  padding: 0 16px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
}

.search-btn:hover {
  color: #374151;
}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  padding: 12px 0;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn:hover {
  color: #374151;
}

.tab-btn.active {
  color: #3b82f6;
  font-weight: 500;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state svg {
  margin: 0 auto 20px;
}

.empty-state p {
  color: #6b7280;
  font-size: 16px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.order-number {
  font-weight: 600;
  color: #111827;
}

.order-date {
  color: #6b7280;
  font-size: 14px;
}

.order-status {
  display: flex;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-gray {
  background: #f3f4f6;
  color: #6b7280;
}

.status-blue {
  background: #dbeafe;
  color: #1e40af;
}

.status-yellow {
  background: #fef3c7;
  color: #92400e;
}

.status-purple {
  background: #ede9fe;
  color: #5b21b6;
}

.status-green {
  background: #d1fae5;
  color: #065f46;
}

.status-red {
  background: #fee2e2;
  color: #991b1b;
}

.order-items {
  padding: 20px;
}

.simple-item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.item-count {
  color: #6b7280;
  font-size: 14px;
}

.member-info {
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.vendor-group {
  margin-bottom: 16px;
}

.vendor-group:last-child {
  margin-bottom: 0;
}

.vendor-name {
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
  margin-bottom: 12px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item {
  display: flex;
  gap: 12px;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #f3f4f6;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
}

.item-price {
  color: #ef4444;
  font-weight: 500;
}

.item-quantity {
  color: #6b7280;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.order-amount {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-label {
  color: #6b7280;
  font-size: 14px;
}

.amount-value {
  font-size: 18px;
  font-weight: 600;
  color: #ef4444;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-outline {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-outline:hover {
  background: #f9fafb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-size: 14px;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 16px;
  }
  
  .order-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .tabs {
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>