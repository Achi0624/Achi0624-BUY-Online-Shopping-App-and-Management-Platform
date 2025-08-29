<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import productApi from '@/api/modules/product'
import ProductRecommendationService from '@/utils/productRecommendation'
import type { ProductAPI } from '@/types/api'

const router = useRouter()

const products = ref<ProductAPI.ProductInfo[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const props = withDefaults(defineProps<{
  title?: string
  limit?: number
  showViewAll?: boolean
}>(), {
  title: '本週熱門商品',
  limit: 8,
  showViewAll: true
})

async function loadPopularProducts() {
  try {
    loading.value = true
    error.value = null
    
    // 直接使用 API 獲取熱門商品，按銷售數量排序
    try {
      const response = await productApi.getProducts({
        page: 1,
        pageSize: props.limit,
        sortBy: 'soldCount',
        sortOrder: 'desc'
      })
      products.value = response.items || []
    } catch (apiErr) {
      console.warn('商品 API 失敗，使用智能推薦服務')
      // 使用智能推薦服務作為備用
      products.value = await ProductRecommendationService.getPopularProducts(props.limit)
    }
    
    // 如果仍無數據，嘗試原始熱門商品 API
    if (products.value.length === 0) {
      console.warn('所有服務無數據，使用原始熱門商品 API')
      products.value = await productApi.getPopularProducts(props.limit)
    }
  } catch (err) {
    error.value = '載入熱門商品失敗'
    console.error('載入熱門商品失敗:', err)
    
    // 最終錯誤處理：嘗試原始 API
    try {
      products.value = await productApi.getPopularProducts(props.limit)
    } catch (fallbackErr) {
      console.error('原始 API 也失敗了:', fallbackErr)
    }
  } finally {
    loading.value = false
  }
}

function viewProduct(productId: number) {
  router.push(`/product/${productId}`)
}

function viewAllProducts() {
  router.push('/products?category=hot')
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

onMounted(() => {
  loadPopularProducts()
})
</script>

<template>
  <section class="popular-products-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">🔥</span>
          {{ title }}
        </h2>
        <button 
          v-if="showViewAll" 
          class="view-all-btn" 
          @click="viewAllProducts"
        >
          查看全部
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
        <button class="retry-btn" @click="loadPopularProducts">重試</button>
      </div>

      <!-- 商品網格 -->
      <div v-else class="products-grid">
        <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
          @click="viewProduct(product.id)"
        >
          <div class="product-image-container">
            <img
              :src="getProductImage(product)"
              :alt="product.productName"
              class="product-image"
              loading="lazy"
            />
            <div class="product-badge" v-if="product.soldCount > 100">
              熱銷
            </div>
            <div class="product-rating" v-if="product.rating && product.rating > 0">
              <span class="stars">⭐</span>
              <span class="rating-value">{{ product.rating.toFixed(1) }}</span>
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.productName }}</h3>
            <p class="product-vendor" v-if="product.vendor">{{ product.vendor.vendorName }}</p>
            <div class="product-stats">
              <span class="sold-count">已售 {{ product.soldCount }}</span>
              <span class="view-count">{{ product.viewCount }} 人瀏覽</span>
            </div>
            <div class="product-price">
              <span class="current-price">{{ formatPrice(product.basePrice) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-if="!loading && !error && products.length === 0" class="empty-state">
        <div class="empty-icon">🛒</div>
        <p class="empty-message">暫無熱門商品</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import '@/styles/variables.css';

.popular-products-section {
  padding: var(--space-5) 0;
  background: var(--brand-white);
  position: relative;
}

.popular-products-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gray-200), transparent);
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
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: var(--primary-color);
  color: white;
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
}

.product-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--gray-200);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
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

.product-badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  background: var(--danger-color);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.product-rating {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  background: rgba(255, 255, 255, 0.9);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
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

.product-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.product-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-price {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--primary-color);
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
  border-radius: var(--radius-lg);
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
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--space-4);
  }
  
  .product-card {
    margin: 0;
  }
}
</style>