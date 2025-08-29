/**
 * 物流狀態管理 Store
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 物流追蹤系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ShippingInfo, TrackingLog, LogisticsProvider, ShippingStatus } from '@/types/modules/order'

export const useShippingStore = defineStore('shipping', () => {
  // State
  const currentShipping = ref<ShippingInfo | null>(null)
  const trackingLogs = ref<TrackingLog[]>([])
  const logisticsProviders = ref<LogisticsProvider[]>([
    { 
      id: 1, 
      name: '黑貓宅急便', 
      code: 'TCAT', 
      providerName: '黑貓宅急便',
      providerCode: 'TCAT',
      trackingUrl: 'https://www.t-cat.com.tw/Inquire/Trace.aspx',
      createdAt: new Date().toISOString()
    },
    { 
      id: 2, 
      name: '統一速達', 
      code: 'PRESIDENT', 
      providerName: '統一速達',
      providerCode: 'PRESIDENT',
      trackingUrl: 'https://www.t-cat.com.tw/',
      createdAt: new Date().toISOString()
    },
    { 
      id: 3, 
      name: '新竹物流', 
      code: 'HCT', 
      providerName: '新竹物流',
      providerCode: 'HCT',
      trackingUrl: 'https://www.hct.com.tw/',
      createdAt: new Date().toISOString()
    },
    { 
      id: 4, 
      name: '大榮物流', 
      code: 'KERRY', 
      providerName: '大榮物流',
      providerCode: 'KERRY',
      trackingUrl: 'https://www.kerrytj.com/',
      createdAt: new Date().toISOString()
    },
    { 
      id: 5, 
      name: '順豐速運', 
      code: 'SF', 
      providerName: '順豐速運',
      providerCode: 'SF',
      trackingUrl: 'https://www.sf-express.com/tw/',
      createdAt: new Date().toISOString()
    }
  ])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const currentProvider = computed(() => {
    if (!currentShipping.value) return null
    return logisticsProviders.value.find(p => p.id === currentShipping.value?.logisticsProviderId)
  })

  const latestStatus = computed(() => {
    if (!trackingLogs.value.length) return null
    return trackingLogs.value[0] // 假設已按時間排序
  })

  const isDelivered = computed(() => {
    return currentShipping.value?.status === 4 // Delivered = 4
  })

  const estimatedDeliveryTime = computed(() => {
    if (!currentShipping.value?.estimatedDeliveryDate) return null
    return new Date(currentShipping.value.estimatedDeliveryDate)
  })

  const shippingProgress = computed(() => {
    const status = currentShipping.value?.status || 0
    // 0: Pending, 1: Processing, 2: Shipped, 3: InTransit, 4: Delivered
    const progressMap: Record<number, number> = {
      0: 20,  // 待處理
      1: 40,  // 處理中
      2: 60,  // 已發貨
      3: 80,  // 運送中
      4: 100  // 已送達
    }
    return progressMap[status] || 0
  })

  // Actions
  const trackShipment = async (trackingNumber: string) => {
    try {
      loading.value = true
      error.value = null

      // 模擬 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模擬物流資訊
      currentShipping.value = {
        id: 1,
        orderId: 12345,
        trackingNumber,
        logisticsProviderId: 1,
        status: 3 as ShippingStatus, // InTransit
        shippedDate: new Date().toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        actualDeliveryDate: undefined,
        recipientName: '王小明',
        recipientPhone: '0912345678',
        shippingAddress: '台北市信義區信義路五段7號',
        shippingFee: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 模擬追蹤記錄
      trackingLogs.value = generateMockTrackingLogs(trackingNumber)

      return true
    } catch (err) {
      error.value = '查詢物流資訊失敗'
      console.error('Failed to track shipment:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateShippingStatus = async (shippingId: number, status: ShippingStatus) => {
    try {
      loading.value = true
      error.value = null

      // 模擬 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 500))

      if (currentShipping.value && currentShipping.value.id === shippingId) {
        currentShipping.value.status = status
        
        // 如果是已送達，更新實際送達時間
        if (status === 4) {
          currentShipping.value.actualDeliveryDate = new Date().toISOString()
        }
      }

      return true
    } catch (err) {
      error.value = '更新物流狀態失敗'
      console.error('Failed to update shipping status:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const getShippingByOrderId = async (orderId: number) => {
    try {
      loading.value = true
      error.value = null

      // 模擬 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 800))

      // 模擬返回物流資訊
      currentShipping.value = {
        id: 1,
        orderId,
        trackingNumber: `BUY${orderId}${Date.now()}`,
        logisticsProviderId: Math.floor(Math.random() * 5) + 1,
        status: Math.floor(Math.random() * 5) as ShippingStatus,
        shippedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        actualDeliveryDate: undefined,
        recipientName: '測試收件人',
        recipientPhone: '0987654321',
        shippingAddress: '台北市大安區復興南路一段1號',
        shippingFee: 80,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (currentShipping.value.trackingNumber) {
        trackingLogs.value = generateMockTrackingLogs(currentShipping.value.trackingNumber)
      }

      return currentShipping.value
    } catch (err) {
      error.value = '獲取物流資訊失敗'
      console.error('Failed to get shipping info:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const clearShippingInfo = () => {
    currentShipping.value = null
    trackingLogs.value = []
    error.value = null
  }

  // Helper function to generate mock tracking logs
  const generateMockTrackingLogs = (trackingNumber: string): TrackingLog[] => {
    const now = new Date()
    const logs: TrackingLog[] = [
      {
        id: 5,
        shipmentId: 1,
        status: '包裹已送達',
        location: '台北市信義區',
        description: '收件人已簽收',
        logTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        shipmentId: 1,
        status: '派送中',
        location: '台北市信義區',
        description: '快遞員正在派送您的包裹',
        logTime: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        shipmentId: 1,
        status: '運送中',
        location: '台北轉運中心',
        description: '包裹已到達台北轉運中心',
        logTime: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        shipmentId: 1,
        status: '已發貨',
        location: '新北市物流中心',
        description: '包裹已從倉庫發出',
        logTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 1,
        shipmentId: 1,
        status: '已攬收',
        location: '新北市中和區',
        description: `物流單號 ${trackingNumber} 已由黑貓宅急便攬收`,
        logTime: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ]

    // 根據當前狀態返回不同的日誌
    const currentStatus = currentShipping.value?.status || 0
    if (currentStatus < 4) {
      return logs.slice(logs.length - currentStatus - 1)
    }
    return logs
  }

  return {
    // State
    currentShipping,
    trackingLogs,
    logisticsProviders,
    loading,
    error,

    // Getters
    currentProvider,
    latestStatus,
    isDelivered,
    estimatedDeliveryTime,
    shippingProgress,

    // Actions
    trackShipment,
    updateShippingStatus,
    getShippingByOrderId,
    clearShippingInfo
  }
})