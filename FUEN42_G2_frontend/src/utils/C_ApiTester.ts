/**
 * C組 API 測試工具
 * 開發者: 蔡易霖 (C組組長)
 * 用途: 測試前後端 API 整合
 */

import { orderApi, paymentApi, shippingApi } from '@/api/modules/order'

export class C_ApiTester {

  /**
   * 測試訂單 API
   */
  static async testOrderAPI() {
    console.log('🧪 開始測試 C組 訂單 API...')

    try {
      // 測試獲取訂單列表
      console.log('📋 測試獲取訂單列表...')
      const ordersResponse = await orderApi.getOrders({ page: 1, pageSize: 10 })
      console.log('✅ 訂單列表獲取成功:', ordersResponse)

      // 測試獲取訂單詳情
      console.log('📄 測試獲取訂單詳情...')
      const orderResponse = await orderApi.getOrder(1)
      console.log('✅ 訂單詳情獲取成功:', orderResponse)

    } catch (error) {
      console.error('❌ 訂單 API 測試失敗:', error)
    }
  }

  /**
   * 測試付款 API
   */
  static async testPaymentAPI() {
    console.log('🧪 開始測試 C組 付款 API...')

    try {
      // 測試獲取付款方式
      console.log('💳 測試獲取付款方式...')
      const methodsResponse = await paymentApi.getPaymentMethods()
      console.log('✅ 付款方式獲取成功:', methodsResponse)

      // 測試查詢付款狀態
      console.log('💰 測試查詢付款狀態...')
      const statusResponse = await paymentApi.getPaymentStatus('test-transaction-123')
      console.log('✅ 付款狀態查詢成功:', statusResponse)

    } catch (error) {
      console.error('❌ 付款 API 測試失敗:', error)
    }
  }

  /**
   * 測試物流 API
   */
  static async testShippingAPI() {
    console.log('🧪 開始測試 C組 物流 API...')

    try {
      // 測試獲取物流供應商
      console.log('🚚 測試獲取物流供應商...')
      const providersResponse = await shippingApi.getLogisticsProviders()
      console.log('✅ 物流供應商獲取成功:', providersResponse)

      // 測試物流追蹤
      console.log('📦 測試物流追蹤...')
      const trackingResponse = await shippingApi.trackByTrackingNumber('BUY123456789')
      console.log('✅ 物流追蹤成功:', trackingResponse)

      // 測試透過訂單ID查詢物流
      console.log('🔍 測試透過訂單ID查詢物流...')
      const orderShippingResponse = await shippingApi.getShippingByOrderId(1)
      console.log('✅ 訂單物流查詢成功:', orderShippingResponse)

    } catch (error) {
      console.error('❌ 物流 API 測試失敗:', error)
    }
  }

  /**
   * 執行所有測試
   */
  static async runAllTests() {
    console.log('🚀 開始執行 C組 完整 API 測試...')
    console.log('🔗 API 基礎地址:', import.meta.env.VITE_API_URL || 'http://localhost:5100/api')

    await this.testOrderAPI()
    await this.testPaymentAPI()
    await this.testShippingAPI()

    console.log('🎉 C組 API 測試完成！')
  }

  /**
   * 檢查 API 服務健康狀態
   */
  static async checkAPIHealth() {
    try {
      const response = await fetch('https://localhost:7044/api/test/health')
      const data = await response.json()
      console.log('💚 API 服務狀態:', data)
      return true
    } catch (error) {
      console.error('💔 API 服務無法連接:', error)
      return false
    }
  }
}

// 在開發環境中暴露到全域
if (import.meta.env.DEV) {
  (window as any).C_ApiTester = C_ApiTester
  console.log('🛠️ C組 API 測試工具已載入，使用 C_ApiTester.runAllTests() 進行測試')
}