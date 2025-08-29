<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/modules/product'
import { useCartStore } from '@/stores/modules/cart'
import ProductCard from '@/components/product/ProductCard.vue'
import CategoryFilter from '@/components/product/CategoryFilter.vue'
import { productApi } from '@/api/modules/product'
import type { ProductAPI } from '@/types/api'

// B組 (李奕錡) - 分類商品頁面 (參考電商分類頁面設計)

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

const categoryId = computed(() => Number(route.params.categoryId))
const category = ref<ProductAPI.CategoryInfo | null>(null)
const subcategories = ref<ProductAPI.CategoryInfo[]>([])
const products = ref<ProductAPI.ProductInfo[]>([])

// UI 狀態
const loading = ref(false)
const error = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const showFilters = ref(true)

// 篩選和排序
const selectedSubcategory = ref<number | null>(null)
const priceRange = ref({ min: null as number | null, max: null as number | null })
const selectedRating = ref<number | null>(null)
const sortBy = ref('id')
const sortOrder = ref<'asc' | 'desc'>('desc')
const showInStockOnly = ref(false)

// 分頁
const currentPage = ref(1)
const itemsPerPage = ref(24)
const totalItems = ref(0)

// 排序選項
const sortOptions = [
  { label: '綜合排序', value: 'id', order: 'desc' },
  { label: '銷量由高到低', value: 'soldCount', order: 'desc' },
  { label: '價格由低到高', value: 'basePrice', order: 'asc' },
  { label: '價格由高到低', value: 'basePrice', order: 'desc' },
  { label: '評分由高到低', value: 'rating', order: 'desc' },
  { label: '上架時間', value: 'createdAt', order: 'desc' }
]

// 監聽路由變化
watch(() => route.params.categoryId, async (newCategoryId) => {
  if (newCategoryId) {
    resetFilters()
    await fetchCategoryData()
    await fetchProducts()
  }
})

onMounted(async () => {
  await fetchCategoryData()
  await fetchProducts()
})

const fetchCategoryData = async () => {
  try {
    loading.value = true
    error.value = null

    // 獲取分類詳情
    const categoryResponse = await productApi.getCategoryDetail(categoryId.value)
    category.value = categoryResponse.data

    // 獲取子分類
    const subcategoriesResponse = await productApi.getSubcategories(categoryId.value)
    subcategories.value = subcategoriesResponse.data

  } catch (err) {
    error.value = '載入分類資訊失敗'
    console.error('獲取分類資訊失敗:', err)
    // 添加更詳細的錯誤信息
    if (err instanceof Error) {
      console.error('Error details:', err.message, err.stack)
    }
  } finally {
    loading.value = false
  }
}

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null

    const params: ProductAPI.ProductListRequest = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      categoryId: selectedSubcategory.value || categoryId.value,
      priceMin: priceRange.value.min || undefined,
      priceMax: priceRange.value.max || undefined,
      rating: selectedRating.value || undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      inStock: showInStockOnly.value || undefined
    }

    const response = await productApi.getProductsByCategory(
      selectedSubcategory.value || categoryId.value,
      params
    )

    products.value = response.data
    totalItems.value = response.total

  } catch (err) {
    error.value = '載入商品失敗'
    console.error('獲取商品失敗:', err)
    // 添加更詳細的錯誤信息
    if (err instanceof Error) {
      console.error('Error details:', err.message, err.stack)
    }
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  selectedSubcategory.value = null
  priceRange.value = { min: null, max: null }
  selectedRating.value = null
  sortBy.value = 'id'
  sortOrder.value = 'desc'
  showInStockOnly.value = false
  currentPage.value = 1
}

const handleSubcategoryChange = (subcategoryId: number | null) => {
  selectedSubcategory.value = subcategoryId
  currentPage.value = 1
  fetchProducts()
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchProducts()
}

const handlePriceRangeChange = (newPriceRange: { min: number | null; max: number | null }) => {
  priceRange.value = newPriceRange
  handleFilterChange()
}

const handleRatingChange = (rating: number | null) => {
  selectedRating.value = rating
  handleFilterChange()
}

