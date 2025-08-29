<template>
  <div class="tracking-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="icon-truck"></i>
        物流追蹤
      </h1>
      <p class="page-subtitle">輸入訂單編號或物流單號查詢配送狀態</p>
    </div>

    <!-- 查詢表單 -->
    <div class="search-section">
      <div class="search-box">
        <input
          v-model="searchNumber"
          type="text"
          class="search-input"
          placeholder="請輸入訂單編號或物流單號"
          @keyup.enter="handleSearch"
        />
        <button 
          class="search-btn"
          :disabled="!searchNumber || loading"
          @click="handleSearch"
        >
          <span v-if="loading">查詢中...</span>
          <span v-else>查詢</span>
        </button>
      </div>
      
      <!-- 錯誤提示 -->
      <div v-if="error" class="error-message">
        <i class="icon-alert"></i>
        {{ error }}
      </div>
    </div>

    <!-- 物流資訊展示 -->
    <div v-if="shippingInfo && !loading" class="tracking-content">
      <!-- 基本資訊卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h2 class="card-title">物流資訊</h2>
          <div class="shipping-status" :class="`status-${shippingInfo.status}`">
            {{ getStatusText(shippingInfo.status) }}
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">物流單號</span>
            <span class="info-value">{{ shippingInfo.trackingNumber }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">物流公司</span>
            <span class="info-value">
              {{ currentProvider?.name || '未知' }}
              <a 
                v-if="currentProvider?.trackingUrl" 
                :href="`${currentProvider.trackingUrl}?tracking=${shippingInfo.trackingNumber}`"
                target="_blank"
                class="external-link"
              >
                官網查詢
              </a>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">收件人</span>
            <span class="info-value">{{ shippingInfo.recipientName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">聯絡電話</span>
            <span class="info-value">{{ shippingInfo.recipientPhone }}</span>
          </div>
          <div class="info-item full-width">
            <span class="info-label">配送地址</span>
            <span class="info-value">{{ shippingInfo.shippingAddress }}</span>
          </div>
        </div>

        <!-- 時間資訊 -->
        <div class="time-info">
          <div v-if="shippingInfo.shippedDate" class="time-item">
            <i class="icon-clock"></i>
            <span>發貨時間：{{ formatDateTime(shippingInfo.shippedDate) }}</span>
          </div>
          <div v-if="shippingInfo.estimatedDeliveryDate" class="time-item">
            <i class="icon-calendar"></i>
            <span>預計送達：{{ formatDateTime(shippingInfo.estimatedDeliveryDate) }}</span>
          </div>
          <div v-if="shippingInfo.actualDeliveryDate" class="time-item success">
            <i class="icon-check"></i>
            <span>實際送達：{{ formatDateTime(shippingInfo.actualDeliveryDate) }}</span>
          </div>
        </div>
      </div>

      <!-- 進度條 -->
      <div class="progress-card">
        <h3 class="section-title">配送進度</h3>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${shippingProgress}%` }"
            ></div>
          </div>
          <div class="progress-labels">
            <span class="progress-label" :class="{ active: shippingInfo.status >= 0 }">已接單</span>
            <span class="progress-label" :class="{ active: shippingInfo.status >= 1 }">處理中</span>
            <span class="progress-label" :class="{ active: shippingInfo.status >= 2 }">已發貨</span>
            <span class="progress-label" :class="{ active: shippingInfo.status >= 3 }">運送中</span>
            <span class="progress-label" :class="{ active: shippingInfo.status >= 4 }">已送達</span>
          </div>
        </div>
      </div>

      <!-- 物流時間軸 -->
      <div class="timeline-card">
        <h3 class="section-title">物流追蹤記錄</h3>
        <div v-if="trackingLogs.length > 0" class="timeline">
          <div
            v-for="(log, index) in trackingLogs"
            :key="log.id"
            class="timeline-item"
            :class="{ 'first-item': index === 0 }"
          >
            <div class="timeline-marker">
              <span class="marker-dot"></span>
              <span v-if="index < trackingLogs.length - 1" class="marker-line"></span>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-status">{{ log.status }}</span>
                <span class="timeline-time">{{ formatDateTime(log.logTime) }}</span>
              </div>
              <div class="timeline-location">
                <i class="icon-location"></i>
                {{ log.location }}
              </div>
              <div class="timeline-description">{{ log.description }}</div>
            </div>
          </div>
        </div>
        <div v-else class="no-data">
          <i class="icon-empty"></i>
          <p>暫無物流追蹤記錄</p>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else-if="!loading && searched" class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>查無物流資訊</h3>
      <p>請確認輸入的訂單編號或物流單號是否正確</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 物流追蹤頁面
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 物流追蹤系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useShippingStore } from '@/stores/modules/shipping'
import { ShippingStatus } from '@/types/modules/order'

const route = useRoute()
const shippingStore = useShippingStore()

// 響應式數據
const searchNumber = ref('')
const searched = ref(false)

// 從 Store 獲取數據
const shippingInfo = computed(() => shippingStore.currentShipping)
const trackingLogs = computed(() => shippingStore.trackingLogs)
const currentProvider = computed(() => shippingStore.currentProvider)
const shippingProgress = computed(() => shippingStore.shippingProgress)
const loading = computed(() => shippingStore.loading)
const error = computed(() => shippingStore.error)

// 查詢物流資訊
const handleSearch = async () => {
  if (!searchNumber.value) {
    shippingStore.error = '請輸入訂單編號或物流單號'
    return
  }

  searched.value = true
  
  // 判斷是訂單編號還是物流單號
  if (searchNumber.value.startsWith('BUY')) {
    // 物流單號查詢
    await shippingStore.trackShipment(searchNumber.value)
  } else {
    // 訂單編號查詢
    const orderId = parseInt(searchNumber.value)
    if (!isNaN(orderId)) {
      await shippingStore.getShippingByOrderId(orderId)
    } else {
      shippingStore.error = '訂單編號格式錯誤'
    }
  }
}

// 狀態文字轉換
const getStatusText = (status: ShippingStatus): string => {
  const statusMap: Record<ShippingStatus, string> = {
    [ShippingStatus.Pending]: '待出貨',
    [ShippingStatus.Processing]: '準備中',
    [ShippingStatus.Shipped]: '已發貨',
    [ShippingStatus.InTransit]: '運送中',
    [ShippingStatus.Delivered]: '已送達',
    [ShippingStatus.Failed]: '配送失敗',
    [ShippingStatus.Returned]: '已退回'
  }
  return statusMap[status] || '未知狀態'
}

// 格式化日期時間
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
  // 如果從訂單詳情頁跳轉過來，自動查詢
  const trackingNumber = route.query.tracking as string
  const orderId = route.query.orderId as string
  
  if (trackingNumber) {
    searchNumber.value = trackingNumber
    handleSearch()
  } else if (orderId) {
    searchNumber.value = orderId
    handleSearch()
  }
})
</script>

<style scoped>
.tracking-container {
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

/* 搜索區域 */
.search-section {
  max-width: 600px;
  margin: 0 auto 40px;
}

.search-box {
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--blue);
}

.search-btn {
  padding: 12px 32px;
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover:not(:disabled) {
  background: var(--blue-dark);
}

.search-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 12px;
  padding: 12px;
  background: #fff5f5;
  border: 1px solid #ffdddd;
  border-radius: 6px;
  color: #d32f2f;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 內容區域 */
.tracking-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 資訊卡片 */
.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.shipping-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-0 { background: #f5f5f5; color: #666; }
.status-1 { background: #fff8e1; color: #f57c00; }
.status-2 { background: #e3f2fd; color: #1976d2; }
.status-3 { background: #e8f5e9; color: #388e3c; }
.status-4 { background: #e8f5e9; color: #2e7d32; }
.status-5 { background: #ffebee; color: #c62828; }
.status-6 { background: #fce4ec; color: #c2185b; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-label {
  font-size: 14px;
  color: #999;
}

.info-value {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.external-link {
  font-size: 14px;
  color: var(--blue);
  text-decoration: none;
  padding: 2px 8px;
  border: 1px solid var(--blue);
  border-radius: 4px;
  transition: all 0.3s;
}

.external-link:hover {
  background: var(--blue);
  color: white;
}

.time-info {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.time-item.success {
  color: #4caf50;
  font-weight: 500;
}

/* 進度條卡片 */
.progress-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.progress-bar-container {
  position: relative;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue) 0%, var(--blue-dark) 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
}

.progress-label {
  font-size: 14px;
  color: #999;
  position: relative;
  padding-top: 8px;
}

.progress-label::before {
  content: '';
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
  border: 2px solid white;
}

.progress-label.active {
  color: #333;
  font-weight: 500;
}

.progress-label.active::before {
  background: var(--blue);
}

/* 時間軸卡片 */
.timeline-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.timeline {
  position: relative;
  padding-left: 32px;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-item.first-item .timeline-content {
  background: #f0f7ff;
  padding: 12px;
  border-radius: 8px;
}

.timeline-marker {
  position: absolute;
  left: -32px;
  top: 0;
  width: 32px;
  height: 100%;
}

.marker-dot {
  position: absolute;
  top: 4px;
  left: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--blue);
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.marker-line {
  position: absolute;
  top: 20px;
  left: 15px;
  width: 2px;
  height: calc(100% - 20px);
  background: #e0e0e0;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-status {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.timeline-time {
  font-size: 14px;
  color: #999;
}

.timeline-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.timeline-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 空狀態 */
.empty-state, .no-data {
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
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item.full-width {
    grid-column: span 1;
  }
  
  .time-info {
    flex-direction: column;
  }
  
  .progress-labels {
    font-size: 12px;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 圖標 (簡單模擬) */
.icon-truck::before { content: '🚚'; }
.icon-alert::before { content: '⚠️'; }
.icon-clock::before { content: '⏰'; }
.icon-calendar::before { content: '📅'; }
.icon-check::before { content: '✅'; }
.icon-location::before { content: '📍'; }
.icon-empty::before { content: '📭'; }
</style>