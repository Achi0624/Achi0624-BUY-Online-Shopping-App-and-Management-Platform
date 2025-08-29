/**
 * 訂單 API 模組
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 訂單 + 金流 + 物流管理
 * 對應後端: ASP.NET Core Web API
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import http from '../http'
import type { ApiResponse, PagedResponse } from '../http'
import type {
  MasterOrder,
  Order,
  OrderItem,
  OrderLog,
  Payment,
  PaymentMethod,
  Shipment,
  Return,
  Refund,
  CreateOrderRequest,
  OrderListParams,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  ReturnRequest,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  ShippingInfo,
  TrackingLog,
  LogisticsProvider
} from '@/types/modules/order'

// ==================== 訂單 API ====================
export const orderApi = {
  // ========== 訂單管理 ==========
  
  /**
   * 創建訂單
   * C組 (蔡易霖) 修改: 更新為 C_ 前綴的 API 端點
   */
  createOrder: (data: CreateOrderRequest) =>
    http.post<ApiResponse<MasterOrder>>('/C_Orders', data),

  /**
   * 獲取訂單列表
   * C組 (蔡易霖) 修改: 支援參數指定會員 ID
   * 優先順序：1.參數指定 2.登入會員 3.預設值
   */
  getOrders: (params?: OrderListParams) => {
    let memberId = 1 // 預設值
    
    // 優先使用參數指定的 userId
    if (params?.userId) {
      memberId = params.userId
    } else {
      // 否則從 localStorage 取得會員 ID
      const userStore = localStorage.getItem('user')
      if (userStore) {
        try {
          const user = JSON.parse(userStore)
          memberId = user.id || user.memberId || 1
        } catch (e) {
          console.log('使用預設會員 ID: 1')
        }
      }
    }
    
    // 開發模式提示
    if (import.meta.env.DEV) {
      console.log(`📋 查詢會員 ${memberId} 的訂單`)
    }
    
    // 移除 userId 以免傳遞給後端 API
    const { userId, ...restParams } = params || {}
    
    return http.get<ApiResponse<PagedResponse<MasterOrder>>>(`/C_Orders/member/${memberId}/summary`, { params: restParams })
  },

  /**
   * 獲取我的訂單列表
   */
  getMyOrders: (params?: OrderListParams) =>
    http.get<ApiResponse<PagedResponse<MasterOrder>>>('/orders/my', { params }),

  /**
   * 獲取訂單詳情
   * C組 (蔡易霖) 修改: 更新為 C_ 前綴的 API 端點
   */
  getOrder: (id: number) =>
    http.get<ApiResponse<MasterOrder>>(`/C_Orders/${id}`),

  /**
   * 獲取訂單詳情 (通過訂單編號)
   */
  getOrderByNumber: (orderNumber: string) =>
    http.get<ApiResponse<MasterOrder>>(`/orders/number/${orderNumber}`),

  /**
   * 更新訂單狀態
   */
  updateOrderStatus: (data: UpdateOrderStatusRequest) =>
    http.patch<ApiResponse<void>>(`/orders/${data.orderId}/status`, {
      status: data.newStatus,
      note: data.note
    }),

  /**
   * 取消訂單
   * C組 (蔡易霖) 修改: 更新為 C_ 前綴的 API 端點
   */
  cancelOrder: (data: CancelOrderRequest) =>
    http.put<ApiResponse<void>>(`/C_Orders/${data.orderId}/cancel`, {
      reason: data.reason
    }),

  /**
   * 確認收貨
   * C組 (蔡易霖) 修改: 更新為 C_ 前綴的 API 端點
   */
  confirmReceipt: (orderId: number) =>
    http.put<ApiResponse<void>>(`/C_Orders/${orderId}/confirm-received`),

  /**
   * 獲取訂單狀態歷史
   */
  getOrderLogs: (orderId: number) =>
    http.get<ApiResponse<OrderLog[]>>(`/orders/${orderId}/logs`),

  /**
   * 評價訂單
   */
  reviewOrder: (orderId: number, data: {
    rating: number
    comment: string
    images?: string[]
  }) => http.post<ApiResponse<void>>(`/orders/${orderId}/review`, data),

  // ========== 訂單統計 ==========
  
  /**
   * 獲取訂單統計
   */
  getOrderStatistics: (params?: {
    startDate?: string
    endDate?: string
  }) => http.get<ApiResponse<{
    totalOrders: number
    totalAmount: number
    averageOrderValue: number
    ordersByStatus: Record<OrderStatus, number>
  }>>('/orders/statistics', { params }),

  /**
   * 獲取每日訂單統計
   */
  getDailyStatistics: (params: {
    startDate: string
    endDate: string
  }) => http.get<ApiResponse<Array<{
    date: string
    orderCount: number
    totalAmount: number
  }>>>('/orders/statistics/daily', { params })
}

