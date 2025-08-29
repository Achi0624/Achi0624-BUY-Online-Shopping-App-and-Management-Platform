<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 支援圖片與影片的媒體項目
interface MediaItem {
  id: number
  mediaUrl: string
  mediaType?: number // 1: 圖片, 2: 影片
  isDefault?: boolean
}

interface Props {
  // 為了相容舊用法，仍然命名為 images，但內容可包含影片
  images: MediaItem[]
  productName: string
  autoPlay?: boolean
  autoPlayInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: true,
  autoPlayInterval: 4000
})

const currentIndex = ref(0)
const isPlaying = ref(props.autoPlay)
const isPaused = ref(false)
let autoPlayTimer: number | null = null

// 目前顯示的媒體物件
const currentItem = computed<MediaItem | null>(() => {
  if (!props.images || props.images.length === 0) return null
  return props.images[currentIndex.value] || null
})

// 兼容：當前媒體的 URL（圖片或影片）
const currentImage = computed(() => {
  return currentItem.value?.mediaUrl || '/images/placeholder-product.jpg'
})

const isVideo = (item?: MediaItem | null) => {
  if (!item) return false
  if (item.mediaType === 2) return true
  const url = item.mediaUrl || ''
  return /(\.mp4|\.webm|\.ogg)(\?|$)/i.test(url)
}

const hasMultipleImages = computed(() => props.images && props.images.length > 1)

const goToSlide = (index: number) => {
  if (props.images && index >= 0 && index < props.images.length) {
    currentIndex.value = index
    resetAutoPlay()
  }
}

const goToPrevious = () => {
  if (!props.images || props.images.length <= 1) return
  currentIndex.value = currentIndex.value > 0 
    ? currentIndex.value - 1 
    : props.images.length - 1
  resetAutoPlay()
}

const goToNext = () => {
  if (!props.images || props.images.length <= 1) return
  currentIndex.value = currentIndex.value < props.images.length - 1 
    ? currentIndex.value + 1 
    : 0
  resetAutoPlay()
}

const startAutoPlay = () => {
  if (!hasMultipleImages.value || !isPlaying.value || isPaused.value) return
  
  stopAutoPlay()
  autoPlayTimer = window.setInterval(() => {
    if (!isPaused.value) {
      goToNext()
    }
  }, props.autoPlayInterval)
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

const resetAutoPlay = () => {
  if (isPlaying.value && hasMultipleImages.value) {
    stopAutoPlay()
    startAutoPlay()
  }
}

const toggleAutoPlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
}

const pauseAutoPlay = () => {
  isPaused.value = true
}

const resumeAutoPlay = () => {
  isPaused.value = false
  if (isPlaying.value) {
    startAutoPlay()
  }
}

