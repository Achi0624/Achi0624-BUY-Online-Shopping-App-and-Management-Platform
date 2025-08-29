<script setup lang="ts">
/**
 * 訂單狀態組件
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 訂單管理系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { computed } from 'vue'

interface Props {
  status: number
  type?: 'order' | 'payment' | 'shipping'
  size?: 'small' | 'medium' | 'large'
  showIcon?: boolean
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'order',
  size: 'medium',
  showIcon: true,
  showLabel: true
})

// 訂單狀態配置 - 與後端系統同步
const orderStatusConfig: Record<number, { label: string; color: string; icon: string; bgColor: string }> = {
  0: { label: '已取消', color: '#ef4444', icon: '❌', bgColor: '#fee2e2' },
  1: { label: '待付款', color: '#6b7280', icon: '💳', bgColor: '#f3f4f6' },
  2: { label: '待確認', color: '#f59e0b', icon: '⏳', bgColor: '#fef3c7' },
  3: { label: '處理中', color: '#3b82f6', icon: '📦', bgColor: '#dbeafe' },
  4: { label: '待出貨', color: '#8b5cf6', icon: '📋', bgColor: '#ede9fe' },
  5: { label: '已出貨', color: '#8b5cf6', icon: '🚚', bgColor: '#ede9fe' },
  6: { label: '已送達', color: '#10b981', icon: '✅', bgColor: '#d1fae5' },
  7: { label: '已完成', color: '#10b981', icon: '🎉', bgColor: '#d1fae5' },
  8: { label: '退貨中', color: '#f59e0b', icon: '↩️', bgColor: '#fef3c7' },
  9: { label: '已退貨', color: '#6b7280', icon: '✗', bgColor: '#f3f4f6' }
}

// 付款狀態配置
const paymentStatusConfig: Record<number, { label: string; color: string; icon: string; bgColor: string }> = {
  0: { label: '待付款', color: '#6b7280', icon: '💳', bgColor: '#f3f4f6' },
  1: { label: '待付款', color: '#6b7280', icon: '💳', bgColor: '#f3f4f6' }, // 修正：1=未付款，顯示「待付款」
  2: { label: '已付款', color: '#10b981', icon: '✓', bgColor: '#d1fae5' }, // 修正：2=已付款
  3: { label: '退款中', color: '#f59e0b', icon: '⏳', bgColor: '#fef3c7' },
  4: { label: '已退款', color: '#8b5cf6', icon: '↩', bgColor: '#ede9fe' }
}

// 物流狀態配置
const shippingStatusConfig: Record<number, { label: string; color: string; icon: string; bgColor: string }> = {
  0: { label: '待發貨', color: '#6b7280', icon: '📦', bgColor: '#f3f4f6' },
  1: { label: '已發貨', color: '#3b82f6', icon: '🚚', bgColor: '#dbeafe' },
  2: { label: '運送中', color: '#f59e0b', icon: '🚛', bgColor: '#fef3c7' },
  3: { label: '派送中', color: '#8b5cf6', icon: '🏃', bgColor: '#ede9fe' },
  4: { label: '已送達', color: '#10b981', icon: '✓', bgColor: '#d1fae5' },
  5: { label: '已簽收', color: '#10b981', icon: '📝', bgColor: '#d1fae5' },
  6: { label: '配送失敗', color: '#ef4444', icon: '✗', bgColor: '#fee2e2' }
}

// 根據類型獲取配置
const statusConfig = computed(() => {
  switch (props.type) {
    case 'payment':
      return paymentStatusConfig[props.status] || paymentStatusConfig[0]
    case 'shipping':
      return shippingStatusConfig[props.status] || shippingStatusConfig[0]
    default:
      return orderStatusConfig[props.status] || orderStatusConfig[0]
  }
})

// 尺寸類名
const sizeClass = computed(() => {
  return `status-${props.size}`
})

// 進度百分比（用於進度條）
const progressPercentage = computed(() => {
  if (props.type === 'order') {
    // 訂單狀態進度 - 與後端系統同步
    if (props.status === 0) return 0 // 已取消
    if (props.status >= 8) return 0 // 退貨狀態
    if (props.status === 6 || props.status === 7) return 100 // 已送達/已完成
    // 正常進度: 1(待付款) -> 6(已送達) = 100%
    const normalizedStatus = Math.max(1, props.status) - 1 // 1-6 轉為 0-5
    return Math.min(100, (normalizedStatus / 5) * 100)
  } else if (props.type === 'shipping') {
    // 物流狀態進度
    const maxStatus = 5 // 已簽收
    if (props.status === 6) return 0 // 配送失敗
    if (props.status >= maxStatus) return 100
    return (props.status / maxStatus) * 100
  }
  return 0
})

// 是否顯示進度條
const showProgress = computed(() => {
  return props.type === 'order' || props.type === 'shipping'
})
</script>

<template>
  <div class="order-status" :class="sizeClass">
    <!-- 簡單徽章樣式 -->
    <div class="status-badge" :style="{ background: statusConfig.bgColor, color: statusConfig.color }">
      <span v-if="showIcon" class="status-icon">{{ statusConfig.icon }}</span>
      <span v-if="showLabel" class="status-label">{{ statusConfig.label }}</span>
    </div>
    
    <!-- 進度條（僅訂單和物流狀態顯示） -->
    <div v-if="showProgress && size !== 'small'" class="status-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ 
            width: `${progressPercentage}%`,
            background: statusConfig.color 
          }"
        ></div>
      </div>
      <div class="progress-text">{{ progressPercentage }}%</div>
    </div>
  </div>
</template>

<style scoped>
.order-status {
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.status-label {
  white-space: nowrap;
}

/* 小尺寸 */
.status-small .status-badge {
  padding: 2px 8px;
  font-size: 11px;
}

.status-small .status-icon {
  font-size: 10px;
}

/* 中等尺寸 */
.status-medium .status-badge {
  padding: 4px 12px;
  font-size: 12px;
}

.status-medium .status-icon {
  font-size: 12px;
}

/* 大尺寸 */
.status-large .status-badge {
  padding: 6px 16px;
  font-size: 14px;
}

.status-large .status-icon {
  font-size: 16px;
}

/* 進度條 */
.status-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: #6b7280;
  min-width: 30px;
  text-align: right;
}

/* 響應式調整 */
@media (max-width: 640px) {
  .status-progress {
    width: 100px;
  }
}
</style>