const handleStockFilterChange = (inStockOnly: boolean) => {
  showInStockOnly.value = inStockOnly
  handleFilterChange()
}

const handleSortChange = (sortOption: string) => {
  const option = sortOptions.find(o => `${o.value}-${o.order}` === sortOption)
  if (option) {
    sortBy.value = option.value
    sortOrder.value = option.order as 'asc' | 'desc'
    handleFilterChange()
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearFilters = () => {
  resetFilters()
  fetchProducts()
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(price)
}

const handleAddToCart = (product: ProductAPI.ProductInfo) => {
  console.log(`商品 ${product.productName} 已加入購物車`)
}

const handleToggleWishlist = (productId: number, isInWishlist: boolean) => {
  console.log(`商品 ${productId} ${isInWishlist ? '已加入' : '已移除'}願望清單`)
}

// 計算屬性
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage.value)
})

const hasFilters = computed(() => {
  return selectedSubcategory.value ||
         priceRange.value.min ||
         priceRange.value.max ||
         selectedRating.value ||
         showInStockOnly.value
})

const currentSortOption = computed(() => {
  return `${sortBy.value}-${sortOrder.value}`
})

const breadcrumbItems = computed(() => {
  const items = [{ name: '首頁', path: '/' }]
  
  if (category.value) {
    // 如果有父分類，加入父分類
    if (category.value.parentCategory) {
      items.push({
        name: category.value.parentCategory.categoryName,
        path: `/category/${category.value.parentCategory.id}`
      })
    }
    
    // 加入當前分類
    items.push({
      name: category.value.categoryName,
      path: `/category/${category.value.id}`
    })
  }
  
  return items
})
</script>

