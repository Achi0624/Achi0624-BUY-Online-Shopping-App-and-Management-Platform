<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCouponStore } from '@/stores/modules/coupon'
import { useUserStore } from '@/stores/user'
import CouponCard from '@/components/coupon/CouponCard.vue'

// Stores
const couponStore = useCouponStore()
const userStore = useUserStore()

// Local state
const activeTab = ref<'available' | 'used' | 'expired'>('available')

// Computed
const memberCoupons = computed(() => couponStore.memberCoupons)
const loading = computed(() => couponStore.loading)
const error = computed(() => couponStore.error)
const currentUser = computed(() => userStore.user)

const availableCoupons = computed(() => 
  memberCoupons.value.filter(mc => 
    mc.status === 1 && // 未使用
    new Date(mc.expiredAt) > new Date() // 未過期
  )
)

const usedCoupons = computed(() =>
  memberCoupons.value.filter(mc => mc.status === 2) // 已使用
)

const expiredCoupons = computed(() =>
  memberCoupons.value.filter(mc => 
    mc.status === 1 && // 未使用但已過期
    new Date(mc.expiredAt) <= new Date()
  )
)

const currentCoupons = computed(() => {
  switch (activeTab.value) {
    case 'available':
      return availableCoupons.value
    case 'used':
      return usedCoupons.value
    case 'expired':
      return expiredCoupons.value
    default:
      return []
  }
})

// Methods
const fetchMemberCoupons = async () => {
  if (currentUser.value) {
    await couponStore.fetchMemberCoupons(currentUser.value.id, false) // 獲取所有優惠券
  }
}

const handleUseCoupon = (coupon: any) => {
  // 複製優惠券代碼到剪貼簿
  navigator.clipboard.writeText(coupon.coupon.couponCode).then(() => {
    alert(`優惠券代碼已複製: ${coupon.coupon.couponCode}`)
  }).catch(() => {
    alert(`優惠券代碼: ${coupon.coupon.couponCode}`)
  })
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getStatusBadge = (memberCoupon: any) => {
  const now = new Date()
  const expiredAt = new Date(memberCoupon.expiredAt)
  
  if (memberCoupon.status === 2) {
    return { text: '已使用', class: 'used' }
  } else if (expiredAt <= now) {
    return { text: '已過期', class: 'expired' }
  } else {
    return { text: '可使用', class: 'available' }
  }
}

// 生命周期
onMounted(async () => {
  await fetchMemberCoupons()
})

// Empty state helpers (moved from options API)
const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'available':
      return '暫無可使用的優惠券'
    case 'used':
      return '暫無已使用的優惠券'
    case 'expired':
      return '暫無過期的優惠券'
    default:
      return '暫無優惠券'
  }
}

const getEmptyDescription = () => {
  switch (activeTab.value) {
    case 'available':
      return '前往優惠券中心領取更多優惠券'
    case 'used':
      return '您還未使用任何優惠券'
    case 'expired':
      return '沒有過期的優惠券'
    default:
      return ''
  }
}
</script>

