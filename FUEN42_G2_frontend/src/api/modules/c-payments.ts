/**
 * ==================== C組專用檔案 ====================
 * 檔案: c-payments.ts
 * 用途: C組金流管理 API 服務層
 * 負責人: 蔡易霖 (C組組長)
 * 最後更新: 2025-08-20
 * 
 * 警告: 此檔案為 C組 (訂單/金流/物流) 專用
 *      其他組別請勿修改此檔案
 * =====================================================
 */

import { request, type ApiResponse } from '../http'

// ==================== 介面定義 ====================

// 金流測試回應介面
export interface PaymentTestResponse {
  service: string
  status: string
  timestamp: string
  version: string
  developer: string
  modules: string[]
}

// 建立付款請求介面
export interface CreatePaymentRequest {
  orderNumber: string
  vendorId: number
  paymentMethodId: number
  amount: number
  customerEmail: string
  customerPhone: string
  customerName: string
}

// 付款回應介面
export interface PaymentResponse {
  paymentUrl: string
  transactionId: string
  orderNumber: string
}

// 付款方式資訊介面
export interface PaymentMethodInfo {
  id: number
  name: string
  code: string
  type: string
  iconUrl: string
  handlingFee: number
  description: string
}

// 付款狀態資訊介面
export interface PaymentStatusInfo {
  orderNumber: string
  status: string
  statusText: string
  amount: number
  paidAt?: string
}

// ==================== API 服務類別 ====================

export class CPaymentsApiService {
  private static readonly BASE_PATH = '/C_Payments'

  /**
   * 測試金流 API 連接
   */
  static async testConnection(): Promise<ApiResponse<PaymentTestResponse>> {
    const response = await request.get<ApiResponse<PaymentTestResponse>>(
      `${this.BASE_PATH}/test`
    )
    return response.data
  }

  /**
   * 建立付款
   * @param paymentData 付款資料
   */
  static async createPayment(paymentData: CreatePaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    const response = await request.post<ApiResponse<PaymentResponse>>(
      `${this.BASE_PATH}/create`,
      paymentData
    )
    return response.data
  }

  /**
   * 獲取廠商的付款方式
   * @param vendorId 廠商ID
   */
  static async getVendorPaymentMethods(vendorId: number): Promise<ApiResponse<PaymentMethodInfo[]>> {
    const response = await request.get<ApiResponse<PaymentMethodInfo[]>>(
      `${this.BASE_PATH}/vendors/${vendorId}/methods`
    )
    return response.data
  }

  /**
   * 查詢付款狀態
   * @param orderNumber 訂單編號
   */
  static async getPaymentStatus(orderNumber: string): Promise<ApiResponse<PaymentStatusInfo>> {
    const response = await request.get<ApiResponse<PaymentStatusInfo>>(
      `${this.BASE_PATH}/status/${orderNumber}`
    )
    return response.data
  }

  /**
   * 處理金流閘道回調（POST表單資料）
   * @param callbackData 回調資料
   */
  static async handleGatewayCallback(callbackData: FormData): Promise<string> {
    const response = await request.post<string>(
      `${this.BASE_PATH}/gateway-callback`,
      callbackData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }
}

// ==================== 便利方法導出 ====================

/**
 * 測試 C組金流 API 連接
 */
export const testCPaymentsApi = () => CPaymentsApiService.testConnection()

/**
 * 建立付款
 */
export const createPayment = (paymentData: CreatePaymentRequest) => 
  CPaymentsApiService.createPayment(paymentData)

/**
 * 獲取付款方式
 */
export const getPaymentMethods = (vendorId: number) => 
  CPaymentsApiService.getVendorPaymentMethods(vendorId)

/**
 * 查詢付款狀態
 */
export const getPaymentStatus = (orderNumber: string) => 
  CPaymentsApiService.getPaymentStatus(orderNumber)

/**
 * 處理付款回調
 */
export const handlePaymentCallback = (callbackData: FormData) => 
  CPaymentsApiService.handleGatewayCallback(callbackData)

// 預設導出
export default CPaymentsApiService