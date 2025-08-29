import axios, { type AxiosInstance, type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { shouldUseMockData, createMockResponse } from './mockInterceptor'

// API 響應格式 (對應 ASP.NET Core Web API)
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errorCode?: string
  timestamp?: string
}

// 分頁響應格式
export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// 創建 axios 實例
const http: AxiosInstance = axios.create({
  // 更新 API 基礎 URL 對接實際後端 - 使用正確的HTTPS 7044端口
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7044/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  withCredentials: true, // 允許攜帶認證資訊
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 請求攔截器
http.interceptors.request.use(
  async (config) => {
    // 檢查是否使用模擬數據
    if (shouldUseMockData()) {
      try {
        const mockResponse = await createMockResponse(config)
        // 直接返回模擬響應，中斷真實請求
        return Promise.reject({
          isMockResponse: true,
          response: mockResponse
        })
      } catch (error) {
        console.error('❌ Mock API Error:', error)
      }
    }
    
    // 從 localStorage 獲取 token (暫時不使用 store 避免循環依賴)
    const token = localStorage.getItem('access_token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 開發環境日誌
    if (import.meta.env.DEV) {
      console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`, config.data)
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 響應攔截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 開發環境日誌
    if (import.meta.env.DEV) {
      console.log(`📥 [${response.config.method?.toUpperCase()}] ${response.config.url}`, response.data)
    }
    
    return response
  },
  async (error: any) => {
    // 處理模擬響應
    if (error.isMockResponse) {
      if (import.meta.env.DEV) {
        console.log('📥 [MOCK]', error.response.data)
      }
      return error.response
    }
    
    const { response } = error as AxiosError<ApiResponse>
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 400:
          // 請求錯誤
          console.error('❌ 請求參數錯誤:', data?.message || '請檢查輸入資料')
          break
          
        case 401:
          // 未授權，清除 token 並跳轉到登入頁
          console.error('❌ 未授權，請重新登入')
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_info')
          
          // 避免在登入頁重複跳轉
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
          
        case 403:
          console.error('❌ 沒有權限訪問此資源')
          break
          
        case 404:
          console.error('❌ 請求的資源不存在')
          break
          
        case 409:
          console.error('❌ 資源衝突:', data?.message || '操作與現有資料衝突')
          break
          
        case 422:
          console.error('❌ 驗證錯誤:', data?.message || '輸入資料驗證失敗')
          break
          
        case 500:
          console.error('❌ 伺服器錯誤，請稍後再試')
          break
          
        case 502:
        case 503:
        case 504:
          console.error('❌ 服務暫時無法使用，請稍後再試')
          break
          
        default:
          console.error(`❌ 請求失敗 (${status}):`, data?.message || '未知錯誤')
      }
    } else if (error.request) {
      // 網路錯誤 - 在開發模式下提供更友好的提示
      if (import.meta.env.DEV) {
        console.warn('⚠️ API連接失敗：無法連接到後端伺服器')
        console.info('💡 請啟動ASP.NET Core後端服務器:')
        console.info('   1. 在後端專案目錄執行: dotnet run')
        console.info('   2. 或在Visual Studio中啟動專案')
        console.info('   3. 確保API運行在: https://localhost:7044')
      } else {
        console.error('❌ 網路錯誤：無法連接到伺服器')
      }
    } else {
      console.error('❌ 請求配置錯誤:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// 通用請求方法封裝
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return http.get(url, config)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return http.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return http.put(url, data, config)
  },
  
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return http.patch(url, data, config)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return http.delete(url, config)
  }
}

export default http