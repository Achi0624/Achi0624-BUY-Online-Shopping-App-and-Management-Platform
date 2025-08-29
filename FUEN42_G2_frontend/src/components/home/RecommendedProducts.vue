<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import productApi from '@/api/modules/product'
import ProductRecommendationService from '@/utils/productRecommendation'
import userBehaviorTracker from '@/utils/userBehaviorTracker'
import type { ProductAPI } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()

const products = ref<ProductAPI.ProductInfo[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const props = withDefaults(defineProps<{
  title?: string
  limit?: number
  showViewAll?: boolean
}>(), {
  title: '你可能會喜歡',
  limit: 8,
  showViewAll: true
})

const isLoggedIn = computed(() => userStore.isLoggedIn)

async function loadRecommendedProducts() {
  try {
    loading.value = true
    error.value = null
    
    // 直接使用 API 獲取推薦商品，按瀏覽次數排序
    try {
      const response = await productApi.getProducts({
        page: 1,
        pageSize: props.limit * 2, // 多取一些來過濾重複
        sortBy: 'viewCount',
        sortOrder: 'desc'
      })
      
      // 獲取熱門商品ID以排除重複
      let hotProductIds: number[] = []
      try {
        const hotResponse = await productApi.getProducts({
          page: 1,
          pageSize: props.limit,
          sortBy: 'soldCount',
          sortOrder: 'desc'
        })
        hotProductIds = (hotResponse.items || []).map(p => p.id)
      } catch (hotErr) {
        console.warn('無法獲取熱門商品ID用於排除重複')
      }
      
      // 過濾掉熱門商品，確保不重複
      const filteredProducts = (response.items || [])
        .filter(product => !hotProductIds.includes(product.id))
        .slice(0, props.limit)
      
      products.value = filteredProducts
    } catch (apiErr) {
      console.warn('商品 API 失敗，使用智能推薦服務')
      // 使用智能推薦服務作為備用
      const userId = isLoggedIn.value ? userStore.user?.id : undefined
      products.value = await ProductRecommendationService.getRecommendedProducts(props.limit, {
        userId,
        excludePopular: true // 排除熱門商品，確保推薦內容不重複
      })
    }
    
    // 如果推薦服務沒有返回足夠數據，使用備用策略
    if (products.value.length === 0) {
      console.warn('智能推薦服務無數據，使用備用策略')
      
      if (isLoggedIn.value) {
        // 已登入用戶：嘗試基於瀏覽歷史推薦
        try {
          const viewHistory = await productApi.getViewHistory(10)
          if (viewHistory.length > 0) {
            // 基於瀏覽歷史的分類推薦
            const categoryIds = [...new Set(viewHistory.map(p => p.categoryId).filter(Boolean))]
            if (categoryIds.length > 0) {
              const categoryProducts = await productApi.getProductsByCategory(categoryIds[0], {
                page: 1,
                pageSize: props.limit * 2
              })
              
              // 過濾掉已瀏覽的商品
              const viewedIds = viewHistory.map(p => p.id)
              products.value = categoryProducts.items
                .filter(p => !viewedIds.includes(p.id))
                .slice(0, props.limit)
            }
          }
        } catch (historyErr) {
          console.warn('基於瀏覽歷史推薦失敗:', historyErr)
        }
      }
      
      // 最後備用：使用新品作為推薦
      if (products.value.length === 0) {
        products.value = await productApi.getNewProducts(props.limit)
      }
    }
  } catch (err) {
    error.value = '載入推薦商品失敗'
    console.error('載入推薦商品失敗:', err)
    
    // 最終錯誤處理：使用新品
    try {
      products.value = await productApi.getNewProducts(props.limit)
    } catch (fallbackErr) {
      console.error('載入新品也失敗了:', fallbackErr)
    }
  } finally {
    loading.value = false
  }
}

function viewProduct(productId: number, productName?: string, position?: number) {
  // 記錄商品瀏覽，用於改進推薦算法
  productApi.incrementViewCount(productId).catch(console.error)
  
  // 追蹤點擊行為
  try {
    const product = products.value.find(p => p.id === productId)
    userBehaviorTracker.trackClick(
      'product',
      productId,
      productName || product?.productName || `商品${productId}`,
      'home_recommendations',
      position
    )
  } catch (error) {
    console.error('點擊追蹤失敗:', error)
  }
  
  router.push(`/product/${productId}`)
}

function viewAllProducts() {
  router.push('/products?category=recommended')
}

function getProductImage(product: ProductAPI.ProductInfo): string {
  const defaultImage = product.media?.find(m => m.isDefault)?.mediaUrl
  const firstImage = product.media?.[0]?.mediaUrl
  return defaultImage || firstImage || '/images/product-placeholder.jpg'
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(price)
}

function getRecommendationReason(product: ProductAPI.ProductInfo): string {
  // 訪客用戶顯示通用推薦
  if (!isLoggedIn.value) {
    if (product.rating && product.rating >= 4.5) return '高評分推薦'
    if (product.soldCount > 100) return '熱銷推薦'  
    if (product.viewCount > 500) return '熱門推薦'
    return '新品推薦'
  }
  
  // 會員用戶顯示個人化推薦原因
  if (product.rating && product.rating >= 4.7) return '高評分推薦'
  if (product.soldCount > 1000) return '暢銷好物'
  if (product.viewCount > 2000) return '熱門關注'
  if (product.soldCount < 50 && product.rating && product.rating >= 4.0) return '新品好物'
  
  // 基於價格範圍的推薦
  if (product.basePrice < 1000) return '超值推薦'
  if (product.basePrice > 50000) return '精品推薦'
  
  return '為你推薦'
}

onMounted(() => {
  loadRecommendedProducts()
})

// 當登入狀態變化時重新載入推薦
const stopWatcher = userStore.$subscribe(() => {
  loadRecommendedProducts()
})

// 組件銷毀時停止監聽
onBeforeUnmount(() => {
  stopWatcher()
})
</script>

<template>
  <section class="recommended-products-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">💝</span>
          {{ title }}
          <span v-if="isLoggedIn" class="personalized-badge">個人化</span>
        </h2>
        <button 
          v-if="showViewAll" 
          class="view-all-btn" 
          @click="viewAllProducts"
        >
          查看更多推薦
          <span class="arrow">→</span>
        </button>
      </div>

      <!-- 載入狀態 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-grid">
          <div v-for="i in limit" :key="i" class="loading-card">
            <div class="loading-image"></div>
            <div class="loading-content">
              <div class="loading-line"></div>
              <div class="loading-line short"></div>
              <div class="loading-line"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="loadRecommendedProducts">重試</button>
      </div>

      <!-- 商品網格 -->
      <div v-else class="products-grid">
        <div
          v-for="(product, index) in products"
          :key="product.id"
          class="product-card"
          @click="viewProduct(product.id, product.productName, index + 1)"
        >
          <div class="product-image-container">
            <img
              :src="getProductImage(product)"
              :alt="product.productName"
              class="product-image"
              loading="lazy"
            />
            <div class="recommendation-badge">
              {{ getRecommendationReason(product) }}
            </div>
            <div class="product-rating" v-if="product.rating && product.rating > 0">
              <span class="stars">⭐</span>
              <span class="rating-value">{{ product.rating.toFixed(1) }}</span>
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.productName }}</h3>
            <p class="product-vendor" v-if="product.vendor">{{ product.vendor.vendorName }}</p>
            <div class="product-features">
              <span v-if="product.reviewCount > 0" class="feature-tag">
                {{ product.reviewCount }} 則評價
              </span>
              <span v-if="product.soldCount > 0" class="feature-tag">
                已售 {{ product.soldCount }}
              </span>
            </div>
            <div class="product-price">
              <span class="current-price">{{ formatPrice(product.basePrice) }}</span>
              <div class="recommendation-hint">
                <span class="hint-icon">🎯</span>
                <span class="hint-text">{{ getRecommendationReason(product) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-if="!loading && !error && products.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-message">暫無推薦商品</p>
        <p class="empty-hint">瀏覽更多商品來獲得個人化推薦</p>
      </div>

      <!-- 登入提示 (訪客用戶) -->
      <div v-if="!isLoggedIn && products.length > 0" class="login-hint">
        <div class="hint-content">
          <span class="hint-icon">💡</span>
          <span class="hint-text">登入後獲得更精準的個人化推薦</span>
          <router-link to="/login" class="login-link">立即登入</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import '@/styles/variables.css';

.recommended-products-section {
  padding: var(--space-5) 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
}

.recommended-products-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gray-300), transparent);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
}

