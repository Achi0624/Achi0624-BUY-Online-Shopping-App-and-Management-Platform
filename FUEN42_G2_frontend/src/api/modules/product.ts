import http from '../http'
import type { ProductAPI, PaginationResponse } from '@/types/api'

// B組 (李奕錡) - 商品與分類管理 API 模組
// 使用原生 fetch 與 axios 混合模式，提供更靈活的 API 呼叫

const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:7044/api'

// 原生 fetch 封裝 - 用於純 JSON API 呼叫
const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('access_token')
  const url = `${API_BASE}${endpoint}`

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  }

  if (import.meta.env.DEV) {
    console.log(`📤 [FETCH ${options.method || 'GET'}] ${url}`, options.body)
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    if (import.meta.env.DEV) {
      console.log(`📥 [FETCH ${options.method || 'GET'}] ${url}`, data)
    }

    return data
  } catch (error) {
    console.error(`❌ Fetch API Error [${endpoint}]:`, error)
    throw error
  }
}

// 後端通用回應包裝
type ApiResponse<T> = { success: boolean; data: T; message?: string; code?: string }

// 後端的分頁資料鍵為 data/total/page/limit/totalPages（已由 ASP.NET 轉為 camelCase）
type BackendPaged<T> = { data: T[]; total: number; page: number; limit: number; totalPages: number }

// 映射後端 Product DTO 為前端型別
const mapProduct = (p: any): ProductAPI.ProductInfo => ({
  id: p.id,
  vendorId: p.vendorId,
  categoryId: p.categoryId,
  productName: p.productName,
  description: p.description,
  basePrice: p.basePrice,
  stock: p.stock,
  sku: p.sku ?? '',
  barcode: p.barcode,
  isActive: p.isActive,
  status: p.status,
  viewCount: p.viewCount,
  soldCount: p.soldCount,
  rating: p.rating,
  reviewCount: p.reviewCount,
  media: (p.media || []).map((m: any) => ({
    id: m.id,
    productId: m.productId,
    mediaType: m.mediaType,
    mediaUrl: m.mediaUrl,
    isDefault: m.isDefault
  })),
  category: p.category
    ? {
      id: p.category.id,
      parentId: p.category.parentId,
      categoryName: p.category.categoryName,
      description: p.category.description,
      iconUrl: undefined,
      level: p.category.level,
      sortOrder: p.category.sortOrder ?? 0,
      children: p.category.children || [],
      parentCategory: p.category.parentCategory
        ? {
          id: p.category.parentCategory.id,
          parentId: p.category.parentCategory.parentId,
          categoryName: p.category.parentCategory.categoryName,
          description: p.category.parentCategory.description,
          iconUrl: undefined,
          level: p.category.parentCategory.level,
          sortOrder: p.category.parentCategory.sortOrder ?? 0
        }
        : undefined
    }
    : (undefined as any),
  vendor: p.vendor
    ? {
      id: p.vendor.id,
      vendorName: p.vendor.vendorName,
      rating: typeof p.vendor.rating === 'number' ? p.vendor.rating : 0
    }
    : { id: 0, vendorName: '', rating: 0 },
  specs: (p.specs || []).map((s: any) => ({
    id: s.id,
    productId: s.productId,
    specName: s.specName,
    specValue: s.specValue,
    additionalPrice: Number(s.additionalPrice ?? 0),
    stock: s.stock
  }))
})

const mapPaged = <T>(paged: BackendPaged<any>, mapper: (x: any) => T): PaginationResponse<T> => ({
  items: (paged.data || []).map(mapper),
  totalCount: paged.total ?? 0,
  pageNumber: paged.page ?? 1,
  pageSize: paged.limit ?? 0,
  totalPages: paged.totalPages ?? 0
})

