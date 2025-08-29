<template>
  <div class="shipping-status-component">
    <!-- 簡潔模式 -->
    <div v-if="mode === 'simple'" class="status-simple">
      <span class="status-badge" :class="`status-${status}`">
        <i class="status-icon"></i>
        {{ statusText }}
      </span>
    </div>

    <!-- 詳細模式 -->
    <div v-else-if="mode === 'detailed'" class="status-detailed">
      <div class="status-header">
        <div class="status-badge-large" :class="`status-${status}`">
          <i class="status-icon-large"></i>
          <span>{{ statusText }}</span>
        </div>
        <div v-if="trackingNumber" class="tracking-info">
          <span class="tracking-label">物流單號：</span>
          <span class="tracking-number">{{ trackingNumber }}</span>
          <button 
            v-if="canCopyTracking" 
            class="copy-btn"
            @click="copyTrackingNumber"
          >
            {{ copied ? '已複製' : '複製' }}
          </button>
        </div>
      </div>
      
      <div v-if="showProgress" class="status-progress">
        <div class="progress-steps">
          <div 
            v-for="step in progressSteps" 
            :key="step.value"
            class="progress-step"
            :class="{ 
              'active': status >= step.value,
              'current': status === step.value 
            }"
          >
            <div class="step-dot">
              <span v-if="status > step.value" class="check-icon">✓</span>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
        <div class="progress-line">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 內嵌模式 -->
    <div v-else-if="mode === 'inline'" class="status-inline">
      <i class="inline-icon" :class="`status-${status}`"></i>
      <span class="inline-text">{{ statusText }}</span>
      <span v-if="estimatedDate" class="inline-date">
        (預計 {{ formatDate(estimatedDate) }})
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 物流狀態顯示組件
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 物流追蹤系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { computed, ref } from 'vue'
import { ShippingStatus } from '@/types/modules/order'

// Props 定義
interface Props {
  status: ShippingStatus
  mode?: 'simple' | 'detailed' | 'inline'
  trackingNumber?: string
  estimatedDate?: string
  showProgress?: boolean
  canCopyTracking?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'simple',
  showProgress: true,
  canCopyTracking: true
})

// 狀態文字映射
const statusTextMap: Record<ShippingStatus, string> = {
  [ShippingStatus.Pending]: '待出貨',
  [ShippingStatus.Processing]: '準備中',
  [ShippingStatus.Shipped]: '已發貨',
  [ShippingStatus.InTransit]: '運送中',
  [ShippingStatus.Delivered]: '已送達',
  [ShippingStatus.Failed]: '配送失敗',
  [ShippingStatus.Returned]: '已退回'
}

// 進度步驟
const progressSteps = [
  { value: ShippingStatus.Pending, label: '待出貨' },
  { value: ShippingStatus.Processing, label: '準備中' },
  { value: ShippingStatus.Shipped, label: '已發貨' },
  { value: ShippingStatus.InTransit, label: '運送中' },
  { value: ShippingStatus.Delivered, label: '已送達' }
]

// 計算屬性
const statusText = computed(() => statusTextMap[props.status] || '未知狀態')

const progressPercentage = computed(() => {
  if (props.status === ShippingStatus.Failed || props.status === ShippingStatus.Returned) {
    return 0
  }
  const maxStep = 4 // Delivered
  return Math.min((props.status / maxStep) * 100, 100)
})

// 響應式數據
const copied = ref(false)

// 方法
const copyTrackingNumber = async () => {
  if (!props.trackingNumber) return
  
  try {
    await navigator.clipboard.writeText(props.trackingNumber)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('複製失敗:', error)
  }
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    month: 'numeric',
    day: 'numeric'
  })
}
</script>

<style scoped>
.shipping-status-component {
  font-family: inherit;
}

/* 簡潔模式 */
.status-simple {
  display: inline-block;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.status-icon::before {
  font-size: 14px;
}

/* 狀態顏色 */
.status-0 { 
  background: #f5f5f5; 
  color: #666;
}
.status-0 .status-icon::before { content: '⏳'; }

.status-1 { 
  background: #fff8e1; 
  color: #f57c00;
}
.status-1 .status-icon::before { content: '📦'; }

.status-2 { 
  background: #e3f2fd; 
  color: #1976d2;
}
.status-2 .status-icon::before { content: '🚚'; }

.status-3 { 
  background: #e8f5e9; 
  color: #388e3c;
}
.status-3 .status-icon::before { content: '🚛'; }

.status-4 { 
  background: #e8f5e9; 
  color: #2e7d32;
}
.status-4 .status-icon::before { content: '✅'; }

.status-5 { 
  background: #ffebee; 
  color: #c62828;
}
.status-5 .status-icon::before { content: '❌'; }

.status-6 { 
  background: #fce4ec; 
  color: #c2185b;
}
.status-6 .status-icon::before { content: '↩️'; }

/* 詳細模式 */
.status-detailed {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.status-badge-large {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

.status-icon-large::before {
  font-size: 20px;
}

.tracking-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.tracking-label {
  color: #666;
}

.tracking-number {
  font-family: monospace;
  font-weight: 500;
  color: #333;
}

.copy-btn {
  padding: 4px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.copy-btn:hover {
  background: #e0e0e0;
}

/* 進度條 */
.status-progress {
  position: relative;
  padding: 0 20px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0e0e0;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  transition: all 0.3s;
}

.progress-step.active .step-dot {
  background: var(--blue);
}

.progress-step.current .step-dot {
  background: var(--blue);
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.2);
}

.check-icon {
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.step-label {
  font-size: 12px;
  color: #999;
  text-align: center;
}

.progress-step.active .step-label {
  color: #333;
}

.progress-step.current .step-label {
  color: var(--blue);
  font-weight: 500;
}

.progress-line {
  position: absolute;
  top: 11px;
  left: 40px;
  right: 40px;
  height: 2px;
  background: #e0e0e0;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background: var(--blue);
  transition: width 0.5s ease;
}

/* 內嵌模式 */
.status-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.inline-icon::before {
  font-size: 16px;
}

.inline-text {
  font-weight: 500;
}

.inline-date {
  color: #666;
  font-size: 13px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .status-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .progress-steps {
    padding: 0;
  }
  
  .step-label {
    font-size: 11px;
  }
  
  .progress-line {
    left: 20px;
    right: 20px;
  }
}
</style>