.title-icon {
  font-size: 1.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.personalized-badge {
  background: var(--gray-100);
  color: var(--gray-700);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  margin-left: var(--space-2);
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: var(--primary-color);
  color: #fff;
}

.view-all-btn .arrow {
  transition: transform 0.3s ease;
}

.view-all-btn:hover .arrow {
  transform: translateX(4px);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-5);
  margin-bottom: var(--space-5);
}

.product-card {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--gray-200);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: var(--gray-50);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.recommendation-badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.product-rating {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  background: rgba(255, 255, 255, 0.95);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  backdrop-filter: blur(4px);
}

.product-info {
  padding: var(--space-4);
}

.product-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-bottom: var(--space-1);
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-vendor {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: var(--space-2);
}

.product-features {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}

.feature-tag {
  background: var(--gray-100);
  color: var(--gray-600);
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.current-price {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: #667eea;
}

.recommendation-hint {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.hint-icon {
  font-size: 0.8rem;
}

/* 載入狀態 */
.loading-state {
  padding: var(--space-4) 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-5);
}

.loading-card {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--gray-200);
}

.loading-image {
  width: 100%;
  height: 220px;
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.loading-content {
  padding: var(--space-4);
}

.loading-line {
  height: 16px;
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.loading-line.short {
  width: 60%;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 錯誤狀態 */
.error-state {
  text-align: center;
  padding: var(--space-8) 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: var(--space-3);
}

.error-message {
  color: var(--gray-600);
  margin-bottom: var(--space-4);
}

.retry-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: var(--primary-dark);
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: var(--space-8) 0;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-3);
}

.empty-message {
  color: var(--gray-600);
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
}

.empty-hint {
  color: var(--gray-500);
  font-size: var(--text-sm);
}

/* 登入提示 */
.login-hint {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  text-align: center;
}

.hint-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: white;
}

.hint-text {
  font-weight: var(--font-medium);
}

.login-link {
  background: white;
  color: #667eea;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: var(--font-semibold);
  transition: all 0.3s ease;
}

.login-link:hover {
  background: var(--gray-100);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }
  
  .section-title {
    font-size: var(--text-2xl);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  
  .product-image-container {
    height: 200px;
  }

  .hint-content {
    flex-direction: column;
    gap: var(--space-2);
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--space-4);
  }
  
  .product-card {
    margin: 0;
  }

  .product-price {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
}
</style>