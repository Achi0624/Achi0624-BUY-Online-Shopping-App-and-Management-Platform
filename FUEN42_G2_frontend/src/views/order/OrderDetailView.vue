<script setup lang="ts">
/**
 * 訂單詳情頁面
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 訂單管理系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/modules/order'
// import { mockOrders } from '@/utils/mockData' // 停用假資料

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

// 狀態
const loading = ref(false)
const activeTab = ref<'detail' | 'timeline' | 'invoice'>('detail')

// 使用computed簡化訂單訪問
const order = computed(() => orderStore.currentOrder)

// 訂單狀態映射
const orderStatusMap: Record<number, { label: string; color: string; icon: string }> = {
  0: { label: '待處理', color: 'gray', icon: '⏳' },
  1: { label: '已確認', color: 'blue', icon: '✓' },
  2: { label: '處理中', color: 'yellow', icon: '📦' },
  3: { label: '已出貨', color: 'purple', icon: '🚚' },
  4: { label: '已送達', color: 'green', icon: '📬' },
  5: { label: '已完成', color: 'green', icon: '✅' },
  6: { label: '已取消', color: 'red', icon: '❌' }
}

// 付款狀態映射
const paymentStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待付款', color: 'gray' },
  1: { label: '待付款', color: 'gray' },    // 修正：1=未付款，顯示「待付款」
  2: { label: '已付款', color: 'green' },   // 修正：2=已付款
  3: { label: '退款中', color: 'yellow' },
  4: { label: '已退款', color: 'purple' }
}

// 訂單時間軸
const timeline = computed(() => {
  if (!order.value) return []
  
  const events = [
    {
      time: order.value.createdAt,
      title: '訂單建立',
      description: '您的訂單已成功建立',
      completed: true
    }
  ]
  
  if (order.value.orderStatus >= 1) {
    events.push({
      time: order.value.createdAt,
      title: '訂單確認',
      description: '賣家已確認您的訂單',
      completed: true
    })
  }
  
  if (order.value.orderStatus >= 2) {
    events.push({
      time: order.value.createdAt,
      title: '處理中',
      description: '商品正在準備中',
      completed: true
    })
  }
  
  if (order.value.orderStatus >= 3) {
    events.push({
      time: order.value.createdAt,
      title: '已出貨',
      description: '商品已發貨，物流單號：TW123456789',
      completed: true
    })
  }
  
  if (order.value.orderStatus >= 4) {
    events.push({
      time: order.value.createdAt,
      title: '已送達',
      description: '商品已送達指定地址',
      completed: true
    })
  }
  
  if (order.value.orderStatus === 5) {
    events.push({
      time: order.value.createdAt,
      title: '訂單完成',
      description: '訂單已完成，感謝您的購買',
      completed: true
    })
  }
  
  if (order.value.orderStatus === 6) {
    events.push({
      time: order.value.createdAt,
      title: '訂單取消',
      description: '訂單已取消',
      completed: true
    })
  }
  
  return events
})

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 計算小計
const calculateSubtotal = (items: any[]) => {
  if (!items || !Array.isArray(items)) return 0
  return items.reduce((sum, item) => {
    // 使用 unitPrice 而不是 price，或者直接使用 subTotal 如果有的話
    const subtotal = item.subTotal || (item.unitPrice || 0) * (item.quantity || 0)
    return sum + subtotal
  }, 0)
}

// 複製訂單號
const copyOrderNumber = () => {
  if (!order.value) return
  navigator.clipboard.writeText(order.value.masterOrderNumber)
  alert('訂單編號已複製')
}

// 取消訂單
const cancelOrder = async () => {
  if (!confirm('確定要取消此訂單嗎？')) return
  
  try {
    loading.value = true
    await orderStore.cancelOrder(order.value.id, '用戶取消')
    // 重新載入訂單詳情以更新狀態
    await orderStore.fetchOrderDetail(order.value.id)
    alert('訂單已取消')
  } catch (error) {
    alert('取消訂單失敗')
  } finally {
    loading.value = false
  }
}

// 確認收貨
const confirmReceived = async () => {
  if (!confirm('確定已收到商品嗎？')) return
  
  try {
    loading.value = true
    await orderStore.confirmReceived(order.value.id)
    // 重新載入訂單詳情以更新狀態
    await orderStore.fetchOrderDetail(order.value.id)
    alert('已確認收貨')
  } catch (error) {
    alert('確認收貨失敗')
  } finally {
    loading.value = false
  }
}

// 申請退款
const requestRefund = () => {
  router.push(`/order/${order.value.id}/refund`)
}

// 聯絡客服
const contactSupport = () => {
  router.push(`/support?orderId=${order.value.id}`)
}

// 查看物流
const trackShipment = () => {
  router.push(`/tracking/${order.value.id}`)
}

// 載入訂單詳情
// C組 (蔡易霖) 修改: 使用真實 API
const loadOrder = async () => {
  loading.value = true
  try {
    const orderId = Number(route.params.id)
    console.log('訂單ID:', orderId, '原始參數:', route.params.id)
    
    // 驗證 orderId 是否為有效數字
    if (isNaN(orderId) || orderId <= 0) {
      console.error('無效的訂單ID:', route.params.id)
      alert('無效的訂單ID')
      router.push('/member/orders')
      return
    }
    
    // 調用真實 API
    await orderStore.fetchOrderDetail(orderId)
    console.log('從store獲取的訂單:', orderStore.currentOrder)
    
    // 詳細調試訂單結構
    if (orderStore.currentOrder) {
      console.log('📋 訂單詳細結構分析:')
      console.log('  - 主訂單資料:', {
        id: orderStore.currentOrder.id,
        masterOrderNumber: orderStore.currentOrder.masterOrderNumber,
        totalAmount: orderStore.currentOrder.totalAmount,
        finalAmount: orderStore.currentOrder.finalAmount,
        shippingFee: orderStore.currentOrder.shippingFee
      })
      
      if (orderStore.currentOrder.orders && orderStore.currentOrder.orders.length > 0) {
        console.log('  - 子訂單數量:', orderStore.currentOrder.orders.length)
        orderStore.currentOrder.orders.forEach((subOrder, index) => {
          console.log(`  - 子訂單 ${index + 1}:`, {
            orderNumber: subOrder.orderNumber,
            vendorName: subOrder.vendorName,
            itemsCount: subOrder.items?.length || 0
          })
          
          if (subOrder.items && subOrder.items.length > 0) {
            subOrder.items.forEach((item, itemIndex) => {
              console.log(`    - 商品 ${itemIndex + 1}:`, {
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subTotal: item.subTotal,
                price: item.price // 檢查是否有這個欄位
              })
            })
          }
        })
      }
    }
    
    if (!orderStore.currentOrder) {
      // 如果找不到，顯示錯誤
      console.error('訂單不存在')
      alert('訂單不存在')
      router.push('/member/orders')
      return
    }
    
    console.log('訂單載入完成，設置loading為false')
  } catch (error) {
    console.error('載入訂單失敗:', error)
    alert('載入訂單失敗')
    router.push('/member/orders')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<template>
  <div class="order-detail-container">
    <!-- 載入中 -->
    <div v-if="loading" class="loading">
      載入中...
    </div>

    <!-- 訂單詳情 -->
    <div v-else-if="order">
      <!-- 頁面標題 -->
      <div class="page-header">
        <button class="back-btn" @click="router.push('/member/orders')">
          ← 返回訂單列表
        </button>
        <h1>訂單詳情</h1>
      </div>

      <!-- 訂單狀態卡片 -->
      <div class="status-card">
        <div class="status-icon">
          {{ orderStatusMap[order?.orderStatus || 0]?.icon || '❓' }}
        </div>
        <div class="status-info">
          <h2>{{ orderStatusMap[order?.orderStatus || 0]?.label || `未知狀態(${order?.orderStatus || 0})` }}</h2>
          <p>訂單編號：{{ order?.masterOrderNumber || '載入中...' }}</p>
          <p>下單時間：{{ order?.createdAt ? formatDate(order.createdAt) : '載入中...' }}</p>
        </div>
        <div class="status-actions">
          <button class="btn btn-outline" @click="copyOrderNumber">
            複製訂單號
          </button>
          <button 
            v-if="order?.orderStatus === 3 || order?.orderStatus === 4"
            class="btn btn-primary"
            @click="trackShipment"
          >
            查看物流
          </button>
        </div>
      </div>

      <!-- 標籤切換 -->
      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'detail' }"
          @click="activeTab = 'detail'"
        >
          訂單明細
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'timeline' }"
          @click="activeTab = 'timeline'"
        >
          訂單追蹤
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'invoice' }"
          @click="activeTab = 'invoice'"
        >
          發票資訊
        </button>
      </div>

      <!-- 訂單明細 -->
      <div v-show="activeTab === 'detail'" class="tab-content">
        <!-- 收件資訊 -->
        <div class="info-section">
          <h3>收件資訊</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">收件人：</span>
              <span class="info-value">{{ order.recipientName || '王小明' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">聯絡電話：</span>
              <span class="info-value">{{ order.recipientPhone || '0912345678' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">收件地址：</span>
              <span class="info-value">{{ order.shippingAddress || '台北市大安區忠孝東路三段123號5樓' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">配送方式：</span>
              <span class="info-value">{{ order.shippingMethod || '宅配' }}</span>
            </div>
          </div>
        </div>

        <!-- 付款資訊 -->
        <div class="info-section">
          <h3>付款資訊</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">付款方式：</span>
              <span class="info-value">{{ order.paymentMethod || '信用卡' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">付款狀態：</span>
              <span 
                class="status-badge"
                :class="`status-${paymentStatusMap[order.paymentStatus ?? 0]?.color || 'gray'}`"
              >
                {{ paymentStatusMap[order.paymentStatus ?? 0]?.label || '待付款' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 商品明細 -->
        <div class="info-section">
          <h3>商品明細</h3>
          <div v-for="subOrder in (order.orders || [])" :key="subOrder.id" class="vendor-section">
            <div class="vendor-header">
              <span class="vendor-name">{{ subOrder.vendorName || '未知廠商' }}</span>
              <span class="sub-order-number">子訂單：{{ subOrder.orderNumber || '無編號' }}</span>
            </div>
            <div class="items-table">
              <div v-for="item in (subOrder.items || [])" :key="item.productName || item.id" class="item-row">
                <img :src="item.imageUrl || '/placeholder.jpg'" :alt="item.productName || '商品'" class="item-image">
                <div class="item-details">
                  <div class="item-name">{{ item.productName || '未知商品' }}</div>
                  <div class="item-spec" v-if="item.specName">規格：{{ item.specName }}</div>
                </div>
                <div class="item-quantity">x {{ item.quantity || 0 }}</div>
                <div class="item-price">NT$ {{ (item.unitPrice || 0).toLocaleString() }}</div>
                <div class="item-subtotal">NT$ {{ (item.subTotal || 0).toLocaleString() }}</div>
              </div>
              <div class="vendor-subtotal">
                <span>小計：</span>
                <span>NT$ {{ (calculateSubtotal(subOrder.items || [])).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 金額明細 -->
        <div class="amount-section">
          <div class="amount-row">
            <span>商品總額</span>
            <span>NT$ {{ ((order?.totalAmount || 0)).toLocaleString() }}</span>
          </div>
          <div class="amount-row">
            <span>運費</span>
            <span>NT$ {{ (order?.shippingFee || 0).toLocaleString() }}</span>
          </div>
          <div class="amount-row" v-if="order?.discount">
            <span>優惠折扣</span>
            <span class="discount">-NT$ {{ ((order?.discount || 0)).toLocaleString() }}</span>
          </div>
          <div class="amount-row total">
            <span>應付金額</span>
            <span>NT$ {{ ((order?.finalAmount || 0)).toLocaleString() }}</span>
          </div>
        </div>

        <!-- 訂單備註 -->
        <div class="info-section" v-if="order.note">
          <h3>訂單備註</h3>
          <p class="note-content">{{ order.note }}</p>
        </div>
      </div>

      <!-- 訂單追蹤 -->
      <div v-show="activeTab === 'timeline'" class="tab-content">
        <div class="timeline">
          <div 
            v-for="(event, index) in timeline" 
            :key="index"
            class="timeline-item"
            :class="{ completed: event.completed }"
          >
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-time">{{ formatDate(event.time) }}</div>
              <div class="timeline-title">{{ event.title }}</div>
              <div class="timeline-description">{{ event.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 發票資訊 -->
      <div v-show="activeTab === 'invoice'" class="tab-content">
        <div class="info-section">
          <h3>發票資訊</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">發票類型：</span>
              <span class="info-value">電子發票</span>
            </div>
            <div class="info-item">
              <span class="info-label">載具類型：</span>
              <span class="info-value">會員載具</span>
            </div>
            <div class="info-item">
              <span class="info-label">發票號碼：</span>
              <span class="info-value">{{ order.invoiceNumber || 'AB12345678' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">開立日期：</span>
              <span class="info-value">{{ formatDate(order.createdAt) }}</span>
            </div>
          </div>
          <button class="btn btn-outline">
            下載發票
          </button>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="action-section">
        <button 
          v-if="order?.orderStatus === 0 || order?.orderStatus === 1"
          class="btn btn-danger"
          @click="cancelOrder"
        >
          取消訂單
        </button>
        <button 
          v-if="order?.orderStatus === 3 || order?.orderStatus === 4"
          class="btn btn-primary"
          @click="confirmReceived"
        >
          確認收貨
        </button>
        <button 
          v-if="order?.orderStatus === 5"
          class="btn btn-outline"
          @click="requestRefund"
        >
          申請退款
        </button>
        <button class="btn btn-outline" @click="contactSupport">
          聯絡客服
        </button>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else class="error-state">
      <p>訂單不存在或載入失敗</p>
      <button class="btn btn-primary" @click="router.push('/member/orders')">
        返回訂單列表
      </button>
    </div>
  </div>
</template>

<style scoped>
.order-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.page-header {
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
  padding: 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-icon {
  font-size: 48px;
}

.status-info {
  flex: 1;
}

.status-info h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #111827;
}

.status-info p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 14px;
}

.status-actions {
  display: flex;
  gap: 12px;
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

.tab-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-section {
  margin-bottom: 32px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #6b7280;
  font-size: 14px;
}

.info-value {
  color: #111827;
  font-size: 14px;
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

.status-green {
  background: #d1fae5;
  color: #065f46;
}

.status-red {
  background: #fee2e2;
  color: #991b1b;
}

.status-yellow {
  background: #fef3c7;
  color: #92400e;
}

.status-purple {
  background: #ede9fe;
  color: #5b21b6;
}

.vendor-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.vendor-header {
  background: #f9fafb;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vendor-name {
  font-weight: 500;
  color: #3b82f6;
  font-size: 14px;
}

.sub-order-number {
  color: #6b7280;
  font-size: 12px;
}

.items-table {
  padding: 16px;
}

.item-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px 100px;
  gap: 16px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.item-row:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #f3f4f6;
}

.item-details {
  flex: 1;
}

.item-name {
  color: #111827;
  font-size: 14px;
  margin-bottom: 4px;
}

.item-spec {
  color: #6b7280;
  font-size: 12px;
}

.item-quantity {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.item-price,
.item-subtotal {
  text-align: right;
  color: #111827;
  font-size: 14px;
  font-weight: 500;
}

.vendor-subtotal {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #e5e7eb;
  font-weight: 500;
  color: #111827;
}

.amount-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  margin-top: 20px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.amount-row.total {
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
  padding-top: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.discount {
  color: #ef4444;
}

.note-content {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 20px;
  bottom: 20px;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  margin-bottom: 32px;
}

.timeline-marker {
  position: absolute;
  left: -30px;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
}

.timeline-item.completed .timeline-marker {
  background: #3b82f6;
  border-color: #3b82f6;
}

.timeline-content {
  padding: 0;
}

.timeline-time {
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 4px;
}

.timeline-title {
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.timeline-description {
  color: #6b7280;
  font-size: 14px;
}

.action-section {
  margin-top: 32px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
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

.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-state p {
  color: #6b7280;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .status-card {
    flex-direction: column;
    text-align: center;
  }
  
  .status-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .item-row {
    grid-template-columns: 60px 1fr;
    gap: 12px;
  }
  
  .item-quantity,
  .item-price,
  .item-subtotal {
    display: none;
  }
  
  .action-section {
    flex-direction: column;
  }
}
</style>