import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { couponApi } from '@/api/modules/coupon'
import type { CouponAPI } from '@/types/api'

export const useCouponStore = defineStore('coupon', () => {
  // State
  const coupons = ref<CouponAPI.CouponInfo[]>([])
  const currentCoupon = ref<CouponAPI.CouponInfo | null>(null)
  const memberCoupons = ref<CouponAPI.MemberCouponInfo[]>([])
  const availableCoupons = ref<CouponAPI.CouponInfo[]>([])
  const statistics = ref<CouponAPI.CouponStatistics | null>(null)
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 分頁相關
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalCount = ref(0)
  const totalPages = ref(0)

  // Getters
  const activeCoupons = computed(() =>
    coupons.value.filter(coupon => coupon.status === 1 && !coupon.isDeleted)
  )

  const expiredCoupons = computed(() => {
    const now = new Date()
    return coupons.value.filter(coupon => new Date(coupon.endAt) < now)
  })

  const draftCoupons = computed(() =>
    coupons.value.filter(coupon => coupon.status === 0)
  )

  const platformCoupons = computed(() =>
    coupons.value.filter(coupon => coupon.couponType === 1)
  )

  const vendorCoupons = computed(() =>
    coupons.value.filter(coupon => coupon.couponType === 2)
  )

  const usableMemberCoupons = computed(() =>
    memberCoupons.value.filter(mc => 
      mc.status === 1 && // 未使用
      new Date(mc.expiredAt) > new Date() // 未過期
    )
  )

  const hasMore = computed(() => currentPage.value < totalPages.value)

  // Actions
  const fetchCoupons = async (params?: CouponAPI.CouponListRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await couponApi.getCoupons({
        page: currentPage.value,
        pageSize: pageSize.value,
        ...params
      })

      // 防禦性地解析 response.data，適配不同後端回傳形式
      const data = response && (response as any).data
      if (data && data.items) {
        coupons.value = data.items as CouponAPI.CouponInfo[]
        totalCount.value = data.totalCount ?? coupons.value.length
        totalPages.value = data.totalPages ?? Math.ceil(totalCount.value / pageSize.value)
        currentPage.value = data.pageNumber ?? currentPage.value
      } else if (Array.isArray(response)) {
        // fallback: 如果 api 直接回傳陣列
        coupons.value = response as unknown as CouponAPI.CouponInfo[]
        totalCount.value = coupons.value.length
        totalPages.value = Math.ceil(totalCount.value / pageSize.value)
      }
    } catch (err) {
      error.value = '獲取優惠券列表失敗'
      console.error('Failed to fetch coupons:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCouponById = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await couponApi.getCoupon(id)
      
      // 直接使用後端響應格式
      currentCoupon.value = response.data
    } catch (err) {
      error.value = '獲取優惠券詳情失敗'
      console.error('Failed to fetch coupon:', err)
    } finally {
      loading.value = false
    }
  }

  const createCoupon = async (data: CouponAPI.CreateCouponRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await couponApi.createCoupon(data)
      
      // 重新獲取列表
      await fetchCoupons()
      return response.data
    } catch (err) {
      error.value = '創建優惠券失敗'
      console.error('Failed to create coupon:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCoupon = async (id: number, data: CouponAPI.UpdateCouponRequest) => {
    try {
      loading.value = true
      error.value = null
      
      await couponApi.updateCoupon(id, data)
      
      // 重新獲取列表以確保資料最新
      await fetchCoupons()
      
      // 如果是當前優惠券，重新獲取
      if (currentCoupon.value?.id === id) {
        await fetchCouponById(id)
      }
    } catch (err) {
      error.value = '更新優惠券失敗'
      console.error('Failed to update coupon:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCoupon = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      await couponApi.deleteCoupon(id)
      
      // 軟刪除，更新本地狀態
      const index = coupons.value.findIndex(c => c.id === id)
      if (index !== -1) {
        coupons.value[index].isDeleted = true
      }
      
      // 如果刪除的是當前優惠券，清空當前優惠券
      if (currentCoupon.value?.id === id) {
        currentCoupon.value = null
      }
    } catch (err) {
      error.value = '刪除優惠券失敗'
      console.error('Failed to delete coupon:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const validateCoupon = async (data: CouponAPI.CouponValidationRequest) => {
    try {
      const response = await couponApi.validateCoupon(data)
      
      return response.data
    } catch (err) {
      console.error('Failed to validate coupon:', err)
      throw err
    }
  }

  const fetchMemberCoupons = async (memberId: number, availableOnly: boolean = true) => {
    try {
      const response = await couponApi.getMemberCoupons(memberId, availableOnly)
      
      memberCoupons.value = response.data
    } catch (err) {
      console.error('Failed to fetch member coupons:', err)
    }
  }

  const claimCoupon = async (couponId: number, memberId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await couponApi.claimCoupon(couponId, memberId)
      
      // 添加到會員優惠券列表
      memberCoupons.value.unshift(response.data)
      
      // 更新優惠券已發放數量
      const coupon = coupons.value.find(c => c.id === couponId)
      if (coupon) {
        coupon.issuedQty++
      }
      
      return response.data
    } catch (err) {
      error.value = '領取優惠券失敗'
      console.error('Failed to claim coupon:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const useCoupon = async (couponCode: string, orderId: number) => {
    try {
      await couponApi.useCoupon(couponCode, orderId)
      
      // 更新會員優惠券狀態
      const memberCoupon = memberCoupons.value.find(mc => 
        mc.coupon.couponCode === couponCode
      )
      if (memberCoupon) {
        memberCoupon.status = 2 // 已使用
        memberCoupon.usedAt = new Date().toISOString()
      }
      
      // 更新優惠券已使用數量
      const coupon = coupons.value.find(c => c.couponCode === couponCode)
      if (coupon) {
        coupon.usedQty++
      }
    } catch (err) {
      console.error('Failed to use coupon:', err)
      throw err
    }
  }

  const fetchAvailableCoupons = async (orderAmount?: number, memberLevelId?: number) => {
    try {
      // 使用活動優惠券API
      const response = await couponApi.getActiveCoupons()
      
      // 手動篩選可用的優惠券
      let filtered = response.data
      
      if (orderAmount) {
        filtered = filtered.filter(coupon => 
          !coupon.minimumAmount || orderAmount >= coupon.minimumAmount
        )
      }
      
      availableCoupons.value = filtered
    } catch (err) {
      console.error('Failed to fetch available coupons:', err)
    }
  }

  const calculateDiscount = async (couponCode: string, orderAmount: number) => {
    try {
      const response = await couponApi.calculateDiscount(couponCode, orderAmount)
      
      return response.data
    } catch (err) {
      console.error('Failed to calculate discount:', err)
      throw err
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await couponApi.getCouponStatistics()
      
      statistics.value = response.data
    } catch (err) {
      console.error('Failed to fetch coupon statistics:', err)
    }
  }

  const generateCouponCode = async (prefix?: string) => {
    try {
      const response = await couponApi.generateCouponCode(prefix)
      
      return response.data.couponCode
    } catch (err) {
      console.error('Failed to generate coupon code:', err)
      throw err
    }
  }

  const checkCouponCode = async (couponCode: string) => {
    try {
      const response = await couponApi.checkCouponCode(couponCode)
      
      return response.data.isAvailable
    } catch (err) {
      console.error('Failed to check coupon code:', err)
      return false
    }
  }

  const batchUpdateStatus = async (ids: number[], status: number) => {
    try {
      loading.value = true
      error.value = null
      
      await couponApi.batchUpdateStatus(ids, status)
      
      // 更新本地狀態
      coupons.value = coupons.value.map(coupon => 
        ids.includes(coupon.id) ? { ...coupon, status } : coupon
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
      
      await couponApi.batchDelete(ids)
      
      // 軟刪除，更新本地狀態
      coupons.value = coupons.value.map(coupon => 
        ids.includes(coupon.id) ? { ...coupon, isDeleted: true } : coupon
      )
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

  const clearCurrentCoupon = () => {
    currentCoupon.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    coupons,
    currentCoupon,
    memberCoupons,
    availableCoupons,
    statistics,
    loading,
    error,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    
    // Getters
    activeCoupons,
    expiredCoupons,
    draftCoupons,
    platformCoupons,
    vendorCoupons,
    usableMemberCoupons,
    hasMore,
    
    // Actions
    fetchCoupons,
    fetchCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    fetchMemberCoupons,
    claimCoupon,
    useCoupon,
    fetchAvailableCoupons,
    calculateDiscount,
    fetchStatistics,
    generateCouponCode,
    checkCouponCode,
    batchUpdateStatus,
    batchDelete,
    setPage,
    setPageSize,
    clearCurrentCoupon,
    clearError
  }
})