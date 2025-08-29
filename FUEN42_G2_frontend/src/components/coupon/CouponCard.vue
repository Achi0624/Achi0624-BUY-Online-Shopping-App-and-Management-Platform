<script setup lang="ts">
import { computed } from 'vue'
import type { CouponAPI } from '@/types/api'

interface Props {
  coupon: CouponAPI.CouponInfo
  showActions?: boolean
  disabled?: boolean
  claimed?: boolean
}

interface Emits {
  claim: [coupon: CouponAPI.CouponInfo]
  use: [coupon: CouponAPI.CouponInfo]
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  disabled: false,
  claimed: false
})

const emit = defineEmits<Emits>()

const isExpired = computed(() => new Date(props.coupon.endAt) < new Date())
const isOutOfStock = computed(() => props.coupon.issuedQty >= props.coupon.totalQty)
const isActive = computed(() => props.coupon.status === 1 && !props.coupon.isDeleted)
const canClaim = computed(() => !props.claimed && isActive.value && !isExpired.value && !isOutOfStock.value)

const discountText = computed(() => props.coupon.discountType === 1 ? `NT$ ${props.coupon.discountValue}` : `${props.coupon.discountValue}%`)

// 固定左側寬度，確保所有卡片左側區塊寬度一致，避免虛線不齊
const leftWidth = '140px'

const statusText = computed(() => {
  if (isExpired.value) return '已過期'
  if (props.claimed) return '已領取'
  return ''
})

const statusClass = computed(() => (isExpired.value ? 'expired' : props.claimed ? 'claimed' : 'unclaimed'))

const handleClaim = () => { if (canClaim.value && !props.disabled) emit('claim', props.coupon) }
const handleUse = () => { if (!props.disabled) emit('use', props.coupon) }

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
</script>

<template>
  <div class="coupon-card unified-height" :class="{ disabled: disabled || !canClaim }">
    <div class="coupon-left" :style="{ width: leftWidth }">
      <div class="discount-amount">
        <span class="amount">{{ discountText }}</span>
        <span class="off-text">{{ coupon.discountType === 1 ? '折抵' : '折扣' }}</span>
      </div>
      <div class="coupon-type">{{ coupon.couponType === 1 ? '平台券' : '廠商券' }}</div>
    </div>

    <div class="coupon-divider" aria-hidden></div>

    <div class="coupon-center">
      <div class="coupon-main-info">
        <h3 class="coupon-name">{{ coupon.couponName }}</h3>
        <div class="coupon-code">{{ coupon.couponCode }}</div>
      </div>

      <div class="coupon-details">
        <div class="coupon-conditions" v-if="coupon.minimumAmount">消費滿 NT$ {{ coupon.minimumAmount }}</div>
        <div class="validity-period"><small>有效期限：{{ formatDate(coupon.startAt) }} - {{ formatDate(coupon.endAt) }}</small></div>
        <div class="coupon-description" v-if="coupon.description">{{ coupon.description }}</div>
      </div>
    </div>

    <div class="coupon-right">
      <div class="coupon-status-info">
        <div class="stock-info"><small>剩餘 {{ coupon.totalQty - coupon.issuedQty }} / {{ coupon.totalQty }}</small></div>
        <div v-if="statusText" class="coupon-status" :class="statusClass">{{ statusText }}</div>
      </div>

      <div class="coupon-actions" v-if="showActions">
        <button class="btn btn-primary" :disabled="claimed || !canClaim || disabled" @click="handleClaim">{{ claimed ? '已領取' : '立即領取' }}</button>
        <button class="btn btn-secondary" :disabled="disabled" @click="handleUse">立即使用</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container */
.coupon-card {
  display: flex;
  align-items: stretch; /* 等高 */
  background: transparent; /* 讓左右與中間區塊各自呈現背景 */
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(11, 18, 32, 0.04);
  transition: transform 0.12s, box-shadow 0.12s;
  color: #fff;
  min-height: 160px;
}

.coupon-card.unified-height { min-height: 180px; height: 180px }

.coupon-card:hover:not(.disabled) { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(15,23,42,0.12) }
.coupon-card.disabled { opacity: 0.6; cursor: not-allowed }

/* Left */
.coupon-left {
  background: #0b1220;
  color: #fff;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
  /* 使用固定寬度避免不同卡片左側寬度造成虛線不齊 */
  flex: 0 0 140px;
  width: 140px;
  min-width: 140px;
  max-width: 140px;
  border-right: 1px dashed rgba(255,255,255,0.12); /* 白色虛線邊界 */
  align-self: stretch; /* 確保與兄弟元素等高 */
}

.discount-amount { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px }
.amount { font-size: 32px; font-weight: 900; line-height: 1 }
.off-text { font-size: 12px; opacity: 0.9 }
.coupon-type { background: rgba(255,255,255,0.12); padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 600 }

/* Divider */
.coupon-divider {
  display: none; /* hide on desktop; visual separator provided by coupon-left border-right */
}

/* Center */
.coupon-center {
  flex: 1;
  padding: 18px 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  background: #ffffff;
  color: #0b1220;
  align-self: stretch;
  box-sizing: border-box;
}
.coupon-main-info { margin-bottom: 8px }
.coupon-name { font-size: 18px; font-weight: 800; margin: 0 0 6px 0; color: #0b1220 }
.coupon-code { font-family: 'Courier New', monospace; font-size: 14px; background: rgba(15,23,42,0.06); color: #0b1220; padding: 6px 10px; border-radius: 6px; display: inline-block }
.coupon-details { display: flex; flex-direction: column; gap: 6px }
.coupon-conditions { font-size: 13px; color: #475569 }
.validity-period small { font-size: 12px; color: #64748b }
.coupon-description { font-size: 13px; color: #64748b }

/* Right */
.coupon-right {
  background: #ffffff;
  color: #0b1220;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 160px;
  border-radius: 0 12px 12px 0;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.01), 0 6px 18px rgba(11,18,32,0.04);
  align-self: stretch;
  flex: 0 0 auto;
}
.coupon-status-info { width: 100%; display: flex; flex-direction: column; gap: 8px; align-items: center }
.stock-info small { font-size: 12px; color: #64748b }
.coupon-status { padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 12px }
.coupon-status.claimed { background: #0b1220; color: #fff }
.coupon-status.unclaimed { background: transparent; color: #0b1220; border: 1px solid #e5e7eb }
.coupon-status.expired { background: #e5e7eb; color: #6b7280 }

.coupon-actions { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 8px }
.btn { padding: 10px 16px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px }
.btn:disabled { opacity: 0.5; cursor: not-allowed }
.btn-primary { background: #0b1220; color: #fff }
.btn-primary:hover:not(:disabled) { background: #1e293b }
.btn-secondary { background: transparent; color: #475569; border: 1px solid #cbd5e1 }
.btn-secondary:hover:not(:disabled) { background: #f1f5f9 }

@media (max-width: 768px) {
  .coupon-card { flex-direction: column; min-height: auto; height: auto }
  .coupon-left { border-radius: 16px 16px 0 0; padding: 16px; flex-direction: row; justify-content: space-between; border-right: none }
  .coupon-divider { display: block; height: 1px; width: 100%; border-left: none; border-top: 1px dashed rgba(15,23,42,0.08); background: transparent; margin: 8px 0 }
  .coupon-right { border-radius: 0 0 16px 16px; padding: 12px; min-width: auto }
  .coupon-actions { flex-direction: row }
}
</style>