// ==================== 付款 API ====================
// C組 (蔡易霖) 修改: 更新為 C_ 前綴的 API 端點
export const paymentApi = {
  /**
   * 獲取付款方式列表
   */
  getPaymentMethods: () =>
    http.get<ApiResponse<PaymentMethod[]>>('/C_Payments/methods'),

  /**
   * 獲取付款詳情
   */
  getPayment: (orderId: number) =>
    http.get<ApiResponse<Payment>>(`/C_Payments/order/${orderId}`),

  /**
   * 處理付款
   */
  processPayment: (data: {
    orderId: number
    paymentMethodId: number
  }) => http.post<ApiResponse<{
    paymentUrl?: string
    transactionId: string
  }>>('/C_Payments/process', data),

  /**
   * 付款回調 (第三方金流通知)
   */
  paymentCallback: (data: any) =>
    http.post<ApiResponse<void>>('/C_Payments/callback', data),

  /**
   * 查詢付款狀態
   */
  getPaymentStatus: (transactionId: string) =>
    http.get<ApiResponse<{
      status: PaymentStatus
      paidAt?: string
    }>>(`/C_Payments/status/${transactionId}`),

  /**
   * 獲取付款統計
   */
  getPaymentStatistics: (params?: {
    startDate?: string
    endDate?: string
  }) => http.get<ApiResponse<{
    totalRevenue: number
    successRate: number
    paymentsByMethod: Record<string, number>
  }>>('/payments/statistics', { params })
}

// ==================== 物流 API ====================
// C組 (蔡易霖) 修改: 更新為 C_ 前綴的 API 端點
export const shippingApi = {
  /**
   * 獲取物流供應商列表
   */
  getLogisticsProviders: () =>
    http.get<ApiResponse<LogisticsProvider[]>>('/C_Shipping/providers'),

  /**
   * 透過物流單號查詢物流資訊
   */
  trackByTrackingNumber: (trackingNumber: string) =>
    http.get<ApiResponse<ShippingInfo>>(`/C_Shipping/track/${trackingNumber}`),

  /**
   * 透過訂單ID查詢物流資訊
   */
  getShippingByOrderId: (orderId: number) =>
    http.get<ApiResponse<ShippingInfo>>(`/C_Shipping/order/${orderId}`),

  /**
   * 獲取物流追蹤記錄
   */
  getTrackingLogs: (shipmentId: number) =>
    http.get<ApiResponse<TrackingLog[]>>(`/C_Shipping/${shipmentId}/logs`),

  /**
   * 更新物流狀態 (管理員用)
   */
  updateShippingStatus: (shipmentId: number, status: ShippingStatus) =>
    http.patch<ApiResponse<void>>(`/shipping/${shipmentId}/status`, { status }),

  /**
   * 創建物流單 (系統內部用)
   */
  createShipment: (data: {
    orderId: number
    logisticsProviderId: number
    recipientName: string
    recipientPhone: string
    shippingAddress: string
    shippingFee: number
  }) => http.post<ApiResponse<ShippingInfo>>('/shipping', data),

  /**
   * 批量查詢物流狀態
   */
  batchTrackShipments: (trackingNumbers: string[]) =>
    http.post<ApiResponse<ShippingInfo[]>>('/shipping/batch-track', { trackingNumbers }),

  /**
   * 預估送達時間
   */
  estimateDeliveryTime: (data: {
    providerId: number
    fromAddress: string
    toAddress: string
  }) => http.post<ApiResponse<{
    estimatedDays: number
    estimatedDate: string
  }>>('/shipping/estimate', data)
}

