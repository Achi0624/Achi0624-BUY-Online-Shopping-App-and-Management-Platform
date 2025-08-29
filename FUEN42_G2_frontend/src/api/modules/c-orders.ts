/**
 * ==================== C組專用檔案 ====================
 * 檔案: c-orders.ts
 * 用途: C組訂單管理 API 服務層
 * 負責人: 蔡易霖 (C組組長)
 * 最後更新: 2025-08-20
 * 
 * 警告: 此檔案為 C組 (訂單/金流/物流) 專用
 *      其他組別請勿修改此檔案
 * =====================================================
 */

import { request, type ApiResponse } from '../http'

// ==================== 介面定義 ====================

// 訂單測試回應介面
export interface OrderTestResponse {
  service: string
  status: string
  timestamp: string
  version: string
  developer: string
  modules: string[]
}

// 訂單基本信息介面
export interface OrderInfo {
  id: number
  orderNumber: string
  memberId: number
  memberName: string
  totalAmount: number
  status: number
  statusText: string
  createdAt: string
  updatedAt?: string
}

// 訂單統計介面
export interface OrderStatistics {
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  todayRevenue: number
}

// 會員訂單列表項目
export interface MemberOrderItem {
  id: number
  masterOrderNumber: string
  memberId: number
  totalAmount: number
  shippingFee: number
  discountAmount: number
  finalAmount: number
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  note: string
  status: number
  paymentStatus: number
  createdAt: string
  updatedAt: string
  productSummary: string
  totalItemCount: number
  items: OrderItemSummary[]
}

// 訂單商品摘要
export interface OrderItemSummary {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  subTotal: number
}

// 分頁訂單列表
export interface PagedOrderList {
  items: MemberOrderItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// ==================== API 服務類別 ====================

export class COrdersApiService {
  private static readonly BASE_PATH = '/C_Orders'

  /**
   * 測試訂單 API 連接
   */
  static async testConnection(): Promise<ApiResponse<OrderTestResponse>> {
    const response = await request.get<ApiResponse<OrderTestResponse>>(
      `${this.BASE_PATH}/test`
    )
    return response.data
  }

  /**
   * 建立新訂單 (預留接口)
   * @param orderData 訂單資料
   */
  static async createOrder(orderData: any): Promise<ApiResponse<OrderInfo>> {
    const response = await request.post<ApiResponse<OrderInfo>>(
      `${this.BASE_PATH}`,
      orderData
    )
    return response.data
  }

  /**
   * 根據 ID 獲取訂單
   * @param orderId 訂單ID
   */
  static async getOrderById(orderId: number): Promise<ApiResponse<OrderInfo>> {
    const response = await request.get<ApiResponse<OrderInfo>>(
      `${this.BASE_PATH}/${orderId}`
    )
    return response.data
  }

  /**
   * 根據訂單編號獲取訂單
   * @param orderNumber 訂單編號
   */
  static async getOrderByNumber(orderNumber: string): Promise<ApiResponse<OrderInfo>> {
    const response = await request.get<ApiResponse<OrderInfo>>(
      `${this.BASE_PATH}/number/${orderNumber}`
    )
    return response.data
  }

  /**
   * 獲取會員訂單列表（含摘要）
   * @param memberId 會員ID
   * @param page 頁數（預設1）
   * @param pageSize 每頁數量（預設10）
   */
  static async getMemberOrdersWithSummary(
    memberId: number, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<ApiResponse<PagedOrderList>> {
    const response = await request.get<ApiResponse<PagedOrderList>>(
      `${this.BASE_PATH}/member/${memberId}/summary?page=${page}&pageSize=${pageSize}`
    )
    return response.data
  }

  /**
   * 取消訂單
   * @param orderId 訂單ID
   * @param reason 取消原因
   */
  static async cancelOrder(orderId: number, reason: string): Promise<ApiResponse<void>> {
    const response = await request.put<ApiResponse<void>>(
      `${this.BASE_PATH}/${orderId}/cancel`,
      { reason }
    )
    return response.data
  }

  /**
   * 更新訂單狀態
   * @param orderId 訂單ID
   * @param status 新狀態
   * @param reason 更新原因（可選）
   */
  static async updateOrderStatus(
    orderId: number, 
    status: number, 
    reason?: string
  ): Promise<ApiResponse<OrderInfo>> {
    const response = await request.put<ApiResponse<OrderInfo>>(
      `${this.BASE_PATH}/${orderId}/status`,
      { status, reason }
    )
    return response.data
  }

  /**
   * 獲取訂單統計資料
   * @param fromDate 開始日期（可選）
   * @param toDate 結束日期（可選）
   */
  static async getStatistics(
    fromDate?: string, 
    toDate?: string
  ): Promise<ApiResponse<OrderStatistics>> {
    const params = new URLSearchParams()
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)

    const queryString = params.toString()
    const url = `${this.BASE_PATH}/statistics${queryString ? `?${queryString}` : ''}`
    
    const response = await request.get<ApiResponse<OrderStatistics>>(url)
    return response.data
  }
}

// ==================== 便利方法導出 ====================

/**
 * 測試 C組訂單 API 連接
 */
export const testCOrdersApi = () => COrdersApiService.testConnection()

/**
 * 建立訂單
 */
export const createOrder = (orderData: any) => COrdersApiService.createOrder(orderData)

/**
 * 獲取訂單詳情
 */
export const getOrder = (orderId: number) => COrdersApiService.getOrderById(orderId)

/**
 * 根據編號獲取訂單
 */
export const getOrderByNumber = (orderNumber: string) => COrdersApiService.getOrderByNumber(orderNumber)

/**
 * 獲取會員訂單列表
 */
export const getMemberOrders = (memberId: number, page?: number, pageSize?: number) => 
  COrdersApiService.getMemberOrdersWithSummary(memberId, page, pageSize)

/**
 * 取消訂單
 */
export const cancelOrder = (orderId: number, reason: string) => COrdersApiService.cancelOrder(orderId, reason)

/**
 * 更新訂單狀態
 */
export const updateOrderStatus = (orderId: number, status: number, reason?: string) => 
  COrdersApiService.updateOrderStatus(orderId, status, reason)

/**
 * 獲取訂單統計
 */
export const getOrderStatistics = (fromDate?: string, toDate?: string) => 
  COrdersApiService.getStatistics(fromDate, toDate)

// 預設導出
export default COrdersApiService