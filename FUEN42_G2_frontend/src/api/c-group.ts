/**
 * ==================== C組專用檔案 ====================
 * 檔案: c-group.ts
 * 用途: C組 API 統一匯出點
 * 負責人: 蔡易霖 (C組組長)
 * 最後更新: 2025-08-20
 * 
 * 警告: 此檔案為 C組 (訂單/金流/物流) 專用
 *      其他組別請勿修改此檔案
 * =====================================================
 */

// ==================== 匯入各模組 API ====================
import COrdersApiService, * as OrdersApi from './modules/c-orders'
import CPaymentsApiService, * as PaymentsApi from './modules/c-payments'
import CShipmentsApiService, * as ShipmentsApi from './modules/c-shipments'

// ==================== 匯出 API 服務類別 ====================
export { COrdersApiService, CPaymentsApiService, CShipmentsApiService }

// ==================== 匯出便利方法 ====================
export * from './modules/c-orders'
export * from './modules/c-payments'
export * from './modules/c-shipments'

// ==================== C組 API 統一測試方法 ====================

/**
 * 測試所有 C組 API 連接狀態
 * @returns Promise<{ orders: boolean, payments: boolean, shipments: boolean }>
 */
export const testAllCGroupApis = async () => {
  const results = {
    orders: false,
    payments: false,
    shipments: false
  }

  // 並行測試所有 API
  const promises = [
    OrdersApi.testCOrdersApi().then(() => results.orders = true).catch(() => results.orders = false),
    PaymentsApi.testCPaymentsApi().then(() => results.payments = true).catch(() => results.payments = false),
    ShipmentsApi.testCShipmentsApi().then(() => results.shipments = true).catch(() => results.shipments = false)
  ]

  await Promise.allSettled(promises)
  return results
}

/**
 * C組 API 健康檢查
 * @returns Promise<{ healthy: boolean, details: object }>
 */
export const healthCheck = async () => {
  const startTime = Date.now()
  
  try {
    const results = await testAllCGroupApis()
    const allHealthy = Object.values(results).every(status => status === true)
    const responseTime = Date.now() - startTime

    return {
      healthy: allHealthy,
      responseTime,
      timestamp: new Date().toISOString(),
      details: {
        services: results,
        developer: '蔡易霖 (C組組長)',
        version: '1.0.0',
        baseUrl: import.meta.env.VITE_API_URL || 'https://localhost:7044/api'
      }
    }
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      details: {
        services: { orders: false, payments: false, shipments: false },
        developer: '蔡易霖 (C組組長)',
        version: '1.0.0',
        baseUrl: import.meta.env.VITE_API_URL || 'https://localhost:7044/api'
      }
    }
  }
}

// ==================== 預設匯出 ====================

export default {
  // API 服務類別
  OrdersApi: COrdersApiService,
  PaymentsApi: CPaymentsApiService,
  ShipmentsApi: CShipmentsApiService,
  
  // 統一測試方法
  testAllApis: testAllCGroupApis,
  healthCheck,
  
  // 便利方法
  orders: OrdersApi,
  payments: PaymentsApi,
  shipments: ShipmentsApi
}