// ==================== 舊版物流 API (保留向後相容) ====================
export const shipmentApi = {
  /**
   * @deprecated 請使用 shippingApi.getLogisticsProviders
   */
  getLogisticsProviders: () =>
    http.get<ApiResponse<Array<{
      id: number
      providerName: string
      providerCode: string
    }>>>('/shipments/providers'),

  /**
   * 獲取物流詳情
   */
  getShipment: (orderId: number) =>
    http.get<ApiResponse<Shipment>>(`/shipments/order/${orderId}`),

  /**
   * 追蹤物流
   */
  trackShipment: (trackingNumber: string) =>
    http.get<ApiResponse<{
      shipment: Shipment
      trackingLogs: Array<{
        status: string
        location?: string
        description: string
        logTime: string
      }>
    }>>(`/shipments/track/${trackingNumber}`),

  /**
   * 更新物流狀態
   */
  updateShipmentStatus: (shipmentId: number, data: {
    status: ShippingStatus
    note?: string
  }) => http.patch<ApiResponse<void>>(`/shipments/${shipmentId}/status`, data),

  /**
   * 創建出貨單
   */
  createShipment: (data: {
    orderId: number
    logisticsProviderId: number
    shippingMethod: string
    estimatedDelivery?: string
  }) => http.post<ApiResponse<Shipment>>('/shipments', data),

  /**
   * 獲取物流統計
   */
  getShipmentStatistics: (params?: {
    startDate?: string
    endDate?: string
  }) => http.get<ApiResponse<{
    totalShipments: number
    averageDeliveryTime: number
    onTimeDeliveryRate: number
    shipmentsByStatus: Record<ShippingStatus, number>
  }>>('/shipments/statistics', { params })
}

// ==================== 退貨退款 API ====================
export const returnApi = {
  /**
   * 申請退貨
   */
  requestReturn: (data: ReturnRequest) =>
    http.post<ApiResponse<Return>>('/returns', data),

  /**
   * 獲取退貨列表
   */
  getReturns: (params?: {
    page?: number
    pageSize?: number
    status?: number
  }) => http.get<ApiResponse<PagedResponse<Return>>>('/returns', { params }),

  /**
   * 獲取我的退貨列表
   */
  getMyReturns: (params?: {
    page?: number
    pageSize?: number
  }) => http.get<ApiResponse<PagedResponse<Return>>>('/returns/my', { params }),

  /**
   * 獲取退貨詳情
   */
  getReturn: (id: number) =>
    http.get<ApiResponse<Return>>(`/returns/${id}`),

  /**
   * 更新退貨狀態
   */
  updateReturnStatus: (returnId: number, data: {
    status: number
    note?: string
  }) => http.patch<ApiResponse<void>>(`/returns/${returnId}/status`, data),

  /**
   * 取消退貨申請
   */
  cancelReturn: (returnId: number) =>
    http.patch<ApiResponse<void>>(`/returns/${returnId}/cancel`),

  /**
   * 獲取退款詳情
   */
  getRefund: (returnId: number) =>
    http.get<ApiResponse<Refund>>(`/refunds/return/${returnId}`),

  /**
   * 處理退款
   */
  processRefund: (data: {
    returnId: number
    amount: number
    refundMethod: string
  }) => http.post<ApiResponse<Refund>>('/refunds/process', data),

  /**
   * 獲取退貨統計
   */
  getReturnStatistics: (params?: {
    startDate?: string
    endDate?: string
  }) => http.get<ApiResponse<{
    totalReturns: number
    totalRefundAmount: number
    returnRate: number
    returnReasons: Record<string, number>
  }>>('/returns/statistics', { params })
}

// 匯出所有 API
export default {
  order: orderApi,
  payment: paymentApi,
  shipment: shipmentApi,
  return: returnApi
}