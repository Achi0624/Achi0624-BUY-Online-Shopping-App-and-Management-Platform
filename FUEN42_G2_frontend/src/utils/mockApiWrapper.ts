/**
 * API Mock 攔截器
 * 當後端API不可用時，自動切換到mock數據
 */

import { 
  mockAnnouncements, 
  createMockAnnouncementResponse, 
  getMockAnnouncementById, 
  getMockActiveAnnouncements 
} from './mockAnnouncementData'
import type { CouponAPI } from '@/types/api'

// 檢查是否為開發環境且後端不可用
export const shouldUseMockData = () => {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true'
}

// 模擬公告API
export const mockAnnouncementApi = {
  // 獲取公告列表
  getAnnouncements: async (params?: CouponAPI.AnnouncementListRequest) => {
    console.log('🔄 使用 Mock 數據 - 獲取公告列表')
    
    // 模擬API延遲
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filteredAnnouncements = [...mockAnnouncements]
    
    // 應用篩選條件
    if (params?.isActive !== undefined) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.isActive === params.isActive)
    }
    
    if (params?.areaId) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.announcementAreaId === params.areaId)
    }
    
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredAnnouncements = filteredAnnouncements.filter(a => 
        a.title.toLowerCase().includes(keyword) || 
        a.content.toLowerCase().includes(keyword)
      )
    }
    
    // 應用分頁
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    const pagedItems = filteredAnnouncements.slice(startIndex, endIndex)
    
    return {
      data: {
        items: pagedItems,
        totalCount: filteredAnnouncements.length,
        pageNumber: page,
        pageSize: pageSize,
        totalPages: Math.ceil(filteredAnnouncements.length / pageSize)
      },
      status: 200,
      headers: {
        'x-total-count': filteredAnnouncements.length.toString(),
        'x-page': page.toString(),
        'x-page-size': pageSize.toString()
      }
    }
  },

  // 獲取公告詳情
  getAnnouncement: async (id: number) => {
    console.log(`🔄 使用 Mock 數據 - 獲取公告詳情 ID: ${id}`)
    
    // 模擬API延遲
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const announcement = getMockAnnouncementById(id)
    
    if (!announcement) {
      throw new Error(`公告 ID ${id} 不存在`)
    }
    
    // 模擬瀏覽次數增加
    announcement.viewCount += 1
    
    return {
      data: announcement,
      status: 200,
      headers: {}
    }
  },

  // 獲取活動公告
  getActiveAnnouncements: async (areaId?: number, limit: number = 5) => {
    console.log('🔄 使用 Mock 數據 - 獲取活動公告')
    
    // 模擬API延遲
    await new Promise(resolve => setTimeout(resolve, 150))
    
    let activeAnnouncements = getMockActiveAnnouncements(limit)
    
    if (areaId !== undefined) {
      activeAnnouncements = activeAnnouncements.filter(a => a.announcementAreaId === areaId)
    }
    
    return {
      data: activeAnnouncements,
      status: 200,
      headers: {}
    }
  }
}

// 包裝原始API，當檢測到網路錯誤時自動切換到mock數據
export const createMockWrapper = <T extends (...args: any[]) => Promise<any>>(
  originalApi: T,
  mockApi: T,
  apiName: string
): T => {
  return (async (...args: any[]) => {
    // 如果明確設定使用mock數據
    if (shouldUseMockData()) {
      return mockApi(...args)
    }
    
    try {
      return await originalApi(...args)
    } catch (error: any) {
      // 如果是網路連接錯誤，自動切換到mock數據
      if (error.code === 'ERR_NETWORK' || error.request) {
        console.warn(`⚠️ ${apiName} API 連接失敗，自動切換到 Mock 數據`)
        return mockApi(...args)
      }
      
      // 其他錯誤直接拋出
      throw error
    }
  }) as T
}
