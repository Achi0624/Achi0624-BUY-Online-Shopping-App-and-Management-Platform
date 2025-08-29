import http from '../http'
import type { 
  CouponAPI,
  PaginationResponse
} from '@/types/api'

// 優惠券相關API (對應後端 CouponsController)
export const couponApi = {
  // 獲取優惠券列表 - GET: api/coupons
  getCoupons: async (params?: CouponAPI.CouponListRequest): Promise<{ data: PaginationResponse<CouponAPI.CouponInfo>; status: number; headers: any }> => {
    const response = await http.get<CouponAPI.CouponInfo[]>('/coupons', { params })
    
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

  // 獲取優惠券詳情 - GET: api/coupons/{id}
  getCoupon: (id: number) =>
    http.get<CouponAPI.CouponInfo>(`/coupons/${id}`),

  // 根據代碼獲取優惠券 - GET: api/coupons/code/{code}
  getCouponByCode: (code: string) =>
    http.get<CouponAPI.CouponInfo>(`/coupons/code/${code}`),

  // 創建優惠券 - POST: api/coupons
  createCoupon: (data: CouponAPI.CreateCouponRequest) =>
    http.post<CouponAPI.CouponInfo>('/coupons', data),

  // 更新優惠券 - PUT: api/coupons/{id}
  updateCoupon: (id: number, data: CouponAPI.UpdateCouponRequest) =>
    http.put(`/coupons/${id}`, data),

  // 軟刪除優惠券 - DELETE: api/coupons/{id}
  deleteCoupon: (id: number) =>
    http.delete(`/coupons/${id}`),

  // 驗證優惠券 - POST: api/coupons/validate
  validateCoupon: (data: CouponAPI.CouponValidationRequest) =>
    http.post<CouponAPI.CouponValidationResponse>('/coupons/validate', data),

  // 獲取活動優惠券 - GET: api/coupons/active
  getActiveCoupons: (couponType?: number) =>
    http.get<CouponAPI.CouponInfo[]>('/coupons/active', {
      params: couponType !== undefined ? { couponType } : {}
    }),

  // 獲取優惠券統計 - GET: api/coupons/statistics
  getCouponStatistics: (couponType?: number) =>
    http.get<CouponAPI.CouponStatistics>('/coupons/statistics', {
      params: couponType !== undefined ? { couponType } : {}
    }),

  // 批量更新優惠券狀態 - PATCH: api/coupons/batch-status
  batchUpdateStatus: (ids: number[], status: number) =>
    http.patch('/coupons/batch-status', {
      couponIds: ids,
      status
    }),

  // 批量刪除優惠券 - DELETE: api/coupons/batch
  batchDelete: (ids: number[]) =>
    http.delete('/coupons/batch', {
      data: { couponIds: ids }
    }),

  // ========== 以下API需要會員認證功能完成後實現 ==========
  
  // 獲取會員可用優惠券列表 (需要會員模組完成)
  getMemberCoupons: (memberId: number, availableOnly: boolean = true) =>
    http.get<CouponAPI.MemberCouponInfo[]>(`/members/${memberId}/coupons`, {
      params: { availableOnly }
    }),

  // 領取優惠券 (需要會員模組完成)
  claimCoupon: (couponId: number, memberId: number) =>
    http.post<CouponAPI.MemberCouponInfo>('/coupons/claim', {
      couponId,
      memberId
    }),

  // 使用優惠券 (需要訂單模組完成)
  useCoupon: (couponCode: string, orderId: number) =>
    http.post('/coupons/use', {
      couponCode,
      orderId
    }),

  // 計算折扣金額 (可用於購物車預覽)
  calculateDiscount: (couponCode: string, orderAmount: number) =>
    http.post<{ discountAmount: number; finalAmount: number }>('/coupons/calculate-discount', {
      couponCode,
      orderAmount
    }),

  // 生成優惠券代碼 (管理後台用)
  generateCouponCode: (prefix?: string) =>
    http.post<{ couponCode: string }>('/coupons/generate-code', {
      prefix
    }),

  // 檢查優惠券代碼是否可用 (創建時驗證用)
  checkCouponCode: (couponCode: string) =>
    http.get<{ isAvailable: boolean }>(`/coupons/check-code/${couponCode}`)
}