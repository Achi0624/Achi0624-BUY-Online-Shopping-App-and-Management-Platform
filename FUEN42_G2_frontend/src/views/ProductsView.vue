<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/modules/product'
import { useCartStore } from '@/stores/modules/cart'
import { useUserStore } from '@/stores/user'
import ProductCard from '@/components/product/ProductCard.vue'
import CategoryFilter from '@/components/product/CategoryFilter.vue'
import { productApi } from '@/api/modules/product'
import ProductRecommendationService from '@/utils/productRecommendation'
import type { ProductAPI } from '@/types/api'

// B組 (李奕錡) - 商品列表頁面 (參考 Shopee/Momo 設計)

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

// UI 狀態
const viewMode = ref<'grid' | 'list'>('grid')
const showFilters = ref(true)
const sidebarCollapsed = ref(false)

// 搜尋和篩選
const searchQuery = ref('')
const selectedCategory = ref<number | string | null>(null)
// 記住原始的特殊類別狀態，用於搜尋後重設
const originalSpecialCategory = ref<'hot' | 'recommended' | null>(null)
const priceRange = ref({ min: null as number | null, max: null as number | null })
const selectedRating = ref<number | null>(null)
const sortBy = ref('id')
const sortOrder = ref<'asc' | 'desc'>('desc')
const showInStockOnly = ref(false)

