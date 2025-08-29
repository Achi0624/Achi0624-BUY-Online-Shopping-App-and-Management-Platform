<script setup lang="ts">
/**
 * 付款詳情頁面 - 顯示訂單詳情和狀態
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 付款詳情展示
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/modules/order'
import { useUserStore } from '@/stores/user'
import { paymentApi } from '@/api/modules/payment'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

// 狀態
const loading = ref(false)
const order = ref<any>(null)
const paymentStatus = ref<any>(null)

// 計算屬性
const orderId = computed(() => Number(route.params.orderId))

// 格式化金額
const formatAmount = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'NT$ 0'
  }
  return `NT$ ${amount.toLocaleString()}`
}

// 格式化日期
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '未設定'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 取得訂單狀態文字
const getOrderStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待確認',
    1: '已確認',
    2: '處理中',
    3: '已出貨',
    4: '已完成',
    5: '已取消'
  }
  return statusMap[status] || '未知狀態'
}

// 取得訂單狀態樣式
const getOrderStatusClass = (status: number) => {
  const classMap: Record<number, string> = {
    0: 'status-pending',
    1: 'status-confirmed',
    2: 'status-processing',
    3: 'status-shipped',
    4: 'status-completed',
    5: 'status-cancelled'
  }
  return classMap[status] || 'status-unknown'
}

// 取得付款狀態文字
const getPaymentStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待付款',
    'processing': '處理中',
    'success': '已付款',
    'failed': '付款失敗',
    'cancelled': '已取消',
    'refunded': '已退款'
  }
  return statusMap[status] || '未知狀態'
}

// 取得付款狀態樣式
const getPaymentStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    'pending': 'status-pending',
    'processing': 'status-processing',
    'success': 'status-success',
    'failed': 'status-failed',
    'cancelled': 'status-cancelled',
    'refunded': 'status-refunded'
  }
  return classMap[status] || 'status-unknown'
}

// 載入訂單詳情
const loadOrderDetails = async () => {
  try {
    loading.value = true
    
    // 載入訂單詳情
    await orderStore.fetchOrderDetail(orderId.value)
    order.value = orderStore.currentOrder
    
    if (!order.value) {
      throw new Error('訂單不存在')
    }
    
    // 載入付款狀態
    await loadPaymentStatus()
    
  } catch (error) {
    console.error('載入訂單詳情失敗:', error)
    alert('載入訂單資料失敗')
    router.push('/member/orders')
  } finally {
    loading.value = false
  }
}

// 載入付款狀態
const loadPaymentStatus = async () => {
  try {
    if (!order.value?.masterOrderNumber) return
    
    const response = await paymentApi.getPaymentStatusByOrderNumber(order.value.masterOrderNumber)
    paymentStatus.value = response.data
    
  } catch (error) {
    console.error('載入付款狀態失敗:', error)
    // 不阻斷頁面載入，只是無法顯示付款狀態
  }
}

// 前往付款確認頁面
const goToPaymentConfirmation = () => {
  router.push(`/payment/confirm/${orderId.value}`)
}

// 查看物流追蹤
const trackShipment = (trackingNumber: string) => {
  if (trackingNumber) {
    router.push(`/tracking/${trackingNumber}`)
  } else {
    alert('尚無追蹤號碼')
  }
}

// 聯絡客服
const contactSupport = () => {
  router.push('/support')
}

// 返回訂單列表
const backToOrders = () => {
  router.push('/member/orders')
}

// 頁面初始化
onMounted(() => {
  loadOrderDetails()
})
</script>

<template>
  <div class="payment-details-container">
    <!-- 載入中 -->
    <div v-if="loading && !order" class="loading-state">
      <div class="loading-spinner"></div>
      <p>載入訂單詳情中...</p>
    </div>

    <!-- 訂單詳情內容 -->
    <div v-else-if="order" class="payment-details-content">
      <!-- 頁面標題 -->
      <div class="page-header">
        <div class="header-left">
          <h1>訂單詳情</h1>
          <p class="order-number">訂單編號：{{ order.masterOrderNumber }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="backToOrders">
            返回訂單列表
          </button>
        </div>
      </div>

      <!-- 訂單狀態卡片 -->
      <div class="status-overview">
        <div class="status-card">
          <div class="status-header">
            <h3>訂單狀態</h3>
            <div class="status-badge" :class="getOrderStatusClass(order.status)">
              {{ getOrderStatusText(order.status) }}
            </div>
          </div>
          <div class="status-details">
            <div class="status-item">
              <span class="label">下單時間：</span>
              <span class="value">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="status-item">
              <span class="label">最後更新：</span>
              <span class="value">{{ formatDate(order.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="status-card" v-if="paymentStatus">
          <div class="status-header">
            <h3>付款狀態</h3>
            <div class="status-badge" :class="getPaymentStatusClass(paymentStatus.status)">
              {{ getPaymentStatusText(paymentStatus.status) }}
            </div>
          </div>
          <div class="status-details">
            <div class="status-item">
              <span class="label">應付金額：</span>
              <span class="value">{{ formatAmount(paymentStatus.amount) }}</span>
            </div>
            <div class="status-item" v-if="paymentStatus.paidAt">
              <span class="label">付款時間：</span>
              <span class="value">{{ formatDate(paymentStatus.paidAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 收貨資訊 -->
      <div class="info-card">
        <h3>收貨資訊</h3>
        <div class="info-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">收件人：</span>
              <span class="value">{{ order.recipientName }}</span>
            </div>
            <div class="info-item">
              <span class="label">聯絡電話：</span>
              <span class="value">{{ order.recipientPhone }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">收貨地址：</span>
              <span class="value">{{ order.shippingAddress }}</span>
            </div>
            <div class="info-item full-width" v-if="order.note">
              <span class="label">備註：</span>
              <span class="value">{{ order.note }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品清單 -->
      <div class="products-card">
        <h3>商品清單</h3>
        <div class="products-content">
          <div v-for="subOrder in order.orders" :key="subOrder.id" class="vendor-section">
            <div class="vendor-header">
              <div class="vendor-info">
                <h4>{{ subOrder.vendorName }}</h4>
                <span class="vendor-status" :class="getOrderStatusClass(subOrder.status)">
                  {{ getOrderStatusText(subOrder.status) }}
                </span>
              </div>
              <div class="vendor-actions" v-if="subOrder.trackingNumber">
                <button class="btn btn-outline btn-sm" @click="trackShipment(subOrder.trackingNumber)">
                  追蹤物流
                </button>
              </div>
            </div>
            
            <div class="products-list">
              <div v-for="item in subOrder.items" :key="item.productName" class="product-item">
                <div class="product-image">
                  <img :src="item.imageUrl" :alt="item.productName">
                </div>
                <div class="product-info">
                  <div class="product-name">{{ item.productName }}</div>
                  <div class="product-meta">
                    <span class="product-price">{{ formatAmount(item.price) }}</span>
                    <span class="product-quantity">x {{ item.quantity }}</span>
                    <span class="product-subtotal">{{ formatAmount(item.price * item.quantity) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="vendor-summary">
              <div class="summary-row">
                <span>運費</span>
                <span>{{ formatAmount(subOrder.shippingFee) }}</span>
              </div>
              <div class="summary-row total">
                <span>小計</span>
                <span>{{ formatAmount(subOrder.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 費用明細 -->
      <div class="summary-card">
        <h3>費用明細</h3>
        <div class="summary-content">
          <div class="summary-row">
            <span>商品總額</span>
            <span>{{ formatAmount(order.totalAmount) }}</span>
          </div>
          <div class="summary-row">
            <span>運費</span>
            <span>{{ formatAmount(order.shippingFee) }}</span>
          </div>
          <div class="summary-row" v-if="order.discountAmount > 0">
            <span>優惠折扣</span>
            <span class="discount">-{{ formatAmount(order.discountAmount) }}</span>
          </div>
          <div class="summary-row total">
            <span>應付總額</span>
            <span>{{ formatAmount(order.finalAmount) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="actions-card">
        <div class="actions-content">
          <template v-if="paymentStatus?.status === 'pending'">
            <button class="btn btn-primary" @click="goToPaymentConfirmation">
              立即付款
            </button>
          </template>
          
          <template v-if="order.status === 3"> <!-- 已出貨 -->
            <button class="btn btn-success" @click="trackShipment('')">
              追蹤物流
            </button>
          </template>

          <button class="btn btn-outline" @click="contactSupport">
            聯絡客服
          </button>
        </div>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else class="error-state">
      <div class="error-icon">❌</div>
      <h2>載入失敗</h2>
      <p>無法載入訂單資訊，請重新嘗試</p>
      <button class="btn btn-primary" @click="backToOrders">
        返回訂單列表
      </button>
    </div>
  </div>
</template>

<style scoped>
.payment-details-container {
  max-width: 1000px;
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.order-number {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.status-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.status-pending {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.status-confirmed {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.status-processing {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-badge.status-shipped {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.status-completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.status-cancelled {
  background: #ffebee;
  color: #c62828;
}

.status-badge.status-success {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.status-failed {
  background: #ffebee;
  color: #c62828;
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-item .label {
  color: #666;
  font-size: 14px;
}

.status-item .value {
  font-weight: 500;
  color: #1a1a1a;
}

.info-card,
.products-card,
.summary-card,
.actions-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.info-card h3,
.products-card h3,
.summary-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.info-item .value {
  color: #1a1a1a;
  font-weight: 500;
}

.vendor-section {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

.vendor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #f0f0f0;
}

.vendor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vendor-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.vendor-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.products-list {
  padding: 0;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.product-price {
  color: #e53e3e;
  font-weight: 600;
}

.product-quantity {
  color: #666;
}

.product-subtotal {
  color: #1a1a1a;
  font-weight: 600;
  margin-left: auto;
}

.vendor-summary {
  padding: 16px 20px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 600;
  color: #e53e3e;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
  padding-top: 16px;
}

.discount {
  color: #2e7d32;
}

.actions-content {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 12px;
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

@media (max-width: 768px) {
  .payment-details-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .status-overview {
    grid-template-columns: 1fr;
  }

  .vendor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .product-meta {
    flex-direction: column;
    gap: 8px;
  }

  .actions-content {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>