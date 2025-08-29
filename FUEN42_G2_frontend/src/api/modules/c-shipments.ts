/**
 * ==================== C組專用檔案 ====================
 * 檔案: c-shipments.ts
 * 用途: C組物流管理 API 服務層
 * 負責人: 蔡易霖 (C組組長)
 * 最後更新: 2025-08-20
 * 
 * 警告: 此檔案為 C組 (訂單/金流/物流) 專用
 *      其他組別請勿修改此檔案
 * =====================================================
 */

import { request, type ApiResponse } from '../http'

// ==================== 介面定義 ====================

// 物流測試回應介面
export interface ShipmentTestResponse {
  service: string
  status: string
  timestamp: string
  version: string
  developer: string
  modules: string[]
}

// 建立運單請求介面
export interface CreateShipmentRequest {
  orderId: number
  providerId: number
  recipientName: string
  recipientPhone: string
  deliveryAddress: string
  note?: string
}

// 運單資訊介面
export interface ShipmentInfo {
  id: number
  orderId: number
  trackingNumber: string
  providerId: number
  providerName: string
  status: number
  statusText: string
  createdAt: string
  recipientName: string
  recipientPhone: string
  deliveryAddress: string
}

// 物流追蹤記錄介面
export interface TrackingLogInfo {
  id: number
  status: string
  description: string
  location: string
  loggedAt: string
}

// 物流商資訊介面
export interface LogisticsProviderInfo {
  id: number
  name: string
  code: string
  type: string
  serviceArea: string
  baseRate: number
  isActive: boolean
}

// 更新運單狀態請求介面
export interface UpdateShipmentStatusRequest {
  status: number
  description: string
  location: string
}

// ==================== API 服務類別 ====================

export class CShipmentsApiService {
  private static readonly BASE_PATH = '/C_Shipments'

  /**
   * 測試物流 API 連接
   */
  static async testConnection(): Promise<ApiResponse<ShipmentTestResponse>> {
    const response = await request.get<ApiResponse<ShipmentTestResponse>>(
      `${this.BASE_PATH}/test`
    )
    return response.data
  }

  /**
   * 建立運單
   * @param shipmentData 運單資料
   */
  static async createShipment(shipmentData: CreateShipmentRequest): Promise<ApiResponse<ShipmentInfo>> {
    const response = await request.post<ApiResponse<ShipmentInfo>>(
      `${this.BASE_PATH}`,
      shipmentData
    )
    return response.data
  }

  /**
   * 根據 ID 獲取運單
   * @param shipmentId 運單ID
   */
  static async getShipmentById(shipmentId: number): Promise<ApiResponse<ShipmentInfo>> {
    const response = await request.get<ApiResponse<ShipmentInfo>>(
      `${this.BASE_PATH}/${shipmentId}`
    )
    return response.data
  }

  /**
   * 根據追蹤號碼獲取運單追蹤記錄
   * @param trackingNumber 追蹤號碼
   */
  static async getTrackingInfo(trackingNumber: string): Promise<ApiResponse<TrackingLogInfo[]>> {
    const response = await request.get<ApiResponse<TrackingLogInfo[]>>(
      `${this.BASE_PATH}/tracking/${trackingNumber}`
    )
    return response.data
  }

  /**
   * 獲取可用的物流商
   */
  static async getLogisticsProviders(): Promise<ApiResponse<LogisticsProviderInfo[]>> {
    const response = await request.get<ApiResponse<LogisticsProviderInfo[]>>(
      `${this.BASE_PATH}/providers`
    )
    return response.data
  }

  /**
   * 更新運單狀態
   * @param shipmentId 運單ID
   * @param statusData 狀態更新資料
   */
  static async updateShipmentStatus(
    shipmentId: number, 
    statusData: UpdateShipmentStatusRequest
  ): Promise<ApiResponse<void>> {
    const response = await request.put<ApiResponse<void>>(
      `${this.BASE_PATH}/${shipmentId}/status`,
      statusData
    )
    return response.data
  }
}

// ==================== 便利方法導出 ====================

/**
 * 測試 C組物流 API 連接
 */
export const testCShipmentsApi = () => CShipmentsApiService.testConnection()

/**
 * 建立運單
 */
export const createShipment = (shipmentData: CreateShipmentRequest) => 
  CShipmentsApiService.createShipment(shipmentData)

/**
 * 獲取運單詳情
 */
export const getShipment = (shipmentId: number) => 
  CShipmentsApiService.getShipmentById(shipmentId)

/**
 * 追蹤運單
 */
export const trackShipment = (trackingNumber: string) => 
  CShipmentsApiService.getTrackingInfo(trackingNumber)

/**
 * 獲取物流商列表
 */
export const getLogisticsProviders = () => 
  CShipmentsApiService.getLogisticsProviders()

/**
 * 更新運單狀態
 */
export const updateShipmentStatus = (shipmentId: number, statusData: UpdateShipmentStatusRequest) => 
  CShipmentsApiService.updateShipmentStatus(shipmentId, statusData)

// 預設導出
export default CShipmentsApiService