// 分頁相關
const currentPage = ref(1)
const itemsPerPage = ref(24)
const totalItems = ref(0)
const products = ref<ProductAPI.ProductInfo[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 分類相關
const categories = ref<ProductAPI.CategoryInfo[]>([])
const selectedCategoryInfo = ref<ProductAPI.CategoryInfo | null>(null)

// 緩存機制 - 確保 List/Grid 視圖一致性
const cachedProducts = ref<{
  hot?: ProductAPI.ProductInfo[]
  recommended?: ProductAPI.ProductInfo[]
  lastFetched: {
    hot?: string
    recommended?: string
  }
}>({
  lastFetched: {}
})

// 排序選項
const sortOptions = [
  { label: '綜合排序', value: 'id', order: 'desc' },
  { label: '銷量由高到低', value: 'soldCount', order: 'desc' },
  { label: '價格由低到高', value: 'basePrice', order: 'asc' },
  { label: '價格由高到低', value: 'basePrice', order: 'desc' },
  { label: '評分由高到低', value: 'rating', order: 'desc' },
  { label: '上架時間', value: 'id', order: 'desc' }
]

// 從 URL 參數初始化
const initFromQuery = () => {
  searchQuery.value = (route.query.q as string) || ''
  
  // 處理特殊類別參數
  const categoryParam = route.query.category as string
  if (categoryParam === 'hot' || categoryParam === 'recommended') {
    selectedCategory.value = categoryParam as any
    // 記住原始的特殊類別，用於搜尋後重設
    originalSpecialCategory.value = categoryParam as 'hot' | 'recommended'
  } else {
    selectedCategory.value = categoryParam ? Number(categoryParam) : null
    originalSpecialCategory.value = null
  }
  
  priceRange.value.min = route.query.minPrice ? Number(route.query.minPrice) : null
  priceRange.value.max = route.query.maxPrice ? Number(route.query.maxPrice) : null
  selectedRating.value = route.query.rating ? Number(route.query.rating) : null
  
  // 為特殊類別設置預設排序
  if (categoryParam === 'hot') {
    sortBy.value = (route.query.sortBy as string) || 'soldCount'
    sortOrder.value = (route.query.sortOrder as 'asc' | 'desc') || 'desc'
  } else if (categoryParam === 'recommended') {
    sortBy.value = (route.query.sortBy as string) || 'rating'
    sortOrder.value = (route.query.sortOrder as 'asc' | 'desc') || 'desc'
  } else {
    sortBy.value = (route.query.sortBy as string) || 'id'
    sortOrder.value = (route.query.sortOrder as 'asc' | 'desc') || 'desc'
  }
  
  showInStockOnly.value = route.query.inStock === 'true'
  currentPage.value = route.query.page ? Number(route.query.page) : 1
  viewMode.value = (route.query.view as 'grid' | 'list') || 'grid'
}

onMounted(async () => {
  await fetchCategories()
  initFromQuery()
  await fetchProducts()
})

// 監聽路由變化 - 但排除純視圖模式變化
watch(() => route.query, (newQuery, oldQuery) => {
  // 檢查是否只是視圖模式改變
  const isOnlyViewModeChange = 
    oldQuery && 
    Object.keys(newQuery).length === Object.keys(oldQuery).length &&
    Object.entries(newQuery).every(([key, value]) => {
      if (key === 'view') return true // 忽略視圖模式變化
      return oldQuery[key] === value
    }) &&
    Object.entries(oldQuery).every(([key, value]) => {
      if (key === 'view') return true // 忽略視圖模式變化
      return newQuery[key] === value
    })
  
  initFromQuery()
  
  // 只有非純視圖模式變化才重新獲取數據
  if (!isOnlyViewModeChange) {
    fetchProducts()
  }
})

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    // 如果有搜尋關鍵字，優先使用搜尋而非特殊類別
    if (searchQuery.value && searchQuery.value.trim()) {
      // 正常的搜尋邏輯
      const params: ProductAPI.ProductListRequest = {
        page: currentPage.value,
        pageSize: itemsPerPage.value,
        keyword: searchQuery.value || undefined,
        categoryId: typeof selectedCategory.value === 'number' ? selectedCategory.value : undefined,
        priceMin: priceRange.value.min || undefined,
        priceMax: priceRange.value.max || undefined,
        rating: selectedRating.value || undefined,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        inStock: showInStockOnly.value || undefined
      }

      const response = await productApi.searchProducts(searchQuery.value, params)
      
      // 兼容不同回傳格式
      const anyRes: any = response as any
      products.value = anyRes.items ?? anyRes.data ?? []
      totalItems.value = anyRes.totalCount ?? anyRes.total ?? 0
      
    } else if (selectedCategory.value === 'hot') {
      // 生成緩存鍵 - 基於篩選條件和排序條件
      const cacheKey = JSON.stringify({
        price: priceRange.value,
        rating: selectedRating.value,
        inStock: showInStockOnly.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value
      })
      
      let hotProducts: ProductAPI.ProductInfo[]
      
      // 檢查緩存 - 如果篩選條件未變且有緩存則使用緩存
      if (cachedProducts.value.hot && cachedProducts.value.lastFetched.hot === cacheKey) {
        hotProducts = cachedProducts.value.hot
      } else {
        // 獲取新數據並緩存 - 使用與首頁完全相同的邏輯
        let rawProducts: ProductAPI.ProductInfo[] = []
        
        try {
          rawProducts = await ProductRecommendationService.getPopularProducts(200) // 獲取固定大量商品確保 List/Grid 一致
          
          // 如果新服務沒有返回數據，使用與首頁相同的備用策略
          if (rawProducts.length === 0) {
            console.warn('智能推薦服務無數據，使用原始 API')
            rawProducts = await productApi.getPopularProducts(200)
          }
        } catch (err) {
          console.error('載入熱門商品失敗:', err)
          
          // 錯誤時嘗試原始 API - 與首頁相同的備用策略
          try {
            rawProducts = await productApi.getPopularProducts(200)
          } catch (fallbackErr) {
            console.error('原始 API 也失敗了:', fallbackErr)
            rawProducts = [] // 確保有一個預設值
          }
        }
        
        // 應用篩選條件
        let filteredProducts = rawProducts
        if (priceRange.value.min || priceRange.value.max) {
          filteredProducts = filteredProducts.filter(p => 
            (!priceRange.value.min || p.basePrice >= priceRange.value.min) &&
            (!priceRange.value.max || p.basePrice <= priceRange.value.max)
          )
        }
        if (selectedRating.value) {
          filteredProducts = filteredProducts.filter(p => p.rating && p.rating >= selectedRating.value!)
        }
        if (showInStockOnly.value) {
          filteredProducts = filteredProducts.filter(p => p.stock && p.stock > 0)
        }
        
        // 更新緩存
        cachedProducts.value.hot = filteredProducts
        cachedProducts.value.lastFetched.hot = cacheKey
        hotProducts = filteredProducts
      }
      
      // 應用排序邏輯
      const sortedProducts = [...hotProducts].sort((a, b) => {
        const getValue = (product: ProductAPI.ProductInfo, field: string) => {
          switch (field) {
            case 'soldCount': return product.soldCount || 0
            case 'basePrice': return product.basePrice || 0
            case 'rating': return product.rating || 0
            case 'id': return product.id
            default: return 0
          }
        }
        
        const aValue = getValue(a, sortBy.value)
        const bValue = getValue(b, sortBy.value)
        
        if (sortOrder.value === 'asc') {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      })
      
      // 分頁處理 - 使用排序後的商品
      const startIndex = (currentPage.value - 1) * itemsPerPage.value
      const endIndex = startIndex + itemsPerPage.value
      products.value = sortedProducts.slice(startIndex, endIndex)
      totalItems.value = sortedProducts.length
      
    } else if (selectedCategory.value === 'recommended') {
      // 生成緩存鍵 - 基於篩選條件、排序條件和用戶狀態
      const cacheKey = JSON.stringify({
        userId: isLoggedIn.value ? userStore.user?.id : null, // 包含用戶ID以確保個人化推薦
        price: priceRange.value,
        rating: selectedRating.value,
        inStock: showInStockOnly.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value
      })
      
      let recommendedProducts: ProductAPI.ProductInfo[]
      
      // 檢查緩存 - 如果篩選條件未變且有緩存則使用緩存
      if (cachedProducts.value.recommended && cachedProducts.value.lastFetched.recommended === cacheKey) {
        recommendedProducts = cachedProducts.value.recommended
      } else {
        // 獲取新數據並緩存 - 使用與首頁完全相同的邏輯
        let rawProducts = await ProductRecommendationService.getRecommendedProducts(200, { // 獲取固定大量商品確保 List/Grid 一致
          userId: isLoggedIn.value ? userStore.user?.id : undefined,
          excludePopular: true // 排除熱門商品，確保推薦內容不重複
        })
        
        // 如果推薦服務沒有返回足夠數據，使用與首頁相同的備用策略
        if (rawProducts.length === 0) {
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
                    pageSize: 200
                  })
                  
                  // 過濾掉已瀏覽的商品
                  const viewedIds = viewHistory.map(p => p.id)
                  rawProducts = categoryProducts.items
                    .filter(p => !viewedIds.includes(p.id))
                    .slice(0, 200)
                }
              }
            } catch (historyErr) {
              console.warn('基於瀏覽歷史推薦失敗:', historyErr)
            }
          }
          
          // 最後備用：使用新品作為推薦
          if (rawProducts.length === 0) {
            rawProducts = await productApi.getNewProducts(200)
          }
        }
        
        // 應用篩選條件
        let filteredProducts = rawProducts
        if (priceRange.value.min || priceRange.value.max) {
          filteredProducts = filteredProducts.filter(p => 
            (!priceRange.value.min || p.basePrice >= priceRange.value.min) &&
            (!priceRange.value.max || p.basePrice <= priceRange.value.max)
          )
        }
        if (selectedRating.value) {
          filteredProducts = filteredProducts.filter(p => p.rating && p.rating >= selectedRating.value!)
        }
        if (showInStockOnly.value) {
          filteredProducts = filteredProducts.filter(p => p.stock && p.stock > 0)
        }
        
        // 更新緩存
        cachedProducts.value.recommended = filteredProducts
        cachedProducts.value.lastFetched.recommended = cacheKey
        recommendedProducts = filteredProducts
      }
      
      // 應用排序邏輯
      const sortedRecommendedProducts = [...recommendedProducts].sort((a, b) => {
        const getValue = (product: ProductAPI.ProductInfo, field: string) => {
          switch (field) {
            case 'soldCount': return product.soldCount || 0
            case 'basePrice': return product.basePrice || 0
            case 'rating': return product.rating || 0
            case 'id': return product.id
            default: return 0
          }
        }
        
        const aValue = getValue(a, sortBy.value)
        const bValue = getValue(b, sortBy.value)
        
        if (sortOrder.value === 'asc') {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      })
      
      // 分頁處理 - 使用排序後的商品
      const startIndex = (currentPage.value - 1) * itemsPerPage.value
      const endIndex = startIndex + itemsPerPage.value
      products.value = sortedRecommendedProducts.slice(startIndex, endIndex)
      totalItems.value = sortedRecommendedProducts.length
      
    } else {
      // 正常的商品列表邏輯（無搜尋關鍵字時）
      const params: ProductAPI.ProductListRequest = {
        page: currentPage.value,
        pageSize: itemsPerPage.value,
        categoryId: typeof selectedCategory.value === 'number' ? selectedCategory.value : undefined,
        priceMin: priceRange.value.min || undefined,
        priceMax: priceRange.value.max || undefined,
        rating: selectedRating.value || undefined,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        inStock: showInStockOnly.value || undefined
      }

      let response
      if (typeof selectedCategory.value === 'number') {
        response = await productApi.getProductsByCategory(selectedCategory.value, params)
      } else {
        response = await productApi.getProducts(params)
      }
      
      // 兼容不同回傳格式：
      // - 新格式 PaginationResponse: { items, totalCount, pageNumber, pageSize, totalPages }
      // - 舊格式: { data, total, page, limit, totalPages }
      const anyRes: any = response as any
      products.value = anyRes.items ?? anyRes.data ?? []
      totalItems.value = anyRes.totalCount ?? anyRes.total ?? 0
    }
    
  } catch (err) {
    error.value = '載入商品失敗，請稍後再試'
    console.error('載入商品失敗:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 記住當前的特殊類別狀態，以便重設時回到原頁面
  if (selectedCategory.value === 'hot' || selectedCategory.value === 'recommended') {
    originalSpecialCategory.value = selectedCategory.value as 'hot' | 'recommended'
  }
  
  // 清除頁碼回到第一頁
  currentPage.value = 1
  
  updateURL()
  fetchProducts()
}

const handleResetSearch = () => {
  // 清除搜尋關鍵字
  searchQuery.value = ''
  
  // 如果有記住的原始特殊類別，恢復到該類別
  let targetCategory = selectedCategory.value
  if (originalSpecialCategory.value && !selectedCategory.value) {
    // 如果搜尋時清除了特殊類別，恢復原始特殊類別
    targetCategory = originalSpecialCategory.value
    selectedCategory.value = originalSpecialCategory.value
  } else if (originalSpecialCategory.value && 
             (selectedCategory.value === 'hot' || selectedCategory.value === 'recommended')) {
    // 如果仍在特殊類別頁面，確保使用原始類別
    targetCategory = originalSpecialCategory.value
    selectedCategory.value = originalSpecialCategory.value
  }
  
  // 更新 URL，移除搜尋參數但保持其他篩選條件
  const newQuery: any = {}
  
  // 保持特殊類別參數
  if (targetCategory === 'hot' || targetCategory === 'recommended') {
    newQuery.category = targetCategory
  } else if (typeof targetCategory === 'number') {
    newQuery.category = targetCategory
  }
  
  // 保持其他篩選條件
  if (priceRange.value.min) newQuery.minPrice = priceRange.value.min
  if (priceRange.value.max) newQuery.maxPrice = priceRange.value.max
  if (selectedRating.value) newQuery.rating = selectedRating.value
  if (showInStockOnly.value) newQuery.inStock = 'true'
  if (currentPage.value > 1) newQuery.page = currentPage.value
  if (viewMode.value !== 'grid') newQuery.view = viewMode.value
  
  // 保持排序設置，根據目標類別設置預設排序
  const defaultSort = targetCategory === 'hot' ? 'soldCount' : 
                     targetCategory === 'recommended' ? 'rating' : 'id'
  
  // 恢復特殊類別的預設排序
  if (targetCategory === 'hot') {
    sortBy.value = 'soldCount'
    sortOrder.value = 'desc'
  } else if (targetCategory === 'recommended') {
    sortBy.value = 'rating'
    sortOrder.value = 'desc'
  }
  
  if (sortBy.value !== defaultSort) newQuery.sortBy = sortBy.value
  if (sortOrder.value !== 'desc') newQuery.sortOrder = sortOrder.value
  
  // 清除特殊類別的緩存，因為要恢復原始狀態
  if (targetCategory === 'hot') {
    cachedProducts.value.hot = undefined
    cachedProducts.value.lastFetched.hot = undefined
  } else if (targetCategory === 'recommended') {
    cachedProducts.value.recommended = undefined
    cachedProducts.value.lastFetched.recommended = undefined
  }
  
  router.replace({ query: newQuery })
  fetchProducts()
}

const handleFilterChange = () => {
  // 清除特殊類別的緩存，因為篩選條件已改變
  if (selectedCategory.value === 'hot') {
    cachedProducts.value.hot = undefined
    cachedProducts.value.lastFetched.hot = undefined
  } else if (selectedCategory.value === 'recommended') {
    cachedProducts.value.recommended = undefined
    cachedProducts.value.lastFetched.recommended = undefined
  }
  
  currentPage.value = 1
  updateURL()
  fetchProducts()
}

const updateURL = () => {
  const query: any = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (selectedCategory.value) query.category = selectedCategory.value
  if (priceRange.value.min) query.minPrice = priceRange.value.min
  if (priceRange.value.max) query.maxPrice = priceRange.value.max
  if (selectedRating.value) query.rating = selectedRating.value
  
  // 根據不同類別設置預設排序條件
  const defaultSort = selectedCategory.value === 'hot' ? 'soldCount' : 
                     selectedCategory.value === 'recommended' ? 'rating' : 'id'
  
  if (sortBy.value !== defaultSort) query.sortBy = sortBy.value
  if (sortOrder.value !== 'desc') query.sortOrder = sortOrder.value
  if (showInStockOnly.value) query.inStock = 'true'
  if (currentPage.value > 1) query.page = currentPage.value
  if (viewMode.value !== 'grid') query.view = viewMode.value
  
  router.replace({ query })
}

const viewProduct = (productId: number) => {
  router.push(`/product/${productId}`)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(price)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  updateURL()
  fetchProducts()
  
  // 滾動到頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearFilters = () => {
  // 保存當前的特殊類別（hot 或 recommended）
  const currentSpecialCategory = (selectedCategory.value === 'hot' || selectedCategory.value === 'recommended') 
    ? selectedCategory.value 
    : null
  
  // 清除所有篩選條件
  searchQuery.value = ''
  selectedCategory.value = currentSpecialCategory // 保持特殊類別
  priceRange.value = { min: null, max: null }
  selectedRating.value = null
  showInStockOnly.value = false
  currentPage.value = 1
  
  // 清除特殊類別的緩存，因為篩選條件已改變
  if (currentSpecialCategory === 'hot') {
    cachedProducts.value.hot = undefined
    cachedProducts.value.lastFetched.hot = undefined
    sortBy.value = 'soldCount'
    sortOrder.value = 'desc'
  } else if (currentSpecialCategory === 'recommended') {
    cachedProducts.value.recommended = undefined
    cachedProducts.value.lastFetched.recommended = undefined
    sortBy.value = 'rating'
    sortOrder.value = 'desc'
  } else {
    sortBy.value = 'id'
    sortOrder.value = 'desc'
  }
  
  // 更新 URL，保持特殊類別參數
  const newQuery: any = {}
  if (currentSpecialCategory) {
    newQuery.category = currentSpecialCategory
  }
  router.replace({ query: newQuery })
  
  fetchProducts()
}

// 篩選事件處理
const handleCategoryChange = (categoryId: number | string | null) => {
  selectedCategory.value = categoryId
  
  // 更新選中分類信息
  updateSelectedCategoryInfo()
  
  // 當切換到正常分類時，重置排序方式
  if (typeof categoryId === 'number') {
    sortBy.value = 'id'
    sortOrder.value = 'desc'
  }
  
  handleFilterChange()
}

// 獲取分類列表
const fetchCategories = async () => {
  try {
    categories.value = await productApi.getCategories()
    updateSelectedCategoryInfo()
  } catch (error) {
    console.error('獲取分類列表失敗:', error)
  }
}

// 更新選中分類信息
const updateSelectedCategoryInfo = () => {
  if (typeof selectedCategory.value === 'number') {
    const category = categories.value.find(c => c.id === selectedCategory.value)
    selectedCategoryInfo.value = category || null
  } else {
    selectedCategoryInfo.value = null
  }
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

// 排序處理
const handleSortChange = (sortOption: string) => {
  const option = sortOptions.find(o => `${o.value}-${o.order}` === sortOption)
  if (option) {
    sortBy.value = option.value
    sortOrder.value = option.order as 'asc' | 'desc'
    handleFilterChange()
  }
}

// 切換顯示模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
  updateURL()
}

// 切換篩選面板
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// 願望清單處理
const handleToggleWishlist = (productId: number, isInWishlist: boolean) => {
  // 這裡可以添加全局提示
  console.log(`商品 ${productId} ${isInWishlist ? '已加入' : '已移除'}願望清單`)
}

// 購物車處理
const handleAddToCart = (product: ProductAPI.ProductInfo) => {
  // 這裡可以添加全局提示
  console.log(`商品 ${product.productName} 已加入購物車`)
}

// 計算屬性
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage.value)
})

