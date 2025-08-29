import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { announcementApi } from '@/api/modules/announcement'
import type { CouponAPI } from '@/types/api'

export const useAnnouncementStore = defineStore('announcement', () => {
  // State
  const announcements = ref<CouponAPI.AnnouncementInfo[]>([])
  const currentAnnouncement = ref<CouponAPI.AnnouncementInfo | null>(null)
  const announcementAreas = ref<CouponAPI.AnnouncementAreaInfo[]>([])
  const homeAnnouncements = ref<CouponAPI.AnnouncementInfo[]>([])
  const statistics = ref<CouponAPI.AnnouncementStatistics | null>(null)
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 分頁相關
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalCount = ref(0)
  const totalPages = ref(0)

  // Getters
  const activeAnnouncements = computed(() =>
    announcements.value.filter(announcement => announcement.isActive)
  )

  const pinnedAnnouncements = computed(() =>
    announcements.value.filter(announcement => announcement.priority > 0)
  )

  const hasMore = computed(() => currentPage.value < totalPages.value)

  // Actions
  const fetchAnnouncements = async (params?: CouponAPI.AnnouncementListRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await announcementApi.getAnnouncements({
        page: currentPage.value,
        pageSize: pageSize.value,
        ...params
      })
      
      // 直接使用後端響應格式
      const data = response.data
      announcements.value = data.items
      totalCount.value = data.totalCount
      totalPages.value = data.totalPages
      currentPage.value = data.pageNumber
    } catch (err) {
      error.value = '獲取公告列表失敗'
      console.error('Failed to fetch announcements:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchAnnouncementById = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await announcementApi.getAnnouncement(id)
      
      // 直接使用後端響應格式 (後端自動增加瀏覽次數)
      currentAnnouncement.value = response.data
    } catch (err) {
      error.value = '獲取公告詳情失敗'
      console.error('Failed to fetch announcement:', err)
    } finally {
      loading.value = false
    }
  }

  const createAnnouncement = async (data: CouponAPI.CreateAnnouncementRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await announcementApi.createAnnouncement(data)
      
      // 重新獲取列表
      await fetchAnnouncements()
      return response.data
    } catch (err) {
      error.value = '創建公告失敗'
      console.error('Failed to create announcement:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAnnouncement = async (id: number, data: CouponAPI.UpdateAnnouncementRequest) => {
    try {
      loading.value = true
      error.value = null
      
      await announcementApi.updateAnnouncement(id, data)
      
      // 重新獲取列表以確保資料最新
      await fetchAnnouncements()
      
      // 如果是當前公告，重新獲取
      if (currentAnnouncement.value?.id === id) {
        await fetchAnnouncementById(id)
      }
    } catch (err) {
      error.value = '更新公告失敗'
      console.error('Failed to update announcement:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAnnouncement = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      await announcementApi.deleteAnnouncement(id)
      
      // 從本地狀態中移除
      const index = announcements.value.findIndex(a => a.id === id)
      if (index !== -1) {
        announcements.value.splice(index, 1)
        totalCount.value--
      }
      
      // 如果刪除的是當前公告，清空當前公告
      if (currentAnnouncement.value?.id === id) {
        currentAnnouncement.value = null
      }
    } catch (err) {
      error.value = '刪除公告失敗'
      console.error('Failed to delete announcement:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAnnouncementAreas = async () => {
    try {
      const response = await announcementApi.getAnnouncementAreas()
      
      announcementAreas.value = response.data
    } catch (err) {
      console.error('Failed to fetch announcement areas:', err)
    }
  }

  const fetchHomeAnnouncements = async (areaId?: number, limit: number = 5) => {
    try {
      console.log('📢 正在獲取首頁公告，區域ID:', areaId, '限制數量:', limit)
      
      // 使用活動公告API並限制數量
      const response = await announcementApi.getActiveAnnouncements(areaId, limit)
      
      console.log('📢 API響應:', response.data)
      
      // 手動處理分頁限制和區域篩選
      let filteredAnnouncements = response.data
      
      if (areaId) {
        filteredAnnouncements = filteredAnnouncements.filter(a => a.announcementAreaId === areaId)
        console.log('📢 區域篩選後:', filteredAnnouncements)
      }
      
      homeAnnouncements.value = filteredAnnouncements.slice(0, limit)
      console.log('📢 最終公告數據:', homeAnnouncements.value)
    } catch (err) {
      console.error('❌ 獲取首頁公告失敗:', err)
      error.value = '獲取公告失敗'
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await announcementApi.getAnnouncementStatistics()
      
      statistics.value = response.data
    } catch (err) {
      console.error('Failed to fetch announcement statistics:', err)
    }
  }

  const setPage = (page: number) => {
    currentPage.value = page
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1 // 重置到第一頁
  }

  const clearCurrentAnnouncement = () => {
    currentAnnouncement.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    announcements,
    currentAnnouncement,
    announcementAreas,
    homeAnnouncements,
    statistics,
    loading,
    error,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    
    // Getters
    activeAnnouncements,
    pinnedAnnouncements,
    hasMore,
    
    // Actions
    fetchAnnouncements,
    fetchAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    fetchAnnouncementAreas,
    fetchHomeAnnouncements,
    fetchStatistics,
    setPage,
    setPageSize,
    clearCurrentAnnouncement,
    clearError
  }
})