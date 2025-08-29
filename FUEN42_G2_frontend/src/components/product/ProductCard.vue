<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '@/api/modules/product'
import type { ProductAPI } from '@/types/api'

// B組 (李奕錡) - 商品卡片組件 (參考 Shopee/Momo 設計)

interface Props {
  product: ProductAPI.ProductInfo
  showWishlist?: boolean
  layout?: 'grid' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  showWishlist: true,
  layout: 'grid'
})

const emit = defineEmits<{
  toggleWishlist: [productId: number, isInWishlist: boolean]
}>()

const router = useRouter()

const isToggling = ref(false)
const isInWishlist = ref(false)

// 格式化價格
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(price)
}

// 計算折扣百分比
const discountPercentage = computed(() => {
  const originalPrice = props.product.basePrice * 1.2 // 假設原價比現價高20%
  const discount = ((originalPrice - props.product.basePrice) / originalPrice) * 100
  return Math.round(discount)
})

// 獲取主要商品圖片（永遠使用圖片，不用影片）
const mainImage = computed(() => {
  const media = props.product.media || []
  const isImageUrl = (url: string) => /(\.png|\.jpe?g|\.gif|\.webp|\.bmp|\.svg)(\?|$)/i.test(url)
  const defaultImage = media.find(m => m.isDefault && (m.mediaType === 1 || isImageUrl(m.mediaUrl)))
  const firstImage = media.find(m => m.mediaType === 1 || isImageUrl(m.mediaUrl))
  return defaultImage?.mediaUrl || firstImage?.mediaUrl || '/images/placeholder-product.jpg'
})

// 生成星星評分
const starRating = computed(() => {
  const rating = props.product.rating || 0
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return {
    full: Array(fullStars).fill('★'),
    half: hasHalfStar ? ['☆'] : [],
    empty: Array(emptyStars).fill('☆')
  }
})

// 查看商品詳情
const viewProduct = () => {
  router.push(`/product/${props.product.id}`)
  
  // 異步增加瀏覽次數
  productApi.incrementViewCount(props.product.id).catch(console.error)
}


// 切換願望清單狀態
const toggleWishlist = async (event: Event) => {
  event.stopPropagation()
  
  if (isToggling.value) return
  
  try {
    isToggling.value = true
    
    if (isInWishlist.value) {
      await productApi.removeFromWishlist(props.product.id)
      isInWishlist.value = false
    } else {
      await productApi.addToWishlist(props.product.id)
      isInWishlist.value = true
    }
    
    emit('toggleWishlist', props.product.id, isInWishlist.value)
  } catch (error) {
    console.error('願望清單操作失敗:', error)
  } finally {
    isToggling.value = false
  }
}

// 檢查是否在願望清單中
const checkWishlistStatus = async () => {
  try {
    const result = await productApi.isInWishlist(props.product.id)
    isInWishlist.value = result.isInWishlist
  } catch (error) {
    // 靜默處理錯誤
  }
}

// 初始化時檢查願望清單狀態
if (props.showWishlist) {
  checkWishlistStatus()
}
</script>

