<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useBannerStore } from '@/stores/modules/banner'
import type { CouponAPI } from '@/types/api'

// Store
const bannerStore = useBannerStore()

// Local state
const currentSlide = ref(0)
const carouselTimer = ref<number | null>(null)
const defaultCarouselInterval = 4000

// Computed
const activeBanners = computed(() => bannerStore.carouselBanners.filter(banner => banner.isActive))
const loading = computed(() => bannerStore.loading)

// Watch for banner changes to reset carousel
watch(activeBanners, (newBanners) => {
  if (newBanners.length > 0) {
    currentSlide.value = 0
    setupCarousel()
  } else {
    pauseCarousel()
  }
})

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % activeBanners.value.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + activeBanners.value.length) % activeBanners.value.length
}

function goSlide(index: number) {
  currentSlide.value = index
}

function pauseCarousel() {
  if (carouselTimer.value) {
    clearInterval(carouselTimer.value)
    carouselTimer.value = null
  }
}

function resumeCarousel() {
  setupCarousel()
}

function setupCarousel() {
  pauseCarousel()
  if (activeBanners.value.length > 1) {
    const interval = activeBanners.value[currentSlide.value]?.carouselInterval || defaultCarouselInterval
    carouselTimer.value = setInterval(nextSlide, interval)
  }
}

async function handleBannerClick(banner: CouponAPI.BannerInfo) {
  // 記錄點擊次數
  await bannerStore.recordBannerClick(banner.id)
  
  // 如果有連結，開啟連結
  if (banner.linkUrl) {
    if (banner.linkUrl.startsWith('http')) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer')
    } else {
      // 內部連結，使用路由跳轉
      window.location.href = banner.linkUrl
    }
  }
}

async function handleBannerView(banner: CouponAPI.BannerInfo) {
  // 記錄瀏覽次數
  await bannerStore.recordBannerView(banner.id)
}

// 生命周期
onMounted(async () => {
  console.log('🎯 BannerCarousel 載入中...')
  
  // 載入輪播廣告 - 先嘗試獲取首頁區域(ID=1)的廣告
  await bannerStore.fetchCarouselBanners(1, 5)
  
  // 如果沒有數據，嘗試獲取所有活動廣告
  if (activeBanners.value.length === 0) {
    console.log('🎯 首頁區域無廣告，嘗試獲取所有活動廣告...')
    await bannerStore.fetchCarouselBanners(undefined, 5)
  }
  
  // 如果還是沒數據，直接調用API測試
  if (activeBanners.value.length === 0) {
    console.log('🎯 嘗試直接調用API...')
    try {
      const { bannerApi } = await import('@/api/modules/banner')
      const response = await bannerApi.getActiveBanners(1)
      console.log('🎯 直接API調用結果:', response.data)
      if (response.data && response.data.length > 0) {
        bannerStore.carouselBanners = response.data.slice(0, 5)
      }
    } catch (error) {
      console.error('🎯 直接API調用失敗:', error)
    }
  }
  
  // 記錄初始瀏覽
  if (activeBanners.value.length > 0) {
    await handleBannerView(activeBanners.value[0])
  }
  
  // 調試信息
  console.log('🎯 最終廣告數據:', activeBanners.value)
  console.log('🎯 carouselBanners:', bannerStore.carouselBanners)
})

onUnmounted(() => {
  pauseCarousel()
})
</script>

<template>
  <section class="banners-section">
    <div class="banners-inner">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>載入中...</span>
      </div>
      
      <!-- Carousel -->
      <div v-else-if="activeBanners.length > 0" class="carousel" @mouseenter="pauseCarousel" @mouseleave="resumeCarousel">
        <div 
          v-for="(banner, idx) in activeBanners" 
          :key="banner.id" 
          class="slide" 
          :class="{ active: idx === currentSlide }"
        >
          <div 
            class="slide-link" 
            @click="handleBannerClick(banner)"
            :style="{ cursor: banner.linkUrl ? 'pointer' : 'default' }"
          >
            <img 
              v-if="banner.imageUrl" 
              :src="banner.imageUrl" 
              :alt="banner.title || '廣告'" 
              @load="idx === currentSlide && handleBannerView(banner)"
            />
            <span class="badge">{{ banner.title }}</span>
          </div>
        </div>
        
        <!-- Navigation -->
        <div class="carousel-nav" v-if="activeBanners.length > 1">
          <button class="carousel-btn" @click="prevSlide" aria-label="上一張">◀</button>
          <button class="carousel-btn" @click="nextSlide" aria-label="下一張">▶</button>
        </div>
        
        <!-- Dots -->
        <div class="carousel-dots" v-if="activeBanners.length > 1">
          <span 
            v-for="(banner, i) in activeBanners" 
            :key="'dot-' + banner.id" 
            class="dot" 
            :class="{ active: i === currentSlide }" 
            @click="goSlide(i)"
          ></span>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🖼️</div>
        <p>目前沒有廣告</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.banners-section {
  background: #000;
  color: #fff;
}

.banners-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.carousel {
  position: relative;
  width: 100%;
  height: clamp(220px, 45vw, 500px);
  overflow: hidden;
  border-radius: 16px;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(1.02);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.slide.active {
  opacity: 1;
  transform: scale(1);
}

.slide-link {
  display: block;
  width: 100%;
  height: 100%;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3));
  color: #fff;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.carousel-nav {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  pointer-events: none;
}

.carousel-btn {
  pointer-events: auto;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: opacity 0.2s;
}

.carousel-btn:hover {
  opacity: 0.8;
}

.carousel-dots {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 12px;
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background 0.2s;
}

.dot.active {
  background: #fff;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: clamp(220px, 45vw, 500px);
  background: #f8f9fa;
  border-radius: 16px;
  color: #666;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: clamp(220px, 45vw, 500px);
  background: #f8f9fa;
  border-radius: 16px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 18px;
  margin: 0;
}
</style>