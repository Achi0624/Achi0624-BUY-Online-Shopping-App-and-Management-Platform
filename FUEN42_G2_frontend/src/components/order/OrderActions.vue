<script setup lang="ts">
/**
 * 訂單操作組件
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 訂單管理系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  orderId: number
  orderStatus: number
  paymentStatus: number
  orderType?: 'master' | 'sub'
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  orderType: 'master',
  compact: false
})

const emit = defineEmits<{
  cancel: []
  confirm: []
  refund: []
  review: []
  track: []
  reorder: []
  contact: []
  pay: []
}>()

const router = useRouter()

// 可用操作列表
const availableActions = computed(() => {
  const actions = []
  
  // 根據訂單狀態決定可用操作
  switch (props.orderStatus) {
    case 0: // 待處理
    case 1: // 已確認
      if (props.paymentStatus === 0) {
        actions.push({
          key: 'pay',
          label: '立即付款',
          type: 'primary',
          icon: '💳'
        })
      }
      actions.push({
        key: 'cancel',
        label: '取消訂單',
        type: 'danger',
        icon: '❌'
      })
      break
      
    case 2: // 處理中
      actions.push({
        key: 'contact',
        label: '聯絡賣家',
        type: 'default',
        icon: '💬'
      })
      break
      
    case 3: // 已出貨
    case 4: // 已送達
      actions.push({
        key: 'track',
        label: '查看物流',
        type: 'primary',
        icon: '🚚'
      })
      actions.push({
        key: 'confirm',
        label: '確認收貨',
        type: 'success',
        icon: '✓'
      })
      break
      
    case 5: // 已完成
      actions.push({
        key: 'review',
        label: '評價商品',
        type: 'primary',
        icon: '⭐'
      })
      actions.push({
        key: 'reorder',
        label: '再次購買',
        type: 'default',
        icon: '🛒'
      })
      if (props.paymentStatus === 1) {
        actions.push({
          key: 'refund',
          label: '申請退款',
          type: 'warning',
          icon: '↩️'
        })
      }
      break
      
    case 6: // 已取消
      actions.push({
        key: 'reorder',
        label: '再次購買',
        type: 'primary',
        icon: '🛒'
      })
      break
  }
  
  // 所有狀態都可以聯絡客服
  actions.push({
    key: 'contact',
    label: '聯絡客服',
    type: 'default',
    icon: '🎧'
  })
  
  return actions
})

// 處理操作點擊
const handleAction = (actionKey: string) => {
  switch (actionKey) {
    case 'cancel':
      if (confirm('確定要取消此訂單嗎？')) {
        emit('cancel')
      }
      break
      
    case 'confirm':
      if (confirm('確定已收到商品嗎？')) {
        emit('confirm')
      }
      break
      
    case 'refund':
      emit('refund')
      router.push(`/order/${props.orderId}/refund`)
      break
      
    case 'review':
      emit('review')
      router.push(`/order/${props.orderId}/review`)
      break
      
    case 'track':
      emit('track')
      router.push(`/tracking/${props.orderId}`)
      break
      
    case 'reorder':
      emit('reorder')
      break
      
    case 'contact':
      emit('contact')
      router.push(`/support?orderId=${props.orderId}`)
      break
      
    case 'pay':
      emit('pay')
      router.push(`/payment/${props.orderId}`)
      break
  }
}

// 按鈕樣式類
const getButtonClass = (type: string) => {
  const baseClass = 'action-btn'
  const typeClasses: Record<string, string> = {
    primary: 'btn-primary',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-danger',
    default: 'btn-default'
  }
  return `${baseClass} ${typeClasses[type] || typeClasses.default}`
}
</script>

<template>
  <div class="order-actions" :class="{ compact }">
    <button
      v-for="action in availableActions"
      :key="action.key"
      :class="getButtonClass(action.type)"
      @click="handleAction(action.key)"
    >
      <span v-if="!compact" class="action-icon">{{ action.icon }}</span>
      <span class="action-label">{{ action.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.order-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.order-actions.compact {
  gap: 4px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.compact .action-btn {
  padding: 6px 12px;
  font-size: 13px;
}

.action-icon {
  font-size: 14px;
}

.action-label {
  line-height: 1;
}

/* 按鈕類型樣式 */
.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-default {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-default:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 禁用狀態 */
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* 響應式設計 */
@media (max-width: 640px) {
  .order-actions:not(.compact) {
    flex-direction: column;
  }
  
  .order-actions:not(.compact) .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>