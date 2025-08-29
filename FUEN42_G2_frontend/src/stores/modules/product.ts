import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productApi } from '@/api/modules/product'
import type { ProductAPI, PaginationResponse, ApiResponse } from '@/types/api'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref<ProductAPI.ProductInfo[]>([])
  const currentProduct = ref<ProductAPI.ProductInfo | null>(null)
  const currentProductDetail = ref<ProductAPI.ProductDetailInfo | null>(null)
  const categories = ref<ProductAPI.CategoryInfo[]>([])
  const currentCategory = ref<ProductAPI.CategoryInfo | null>(null)
  const relatedProducts = ref<ProductAPI.ProductInfo[]>([])
  const popularProducts = ref<ProductAPI.ProductInfo[]>([])
  const newProducts = ref<ProductAPI.ProductInfo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 分頁相關
  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 12
  })
  
  // 篩選相關
  const filters = ref({
    categoryId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    keyword: '',
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    rating: undefined as number | undefined,
    inStock: undefined as boolean | undefined,
    sortBy: 'id',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  // Getters
  const availableProducts = computed(() =>
    products.value.filter(product => product.isActive && product.stock > 0)
  )

  const getProductsByCategory = computed(() => (categoryId: number) =>
    products.value.filter(product => product.categoryId === categoryId)
  )

  const getProductsByVendor = computed(() => (vendorId: number) =>
    products.value.filter(product => product.vendorId === vendorId)
  )

  // Actions
  const fetchProducts = async (params?: ProductAPI.ProductListRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const requestParams = {
        page: pagination.value.currentPage,
        limit: pagination.value.itemsPerPage,
        ...filters.value,
        ...params
      }
      
      const response = await productApi.getProducts(requestParams)
      const apiResponse = response.data as ApiResponse<PaginationResponse<ProductAPI.ProductInfo>>
      
      if (apiResponse.success) {
        const data = apiResponse.data
        products.value = data.data
        pagination.value = {
          currentPage: data.page,
          totalPages: data.totalPages,
          totalItems: data.total,
          itemsPerPage: data.limit
        }
      } else {
        throw new Error(apiResponse.message || '獲取商品失敗')
      }
    } catch (err: any) {
      error.value = err.message || '獲取商品失敗'
      console.error('Failed to fetch products:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await productApi.getProduct(id)
      const apiResponse = response.data as ApiResponse<ProductAPI.ProductInfo>
      
      if (apiResponse.success) {
        currentProduct.value = apiResponse.data
        
        // 增加瀏覽次數
        await productApi.incrementViewCount(id)
      } else {
        throw new Error(apiResponse.message || '獲取商品詳情失敗')
      }
    } catch (err: any) {
      error.value = err.message || '獲取商品詳情失敗'
      console.error('Failed to fetch product:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await productApi.getCategories()
      const apiResponse = response.data as ApiResponse<ProductAPI.CategoryInfo[]>
      
      if (apiResponse.success) {
        categories.value = apiResponse.data
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const searchProducts = async (keyword: string, params?: Omit<ProductAPI.ProductListRequest, 'keyword'>) => {
    try {
      loading.value = true
      error.value = null
      filters.value.keyword = keyword
      
      const requestParams = {
        page: pagination.value.currentPage,
        limit: pagination.value.itemsPerPage,
        ...filters.value,
        ...params
      }
      
      const response = await productApi.searchProducts(keyword, requestParams)
      const apiResponse = response.data as ApiResponse<PaginationResponse<ProductAPI.ProductInfo>>
      
      if (apiResponse.success) {
        const data = apiResponse.data
        products.value = data.data
        pagination.value = {
          currentPage: data.page,
          totalPages: data.totalPages,
          totalItems: data.total,
          itemsPerPage: data.limit
        }
      } else {
        throw new Error(apiResponse.message || '搜尋商品失敗')
      }
    } catch (err: any) {
      error.value = err.message || '搜尋商品失敗'
      console.error('Failed to search products:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProductsByCategory = async (categoryId: number, params?: Omit<ProductAPI.ProductListRequest, 'categoryId'>) => {
    try {
      loading.value = true
      error.value = null
      filters.value.categoryId = categoryId
      
      const requestParams = {
        page: pagination.value.currentPage,
        limit: pagination.value.itemsPerPage,
        ...filters.value,
        ...params
      }
      
      const response = await productApi.getProductsByCategory(categoryId, requestParams)
      const apiResponse = response.data as ApiResponse<PaginationResponse<ProductAPI.ProductInfo>>
      
      if (apiResponse.success) {
        const data = apiResponse.data
        products.value = data.data
        pagination.value = {
          currentPage: data.page,
          totalPages: data.totalPages,
          totalItems: data.total,
          itemsPerPage: data.limit
        }
      } else {
        throw new Error(apiResponse.message || '獲取分類商品失敗')
      }
    } catch (err: any) {
      error.value = err.message || '獲取分類商品失敗'
      console.error('Failed to fetch products by category:', err)
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters: Partial<typeof filters.value>) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.currentPage = 1 // 重置到第一頁
  }

  const clearFilters = () => {
    filters.value = {
      categoryId: undefined,
      vendorId: undefined,
      keyword: '',
      priceMin: undefined,
      priceMax: undefined,
      rating: undefined,
      inStock: undefined,
      sortBy: 'id',
      sortOrder: 'desc'
    }
    pagination.value.currentPage = 1
  }

  const setPage = (page: number) => {
    pagination.value.currentPage = page
  }

  const setItemsPerPage = (limit: number) => {
    pagination.value.itemsPerPage = limit
    pagination.value.currentPage = 1
  }

  // 獲取商品詳情（含規格變體）
  const fetchProductDetail = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await productApi.getProductDetail(id)
      currentProductDetail.value = response.data
      
      // 同時獲取相關商品
      await fetchSimilarProducts(id)
      
    } catch (err: any) {
      error.value = err.message || '獲取商品詳情失敗'
      console.error('Failed to fetch product detail:', err)
    } finally {
      loading.value = false
    }
  }

  // 獲取分類詳情
  const fetchCategoryDetail = async (id: number) => {
    try {
      const response = await productApi.getCategoryDetail(id)
      currentCategory.value = response.data
    } catch (err: any) {
      console.error('Failed to fetch category detail:', err)
    }
  }

  // 獲取相似商品
  const fetchSimilarProducts = async (productId: number, limit: number = 8) => {
    try {
      const products = await productApi.getSimilarProducts(productId, limit)
      relatedProducts.value = products
    } catch (err: any) {
      console.error('Failed to fetch similar products:', err)
    }
  }

  // 獲取熱門商品
  const fetchPopularProducts = async (limit: number = 12) => {
    try {
      const products = await productApi.getPopularProducts(limit)
      popularProducts.value = products
    } catch (err: any) {
      console.error('Failed to fetch popular products:', err)
    }
  }

  // 獲取新品
  const fetchNewProducts = async (limit: number = 12) => {
    try {
      const products = await productApi.getNewProducts(limit)
      newProducts.value = products
    } catch (err: any) {
      console.error('Failed to fetch new products:', err)
    }
  }

  // 增加商品瀏覽次數
  const incrementViewCount = async (productId: number) => {
    try {
      await productApi.incrementViewCount(productId)
    } catch (err: any) {
      console.error('Failed to increment view count:', err)
    }
  }

  // 檢查商品庫存
  const checkProductStock = async (productId: number, productSpecId?: number, quantity?: number) => {
    try {
      return await productApi.checkStock(productId, productSpecId, quantity)
    } catch (err: any) {
      console.error('Failed to check stock:', err)
      return { inStock: false, availableStock: 0 }
    }
  }

  return {
    // State
    products,
    currentProduct,
    currentProductDetail,
    categories,
    currentCategory,
    relatedProducts,
    popularProducts,
    newProducts,
    loading,
    error,
    pagination,
    filters,
    
    // Getters
    availableProducts,
    getProductsByCategory,
    getProductsByVendor,
    
    // Actions
    fetchProducts,
    fetchProduct,
    fetchProductDetail,
    fetchCategories,
    fetchCategoryDetail,
    searchProducts,
    fetchProductsByCategory,
    fetchSimilarProducts,
    fetchPopularProducts,
    fetchNewProducts,
    incrementViewCount,
    checkProductStock,
    updateFilters,
    clearFilters,
    setPage,
    setItemsPerPage
  }
})