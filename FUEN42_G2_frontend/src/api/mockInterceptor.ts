import type { AxiosRequestConfig } from 'axios'
import { mockProducts, mockCategories, createMockPaginationResponse, mockApiDelay } from '@/utils/mockData'
import type { ProductAPI, PaginationResponse } from '@/types/api'

// 檢查是否應該使用模擬數據
const shouldUseMockData = () => {
  // 檢查 localStorage 設定
  const useMockFromStorage = localStorage.getItem('use_mock_data')
  if (useMockFromStorage === 'false') {
    return false
  }
  
  // 如果有設定 VITE_API_URL 環境變數，就使用真實 API
  if (import.meta.env.VITE_API_URL) {
    return false
  }
  
  // 預設在開發環境下不使用 Mock API（改為連接真實後端）
  return false
}

// 模擬 API 響應生成器
export const createMockResponse = async (config: AxiosRequestConfig): Promise<any> => {
  // 添加延遲以模擬網路請求
  await mockApiDelay(500)

  const { url, method, params } = config
  const baseUrl = url?.replace(/^\/api/, '') || ''

  console.log(`🎭 Mock API: ${method?.toUpperCase()} ${baseUrl}`, params)

  // 處理商品相關 API
  if (baseUrl.startsWith('/products')) {
    return handleProductsAPI(baseUrl, method || 'get', params)
  }

  // 處理分類相關 API
  if (baseUrl.startsWith('/categories')) {
    return handleCategoriesAPI(baseUrl, method || 'get', params)
  }

  // 預設響應
  return {
    data: {
      success: false,
      message: `Mock API not implemented for ${baseUrl}`,
      data: null
    }
  }
}

// 處理商品 API
const handleProductsAPI = (url: string, method: string, params: any = {}) => {
  const {
    page = 1,
    limit = 12,
    keyword = '',
    categoryId,
    vendorId,
    priceMin,
    priceMax,
    rating,
    inStock,
    sortBy = 'id',
    sortOrder = 'desc'
  } = params

  // 獲取商品列表
  if (url === '/products' || url.includes('/search')) {
    let filteredProducts = [...mockProducts]

    // 關鍵字搜尋
    if (keyword) {
      filteredProducts = filteredProducts.filter(product =>
        product.productName.toLowerCase().includes(keyword.toLowerCase()) ||
        product.description.toLowerCase().includes(keyword.toLowerCase())
      )
    }

    // 分類篩選
    if (categoryId) {
      filteredProducts = filteredProducts.filter(product =>
        product.categoryId === Number(categoryId)
      )
    }

    // 廠商篩選
    if (vendorId) {
      filteredProducts = filteredProducts.filter(product =>
        product.vendorId === Number(vendorId)
      )
    }

    // 價格篩選
    if (priceMin !== undefined && priceMin !== null) {
      filteredProducts = filteredProducts.filter(product =>
        product.basePrice >= Number(priceMin)
      )
    }

    if (priceMax !== undefined && priceMax !== null) {
      filteredProducts = filteredProducts.filter(product =>
        product.basePrice <= Number(priceMax)
      )
    }

    // 評分篩選
    if (rating) {
      filteredProducts = filteredProducts.filter(product =>
        product.rating && product.rating >= Number(rating)
      )
    }

    // 庫存篩選
    if (inStock) {
      filteredProducts = filteredProducts.filter(product =>
        product.stock > 0
      )
    }

    // 排序
    filteredProducts.sort((a, b) => {
      let aVal: any, bVal: any

      switch (sortBy) {
        case 'basePrice':
          aVal = a.basePrice
          bVal = b.basePrice
          break
        case 'soldCount':
          aVal = a.soldCount
          bVal = b.soldCount
          break
        case 'rating':
          aVal = a.rating || 0
          bVal = b.rating || 0
          break
        case 'createdAt':
          aVal = a.id // 用 ID 模擬創建時間
          bVal = b.id
          break
        default:
          aVal = a.id
          bVal = b.id
      }

      if (sortOrder === 'asc') {
        return aVal - bVal
      } else {
        return bVal - aVal
      }
    })

    const paginationResponse = createMockPaginationResponse(filteredProducts, Number(page), Number(limit))

    return {
      data: {
        success: true,
        data: paginationResponse,
        message: '獲取商品列表成功'
      }
    }
  }

  // 獲取單個商品
  const productIdMatch = url.match(/^\/products\/(\d+)$/)
  if (productIdMatch) {
    const productId = Number(productIdMatch[1])
    const product = mockProducts.find(p => p.id === productId)

    if (product) {
      return {
        data: {
          success: true,
          data: product,
          message: '獲取商品詳情成功'
        }
      }
    } else {
      return {
        data: {
          success: false,
          message: '商品不存在',
          data: null
        }
      }
    }
  }

  // 獲取熱門商品
  if (url === '/products/popular') {
    const popularProducts = [...mockProducts]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, Number(params.limit || 12))

    return {
      data: {
        success: true,
        data: popularProducts,
        message: '獲取熱門商品成功'
      }
    }
  }

  // 獲取推薦商品
  if (url === '/products/recommended') {
    const recommendedProducts = [...mockProducts]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, Number(params.limit || 12))

    return {
      data: {
        success: true,
        data: recommendedProducts,
        message: '獲取推薦商品成功'
      }
    }
  }

  // 獲取新品
  if (url === '/products/new') {
    const newProducts = [...mockProducts]
      .reverse() // 假設 ID 越大越新
      .slice(0, Number(params.limit || 12))

    return {
      data: {
        success: true,
        data: newProducts,
        message: '獲取新品成功'
      }
    }
  }

  return {
    data: {
      success: false,
      message: `Product API not implemented: ${url}`,
      data: null
    }
  }
}

// 處理分類 API
const handleCategoriesAPI = (url: string, method: string, params: any = {}) => {
  // 獲取所有分類
  if (url === '/categories') {
    return {
      data: {
        success: true,
        data: mockCategories,
        message: '獲取分類列表成功'
      }
    }
  }

  // 獲取分類下的商品
  const categoryProductsMatch = url.match(/^\/categories\/(\d+)\/products$/)
  if (categoryProductsMatch) {
    const categoryId = Number(categoryProductsMatch[1])
    const categoryProducts = mockProducts.filter(product => product.categoryId === categoryId)
    const paginationResponse = createMockPaginationResponse(
      categoryProducts,
      Number(params.page || 1),
      Number(params.limit || 12)
    )

    return {
      data: {
        success: true,
        data: paginationResponse,
        message: '獲取分類商品成功'
      }
    }
  }

  return {
    data: {
      success: false,
      message: `Category API not implemented: ${url}`,
      data: null
    }
  }
}

export { shouldUseMockData }