import http from '../http'
import type { 
  CouponAPI,
  PaginationResponse
} from '@/types/api'

// 廣告橫幅相關API (對應後端 BannersController)
export const bannerApi = {
  // 獲取廣告橫幅列表 - GET: api/banners
  getBanners: async (params?: CouponAPI.BannerListRequest): Promise<{ data: PaginationResponse<CouponAPI.BannerInfo>; status: number; headers: any }> => {
    const response = await http.get<CouponAPI.BannerInfo[]>('/banners', { params })
    
    // 從響應頭獲取分頁資訊
    const totalCount = parseInt(response.headers['x-total-count'] || '0')
    const page = parseInt(response.headers['x-page'] || '1')  
    const pageSize = parseInt(response.headers['x-page-size'] || '10')
    
    return {
      data: {
        items: response.data,
        totalCount,
        pageNumber: page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalCount / (pageSize || 1)))
      },
      status: response.status,
      headers: response.headers
    }
  },

  // 獲取廣告橫幅詳情 - GET: api/banners/{id}
  getBanner: (id: number) =>
    http.get<CouponAPI.BannerInfo>(`/banners/${id}`),

  // 創建廣告橫幅 - POST: api/banners (支持 FormData)
  createBanner: (data: FormData | CouponAPI.CreateBannerRequest) =>
    http.post<CouponAPI.BannerInfo>('/banners', data),

  // 更新廣告橫幅 - PUT: api/banners/{id} (支持 FormData)
  updateBanner: (id: number, data: FormData | CouponAPI.UpdateBannerRequest) =>
    http.put(`/banners/${id}`, data),

  // 刪除廣告橫幅 - DELETE: api/banners/{id}
  deleteBanner: (id: number) =>
    http.delete(`/banners/${id}`),

  // 獲取活動廣告橫幅 - GET: api/banners/active
  getActiveBanners: (areaId?: number) =>
    http.get<CouponAPI.BannerInfo[]>('/banners/active', {
      params: areaId !== undefined ? { areaId } : {}
    }),

  // 記錄點擊次數 - POST: api/banners/{id}/click
  recordClick: (id: number, clickData?: { userAgent?: string; ipAddress?: string }) =>
    http.post(`/banners/${id}/click`, clickData || {}),

  // 記錄瀏覽次數 - POST: api/banners/{id}/view
  recordView: (id: number) =>
    http.post(`/banners/${id}/view`),

  // 獲取廣告區域列表 - GET: api/banners/areas
  getBannerAreas: () =>
    http.get<CouponAPI.BannerAreaInfo[]>('/banners/areas'),

  // 獲取廣告橫幅統計 - GET: api/banners/statistics
  getBannerStatistics: (areaId?: number) =>
    http.get<CouponAPI.BannerStatistics>('/banners/statistics', {
      params: areaId !== undefined ? { areaId } : {}
    }),

  // 批量更新橫幅狀態 - PATCH: api/banners/batch-status
  batchUpdateStatus: (ids: number[], isActive: boolean) =>
    http.patch('/banners/batch-status', {
      bannerIds: ids,
      isActive
    }),

  // 批量刪除橫幅 - DELETE: api/banners/batch
  batchDelete: (ids: number[]) =>
    http.delete('/banners/batch', {
      data: { bannerIds: ids }
    })
}