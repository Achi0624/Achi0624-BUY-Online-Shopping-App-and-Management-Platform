<template>
  <div class="return-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="icon-return"></i>
        退貨退款管理
      </h1>
      <p class="page-subtitle">查看和管理您的退貨退款申請</p>
    </div>

    <!-- 標籤切換 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- 可申請退貨的訂單列表 -->
    <div v-if="activeTab === 'available'" class="content-section">
      <div v-if="availableOrders.length > 0" class="order-list">
        <div v-for="order in availableOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">訂單編號：{{ order.orderNumber }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-status">
              <span class="status-badge completed">已完成</span>
            </div>
          </div>
          
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="item-row">
              <img :src="item.imageUrl || '/placeholder.jpg'" :alt="item.productName" class="item-image">
              <div class="item-info">
                <h4 class="item-name">{{ item.productName }}</h4>
                <p class="item-specs">{{ item.specifications }}</p>
              </div>
              <div class="item-quantity">x {{ item.quantity }}</div>
              <div class="item-price">NT$ {{ item.price.toLocaleString() }}</div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              總金額：<span class="total-amount">NT$ {{ order.totalAmount.toLocaleString() }}</span>
            </div>
            <button 
              class="btn btn-primary"
              @click="applyReturn(order.id)"
            >
              申請退貨
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>沒有可申請退貨的訂單</h3>
        <p>已完成的訂單在7天內可申請退貨</p>
      </div>
    </div>

    <!-- 處理中的退貨申請 -->
    <div v-else-if="activeTab === 'processing'" class="content-section">
      <div v-if="processingReturns.length > 0" class="return-list">
        <div v-for="returnItem in processingReturns" :key="returnItem.id" class="return-card">
          <div class="return-header">
            <div class="return-info">
              <span class="return-number">退貨編號：{{ returnItem.returnNumber }}</span>
              <span class="return-date">申請時間：{{ formatDateTime(returnItem.createdAt) }}</span>
            </div>
            <div class="return-status">
              <span class="status-badge" :class="`status-${returnItem.status}`">
                {{ getReturnStatusText(returnItem.status) }}
              </span>
            </div>
          </div>

          <div class="return-content">
            <div class="return-reason">
              <span class="label">退貨原因：</span>
              <span>{{ returnItem.reason }}</span>
            </div>
            <div v-if="returnItem.description" class="return-description">
              <span class="label">詳細說明：</span>
              <p>{{ returnItem.description }}</p>
            </div>
            <div v-if="returnItem.images && returnItem.images.length > 0" class="return-images">
              <span class="label">相關圖片：</span>
              <div class="image-list">
                <img 
                  v-for="(img, index) in returnItem.images" 
                  :key="index"
                  :src="img"
                  class="return-image"
                  @click="viewImage(img)"
                >
              </div>
            </div>
          </div>

          <div class="return-timeline">
            <h4 class="timeline-title">處理進度</h4>
            <div class="timeline-items">
              <div class="timeline-item completed">
                <span class="timeline-dot"></span>
                <div class="timeline-content">
                  <span class="timeline-status">已提交申請</span>
                  <span class="timeline-time">{{ formatDateTime(returnItem.createdAt) }}</span>
                </div>
              </div>
              <div class="timeline-item" :class="{ completed: returnItem.status >= 1 }">
                <span class="timeline-dot"></span>
                <div class="timeline-content">
                  <span class="timeline-status">審核中</span>
                  <span class="timeline-time">{{ returnItem.reviewedAt || '-' }}</span>
                </div>
              </div>
              <div class="timeline-item" :class="{ completed: returnItem.status >= 3 }">
                <span class="timeline-dot"></span>
                <div class="timeline-content">
                  <span class="timeline-status">處理中</span>
                  <span class="timeline-time">{{ returnItem.processedAt || '-' }}</span>
                </div>
              </div>
              <div class="timeline-item" :class="{ completed: returnItem.status === 4 }">
                <span class="timeline-dot"></span>
                <div class="timeline-content">
                  <span class="timeline-status">已完成</span>
                  <span class="timeline-time">{{ returnItem.completedAt || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="returnItem.status === 1" class="return-actions">
            <button class="btn btn-secondary" @click="cancelReturn(returnItem.id)">
              取消申請
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>沒有處理中的退貨申請</h3>
        <p>您目前沒有正在處理的退貨申請</p>
      </div>
    </div>

    <!-- 歷史記錄 -->
    <div v-else-if="activeTab === 'history'" class="content-section">
      <div v-if="historyReturns.length > 0" class="return-list">
        <div v-for="returnItem in historyReturns" :key="returnItem.id" class="return-card history">
          <div class="return-header">
            <div class="return-info">
              <span class="return-number">退貨編號：{{ returnItem.returnNumber }}</span>
              <span class="return-date">{{ formatDate(returnItem.createdAt) }}</span>
            </div>
            <div class="return-status">
              <span class="status-badge" :class="`status-${returnItem.status}`">
                {{ getReturnStatusText(returnItem.status) }}
              </span>
            </div>
          </div>
          
          <div class="return-summary">
            <div class="summary-item">
              <span class="label">訂單編號：</span>
              <span>{{ returnItem.orderNumber }}</span>
            </div>
            <div class="summary-item">
              <span class="label">退貨類型：</span>
              <span>{{ getReturnTypeText(returnItem.type) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">退款金額：</span>
              <span class="refund-amount">NT$ {{ returnItem.refundAmount?.toLocaleString() || 0 }}</span>
            </div>
            <div v-if="returnItem.refundedAt" class="summary-item">
              <span class="label">退款時間：</span>
              <span>{{ formatDateTime(returnItem.refundedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>沒有退貨記錄</h3>
        <p>您還沒有任何退貨記錄</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 退貨退款管理頁面
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 退貨退款系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/modules/order'
import { ReturnStatus, ReturnType } from '@/types/modules/order'

const router = useRouter()
const orderStore = useOrderStore()

// 響應式數據
const activeTab = ref('available')
const loading = ref(false)

// 標籤配置
const tabs = computed(() => [
  { key: 'available', label: '可申請退貨', count: availableOrders.value.length },
  { key: 'processing', label: '處理中', count: processingReturns.value.length },
  { key: 'history', label: '歷史記錄', count: historyReturns.value.length }
])

// 模擬數據
const availableOrders = ref([
  {
    id: 1,
    orderNumber: 'ORD20250115001',
    createdAt: '2025-01-08T10:30:00',
    totalAmount: 3580,
    status: 5, // Completed
    items: [
      {
        id: 1,
        productName: '無線藍牙耳機 Pro',
        specifications: '黑色 / 降噪版',
        quantity: 1,
        price: 3580,
        imageUrl: null
      }
    ]
  },
  {
    id: 2,
    orderNumber: 'ORD20250110002',
    createdAt: '2025-01-10T14:20:00',
    totalAmount: 1280,
    status: 5,
    items: [
      {
        id: 2,
        productName: '運動水壺',
        specifications: '750ml / 藍色',
        quantity: 2,
        price: 640,
        imageUrl: null
      }
    ]
  }
])

const processingReturns = ref([
  {
    id: 1,
    returnNumber: 'RTN20250115001',
    orderNumber: 'ORD20250105003',
    status: 1, // Approved
    type: 0, // Return
    reason: '商品瑕疵',
    description: '耳機左邊聲音異常，有雜音',
    images: [],
    refundAmount: 2980,
    createdAt: '2025-01-15T09:00:00',
    reviewedAt: '2025-01-15T10:30:00',
    processedAt: null,
    completedAt: null,
    refundedAt: null
  }
])

const historyReturns = ref([
  {
    id: 2,
    returnNumber: 'RTN20250101001',
    orderNumber: 'ORD20241225001',
    status: 4, // Completed
    type: 0, // Return
    reason: '尺寸不合',
    refundAmount: 1580,
    createdAt: '2025-01-01T10:00:00',
    completedAt: '2025-01-05T15:00:00',
    refundedAt: '2025-01-06T10:00:00'
  }
])

// 方法
const applyReturn = (orderId: number) => {
  router.push(`/return/${orderId}`)
}

const cancelReturn = async (returnId: number) => {
  if (!confirm('確定要取消此退貨申請嗎？')) return
  
  try {
    loading.value = true
    // 模擬 API 呼叫
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新狀態
    const index = processingReturns.value.findIndex(r => r.id === returnId)
    if (index !== -1) {
      processingReturns.value[index].status = 5 // Cancelled
      // 移到歷史記錄
      historyReturns.value.unshift(processingReturns.value[index])
      processingReturns.value.splice(index, 1)
    }
  } finally {
    loading.value = false
  }
}

const viewImage = (imageUrl: string) => {
  window.open(imageUrl, '_blank')
}

// 狀態文字轉換
const getReturnStatusText = (status: ReturnStatus): string => {
  const statusMap: Record<ReturnStatus, string> = {
    [ReturnStatus.Pending]: '待審核',
    [ReturnStatus.Approved]: '已批准',
    [ReturnStatus.Rejected]: '已拒絕',
    [ReturnStatus.Processing]: '處理中',
    [ReturnStatus.Completed]: '已完成',
    [ReturnStatus.Cancelled]: '已取消'
  }
  return statusMap[status] || '未知狀態'
}

const getReturnTypeText = (type: ReturnType): string => {
  const typeMap: Record<ReturnType, string> = {
    [ReturnType.Return]: '退貨',
    [ReturnType.Exchange]: '換貨',
    [ReturnType.Refund]: '退款'
  }
  return typeMap[type] || '未知類型'
}

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW')
}

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化
onMounted(() => {
  // 載入退貨資料
})
</script>

<style scoped>
.return-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 頁面標題 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-subtitle {
  color: #666;
  font-size: 16px;
}

/* 標籤切換 */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  color: var(--blue);
  font-weight: 500;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--blue);
}

.tab-count {
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tab-btn.active .tab-count {
  background: var(--blue);
  color: white;
}

/* 訂單卡片 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.order-date {
  font-size: 14px;
  color: #999;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.order-items {
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 0;
  margin-bottom: 16px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.item-specs {
  font-size: 13px;
  color: #999;
}

.item-quantity {
  font-size: 14px;
  color: #666;
}

.item-price {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  min-width: 100px;
  text-align: right;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-total {
  font-size: 14px;
  color: #666;
}

.total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #ff6b00;
  margin-left: 8px;
}

/* 退貨卡片 */
.return-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.return-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.return-card.history {
  opacity: 0.9;
}

.return-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.return-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.return-number {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.return-date {
  font-size: 14px;
  color: #999;
}

.status-0 { background: #f5f5f5; color: #666; }
.status-1 { background: #e3f2fd; color: #1976d2; }
.status-2 { background: #ffebee; color: #c62828; }
.status-3 { background: #fff8e1; color: #f57c00; }
.status-4 { background: #e8f5e9; color: #2e7d32; }
.status-5 { background: #fce4ec; color: #c2185b; }

.return-content {
  margin-bottom: 20px;
}

.return-reason,
.return-description {
  margin-bottom: 12px;
}

.label {
  font-size: 14px;
  color: #999;
  margin-right: 8px;
}

.return-description p {
  margin-top: 4px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.return-images {
  margin-top: 16px;
}

.image-list {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.return-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}

.return-image:hover {
  transform: scale(1.05);
}

/* 時間軸 */
.return-timeline {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 12px;
}

.timeline-items {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline-items::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #e0e0e0;
  z-index: 0;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  flex: 1;
}

.timeline-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e0e0e0;
}

.timeline-item.completed .timeline-dot {
  background: var(--blue);
  border-color: var(--blue);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.timeline-status {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.timeline-item.completed .timeline-status {
  color: var(--blue);
}

.timeline-time {
  font-size: 11px;
  color: #999;
}

/* 摘要資訊 */
.return-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.refund-amount {
  font-weight: 500;
  color: #ff6b00;
}

/* 操作按鈕 */
.return-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--blue);
  color: white;
}

.btn-primary:hover {
  background: var(--blue-dark);
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  color: #666;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 16px;
  color: #999;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .tabs {
    overflow-x: auto;
  }
  
  .order-header,
  .return-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .timeline-items {
    flex-direction: column;
    gap: 16px;
  }
  
  .timeline-items::before {
    display: none;
  }
  
  .return-summary {
    grid-template-columns: 1fr;
  }
}

/* 圖標 */
.icon-return::before { content: '↩️'; }
</style>