onMounted(() => {
  // 初始化時，若第一張是影片，嘗試跳到第一張圖片
  if (props.images && props.images.length > 0) {
    // 先找 isDefault 的圖片
    const defaultImageIndex = props.images.findIndex(it => (it as any).isDefault && !isVideo(it as any))
    if (defaultImageIndex >= 0) {
      currentIndex.value = defaultImageIndex
    } else if (isVideo(props.images[0] as any)) {
      const firstImageIndex = props.images.findIndex(it => !isVideo(it as any))
      if (firstImageIndex >= 0) currentIndex.value = firstImageIndex
    }
  }

  if (props.autoPlay && hasMultipleImages.value) {
    startAutoPlay()
  }
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <div class="product-image-carousel">
    <!-- 主圖片區域 -->
    <div 
      class="main-image-container"
      @mouseenter="pauseAutoPlay"
      @mouseleave="resumeAutoPlay"
    >
      <!-- 主要媒體：圖片或影片 -->
      <template v-if="!isVideo(currentItem)">
        <img 
          :src="currentImage" 
          :alt="productName"
          class="main-image"
        >
      </template>
      <template v-else>
        <video
          class="main-video"
          :src="currentItem!.mediaUrl"
          controls
          preload="metadata"
          playsinline
          @play="pauseAutoPlay"
          @pause="resumeAutoPlay"
        >
          您的瀏覽器不支援影片播放
        </video>
      </template>
      
      <!-- 播放/暫停控制按鈕 -->
      <div v-if="hasMultipleImages" class="auto-play-control">
        <button 
          class="play-pause-btn"
          @click="toggleAutoPlay"
          :title="isPlaying ? '暫停自動播放' : '開始自動播放'"
        >
          <svg v-if="isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <!-- 導航箭頭 -->
      <div v-if="hasMultipleImages" class="carousel-nav">
        <button 
          class="nav-btn nav-btn--prev" 
          @click="goToPrevious"
          :disabled="!hasMultipleImages"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button 
          class="nav-btn nav-btn--next" 
          @click="goToNext"
          :disabled="!hasMultipleImages"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 指示器點點 -->
      <div v-if="hasMultipleImages" class="carousel-indicators">
        <button
          v-for="(image, index) in images"
          :key="image.id"
          class="indicator"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
        ></button>
      </div>

      <!-- 自動播放進度條 -->
      <div v-if="hasMultipleImages && isPlaying" class="auto-play-progress">
        <div 
          class="progress-bar"
          :style="{ animationDuration: `${autoPlayInterval}ms` }"
          :key="currentIndex"
        ></div>
      </div>
    </div>

    <!-- 縮圖列表 -->
    <div v-if="hasMultipleImages" class="thumbnail-list">
      <button
        v-for="(image, index) in images.slice(0, 6)"
        :key="image.id"
        class="thumbnail"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
      >
        <template v-if="!isVideo(image)">
          <img 
            :src="image.mediaUrl" 
            :alt="`${productName} 圖片 ${index + 1}`"
            class="thumbnail-image"
          >
        </template>
        <template v-else>
          <div class="thumbnail-video">
            <span class="play-badge">▶</span>
            <video :src="image.mediaUrl" muted preload="metadata"></video>
          </div>
        </template>
      </button>
      
      <!-- 更多圖片指示 -->
      <div v-if="images.length > 6" class="more-images">
        <span>+{{ images.length - 6 }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-image-carousel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 主圖片容器 */
.main-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-image:hover {
  transform: scale(1.05);
}

/* 影片樣式 */
.main-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

/* 導航箭頭 */
.carousel-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  z-index: 2;
}

.nav-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  pointer-events: auto;
  margin: 0 12px;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 播放/暫停控制按鈕 */
.auto-play-control {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
}

.play-pause-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.play-pause-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

/* 自動播放進度條 */
.auto-play-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #333 0%, #555 100%);
  animation: progressAnimation linear forwards;
  transform-origin: left;
}

@keyframes progressAnimation {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* 指示器 */
.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: white;
  border-color: white;
  transform: scale(1.2);
}

.indicator:hover:not(.active) {
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(255, 255, 255, 0.8);
}

/* 縮圖列表 */
.thumbnail-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.thumbnail-list::-webkit-scrollbar {
  height: 4px;
}

.thumbnail-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.thumbnail-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.thumbnail-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #f9f9f9;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail:hover {
  border-color: #666;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.thumbnail.active {
  border-color: #333;
  box-shadow: 0 0 0 2px #333;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-video {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;
}

.play-badge {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.more-images {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  background: #f9f9f9;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .main-image-container {
    border-radius: 8px;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
    margin: 0 8px;
  }
  
  .nav-btn svg {
    width: 20px;
    height: 20px;
  }
  
  .carousel-indicators {
    bottom: 12px;
  }
  
  .indicator {
    width: 10px;
    height: 10px;
  }
  
  .thumbnail {
    width: 60px;
    height: 60px;
  }
  
  .more-images {
    width: 60px;
    height: 60px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .thumbnail {
    width: 50px;
    height: 50px;
  }
  
  .more-images {
    width: 50px;
    height: 50px;
    font-size: 11px;
  }
  
  .nav-btn {
    width: 36px;
    height: 36px;
    margin: 0 6px;
  }
  
  .nav-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .indicator {
    width: 8px;
    height: 8px;
  }

  .auto-play-control {
    top: 12px;
    right: 12px;
  }

  .play-pause-btn {
    width: 36px;
    height: 36px;
  }

  .play-pause-btn svg {
    width: 16px;
    height: 16px;
  }

  .auto-play-progress {
    height: 3px;
  }
}
</style>