export const productApi = {
  // 獲取商品列表 (分頁) - 使用 fetch
  getProducts: async (params?: ProductAPI.ProductListRequest): Promise<PaginationResponse<ProductAPI.ProductInfo>> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const query = queryParams.toString()
    const res = await fetchApi<ApiResponse<BackendPaged<any>>>(`/products${query ? `?${query}` : ''}`)
    return mapPaged(res.data, mapProduct)
  },

  // 獲取商品詳情 - 使用 fetch
  getProduct: async (id: number): Promise<ProductAPI.ProductInfo> => {
    const res = await fetchApi<ApiResponse<any>>(`/products/${id}`)
    return mapProduct(res.data)
  },

  // 獲取商品詳細資訊 (含規格變體) - 使用 fetch
  getProductDetail: async (id: number): Promise<{ data: ProductAPI.ProductDetailInfo }> => {
    const res = await fetchApi<ApiResponse<any>>(`/products/${id}/detail`)
    const p = res.data
    const base = mapProduct(p)
    const detail: ProductAPI.ProductDetailInfo = {
      ...base,
      specifications: (p.specifications || []).map((sp: any) => ({
        id: sp.id,
        productId: sp.productId,
        specName: sp.specName,
        specValue: sp.specValue
      })),
      variants: (p.variants || []).map((v: any) => ({
        id: v.id,
        productId: v.productId,
        variantTypeId: v.variantTypeId,
        variantValue: v.variantValue,
        price: v.price,
        stock: v.stock
      })),
      variantTypes: (p.variantTypes || []).map((t: any) => ({
        id: t.id,
        typeName: t.typeName
      }))
    }
    return { data: detail }
  },

  // 搜尋商品 - 使用 fetch
  searchProducts: async (keyword: string, params?: Omit<ProductAPI.ProductListRequest, 'keyword'>): Promise<PaginationResponse<ProductAPI.ProductInfo>> => {
    const queryParams = new URLSearchParams({ keyword })
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const res = await fetchApi<ApiResponse<BackendPaged<any>>>(`/products/search?${queryParams.toString()}`)
    return mapPaged(res.data, mapProduct)
  },

  // 獲取商品分類 - 使用 fetch
  getCategories: async (): Promise<ProductAPI.CategoryInfo[]> => {
    const response = await fetchApi<{ success: boolean; data: ProductAPI.CategoryInfo[] }>('/categories')
    return response.data || []
  },

  // 獲取分類詳情 - 使用 fetch
  getCategoryDetail: async (id: number): Promise<{ data: ProductAPI.CategoryInfo }> => {
    const response = await fetchApi<{ success: boolean; data: ProductAPI.CategoryInfo }>(`/categories/${id}`)
    return { data: response.data }
  },

  // 獲取子分類 - 使用 fetch
  getSubcategories: async (parentId: number): Promise<{ data: ProductAPI.CategoryInfo[] }> => {
    const response = await fetchApi<{ success: boolean; data: ProductAPI.CategoryInfo[] }>(`/categories/${parentId}/subcategories`)
    return { data: response.data || [] }
  },

  // 獲取分類下的商品 - 使用 fetch
  getProductsByCategory: async (categoryId: number, params?: Omit<ProductAPI.ProductListRequest, 'categoryId'>): Promise<PaginationResponse<ProductAPI.ProductInfo>> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const query = queryParams.toString()
    const response = await fetchApi<{ success: boolean; data: PaginationResponse<ProductAPI.ProductInfo> }>(`/categories/${categoryId}/products${query ? `?${query}` : ''}`)
    return response.data || { data: [], total: 0, page: 1, limit: 24, totalPages: 0 }
  },

  // 獲取廠商的商品 - 使用 axios (保持向後兼容)
  getProductsByVendor: (vendorId: number, params?: Omit<ProductAPI.ProductListRequest, 'vendorId'>) =>
    http.get<PaginationResponse<ProductAPI.ProductInfo>>(`/vendors/${vendorId}/products`, { params }),

  // 獲取熱門商品 - 使用 fetch
  getPopularProducts: async (limit: number = 12): Promise<ProductAPI.ProductInfo[]> => {
    const res = await fetchApi<ApiResponse<any[]>>(`/products/popular?limit=${limit}`)
    return (res.data || []).map(mapProduct)
  },

  // 獲取推薦商品 - 使用 fetch  
  getRecommendedProducts: async (limit: number = 12): Promise<ProductAPI.ProductInfo[]> => {
    // 後端如未提供 /products/recommended，先回退至熱門商品
    try {
      const res = await fetchApi<ApiResponse<any[]>>(`/products/recommended?limit=${limit}`)
      return (res.data || []).map(mapProduct)
    } catch {
      const res = await fetchApi<ApiResponse<any[]>>(`/products/popular?limit=${limit}`)
      return (res.data || []).map(mapProduct)
    }
  },

  // 獲取新品 - 使用 fetch
  getNewProducts: async (limit: number = 12): Promise<ProductAPI.ProductInfo[]> => {
    const res = await fetchApi<ApiResponse<any[]>>(`/products/new?limit=${limit}`)
    return (res.data || []).map(mapProduct)
  },

  // 獲取商品評價 - 使用 fetch
  getProductReviews: async (productId: number, params?: { page?: number; limit?: number }): Promise<PaginationResponse<ProductAPI.ReviewInfo>> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const query = queryParams.toString()
    const res = await fetchApi<ApiResponse<BackendPaged<any>>>(`/products/${productId}/reviews${query ? `?${query}` : ''}`)
    return mapPaged(res.data, (r: any) => ({
      id: r.id,
      productId: r.productId,
      memberName: r.memberName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
    }))
  },

  // 新增商品評價 - 使用 axios
  addProductReview: (productId: number, data: {
    orderItemId: number
    rating: number
    comment: string
    images?: string[]
  }) =>
    http.post<ProductAPI.ProductReviewInfo>(`/products/${productId}/reviews`, data),

  // 增加商品瀏覽次數 - 使用 fetch (輕量級操作)
  incrementViewCount: async (productId: number): Promise<void> => {
    await fetchApi<ApiResponse<boolean>>(`/products/${productId}/view`, { method: 'PATCH' })
  },

  // 檢查商品庫存 - 使用 fetch
  checkStock: async (productId: number, productSpecId?: number, quantity?: number): Promise<{ inStock: boolean; availableStock: number }> => {
    const queryParams = new URLSearchParams()
    if (productSpecId) queryParams.append('productSpecId', productSpecId.toString())
    if (quantity) queryParams.append('quantity', quantity.toString())
    const query = queryParams.toString()
    const res = await fetchApi<ApiResponse<{ inStock: boolean; availableStock: number }>>(`/products/${productId}/stock${query ? `?${query}` : ''}`)
    return res.data
  },

  // 新增：獲取商品的相似商品
  getSimilarProducts: async (productId: number, limit: number = 8): Promise<ProductAPI.ProductInfo[]> => {
    // 後端如未提供，回傳空陣列避免頁面崩潰
    try {
      const res = await fetchApi<ApiResponse<any[]>>(`/products/${productId}/similar?limit=${limit}`)
      return (res.data || []).map(mapProduct)
    } catch {
      return []
    }
  },

  // 新增：獲取商品的瀏覽歷史
  getViewHistory: async (limit: number = 10): Promise<ProductAPI.ProductInfo[]> => {
    // 後端如未提供，回傳空陣列避免頁面崩潰
    try {
      const res = await fetchApi<ApiResponse<any[]>>(`/products/history?limit=${limit}`)
      return (res.data || []).map(mapProduct)
    } catch {
      return []
    }
  },

  // 新增：加入願望清單
  addToWishlist: async (productId: number): Promise<void> => {
    await fetchApi('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId })
    })
  },

  // 新增：從願望清單移除
  removeFromWishlist: async (productId: number): Promise<void> => {
    await fetchApi(`/wishlist/remove/${productId}`, { method: 'DELETE' })
  },

  // 新增：獲取願望清單
  getWishlist: async (page: number = 1, limit: number = 20): Promise<PaginationResponse<ProductAPI.ProductInfo>> => {
    return await fetchApi(`/wishlist?page=${page}&limit=${limit}`)
  },

  // 新增：檢查商品是否在願望清單中
  isInWishlist: async (productId: number): Promise<{ isInWishlist: boolean }> => {
    return await fetchApi(`/wishlist/check/${productId}`)
  }
}

export default productApi