<template>
  <div 
    class="product-card" 
    :class="[
      `product-card--${layout}`,
      { 'product-card--out-of-stock': product.stock <= 0 }
    ]"
    @click="viewProduct"
  >
    <!-- 商品圖片區域 -->
    <div class="product-image">
      <img 
        :src="mainImage" 
        :alt="product.productName"
        loading="lazy"
        class="product-image__img"
      >
      
      <!-- 缺貨覆蓋層 -->
      <div v-if="product.stock <= 0" class="product-image__overlay">
        <span>缺貨</span>
      </div>
      
      <!-- 折扣標籤 -->
      <div v-if="discountPercentage > 0" class="product-image__discount">
        {{ discountPercentage }}%折
      </div>
      
      <!-- 願望清單按鈕 -->
      <button 
        v-if="showWishlist"
        class="product-image__wishlist"
        :class="{ 'product-image__wishlist--active': isInWishlist }"
        @click="toggleWishlist"
        :disabled="isToggling"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>

    <!-- 商品資訊 -->
    <div class="product-info">
      <!-- 商品名稱 -->
      <h3 class="product-info__name">{{ product.productName }}</h3>
      
      <!-- 商品評分和銷量 -->
      <div class="product-info__meta">
        <div class="product-rating" v-if="product.rating">
          <span class="product-rating__stars">
            <span v-for="star in starRating.full" key="full">★</span>
            <span v-for="star in starRating.half" key="half" class="half-star">★</span>
            <span v-for="star in starRating.empty" key="empty" class="empty-star">☆</span>
          </span>
          <span class="product-rating__score">{{ product.rating.toFixed(1) }}</span>
          <span class="product-rating__count">({{ product.reviewCount }})</span>
        </div>
        <div class="product-sold">已售 {{ product.soldCount }}</div>
      </div>
      
      <!-- 價格區域 -->
      <div class="product-price">
        <span class="product-price__current">{{ formatPrice(product.basePrice) }}</span>
        <span v-if="discountPercentage > 0" class="product-price__original">
          {{ formatPrice(product.basePrice * 1.2) }}
        </span>
      </div>
      
      <!-- 商家資訊 -->
      <div class="product-vendor">
        <span class="product-vendor__name">{{ product.vendor.vendorName }}</span>
        <div class="product-vendor__rating">
          <span>★</span>
          <span>{{ product.vendor.rating.toFixed(1) }}</span>
        </div>
      </div>
      
      <!-- 查看詳情按鈕 -->
      <div class="product-actions">
        <button 
          class="product-actions__view"
          @click="viewProduct"
        >
          查看詳情
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: #ffffff;
  color: #0f172a;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.12s, box-shadow 0.12s;
  cursor: pointer;
  border: 1px solid #f8fafc;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
  border-color: #e2e8f0;
}

.product-card--out-of-stock {
  opacity: 0.6;
}

/* 網格佈局樣式 */
.product-card--grid {
  display: flex;
  flex-direction: column;
}

.product-card--grid .product-image {
  height: 200px;
}

/* 列表佈局樣式 */
.product-card--list {
  display: flex;
  flex-direction: row;
}

.product-card--list .product-image {
  width: 150px;
  height: 150px;
  flex-shrink: 0;
}

.product-card--list .product-info {
  flex: 1;
  padding: 20px;
}

/* 商品圖片 */
.product-image {
  position: relative;
  overflow: hidden;
  background: #f8fafc;
}

.product-image__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image__img {
  transform: scale(1.05);
}

.product-image__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.product-image__discount {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #0b1220;
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.product-image__wishlist {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.product-image__wishlist:hover {
  background: white;
  color: #0b1220;
  transform: scale(1.1);
}

.product-image__wishlist--active {
  background: #0b1220;
  color: white;
}

/* 商品資訊 */
.product-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-info__name {
  font-size: 15px;
  font-weight: 600;
  color: #0b1220;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
  min-height: 42px;
}

.product-info__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-rating__stars {
  color: #f59e0b;
  font-size: 14px;
}

.product-rating__stars .empty-star {
  color: #e5e7eb;
}

.product-rating__score {
  font-weight: 500;
  color: #374151;
}

.product-rating__count {
  color: #9ca3af;
}

.product-sold {
  font-size: 12px;
  color: #6b7280;
}

/* 價格 */
.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

.product-price__current {
  font-size: 18px;
  font-weight: 700;
  color: #0b1220;
}

.product-price__original {
  font-size: 14px;
  color: #9ca3af;
  text-decoration: line-through;
}

/* 商家資訊 */
.product-vendor {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
  padding: 12px 0;
  border-top: 1px solid #f1f5f9;
}

.product-vendor__name {
  font-weight: 500;
  color: #374151;
}

.product-vendor__rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #f59e0b;
}

.product-vendor__rating span:last-child {
  color: #6b7280;
  margin-left: 2px;
}

/* 操作按鈕 */
.product-actions {
  margin-top: auto;
}

.product-actions__view {
  width: 100%;
  padding: 12px 16px;
  background: #0b1220;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .product-card--grid .product-image {
    height: 180px;
  }
  
  .product-info {
    padding: 16px;
  }
  
  .product-info__name {
    font-size: 14px;
  }
  
  .product-price__current {
    font-size: 16px;
  }
}
</style>