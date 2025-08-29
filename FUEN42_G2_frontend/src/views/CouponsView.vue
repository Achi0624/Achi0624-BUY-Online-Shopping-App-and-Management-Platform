<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CouponList from '@/components/coupon/CouponList.vue'
import CouponCard from '@/components/coupon/CouponCard.vue'
import { useCouponStore } from '@/stores/modules/coupon'

const activeTab = ref<'available' | 'claimed' | 'expired'>('available')
const couponStore = useCouponStore()
const memberCoupons = couponStore.memberCoupons

onMounted(() => {
  document.title = '優惠券中心 - BUY商城'
})
</script>

<template>
  <div class="coupons-page">
    <div class="page-hero">
      <div class="container hero-inner">
        <svg class="hero-decor" viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f8fafc" />
              <stop offset="50%" stop-color="#e2e8f0" />
              <stop offset="100%" stop-color="#cbd5e1" />
            </linearGradient>
            <linearGradient id="lavender-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f3f4f6" />
              <stop offset="100%" stop-color="#e9d5ff" />
            </linearGradient>
          </defs>
          
          <!-- 主背景 -->
          <rect x="0" y="0" width="800" height="200" fill="url(#bg-gradient)" />
          
          <!-- 薰衣草色裝飾圓圈 -->
          <circle cx="150" cy="60" r="40" fill="#e9d5ff" opacity="0.6" />
          <circle cx="650" cy="80" r="60" fill="#ddd6fe" opacity="0.4" />
          <circle cx="700" cy="140" r="30" fill="#e9d5ff" opacity="0.5" />
          <circle cx="100" cy="140" r="25" fill="#ddd6fe" opacity="0.3" />
          
          <!-- 幾何圖形裝飾 -->
          <rect x="50" y="40" width="80" height="2" fill="#64748b" opacity="0.3" />
          <rect x="600" y="120" width="120" height="2" fill="#475569" opacity="0.4" />
          <rect x="200" y="160" width="60" height="2" fill="#64748b" opacity="0.2" />
          
          <!-- 優惠券形狀 -->
          <g transform="translate(300, 50)">
            <rect x="0" y="0" width="100" height="60" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" opacity="0.8"/>
            <circle cx="0" cy="30" r="8" fill="url(#bg-gradient)"/>
            <circle cx="100" cy="30" r="8" fill="url(#bg-gradient)"/>
            <text x="50" y="35" text-anchor="middle" fill="#64748b" font-size="12" font-weight="600">優惠券</text>
          </g>
          
          <!-- 點陣裝飾 -->
          <g fill="#94a3b8" opacity="0.3">
            <circle cx="80" cy="80" r="2" />
            <circle cx="120" cy="100" r="2" />
            <circle cx="720" cy="60" r="2" />
            <circle cx="680" cy="180" r="2" />
            <circle cx="550" cy="30" r="2" />
            <circle cx="480" cy="170" r="2" />
          </g>
        </svg>

        <div class="hero-content">
          <h1 class="hero-title">優惠券中心</h1>
          <p class="hero-subtitle">精選優惠券，讓您購物更省錢</p>
        </div>
      </div>
    </div>

    <div class="page-content container">
      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'available' } ]" @click="activeTab = 'available'">可領取</button>
        <button :class="['tab', { active: activeTab === 'claimed' } ]" @click="activeTab = 'claimed'">已領取</button>
        <button :class="['tab', { active: activeTab === 'expired' } ]" @click="activeTab = 'expired'">已過期</button>
      </div>

      <div class="tab-panel">
        <CouponList v-if="activeTab === 'available'" title="可領取優惠券" :show-filters="false" :filterParams="{ status: 1 }" />
        <div v-if="activeTab === 'claimed'" class="claimed-list">
          <div v-if="memberCoupons.length === 0" class="empty-claimed">暫無已領取優惠券</div>
          <div v-else class="claimed-coupons">
            <CouponCard v-for="mc in memberCoupons" :key="mc.id" :coupon="mc.coupon" :claimed="true" :show-actions="true" @use="$emit('use', mc)" />
          </div>
        </div>
        <CouponList v-if="activeTab === 'expired'" title="已過期優惠券" :show-filters="false" :filterParams="{ status: 3 }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.coupons-page {
  min-height: 100vh;
  background: #ffffff;
  color: #0b1220;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.page-hero {
  position: relative;
  padding: 60px 0 40px;
  text-align: center;
  margin-bottom: 32px;
  overflow: hidden;
}

.hero-decor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  filter: blur(10px) saturate(110%);
  opacity: 0.9;
}

.hero-inner {
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(249,250,252,0.9));
  border-radius: 14px;
  padding: 28px 32px;
  box-shadow: 0 8px 30px rgba(11,18,32,0.08);
  position: relative;
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.hero-title { 
  font-size: 36px; 
  font-weight: 800; 
  margin: 0;
  color: #0b1220;
  letter-spacing: -0.6px;
}

.hero-subtitle { 
  font-size: 16px; 
  color: #556277; 
  margin: 0;
  font-weight: 500;
}

/* hero CTA 已移除 */

.container { max-width: 1100px; margin: 0 auto; padding: 0 20px }

.tabs { 
  display: flex; 
  gap: 8px; 
  margin: 28px 0;
  background: #f1f5f9;
  padding: 6px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.tab { 
  padding: 16px 24px; 
  border-radius: 12px; 
  background: transparent; 
  color: #64748b; 
  border: none;
  font-weight: 700; 
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  flex: 1;
  text-align: center;
}

.tab:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
  color: #475569;
}

.tab.active { 
  background: #0b1220; 
  color: white; 
  box-shadow: 0 4px 12px rgba(11, 18, 32, 0.25);
  transform: translateY(-1px);
}

.tab-panel { padding-top: 8px }

/* 讓 CouponList 的卡片在中心展現 */
.tab-panel .coupon-list { background: transparent; padding: 0 }

/* 已領取優惠券佈局 */
.claimed-coupons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-claimed {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
}

@media (max-width: 768px) {
  .hero-title { font-size: 28px }
  .hero-subtitle { font-size: 16px }
  .tabs { flex-direction: column }
}
</style>