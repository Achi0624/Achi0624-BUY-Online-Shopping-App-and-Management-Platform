<template>
  <div class="cart-summary">
    <div class="summary-header">
      <h3>購物清單</h3>
    </div>
    
    <div class="summary-body">
      <!-- 商品統計 -->
      <div class="summary-row">
        <span class="label">商品件數</span>
        <span class="value">{{ summary.totalItems }} 件</span>
      </div>
      
      <!-- 小計 -->
      <div class="summary-row">
        <span class="label">商品小計</span>
        <span class="value">NT$ {{ formatPrice(summary.totalAmount) }}</span>
      </div>
      
      <!-- 優惠折扣 -->
      <div v-if="summary.totalDiscount > 0" class="summary-row discount">
        <span class="label">優惠折扣</span>
        <span class="value">-NT$ {{ formatPrice(summary.totalDiscount) }}</span>
      </div>
      
      <!-- 運費 -->
      <div class="summary-row">
        <span class="label">
          運費
          <span v-if="summary.shippingFee === 0" class="free-shipping">
            (免運費)
          </span>
        </span>
        <span class="value">
          <span v-if="summary.shippingFee > 0">
            NT$ {{ formatPrice(summary.shippingFee) }}
          </span>
          <span v-else class="free">免費</span>
        </span>
      </div>
      
      <!-- 運費提示 -->
      <div v-if="freeShippingTip" class="shipping-tip">
        <i class="icon-info">ℹ️</i>
        {{ freeShippingTip }}
      </div>
    </div>
    
    <div class="summary-footer">
      <!-- 總計 -->
      <div class="total-row">
        <span class="total-label">總計</span>
        <span class="total-value">NT$ {{ formatPrice(summary.finalAmount) }}</span>
      </div>
      
      <!-- 操作按鈕 -->
      <div class="action-buttons">
        <slot name="actions">
          <button 
            class="btn-checkout"
            :disabled="!canCheckout"
            @click="$emit('checkout')"
          >
            前往結帳 ({{ selectedCount }})
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 購物車摘要組件
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 購物車系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { computed } from 'vue'
import type { CartSummary } from '@/stores/modules/cart'

// Props
interface Props {
  summary: CartSummary
  selectedCount?: number
  canCheckout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedCount: 0,
  canCheckout: false
})

// Emits
const emit = defineEmits<{
  'checkout': []
}>()

/**
 * 格式化價格
 */
const formatPrice = (price: number | undefined): string => {
  return (price || 0).toLocaleString('zh-TW')
}

/**
 * 免運費提示
 */
const freeShippingTip = computed(() => {
  if (props.summary.shippingFee === 0) return null
  
  const threshold = 1000 // 免運門檻
  const remaining = threshold - props.summary.totalAmount
  
  if (remaining > 0) {
    return `再購買 NT$ ${formatPrice(remaining)} 即可享免運費`
  }
  
  return null
})
</script>

<style scoped>
.cart-summary {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  position: sticky;
  top: 20px;
}

.summary-header {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e5;
}

.summary-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.summary-body {
  padding: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
}

.value {
  font-weight: 500;
  color: #333;
}

.summary-row.discount .label {
  color: #e74c3c;
}

.summary-row.discount .value {
  color: #e74c3c;
}

.free-shipping {
  font-size: 12px;
  color: #27ae60;
  font-weight: normal;
}

.free {
  color: #27ae60;
  font-weight: 600;
}

.shipping-tip {
  background: #e8f5e8;
  color: #27ae60;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.summary-footer {
  padding: 20px;
  border-top: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.total-label {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
  color: #e74c3c;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-checkout {
  width: 100%;
  height: 48px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-checkout:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-1px);
}

.btn-checkout:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .cart-summary {
    position: static;
    margin-top: 20px;
  }
  
  .summary-header,
  .summary-body,
  .summary-footer {
    padding: 16px;
  }
  
  .total-label {
    font-size: 16px;
  }
  
  .total-value {
    font-size: 18px;
  }
  
  .btn-checkout {
    height: 44px;
    font-size: 15px;
  }
}

/* 動畫效果 */
.summary-row,
.total-row {
  transition: all 0.3s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.total-value {
  animation: pulse 0.5s ease-in-out;
}
</style>