<template>
  <div class="category-view">
    <!-- 麵包屑導航 -->
    <div class="breadcrumb-section">
      <div class="container">
        <nav class="breadcrumb">
          <router-link 
            v-for="(item, index) in breadcrumbItems" 
            :key="item.path"
            :to="item.path"
            class="breadcrumb-item"
            :class="{ 'breadcrumb-item--active': index === breadcrumbItems.length - 1 }"
          >
            {{ item.name }}
            <span v-if="index < breadcrumbItems.length - 1" class="breadcrumb-separator">></span>
          </router-link>
        </nav>
      </div>
    </div>

    <!-- 分類標頭 -->
    <div v-if="category" class="category-header">
      <div class="container">
        <div class="category-info">
          <div class="category-content">
            <h1 class="category-title">{{ category.categoryName }}</h1>
            <p v-if="category.description" class="category-description">
              {{ category.description }}
            </p>
            <div class="category-stats">
              <span class="product-count">{{ totalItems.toLocaleString() }} 項商品</span>
            </div>
          </div>
          <div v-if="category.iconUrl" class="category-icon">
            <img :src="category.iconUrl" :alt="category.categoryName">
          </div>
        </div>
      </div>
    </div>

    <!-- 子分類導航 -->
    <div v-if="subcategories.length" class="subcategory-nav">
      <div class="container">
        <div class="subcategory-list">
          <button 
            class="subcategory-item"
            :class="{ 'subcategory-item--active': !selectedSubcategory }"
            @click="handleSubcategoryChange(null)"
          >
            全部
          </button>
          <button 
            v-for="subcategory in subcategories"
            :key="subcategory.id"
            class="subcategory-item"
            :class="{ 'subcategory-item--active': selectedSubcategory === subcategory.id }"
            @click="handleSubcategoryChange(subcategory.id)"
          >
            {{ subcategory.categoryName }}
          </button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="category-layout">
        <!-- 左側篩選面板 -->
        <aside 
          class="filter-sidebar" 
          :class="{ 'filter-sidebar--hidden': !showFilters }"
        >
          <CategoryFilter 
            :selected-category-id="selectedSubcategory || categoryId"
            :price-range="priceRange"
            :selected-rating="selectedRating"
            :show-in-stock-only="showInStockOnly"
            @category-change="handleSubcategoryChange"
            @price-range-change="handlePriceRangeChange"
            @rating-change="handleRatingChange"
            @stock-filter-change="handleStockFilterChange"
            @clear-filters="clearFilters"
          />
        </aside>

        <!-- 主要內容區域 -->
        <main class="category-main">
          <!-- 工具欄 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <div class="results-info">
                <span v-if="!loading" class="results-count">
                  共 {{ totalItems.toLocaleString() }} 項商品
                </span>
                <div v-if="hasFilters" class="active-filters">
                  已套用篩選條件
                </div>
              </div>
            </div>
            
            <div class="toolbar-right">
              <!-- 排序選擇 -->
              <div class="sort-selector">
                <label>排序：</label>
                <select 
                  :value="currentSortOption" 
                  @change="handleSortChange($event.target.value)"
                  class="sort-select"
                >
                  <option 
                    v-for="option in sortOptions" 
                    :key="`${option.value}-${option.order}`"
                    :value="`${option.value}-${option.order}`"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
              
              <!-- 檢視模式切換 -->
              <div class="view-toggle">
                <button 
                  class="view-btn"
                  :class="{ 'view-btn--active': viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 10.02h5V21h-5zM17 21h5V10.02h-5zm5-18H2v5h20z"/>
                  </svg>
                </button>
                <button 
                  class="view-btn"
                  :class="{ 'view-btn--active': viewMode === 'list' }"
                  @click="viewMode = 'list'"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/>
                  </svg>
                </button>
              </div>
              
              <!-- 篩選切換 -->
              <button class="filter-toggle-btn" @click="showFilters = !showFilters">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
                </svg>
                {{ showFilters ? '隱藏篩選' : '顯示篩選' }}
              </button>
            </div>
          </div>

          <!-- 載入狀態 -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>載入中...</p>
          </div>

          <!-- 錯誤狀態 -->
          <div v-else-if="error" class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>載入失敗</h3>
            <p>{{ error }}</p>
            <button @click="fetchProducts" class="retry-btn">重新載入</button>
          </div>

          <!-- 商品列表 -->
          <div v-else class="products-section">
            <!-- 無商品狀態 -->
            <div v-if="products.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 4V2C7 1.45 7.45 1 8 1h8c.55 0 1 .45 1 1v2h5v2h-2v13c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6H2V4h5zM9 3v1h6V3H9zm0 5v9h2V8H9zm4 0v9h2V8h-2z"/>
                </svg>
              </div>
              <h3>此分類暫無商品</h3>
              <p>請嘗試瀏覽其他分類或調整篩選條件</p>
              <button @click="clearFilters" class="clear-btn">清除篩選</button>
            </div>
            
            <!-- 商品網格/列表 -->
            <div 
              v-else 
              class="products-container"
              :class="[`products-container--${viewMode}`]"
            >
              <ProductCard 
                v-for="product in products" 
                :key="product.id"
                :product="product"
                :layout="viewMode"
                :show-wishlist="true"
                @add-to-cart="handleAddToCart"
                @toggle-wishlist="handleToggleWishlist"
              />
            </div>

            <!-- 分頁控制 -->
            <div v-if="totalPages > 1" class="pagination-wrapper">
              <nav class="pagination">
                <!-- 上一頁 -->
                <button 
                  class="pagination-btn pagination-btn--prev"
                  :disabled="currentPage <= 1"
                  @click="handlePageChange(currentPage - 1)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                  上一頁
                </button>
                
                <!-- 頁碼 -->
                <div class="pagination-pages">
                  <template v-for="page in Array.from({length: Math.min(7, totalPages)}, (_, i) => {
                    const start = Math.max(1, Math.min(currentPage - 3, totalPages - 6))
                    return start + i
                  })" :key="page">
                    <button 
                      v-if="page <= totalPages"
                      class="pagination-btn pagination-btn--page"
                      :class="{ 'pagination-btn--active': page === currentPage }"
                      @click="handlePageChange(page)"
                    >
                      {{ page }}
                    </button>
                  </template>
                </div>
                
                <!-- 下一頁 -->
                <button 
                  class="pagination-btn pagination-btn--next"
                  :disabled="currentPage >= totalPages"
                  @click="handlePageChange(currentPage + 1)"
                >
                  下一頁
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </nav>
              
              <div class="pagination-info">
                第 {{ currentPage }} 頁，共 {{ totalPages }} 頁 ({{ totalItems.toLocaleString() }} 項商品)
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* B組 (李奕錡) - 分類頁面樣式 */

