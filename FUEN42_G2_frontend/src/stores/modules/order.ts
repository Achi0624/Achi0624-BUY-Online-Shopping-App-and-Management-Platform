/**
 * 訂單狀態管理 - 統一版本
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 訂單管理系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orderApi } from '@/api/modules/order'
import type { OrderAPI } from '@/types/modules/order'

export const useOrderStore = defineStore('order', () => {
  // ==================== State ====================
  const orders = ref<OrderAPI.MasterOrderInfo[]>([])
  const currentOrder = ref<OrderAPI.MasterOrderInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 付款方式配置
  const paymentMethods = ref([
    { id: 1, name: '信用卡', code: 'credit_card', description: '支援 Visa、MasterCard、JCB', icon: '💳' },
    { id: 2, name: 'LINE Pay', code: 'line_pay', description: '使用 LINE Pay 快速付款', icon: '💚' },
    { id: 3, name: '街口支付', code: 'jko_pay', description: '街口支付 App 付款', icon: '🟡' },
    { id: 4, name: '貨到付款', code: 'cod', description: '收到商品再付款', icon: '💰' },
    { id: 5, name: '銀行轉帳', code: 'bank_transfer', description: '匯款至指定帳戶', icon: '🏦' }
  ])

  // 物流方式配置
  const shippingMethods = ref([
    { id: 1, name: '宅配到府', code: 'home_delivery', fee: 100, description: '1-2個工作天送達', icon: '🚚' },
    { id: 2, name: '7-11取貨', code: 'seven_eleven', fee: 60, description: '3-5個工作天送達門市', icon: '🏪' },
    { id: 3, name: '全家取貨', code: 'family_mart', fee: 60, description: '3-5個工作天送達門市', icon: '🏪' },
    { id: 4, name: '萊爾富取貨', code: 'hi_life', fee: 60, description: '3-5個工作天送達門市', icon: '🏪' },
    { id: 5, name: '超商店到店', code: 'cvs_store', fee: 60, description: '3-5個工作天，可退貨', icon: '📦' }
  ])

  // ==================== Getters ====================
  
  // 訂單統計
  const orderStats = computed(() => {
    const total = orders.value.length
    const pending = orders.value.filter(o => o.orderStatus <= 1).length
    const processing = orders.value.filter(o => o.orderStatus >= 2 && o.orderStatus <= 3).length
    const completed = orders.value.filter(o => o.orderStatus >= 4).length
    const cancelled = orders.value.filter(o => o.orderStatus === 6).length

    return { total, pending, processing, completed, cancelled }
  })

  // 當前用戶的訂單
  const userOrders = computed(() => 
    orders.value.filter(order => order.orderStatus !== 6)
  )

  // 最近訂單
  const recentOrders = computed(() => 
    orders.value
      .filter(order => order.orderStatus !== 6)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  )

  // ==================== Actions ====================

  /**
   * 創建訂單
   * C組 (蔡易霖) 修改: 整合真實 API
   */
  const createOrder = async (orderData: OrderAPI.CreateOrderRequest) => {
    try {
      loading.value = true
      error.value = null
      
      // 調用真實 API
      const response = await orderApi.createOrder(orderData)
      console.log('創建訂單響應:', response)
      
      // 處理 axios 響應結構
      if (response && response.data) {
        if (response.data.success && response.data.data) {
          // API 返回成功，包含 MasterOrder 物件
          const masterOrder = response.data.data
          const orderResponse: OrderAPI.CreateOrderResponse = {
            masterOrderId: masterOrder.id,
            masterOrderNumber: masterOrder.masterOrderNumber,
            finalAmount: masterOrder.totalAmount,
            paymentUrl: orderData.paymentMethodId === 1 ? '/payment/ecpay' : '/payment/success',
            createdAt: masterOrder.createdAt
          }
          return orderResponse
        }
      }
      
      // 如果 API 失敗，使用模擬響應（開發模式）
      if (import.meta.env.DEV) {
        console.warn('使用模擬訂單響應')
        const mockResponse: OrderAPI.CreateOrderResponse = {
          masterOrderId: Date.now(),
          masterOrderNumber: `ORD${new Date().getFullYear()}${String(Date.now()).slice(-8)}`,
          finalAmount: 0,
          paymentUrl: orderData.paymentMethodId === 1 ? '/payment/credit-card' : '/payment/success',
          createdAt: new Date().toISOString()
        }
        return mockResponse
      }
      
      throw new Error('創建訂單失敗：無效的響應格式')
    } catch (err: any) {
      error.value = err.message || '創建訂單失敗'
      console.error('創建訂單錯誤:', err)
      
      // 在開發模式下提供更詳細的錯誤信息
      if (import.meta.env.DEV && err.response) {
        console.error('API 錯誤響應:', err.response.data)
        if (err.response.data?.message) {
          error.value = err.response.data.message
        }
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 獲取訂單列表
   * C組 (蔡易霖) 修改: 整合真實 API
   */
  const fetchOrders = async (params?: {
    page?: number
    limit?: number
    status?: number
    userId?: number
  }) => {
    try {
      loading.value = true
      error.value = null
      
      // 調用真實 API
      const response = await orderApi.getOrders(params)
      console.log('axios 響應完整結構:', response)
      console.log('axios 響應 data:', response.data)
      
      // 處理 axios 響應結構
      // axios 將 API 響應包在 response.data 中
      // 而我們的 API 返回: { success: true, data: [...], ... }
      if (response && response.data && response.data.data) {
        const ordersData = response.data.data
        
        // 檢查是否為分頁格式 {items: [], totalCount: 0, ...}
        if (ordersData.items && Array.isArray(ordersData.items)) {
          orders.value = ordersData.items
          console.log('設定訂單資料 (分頁格式):', orders.value)
          console.log('第一筆訂單結構:', orders.value[0])
          if (orders.value.length > 0) {
            console.log('實際欄位檢查:', {
              id: orders.value[0]?.id,
              orderNumber: orders.value[0]?.orderNumber,
              status: orders.value[0]?.status,
              paymentStatus: orders.value[0]?.paymentStatus,
              orderDate: orders.value[0]?.orderDate,
              totalAmount: orders.value[0]?.totalAmount
            })
          }
        } 
        // 檢查是否為直接陣列格式
        else if (Array.isArray(ordersData)) {
          orders.value = ordersData
          console.log('設定訂單資料 (陣列格式):', orders.value)
          console.log('第一筆訂單結構:', orders.value[0])
          if (orders.value.length > 0) {
            console.log('實際欄位檢查:', {
              id: orders.value[0]?.id,
              orderNumber: orders.value[0]?.orderNumber,
              status: orders.value[0]?.status,
              paymentStatus: orders.value[0]?.paymentStatus,
              orderDate: orders.value[0]?.orderDate,
              totalAmount: orders.value[0]?.totalAmount
            })
          }
        } else {
          console.warn('API 返回的 data 格式不符合預期:', ordersData)
          orders.value = []
        }
      } else {
        orders.value = []
        console.warn('無法解析訂單資料，響應結構:', response)
      }
      
      console.log('成功獲取訂單列表，共', orders.value.length, '筆')
    } catch (err: any) {
      error.value = err.message || '獲取訂單失敗'
      console.error('獲取訂單失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 獲取訂單詳情
   * C組 (蔡易霖) 修改: 整合真實 API
   */
  const fetchOrderDetail = async (orderId: number) => {
    try {
      loading.value = true
      error.value = null
      
      // 調用真實 API
      const response = await orderApi.getOrder(orderId)
      console.log('axios 響應完整結構:', response)
      console.log('axios 響應 data:', response.data)
      
      // 處理 axios 響應結構
      if (response && response.data && response.data.data) {
        currentOrder.value = response.data.data
        console.log('成功獲取訂單詳情', currentOrder.value)
      } else {
        console.warn('無法解析訂單詳情，響應結構:', response)
      }
    } catch (err: any) {
      error.value = err.message || '獲取訂單詳情失敗'
      console.error('獲取訂單詳情失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 取消訂單
   */
  const cancelOrder = async (orderId: number, reason: string) => {
    try {
      loading.value = true
      error.value = null
      
      // 調用 C組 實際 API
      const { cancelOrder } = await import('@/api/modules/c-orders')
      await cancelOrder(orderId, reason)
      
      // 更新本地狀態
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.orderStatus = 6 // 已取消
      }
      
      if (currentOrder.value && currentOrder.value.id === orderId) {
        currentOrder.value.orderStatus = 6
      }
      
      console.log(`訂單 ${orderId} 已取消，原因：${reason}`)
    } catch (err: any) {
      error.value = err.message || '取消訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 確認收貨
   */
  const confirmReceived = async (orderId: number) => {
    try {
      loading.value = true
      error.value = null
      
      // TODO: 調用實際 API
      // await orderApi.confirmReceived(orderId)
      
      // 更新本地狀態
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.orderStatus = 5 // 已完成
      }
      
      if (currentOrder.value && currentOrder.value.id === orderId) {
        currentOrder.value.orderStatus = 5
      }
      
      console.log(`訂單 ${orderId} 已確認收貨`)
    } catch (err: any) {
      error.value = err.message || '確認收貨失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 申請退款
   */
  const requestRefund = async (orderId: number, refundData: {
    reason: string
    amount: number
    description?: string
  }) => {
    try {
      loading.value = true
      error.value = null
      
      // TODO: 調用實際 API
      // const response = await orderApi.requestRefund(orderId, refundData)
      
      console.log(`訂單 ${orderId} 申請退款：`, refundData)
    } catch (err: any) {
      error.value = err.message || '申請退款失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 重新下單
   */
  const reorder = async (orderId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const order = orders.value.find(o => o.id === orderId)
      if (!order) {
        throw new Error('訂單不存在')
      }
      
      // TODO: 將訂單商品加入購物車
      console.log(`重新下單：訂單 ${orderId}`)
      
      return { success: true, message: '商品已加入購物車' }
    } catch (err: any) {
      error.value = err.message || '重新下單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除錯誤
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 重置狀態
   */
  const reset = () => {
    orders.value = []
    currentOrder.value = null
    error.value = null
    loading.value = false
  }

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,
    paymentMethods,
    shippingMethods,
    
    // Getters  
    orderStats,
    userOrders,
    recentOrders,
    
    // Actions
    createOrder,
    fetchOrders,
    fetchOrderDetail,
    cancelOrder,
    confirmReceived,
    requestRefund,
    reorder,
    clearError,
    reset
  }
})