const hasFilters = computed(() => {
  return (selectedCategory.value && typeof selectedCategory.value === 'number') ||
         priceRange.value.min ||
         priceRange.value.max ||
         selectedRating.value ||
         showInStockOnly.value
})

const currentSortOption = computed(() => {
  return `${sortBy.value}-${sortOrder.value}`
})

// 動態頁面標題和描述
const pageTitle = computed(() => {
  if (selectedCategory.value === 'hot') return '本週熱門商品'
  if (selectedCategory.value === 'recommended') return '你可能會喜歡'
  if (searchQuery.value) return `搜尋結果：${searchQuery.value}`
  if (selectedCategoryInfo.value) return `目前分類：${selectedCategoryInfo.value.categoryName}`
  return '所有商品'
})

const pageDescription = computed(() => {
  if (selectedCategory.value === 'hot') return '最受歡迎的商品推薦，根據銷量和評價精選'
  if (selectedCategory.value === 'recommended') return '根據您的喜好為您推薦的精選商品'
  if (searchQuery.value) return `為您找到 ${totalItems.value} 項相關商品`
  return '探索我們的全部商品系列'
})

// 動態清除篩選按鈕文字
const clearFiltersButtonText = computed(() => {
  if (selectedCategory.value === 'hot') return '清除篩選條件'
  if (selectedCategory.value === 'recommended') return '清除篩選條件' 
  return '清除所有篩選'
})