.category-view {
  min-height: calc(100vh - 120px);
  background: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 麵包屑導航 */
.breadcrumb-section {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #666;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #7cb342;
}

.breadcrumb-item--active {
  color: #333;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #ccc;
}

/* 分類標頭 */
.category-header {
  background: linear-gradient(135deg, #7cb342 0%, #689f38 100%);
  color: white;
  padding: 40px 0;
}

.category-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.category-content {
  flex: 1;
}

.category-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-description {
  font-size: 18px;
  margin: 0 0 16px 0;
  opacity: 0.9;
  line-height: 1.5;
}

.category-stats {
  display: flex;
  gap: 24px;
}

.product-count {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.9;
}

.category-icon {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.category-icon img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

/* 子分類導航 */
.subcategory-nav {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.subcategory-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.subcategory-item {
  padding: 10px 20px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.subcategory-item:hover {
  background: #e9ecef;
  color: #333;
}

.subcategory-item--active {
  background: #7cb342;
  color: white;
  border-color: #7cb342;
}

/* 主要佈局 */
.category-layout {
  display: flex;
  gap: 24px;
  padding: 20px 0;
  align-items: flex-start;
}

/* 篩選側邊欄 */
.filter-sidebar {
  width: 280px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.filter-sidebar--hidden {
  transform: translateX(-100%);
  opacity: 0;
  pointer-events: none;
}

/* 主要內容區 */
.category-main {
  flex: 1;
  min-width: 0;
}

/* 工具欄 */
.toolbar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.results-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.results-count {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.active-filters {
  font-size: 14px;
  color: #7cb342;
  font-weight: 500;
}

.sort-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-selector label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.view-btn--active {
  background: white;
  color: #7cb342;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-toggle-btn:hover {
  background: #e9ecef;
  color: #333;
}

/* 載入和狀態 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #7cb342;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 10px 24px;
  background: #7cb342;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 16px;
}

.retry-btn:hover {
  background: #689f38;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  color: #999;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 8px;
  font-size: 20px;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

.clear-btn {
  padding: 10px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.clear-btn:hover {
  background: #5a6268;
}

/* 商品容器 */
.products-container {
  margin-bottom: 40px;
}

.products-container--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.products-container--list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 分頁 */
.pagination-wrapper {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #666;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #7cb342;
  color: #7cb342;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn--page {
  min-width: 40px;
  justify-content: center;
  padding: 10px;
}

.pagination-btn--active {
  background: #7cb342;
  border-color: #7cb342;
  color: white;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.pagination-info {
  text-align: center;
  font-size: 14px;
  color: #666;
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .category-layout {
    gap: 20px;
  }
  
  .filter-sidebar {
    width: 260px;
  }
  
  .products-container--grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .category-layout {
    flex-direction: column;
    padding: 16px 0;
  }
  
  .filter-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: white;
    width: 100%;
    padding: 20px;
    transform: translateX(-100%);
    overflow-y: auto;
  }
  
  .filter-sidebar:not(.filter-sidebar--hidden) {
    transform: translateX(0);
  }
  
  .category-header {
    padding: 24px 0;
  }
  
  .category-info {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .category-title {
    font-size: 28px;
  }
  
  .category-description {
    font-size: 16px;
  }
  
  .category-icon {
    width: 100px;
    height: 100px;
  }
  
  .category-icon img {
    width: 60px;
    height: 60px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
  }
  
  .toolbar-right {
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .products-container--grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .pagination-pages {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
  
  .category-title {
    font-size: 24px;
  }
  
  .subcategory-list {
    gap: 6px;
  }
  
  .subcategory-item {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .products-container--grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pagination-info {
    font-size: 12px;
  }
}
</style>