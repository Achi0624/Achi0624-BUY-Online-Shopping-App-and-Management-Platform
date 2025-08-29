/**
 * 付款狀態管理 Store
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 付款整合系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockApiDelay } from '@/utils/mockData'
import { paymentApi } from '@/api/modules/payment'

// 付款狀態枚舉
export enum PaymentStatus {
  Pending = 0,        // 待付款
  Processing = 1,     // 處理中
  Success = 2,        // 付款成功
  Failed = 3,         // 付款失敗
  Cancelled = 4,      // 用戶取消
  Expired = 5,        // 已過期
  Refunded = 6        // 已退款
}

// 付款方式枚舉
export enum PaymentMethod {
  CreditCard = 1,     // 信用卡
  LinePay = 2,        // LINE Pay
  JkoPay = 3,         // 街口支付
  COD = 4,            // 貨到付款
  BankTransfer = 5    // 銀行轉帳
}

// 付款記錄介面
export interface PaymentRecord {
  id: number
  orderId: number
  orderNumber: string
  amount: number
  paymentMethod: PaymentMethod
  paymentMethodName: string
  status: PaymentStatus
  statusName: string
  transactionId?: string
  thirdPartyId?: string
  paymentUrl?: string
  createdAt: string
  paidAt?: string
  failedReason?: string
  refundAmount?: number
  refundedAt?: string
}

// 付款處理請求
export interface PaymentProcessRequest {
  orderId: number
  paymentMethodId: number
  amount: number
  returnUrl: string
  callbackUrl: string
  customerInfo?: {
    name: string
    email?: string
    phone?: string
  }
}

// 付款處理響應
export interface PaymentProcessResponse {
  paymentId: number
  transactionId: string
  paymentUrl?: string
  qrCode?: string
  status: PaymentStatus
  expiresAt?: string
}

// 退款請求
export interface RefundRequest {
  paymentId: number
  amount: number
  reason: string
}

// 退款響應
export interface RefundResponse {
  refundId: number
  refundAmount: number
  refundedAt: string
  status: 'processing' | 'completed' | 'failed'
}

export const usePaymentStore = defineStore('payment', () => {
  // ==================== State ====================
  const payments = ref<PaymentRecord[]>([])
  const currentPayment = ref<PaymentRecord | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 付款方式配置
  const paymentMethods = ref([
    {
      id: PaymentMethod.CreditCard,
      name: '信用卡',
      code: 'credit_card',
      description: '支援 Visa、MasterCard、JCB',
      icon: '💳',
      fee: 0,
      enabled: true
    },
    {
      id: PaymentMethod.LinePay,
      name: 'LINE Pay',
      code: 'line_pay',
      description: '使用 LINE Pay 快速付款',
      icon: '💚',
      fee: 0,
      enabled: true
    },
    {
      id: PaymentMethod.JkoPay,
      name: '街口支付',
      code: 'jko_pay',
      description: '街口支付 App 付款',
      icon: '🟡',
      fee: 0,
      enabled: true
    },
    {
      id: PaymentMethod.COD,
      name: '貨到付款',
      code: 'cod',
      description: '收到商品再付款',
      icon: '💰',
      fee: 30,
      enabled: true
    },
    {
      id: PaymentMethod.BankTransfer,
      name: '銀行轉帳',
      code: 'bank_transfer',
      description: '匯款至指定帳戶',
      icon: '🏦',
      fee: 15,
      enabled: true
    }
  ])

  // ==================== Getters ====================

  // 付款統計
  const paymentStats = computed(() => {
    const total = payments.value.length
    const success = payments.value.filter(p => p.status === PaymentStatus.Success).length
    const failed = payments.value.filter(p => p.status === PaymentStatus.Failed).length
    const pending = payments.value.filter(p => p.status === PaymentStatus.Pending).length

    return { total, success, failed, pending }
  })

  // 成功付款總額
  const totalPaidAmount = computed(() =>
    payments.value
      .filter(p => p.status === PaymentStatus.Success)
      .reduce((sum, p) => sum + p.amount, 0)
  )

  // 退款總額
  const totalRefundAmount = computed(() =>
    payments.value
      .filter(p => p.status === PaymentStatus.Refunded && p.refundAmount)
      .reduce((sum, p) => sum + (p.refundAmount || 0), 0)
  )

  // 根據 ID 獲取付款方式
  const getPaymentMethod = (id: number) =>
    paymentMethods.value.find(method => method.id === id)

  // 獲取付款狀態名稱
  const getStatusName = (status: PaymentStatus): string => {
    const statusMap = {
      [PaymentStatus.Pending]: '待付款',
      [PaymentStatus.Processing]: '處理中',
      [PaymentStatus.Success]: '付款成功',
      [PaymentStatus.Failed]: '付款失敗',
      [PaymentStatus.Cancelled]: '已取消',
      [PaymentStatus.Expired]: '已過期',
      [PaymentStatus.Refunded]: '已退款'
    }
    return statusMap[status] || '未知狀態'
  }

  // ==================== Actions ====================

  /**
   * 處理付款
   */
  const processPayment = async (paymentData: PaymentProcessRequest): Promise<PaymentProcessResponse> => {
    try {
      loading.value = true
      error.value = null

      await mockApiDelay(2000) // 模擬 API 延遲

      // 模擬不同付款方式的處理邏輯
      const method = getPaymentMethod(paymentData.paymentMethodId)
      if (!method) {
        throw new Error('無效的付款方式')
      }

      // 生成模擬交易 ID
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`

      let mockResponse: PaymentProcessResponse

      switch (paymentData.paymentMethodId) {
        case PaymentMethod.CreditCard:
          // 信用卡：90% 成功率
          const ccSuccess = Math.random() > 0.1
          mockResponse = {
            paymentId: Date.now(),
            transactionId,
            paymentUrl: ccSuccess ? undefined : `/payment/credit-card/${transactionId}`,
            status: ccSuccess ? PaymentStatus.Success : PaymentStatus.Processing,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30分鐘後過期
          }
          break

        case PaymentMethod.LinePay:
        case PaymentMethod.JkoPay:
          // 第三方支付：需要跳轉
          mockResponse = {
            paymentId: Date.now(),
            transactionId,
            paymentUrl: `/payment/${method.code}/${transactionId}`,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment:${transactionId}`,
            status: PaymentStatus.Pending,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15分鐘後過期
          }
          break

        case PaymentMethod.COD:
        case PaymentMethod.BankTransfer:
          // 線下付款：直接成功
          mockResponse = {
            paymentId: Date.now(),
            transactionId,
            status: PaymentStatus.Success
          }
          break

        default:
          throw new Error('不支援的付款方式')
      }

      // 創建付款記錄
      const paymentRecord: PaymentRecord = {
        id: mockResponse.paymentId,
        orderId: paymentData.orderId,
        orderNumber: `ORD${paymentData.orderId}`,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethodId as PaymentMethod,
        paymentMethodName: method.name,
        status: mockResponse.status,
        statusName: getStatusName(mockResponse.status),
        transactionId: mockResponse.transactionId,
        paymentUrl: mockResponse.paymentUrl,
        createdAt: new Date().toISOString(),
        paidAt: mockResponse.status === PaymentStatus.Success ? new Date().toISOString() : undefined
      }

      // 添加到付款記錄
      payments.value.unshift(paymentRecord)
      currentPayment.value = paymentRecord

      return mockResponse

    } catch (err: any) {
      error.value = err.message || '處理付款失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 查詢付款狀態
   */
  const queryPaymentStatus = async (paymentId: number): Promise<PaymentRecord | null> => {
    try {
      loading.value = true
      error.value = null

      await mockApiDelay(1000)

      const payment = payments.value.find(p => p.id === paymentId)
      if (!payment) {
        return null
      }

      // 模擬狀態更新邏輯
      if (payment.status === PaymentStatus.Pending) {
        // 50% 機率變成成功，30% 保持 pending，20% 失敗
        const rand = Math.random()
        if (rand > 0.5) {
          payment.status = PaymentStatus.Success
          payment.statusName = getStatusName(PaymentStatus.Success)
          payment.paidAt = new Date().toISOString()
        } else if (rand < 0.2) {
          payment.status = PaymentStatus.Failed
          payment.statusName = getStatusName(PaymentStatus.Failed)
          payment.failedReason = '付款被拒絕'
        }
      }

      currentPayment.value = payment
      return payment

    } catch (err: any) {
      error.value = err.message || '查詢付款狀態失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 取消付款
   */
  const cancelPayment = async (paymentId: number, reason?: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      await mockApiDelay(1000)

      const payment = payments.value.find(p => p.id === paymentId)
      if (!payment) {
        throw new Error('付款記錄不存在')
      }

      if (payment.status !== PaymentStatus.Pending && payment.status !== PaymentStatus.Processing) {
        throw new Error('此付款無法取消')
      }

      // 更新狀態
      payment.status = PaymentStatus.Cancelled
      payment.statusName = getStatusName(PaymentStatus.Cancelled)
      payment.failedReason = reason || '用戶取消'

      if (currentPayment.value?.id === paymentId) {
        currentPayment.value = payment
      }

    } catch (err: any) {
      error.value = err.message || '取消付款失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 申請退款
   */
  const requestRefund = async (refundData: RefundRequest): Promise<RefundResponse> => {
    try {
      loading.value = true
      error.value = null

      await mockApiDelay(2000)

      const payment = payments.value.find(p => p.id === refundData.paymentId)
      if (!payment) {
        throw new Error('付款記錄不存在')
      }

      if (payment.status !== PaymentStatus.Success) {
        throw new Error('只有成功付款才能申請退款')
      }

      if (refundData.amount > payment.amount) {
        throw new Error('退款金額不能超過原付款金額')
      }

      // 更新付款記錄
      payment.status = PaymentStatus.Refunded
      payment.statusName = getStatusName(PaymentStatus.Refunded)
      payment.refundAmount = refundData.amount
      payment.refundedAt = new Date().toISOString()

      const refundResponse: RefundResponse = {
        refundId: Date.now(),
        refundAmount: refundData.amount,
        refundedAt: payment.refundedAt,
        status: 'completed'
      }

      return refundResponse

    } catch (err: any) {
      error.value = err.message || '申請退款失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 獲取付款記錄列表
   */
  const fetchPayments = async (params?: {
    orderId?: number
    status?: PaymentStatus
    startDate?: string
    endDate?: string
  }) => {
    try {
      loading.value = true
      error.value = null

      await mockApiDelay(1000)

      // TODO: 實際調用 API
      console.log('獲取付款記錄 - 使用模擬數據', params)

    } catch (err: any) {
      error.value = err.message || '獲取付款記錄失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * C組 (蔡易霖) 新增: 獲取真實付款方式列表
   */
  const fetchRealPaymentMethods = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await paymentApi.getPaymentMethods()
      console.log('獲取真實付款方式響應:', response.data)

      if (response && response.data && response.data.data) {
        // 更新付款方式配置，合併真實API和本地配置
        const realMethods = response.data.data

        // 更新現有配置
        paymentMethods.value.forEach(localMethod => {
          const realMethod = realMethods.find(rm => rm.id === localMethod.id)
          if (realMethod) {
            localMethod.name = realMethod.name
            localMethod.code = realMethod.code
            localMethod.enabled = realMethod.isActive
          }
        })

        console.log('🎉 成功整合真實付款方式，共', realMethods.length, '種')
      }

    } catch (err: any) {
      // 當API連接失敗時，使用模擬數據並給出友好提示
      console.warn('⚠️ 後端API無法連接，使用模擬付款方式數據')
      error.value = null // 清除錯誤，因為我們有降級方案

      // 確保本地付款方式配置已啟用
      paymentMethods.value.forEach(method => {
        method.enabled = true
      })

      console.log('🔄 使用本地模擬付款方式，共', paymentMethods.value.length, '種')
      console.log('💡 提示: 啟動後端服務器(localhost:7044)以使用真實API')

      // 不拋出錯誤，因為我們有成功的降級方案
      return
    } finally {
      loading.value = false
    }
  }

  /**
   * C組 (蔡易霖) 新增: 使用真實API處理付款
   */
  const processRealPayment = async (orderId: number, paymentMethodId: number) => {
    try {
      loading.value = true
      error.value = null

      const response = await paymentApi.processPayment({
        orderId,
        paymentMethodId
      })

      console.log('真實付款處理響應:', response.data)

      if (response && response.data && response.data.data) {
        const paymentData = response.data.data

        // 創建付款記錄
        const method = getPaymentMethod(paymentMethodId)
        const paymentRecord: PaymentRecord = {
          id: Date.now(), // 臨時ID，實際應該用API返回的ID
          orderId,
          orderNumber: `ORD${orderId}`,
          amount: 0, // 實際應該從API獲取
          paymentMethod: paymentMethodId as PaymentMethod,
          paymentMethodName: method?.name || '未知',
          status: paymentData.status === 'pending' ? PaymentStatus.Pending : PaymentStatus.Processing,
          statusName: getStatusName(paymentData.status === 'pending' ? PaymentStatus.Pending : PaymentStatus.Processing),
          transactionId: paymentData.transactionId,
          paymentUrl: paymentData.paymentUrl,
          createdAt: new Date().toISOString()
        }

        payments.value.unshift(paymentRecord)
        currentPayment.value = paymentRecord

        return {
          success: true,
          data: paymentData,
          needRedirect: !!paymentData.paymentUrl,
          redirectUrl: paymentData.paymentUrl
        }
      }

      throw new Error('付款響應格式錯誤')
    } catch (err: any) {
      // 當API連接失敗時，切換到模擬付款處理
      console.warn('⚠️ 後端API無法連接，使用模擬付款處理')
      error.value = null // 清除錯誤，使用降級方案

      try {
        // 使用原有的模擬付款流程
        const mockResult = await processPayment({
          orderId,
          paymentMethodId,
          amount: Math.floor(Math.random() * 10000) + 1000, // 模擬金額
          returnUrl: window.location.origin + '/payment/result',
          callbackUrl: window.location.origin + '/payment/callback'
        })

        console.log('🔄 使用模擬付款處理完成')
        console.log('💡 提示: 啟動後端服務器(localhost:7044)以使用真實API')

        return {
          success: true,
          data: {
            transactionId: mockResult.transactionId,
            paymentUrl: mockResult.paymentUrl,
            status: mockResult.status === PaymentStatus.Success ? 'completed' : 'pending'
          },
          needRedirect: !!mockResult.paymentUrl,
          redirectUrl: mockResult.paymentUrl
        }
      } catch (mockErr: any) {
        // 如果連模擬處理都失敗了，這是一個真正的錯誤
        error.value = '模擬付款處理失敗'
        console.error('模擬付款處理失敗:', mockErr)
        throw mockErr
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * C組 (蔡易霖) 新增: 查詢真實付款狀態
   */
  const queryRealPaymentStatus = async (transactionId: string) => {
    try {
      loading.value = true
      error.value = null

      const response = await paymentApi.getPaymentStatus(transactionId)
      console.log('真實付款狀態響應:', response.data)

      if (response && response.data && response.data.data) {
        const statusData = response.data.data

        // 更新對應的付款記錄
        const payment = payments.value.find(p => p.transactionId === transactionId)
        if (payment) {
          // 根據API狀態更新本地狀態
          switch (statusData.status.toLowerCase()) {
            case 'completed':
            case 'paid':
              payment.status = PaymentStatus.Success
              payment.paidAt = statusData.paidAt || new Date().toISOString()
              break
            case 'failed':
              payment.status = PaymentStatus.Failed
              break
            case 'pending':
              payment.status = PaymentStatus.Pending
              break
            case 'cancelled':
              payment.status = PaymentStatus.Cancelled
              break
          }

          payment.statusName = getStatusName(payment.status)
          currentPayment.value = payment
        }

        return statusData
      }

      throw new Error('無法獲取付款狀態')
    } catch (err: any) {
      // 當API連接失敗時，使用模擬狀態查詢
      console.warn('⚠️ 後端API無法連接，使用模擬狀態查詢')
      error.value = null // 清除錯誤，使用降級方案

      try {
        // 查找本地付款記錄
        const payment = payments.value.find(p => p.transactionId === transactionId)
        if (!payment) {
          console.error('❌ 未找到對應的付款記錄:', transactionId)
          throw new Error('未找到對應的付款記錄')
        }

        // 使用模擬狀態查詢邏輯
        const mockPayment = await queryPaymentStatus(payment.id)

        console.log('🔄 使用模擬狀態查詢完成')
        console.log('💡 提示: 啟動後端服務器(localhost:7044)以使用真實API')

        return {
          transactionId: payment.transactionId,
          status: payment.statusName,
          amount: payment.amount,
          paymentMethod: payment.paymentMethodName,
          paidAt: payment.paidAt
        }
      } catch (mockErr: any) {
        // 如果連模擬查詢都失敗了，這是一個真正的錯誤
        error.value = '模擬狀態查詢失敗'
        console.error('模擬狀態查詢失敗:', mockErr)
        throw mockErr
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 處理金流回調
   */
  const handlePaymentCallback = async (callbackData: {
    transactionId: string
    status: 'success' | 'failed' | 'cancelled'
    amount?: number
    thirdPartyId?: string
    message?: string
  }) => {
    try {
      const payment = payments.value.find(p => p.transactionId === callbackData.transactionId)
      if (!payment) {
        console.error('未找到對應的付款記錄:', callbackData.transactionId)
        return
      }

      // 更新付款狀態
      switch (callbackData.status) {
        case 'success':
          payment.status = PaymentStatus.Success
          payment.paidAt = new Date().toISOString()
          break
        case 'failed':
          payment.status = PaymentStatus.Failed
          payment.failedReason = callbackData.message || '第三方付款失敗'
          break
        case 'cancelled':
          payment.status = PaymentStatus.Cancelled
          payment.failedReason = callbackData.message || '用戶取消付款'
          break
      }

      payment.statusName = getStatusName(payment.status)
      payment.thirdPartyId = callbackData.thirdPartyId

      console.log('付款回調處理完成:', payment)

    } catch (err: any) {
      console.error('處理付款回調失敗:', err)
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
    payments.value = []
    currentPayment.value = null
    error.value = null
    loading.value = false
  }

  return {
    // State
    payments,
    currentPayment,
    loading,
    error,
    paymentMethods,

    // Getters
    paymentStats,
    totalPaidAmount,
    totalRefundAmount,
    getPaymentMethod,
    getStatusName,

    // Actions
    processPayment,
    queryPaymentStatus,
    cancelPayment,
    requestRefund,
    fetchPayments,
    handlePaymentCallback,
    clearError,
    reset,

    // C組 (蔡易霖) 新增: 真實API Actions
    fetchRealPaymentMethods,
    processRealPayment,
    queryRealPaymentStatus
  }
})