// 登入狀態檢查
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 監聽用戶狀態變化，當登入狀態改變時重新載入推薦商品
watch(isLoggedIn, (newValue, oldValue) => {
  if (newValue !== oldValue && (selectedCategory.value === 'recommended')) {
    // 清除推薦商品緩存，因為用戶狀態已改變
    cachedProducts.value.recommended = undefined
    cachedProducts.value.lastFetched.recommended = undefined
    fetchProducts()
  }
})
</script>

<template>
  <div class="products-view">
    <!-- 移動端篩選按鈕 -->
    <div class="mobile-filter-toggle" @click="toggleFilters">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
      </svg>
      篩選
    </div>
    
    <div class="container">
      <div class="products-layout">
        <!-- 左側篩選面板 -->
        <aside 
          class="filter-sidebar" 
          :class="{ 
            'filter-sidebar--hidden': !showFilters,
            'filter-sidebar--collapsed': sidebarCollapsed 
          }"
        >
          <CategoryFilter 
            :selected-category-id="selectedCategory"
            :price-range="priceRange"
            :selected-rating="selectedRating"
            :show-in-stock-only="showInStockOnly"
            @category-change="handleCategoryChange"
            @price-range-change="handlePriceRangeChange"
            @rating-change="handleRatingChange"
            @stock-filter-change="handleStockFilterChange"
            @clear-filters="clearFilters"
          />
        </aside>
        
        <!-- 主要內容區域 -->
        <main class="products-main">
          <!-- 頁面標題區域 -->
          <div class="page-header header--dark">
            <div class="page-title-section">
              <h1 class="page-title">
                <span v-if="selectedCategory === 'hot'" class="title-icon">🔥</span>
                <span v-else-if="selectedCategory === 'recommended'" class="title-icon">✨</span>
                <span v-else-if="searchQuery" class="title-icon">🔍</span>
                {{ pageTitle }}
              </h1>
              <p class="page-description">{{ pageDescription }}</p>
            </div>
          </div>
          
          <!-- 頂部工具欄 -->
          <div class="toolbar">
            <!-- 搜尋框 -->
            <div class="search-section">
              <div class="search-box">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.39zM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/>
                </svg>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="商品名稱、品牌或關鍵字"
                  @keyup.enter="handleSearch"
                  class="search-input"
                >
              </div>
              <div class="search-buttons">
                <button @click="handleSearch" class="search-btn">搜尋</button>
                <button @click="handleResetSearch" class="reset-btn" :disabled="!searchQuery">重設</button>
              </div>
            </div>
            
            <!-- 結果統計和控制項 -->
            <div class="toolbar-controls">
              <div class="results-info">
                <span v-if="!loading" class="results-count">
                  共 {{ totalItems?.toLocaleString() || 0 }} 項商品
                </span>
                <div v-if="hasFilters" class="active-filters">
                  已套用篩選條件
                </div>
              </div>
              
              <div class="toolbar-actions">
                <!-- 排序選擇 -->
                <div class="sort-selector">
                  <label>排序：</label>
                  <select 
                    :value="currentSortOption" 
                    @change="handleSortChange(($event.target as HTMLSelectElement)?.value)"
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
                    @click="viewMode = 'grid'; updateURL()"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 10.02h5V21h-5zM17 21h5V10.02h-5zm5-18H2v5h20z"/>
                    </svg>
                  </button>
                  <button 
                    class="view-btn"
                    :class="{ 'view-btn--active': viewMode === 'list' }"
                    @click="viewMode = 'list'; updateURL()"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/>
                    </svg>
                  </button>
                </div>
                
                <!-- 桌面端篩選切換 -->
                <button class="filter-toggle-btn desktop-only" @click="toggleFilters">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
                  </svg>
                  {{ showFilters ? '隱藏篩選' : '顯示篩選' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 載入狀態 -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>載入中...</p>
          </div>

          <!-- 錯誤狀態 -->
          <div v-else-if="error" class="error-state">
            <div class="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
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
              <h3>沒有找到商品</h3>
              <p>請嘗試調整您的搜尋條件或篩選設定</p>
              <button @click="clearFilters" class="clear-btn">{{ clearFiltersButtonText }}</button>
            </div>
            
            <!-- 商品網格/列表 -->
            <div 
              v-else 
              class="products-container"
              :class="[
                `products-container--${viewMode}`,
                { 'products-container--loading': loading }
              ]"
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
/* B組 (李奕錡) - 商品列表頁面樣式 (簡約風格) */

.products-view {
  min-height: calc(100vh - 120px);
  background: #ffffff;
  color: #0b1220;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding: 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 移動端篩選切換 */
.mobile-filter-toggle {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background: #0b1220;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  box-shadow: 0 8px 30px rgba(11, 18, 32, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-filter-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(11, 18, 32, 0.2);
}

/* 主要佈局 */
.products-layout {
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

.filter-sidebar--collapsed {
  width: 0;
  overflow: hidden;
}

/* 主要內容區 */
.products-main {
  flex: 1;
  min-width: 0;
}

/* 頁面標題區域 */
.page-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
}

.header--dark {
  background: #0b1220; /* 黑底 */
  color: #fff;        /* 白字 */
}

.page-title-section {
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 36px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  60% { transform: translateY(-4px); }
}

.page-description {
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  margin: 0;
  line-height: 1.6;
}

/* 工具欄 */
.toolbar {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
  border: 1px solid #f8fafc;
}

.search-section {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 1px solid #e6e9ee;
  border-radius: 12px;
  font-size: 16px;
  background: #f8fafc;
  color: #0b1220;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0b1220;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(11, 18, 32, 0.1);
}

.search-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-btn {
  padding: 14px 24px;
  background: #555b67;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  white-space: nowrap;
}

.search-btn:hover {
  background: #1e293b;
}

.reset-btn {
  padding: 14px 20px;
  background: #f8fafc;
  color: #6b7280;
  border: 1px solid #e6e9ee;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  white-space: nowrap;
}

.reset-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #374151;
  border-color: #d1d5db;
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8fafc;
  color: #9ca3af;
}

.toolbar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.results-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.results-count {
  font-size: 16px;
  color: #0b1220;
  font-weight: 600;
}

.active-filters {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sort-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-selector label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e6e9ee;
  border-radius: 8px;
  background: #ffffff;
  color: #0b1220;
  font-size: 14px;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.view-btn--active {
  background: #ffffff;
  color: #0b1220;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.1);
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e6e9ee;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-toggle-btn:hover {
  background: #f1f5f9;
  color: #0b1220;
}

/* 載入和狀態 */
.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f8fafc;
  border-top: 3px solid #0b1220;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 80px 20px;
}

.error-icon {
  color: #ef4444;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #0b1220;
  margin-bottom: 8px;
}

.error-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.retry-btn {
  padding: 12px 24px;
  background: #0b1220;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #1e293b;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #0b1220;
  margin-bottom: 8px;
  font-size: 20px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.clear-btn {
  padding: 12px 24px;
  background: #374151;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #4b5563;
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

.products-container--loading {
  opacity: 0.7;
  pointer-events: none;
}

/* 分頁 */
.pagination-wrapper {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f8fafc;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
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
  border: 1px solid #e6e9ee;
  background: #ffffff;
  color: #374151;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #0b1220;
  color: #0b1220;
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
  background: #0b1220;
  border-color: #0b1220;
  color: white;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.pagination-info {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.desktop-only {
  display: flex;
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .products-layout {
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
  .mobile-filter-toggle {
    display: flex;
  }
  
  .desktop-only {
    display: none;
  }
  
  .products-layout {
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
  
  .toolbar {
    margin-bottom: 16px;
    padding: 16px;
  }
  
  .toolbar-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .toolbar-actions {
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
  
  .pagination-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .pagination-pages {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 12px;
  }

  .page-header {
    padding: 20px;
    margin-bottom: 16px;
  }
  
  .page-title {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .title-icon {
    font-size: 28px;
  }
  
  .page-description {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
  
  .search-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .search-input {
    font-size: 16px; /* 防止 iOS 縮放 */
  }
  
  .search-buttons {
    width: 100%;
  }
  
  .search-btn, 
  .reset-btn {
    flex: 1;
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .products-container--grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pagination-info {
    font-size: 12px;
  }
}

@media (max-width: 640px) {
  .search-section {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .search-buttons {
    justify-content: stretch;
  }
  
  .search-btn, 
  .reset-btn {
    flex: 1;
    min-width: 0;
  }
}
</style>