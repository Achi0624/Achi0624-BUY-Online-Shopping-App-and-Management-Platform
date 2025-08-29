import http from '../http'
import type { 
  CouponAPI,
  PaginationResponse
} from '@/types/api'
import { createMockWrapper, mockAnnouncementApi } from '@/utils/mockApiWrapper'

// 原始API函數
const originalAnnouncementApi = {
  // 獲取公告列表 - GET: api/announcements
  getAnnouncements: async (params?: CouponAPI.AnnouncementListRequest): Promise<{ data: PaginationResponse<CouponAPI.AnnouncementInfo>; status: number; headers: any }> => {
    const response = await http.get<CouponAPI.AnnouncementInfo[]>('/announcements', { params })
    
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

  // 獲取公告詳情 - GET: api/announcements/{id} (自動增加瀏覽次數)
  getAnnouncement: (id: number) =>
    http.get<CouponAPI.AnnouncementInfo>(`/announcements/${id}`),

  // 獲取活動公告 - GET: api/announcements/active
  getActiveAnnouncements: (areaId?: number, limit: number = 5) =>
    http.get<CouponAPI.AnnouncementInfo[]>('/announcements/active', {
      params: areaId !== undefined ? { areaId, limit } : { limit }
    })
}

// 公告相關API (對應後端 AnnouncementsController) - 包含Mock數據回退功能
export const announcementApi = {
  // 使用mock包裝器的API方法
  getAnnouncements: createMockWrapper(
    originalAnnouncementApi.getAnnouncements,
    mockAnnouncementApi.getAnnouncements,
    '公告列表'
  ),

  getAnnouncement: createMockWrapper(
    originalAnnouncementApi.getAnnouncement,
    mockAnnouncementApi.getAnnouncement,
    '公告詳情'
  ),

  getActiveAnnouncements: createMockWrapper(
    originalAnnouncementApi.getActiveAnnouncements,
    mockAnnouncementApi.getActiveAnnouncements,
    '活動公告'
  ),

  // 以下API方法暫時不使用mock包裝（需要時可以添加）
  // 創建公告 - POST: api/announcements
  createAnnouncement: (data: CouponAPI.CreateAnnouncementRequest) =>
    http.post<CouponAPI.AnnouncementInfo>('/announcements', data),

  // 更新公告 - PUT: api/announcements/{id}
  updateAnnouncement: (id: number, data: CouponAPI.UpdateAnnouncementRequest) =>
    http.put(`/announcements/${id}`, data),

  // 刪除公告 - DELETE: api/announcements/{id}
  deleteAnnouncement: (id: number) =>
    http.delete(`/announcements/${id}`),

  // 獲取公告區域列表 - GET: api/announcements/areas
  getAnnouncementAreas: () =>
    http.get<CouponAPI.AnnouncementAreaInfo[]>('/announcements/areas'),

  // 獲取首頁公告 - GET: api/announcements/home
  getHomeAnnouncements: (areaId?: number, limit: number = 5) =>
    http.get<CouponAPI.AnnouncementInfo[]>('/announcements/home', {
      params: areaId !== undefined ? { areaId, limit } : { limit }
    }),

  // 獲取公告統計 - GET: api/announcements/statistics
  getAnnouncementStatistics: () =>
    http.get<CouponAPI.AnnouncementStatistics>('/announcements/statistics')
}