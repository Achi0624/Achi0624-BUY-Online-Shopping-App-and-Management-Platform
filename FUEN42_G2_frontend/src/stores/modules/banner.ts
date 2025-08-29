import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bannerApi } from '@/api/modules/banner'
import type { CouponAPI } from '@/types/api'

export const useBannerStore = defineStore('banner', () => {
  // State
  const banners = ref<CouponAPI.BannerInfo[]>([])
  const currentBanner = ref<CouponAPI.BannerInfo | null>(null)
  const bannerAreas = ref<CouponAPI.BannerAreaInfo[]>([])
  const carouselBanners = ref<CouponAPI.BannerInfo[]>([])
  const statistics = ref<CouponAPI.BannerStatistics | null>(null)
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 分頁相關
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalCount = ref(0)
  const totalPages = ref(0)

  // Getters
  const activeBanners = computed(() =>
    banners.value.filter(banner => banner.isActive)
  )

  const expiredBanners = computed(() => {
    const now = new Date()
    return banners.value.filter(banner => new Date(banner.endAt) < now)
  })

  const upcomingBanners = computed(() => {
    const now = new Date()
    return banners.value.filter(banner => new Date(banner.startAt) > now)
  })

  const hasMore = computed(() => currentPage.value < totalPages.value)

  // Actions
  const fetchBanners = async (params?: CouponAPI.BannerListRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await bannerApi.getBanners({
        page: currentPage.value,
        pageSize: pageSize.value,
        ...params
      })
      
      // 直接使用後端響應格式
      const data = response.data
      banners.value = data.items
      totalCount.value = data.totalCount
      totalPages.value = data.totalPages
      currentPage.value = data.pageNumber
    } catch (err) {
      error.value = '獲取廣告列表失敗'
      console.error('Failed to fetch banners:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchBannerById = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await bannerApi.getBanner(id)
      
      // 直接使用後端響應格式
      currentBanner.value = response.data
    } catch (err) {
      error.value = '獲取廣告詳情失敗'
      console.error('Failed to fetch banner:', err)
    } finally {
      loading.value = false
    }
  }

  const createBanner = async (data: CouponAPI.CreateBannerRequest) => {
    try {
      loading.value = true
      error.value = null
      
      // 準備 FormData
      const formData = new FormData()
      formData.append('bannerAreaId', data.bannerAreaId.toString())
      formData.append('title', data.title)
      formData.append('priority', data.priority.toString())
      formData.append('isActive', data.isActive.toString())
      formData.append('carouselInterval', data.carouselInterval.toString())
      
      if (data.linkUrl) {
        formData.append('linkUrl', data.linkUrl)
      }
      if (data.startAt) {
        formData.append('startAt', data.startAt)
      }
      if (data.endAt) {
        formData.append('endAt', data.endAt)
      }
      if (data.imageFile) {
        formData.append('imageFile', data.imageFile)
      }
      
      const response = await bannerApi.createBanner(formData)
      
      // 重新獲取列表
      await fetchBanners()
      return response.data
    } catch (err) {
      error.value = '創建廣告失敗'
      console.error('Failed to create banner:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBanner = async (id: number, data: CouponAPI.UpdateBannerRequest) => {
    try {
      loading.value = true
      error.value = null
      
      // 準備 FormData
      const formData = new FormData()
      formData.append('id', data.id.toString())
      formData.append('bannerAreaId', data.bannerAreaId.toString())
      formData.append('title', data.title)
      formData.append('priority', data.priority.toString())
      formData.append('isActive', data.isActive.toString())
      formData.append('carouselInterval', data.carouselInterval.toString())
      
      if (data.linkUrl) {
        formData.append('linkUrl', data.linkUrl)
      }
      if (data.startAt) {
        formData.append('startAt', data.startAt)
      }
      if (data.endAt) {
        formData.append('endAt', data.endAt)
      }
      if (data.imageFile) {
        formData.append('imageFile', data.imageFile)
      }
      
      await bannerApi.updateBanner(id, formData)
      
      // 重新獲取列表以確保資料最新
      await fetchBanners()
      
      // 如果是當前廣告，重新獲取
      if (currentBanner.value?.id === id) {
        await fetchBannerById(id)
      }
    } catch (err) {
      error.value = '更新廣告失敗'
      console.error('Failed to update banner:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteBanner = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      await bannerApi.deleteBanner(id)
      
      // 從本地狀態中移除
      const index = banners.value.findIndex(b => b.id === id)
      if (index !== -1) {
        banners.value.splice(index, 1)
        totalCount.value--
      }
      
      // 如果刪除的是當前廣告，清空當前廣告
      if (currentBanner.value?.id === id) {
        currentBanner.value = null
      }
    } catch (err) {
      error.value = '刪除廣告失敗'
      console.error('Failed to delete banner:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchBannerAreas = async () => {
    try {
      const response = await bannerApi.getBannerAreas()
      
      bannerAreas.value = response.data
    } catch (err) {
      console.error('Failed to fetch banner areas:', err)
    }
  }

  const fetchCarouselBanners = async (areaId?: number, limit: number = 5) => {
    try {
      // 使用活動廣告API
      const response = await bannerApi.getActiveBanners(areaId)
      
      // 手動限制數量
      carouselBanners.value = response.data.slice(0, limit)
    } catch (err) {
      console.error('Failed to fetch carousel banners:', err)
    }
  }

  const recordBannerClick = async (id: number) => {
    try {
      await bannerApi.recordClick(id)
      
      // 更新本地點擊次數
      const banner = banners.value.find(b => b.id === id)
      if (banner) {
        banner.clickCount++
      }
      
      const carouselBanner = carouselBanners.value.find(b => b.id === id)
      if (carouselBanner) {
        carouselBanner.clickCount++
      }
    } catch (err) {
      console.error('Failed to record banner click:', err)
    }
  }

  const recordBannerView = async (id: number) => {
    try {
      await bannerApi.recordView(id)
      
      // 更新本地瀏覽次數
      const banner = banners.value.find(b => b.id === id)
      if (banner) {
        banner.viewCount++
      }
      
      const carouselBanner = carouselBanners.value.find(b => b.id === id)
      if (carouselBanner) {
        carouselBanner.viewCount++
      }
    } catch (err) {
      console.error('Failed to record banner view:', err)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await bannerApi.getBannerStatistics()
      
      statistics.value = response.data
    } catch (err) {
      console.error('Failed to fetch banner statistics:', err)
    }
  }

  const batchUpdateStatus = async (ids: number[], isActive: boolean) => {
    try {
      loading.value = true
      error.value = null
      
      await bannerApi.batchUpdateStatus(ids, isActive)
      
      // 更新本地狀態
      banners.value = banners.value.map(banner => 
        ids.includes(banner.id) ? { ...banner, isActive } : banner
      )
    } catch (err) {
      error.value = '批量更新狀態失敗'
      console.error('Failed to batch update status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchDelete = async (ids: number[]) => {
    try {
      loading.value = true
      error.value = null
      
      await bannerApi.batchDelete(ids)
      
      // 從本地狀態中移除
      banners.value = banners.value.filter(banner => !ids.includes(banner.id))
      totalCount.value -= ids.length
    } catch (err) {
      error.value = '批量刪除失敗'
      console.error('Failed to batch delete:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setPage = (page: number) => {
    currentPage.value = page
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1 // 重置到第一頁
  }

  const clearCurrentBanner = () => {
    currentBanner.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    banners,
    currentBanner,
    bannerAreas,
    carouselBanners,
    statistics,
    loading,
    error,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    
    // Getters
    activeBanners,
    expiredBanners,
    upcomingBanners,
    hasMore,
    
    // Actions
    fetchBanners,
    fetchBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    fetchBannerAreas,
    fetchCarouselBanners,
    recordBannerClick,
    recordBannerView,
    fetchStatistics,
    batchUpdateStatus,
    batchDelete,
    setPage,
    setPageSize,
    clearCurrentBanner,
    clearError
  }
})