<template>
  <div class="member-coupons">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">我的優惠券</h2>
      <p class="page-subtitle">管理您的專屬優惠券</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        class="tab-button"
        :class="{ active: activeTab === 'available' }"
        @click="activeTab = 'available'"
      >
        可使用 ({{ availableCoupons.length }})
      </button>
      <button 
        class="tab-button"
        :class="{ active: activeTab === 'used' }"
        @click="activeTab = 'used'"
      >
        已使用 ({{ usedCoupons.length }})
      </button>
      <button 
        class="tab-button"
        :class="{ active: activeTab === 'expired' }"
        @click="activeTab = 'expired'"
      >
        已過期 ({{ expiredCoupons.length }})
      </button>
    </div>

    <!-- Content -->
    <div class="tab-content">
      <!-- Error State -->
      <div v-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="fetchMemberCoupons">重新載入</button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>載入中...</span>
      </div>

      <!-- Coupons List -->
      <div v-else-if="currentCoupons.length > 0" class="coupons-grid">
        <div 
          v-for="memberCoupon in currentCoupons" 
          :key="memberCoupon.id"
          class="coupon-wrapper"
        >
          <div class="member-coupon-card">
            <!-- Status Badge -->
            <div 
              class="status-badge"
              :class="getStatusBadge(memberCoupon).class"
            >
              {{ getStatusBadge(memberCoupon).text }}
            </div>

            <!-- Coupon Info -->
            <div class="coupon-header">
              <div class="discount-amount">
                <span class="amount">
                  {{ memberCoupon.coupon.discountType === 1 
                    ? `NT$ ${memberCoupon.coupon.discountValue}` 
                    : `${memberCoupon.coupon.discountValue}%` }}
                </span>
                <span class="off-text">
                  {{ memberCoupon.coupon.discountType === 1 ? '折抵' : '折扣' }}
                </span>
              </div>
              <div class="coupon-type">
                {{ memberCoupon.coupon.couponType === 1 ? '平台券' : '廠商券' }}
              </div>
            </div>

            <div class="coupon-body">
              <h3 class="coupon-name">{{ memberCoupon.coupon.couponName }}</h3>
              <div class="coupon-code">{{ memberCoupon.coupon.couponCode }}</div>
              
              <div class="coupon-conditions" v-if="memberCoupon.coupon.minimumAmount">
                <span>消費滿 NT$ {{ memberCoupon.coupon.minimumAmount }}</span>
              </div>
              
              <div class="coupon-description" v-if="memberCoupon.coupon.description">
                {{ memberCoupon.coupon.description }}
              </div>
            </div>

            <div class="coupon-footer">
              <div class="member-coupon-info">
                <div class="received-date">
                  <small>領取時間：{{ formatDate(memberCoupon.receivedAt) }}</small>
                </div>
                <div class="expire-date">
                  <small>到期時間：{{ formatDate(memberCoupon.expiredAt) }}</small>
                </div>
                <div v-if="memberCoupon.usedAt" class="used-date">
                  <small>使用時間：{{ formatDate(memberCoupon.usedAt) }}</small>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="coupon-actions" v-if="activeTab === 'available'">
              <button 
                class="btn btn-primary" 
                @click="handleUseCoupon(memberCoupon)"
              >
                複製代碼
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🎫</div>
        <h3>{{ getEmptyMessage() }}</h3>
        <p>{{ getEmptyDescription() }}</p>
        <router-link to="/coupons" class="btn btn-primary" v-if="activeTab === 'available'">
          前往領取優惠券
        </router-link>
      </div>
    </div>
  </div>
</template>

<!-- 已將 getEmptyMessage 與 getEmptyDescription 移至 <script setup> 區塊 -->

<style scoped>
.member-coupons {
  padding: 0;
}

/* Header */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.page-subtitle {
  color: #666;
  margin: 0;
  font-size: 14px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 32px;
  background: #f8f9fa;
  padding: 4px;
  border-radius: 12px;
}

.tab-button {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.tab-button.active {
  background: white;
  color: var(--blue);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
}

/* States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-state {
  gap: 16px;
}

.error-state,
.empty-state {
  gap: 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.empty-state h3 {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.empty-state p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* Coupons Grid */
.coupons-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coupon-wrapper {
  position: relative;
}

.member-coupon-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.member-coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.member-coupon-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30px, -30px);
}

/* Status Badge */
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  z-index: 2;
}

.status-badge.available {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.status-badge.used {
  background: rgba(96, 125, 139, 0.9);
  color: white;
}

.status-badge.expired {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

/* Coupon Content */
.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  margin-top: 20px;
}

.discount-amount {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.amount {
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.off-text {
  font-size: 12px;
  opacity: 0.9;
}

.coupon-type {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.coupon-body {
  margin-bottom: 16px;
}

.coupon-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.coupon-code {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 10px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.coupon-conditions {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.coupon-description {
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.4;
}

.coupon-footer {
  margin-bottom: 16px;
}

.member-coupon-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  opacity: 0.8;
}

.coupon-actions {
  display: flex;
  gap: 12px;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  flex: 1;
}

.btn-primary:hover {
  background: white;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .tabs {
    flex-direction: column;
  }

  .tab-button {
    flex: none;
  }

  .coupons-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .member-coupon-card {
    padding: 16px;
  }

  .coupon-header {
    margin-top: 16px;
  }
}
</style>