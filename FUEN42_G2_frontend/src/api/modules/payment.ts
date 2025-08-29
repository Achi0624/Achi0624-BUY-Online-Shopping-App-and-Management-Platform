/**
 * 金流管理 API 模組
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 金流處理與付款管理
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import http from '../http'
import type { PaymentAPI } from '@/types/modules/payment'

// ========== 新增：金流閘道整合類型 ==========
export interface CreatePaymentRequest {
  orderNumber: string
  vendorId: number
  paymentMethodId: number
  amount: number
  customerEmail: string
  customerPhone: string
  customerName: string
}

export interface PaymentResponse {
  paymentUrl: string
  transactionId: string
  orderNumber: string
}

export interface PaymentMethodInfo {
  id: number
  name: string
  code: string
  type: string
  iconUrl: string
  handlingFee: number
  description: string
}

export interface PaymentStatusInfo {
  orderNumber: string
  status: string
  statusText: string
  amount: number
  paidAt?: string
}

export const paymentApi = {
  // ========== 新的金流閘道 API ==========
  
  // 建立付款 (平台集中式，後端統一處理)
  createPayment: async (data: CreatePaymentRequest): Promise<{ data: PaymentResponse }> => {
    try {
      console.log('🔄 調用平台付款API:', data)
      const response = await http.post<PaymentResponse>('/C_Payments/create', data)
      console.log('✅ 平台付款API成功:', response)
      return response
    } catch (error: any) {
      console.error('❌ 平台付款API失敗:', error)
      
      // 檢查詳細錯誤信息
      if (error.response?.data) {
        console.log('📋 後端錯誤詳情:', error.response.data)
      }
      
      // 開發環境降級：使用模擬付款
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('🔄 後端服務未運行，使用模擬付款頁面')
        
        const fallbackUrl = `${window.location.origin}/payment/mock?` + new URLSearchParams({
          orderNumber: data.orderNumber,
          amount: data.amount.toString(),
          paymentMethod: data.paymentMethodId.toString(),
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          transactionId: `TXN${Date.now()}`
        }).toString()
        
        return {
          data: {
            paymentUrl: fallbackUrl,
            transactionId: `TXN${Date.now()}`,
            orderNumber: data.orderNumber
          }
        }
      }
      
      // 其他錯誤直接拋出
      throw error
    }
  },

  // 取得平台可用付款方式 (平台集中管理，不再依賴廠商)
  getPlatformPaymentMethods: async (): Promise<{ data: PaymentMethodInfo[] }> => {
    try {
      // 改為調用平台統一的付款方式API
      return await http.get<PaymentMethodInfo[]>('/C_Payments/methods')
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('後端服務未運行，使用模擬付款方式')
        return {
          data: [
            {
              id: 1,
              name: '信用卡付款',
              code: 'CREDIT_CARD',
              type: 'CARD',
              iconUrl: '💳',
              handlingFee: 0,
              description: '支援 VISA、MasterCard、JCB、美國運通'
            },
            {
              id: 2,
              name: 'ATM 轉帳',
              code: 'ATM',
              type: 'TRANSFER',
              iconUrl: '🏧',
              handlingFee: 15,
              description: '虛擬帳號轉帳，繳費期限3天'
            },
            {
              id: 3,
              name: '網路 ATM',
              code: 'WEB_ATM',
              type: 'TRANSFER',
              iconUrl: '🏧',
              handlingFee: 10,
              description: '使用網路銀行即時轉帳'
            },
            {
              id: 4,
              name: '超商代碼繳費',
              code: 'CVS',
              type: 'CODE',
              iconUrl: '🏪',
              handlingFee: 25,
              description: '7-11、全家、萊爾富、OK超商'
            },
            {
              id: 5,
              name: '超商條碼繳費',
              code: 'BARCODE',
              type: 'CODE',
              iconUrl: '📱',
              handlingFee: 25,
              description: '列印條碼至超商繳費'
            },
            {
              id: 6,
              name: 'LINE Pay',
              code: 'LINE_PAY',
              type: 'WALLET',
              iconUrl: '💚',
              handlingFee: 0,
              description: '使用 LINE Pay 付款'
            }
          ]
        }
      }
      throw error
    }
  },

  // 保留舊方法以維持相容性 (暫時)
  getVendorPaymentMethods: async (vendorId: number): Promise<{ data: PaymentMethodInfo[] }> => {
    console.warn('⚠️ getVendorPaymentMethods 已棄用，請使用 getPlatformPaymentMethods')
    return paymentApi.getPlatformPaymentMethods()
  },

  // 查詢付款狀態 (修正後的端點)
  getPaymentStatusByOrderNumber: async (orderNumber: string): Promise<{ data: PaymentStatusInfo }> => {
    try {
      console.log('🔍 查詢付款狀態:', orderNumber)
      const response = await http.get<PaymentStatusInfo>(`/C_Payments/orders/${orderNumber}/status`)
      console.log('📥 付款狀態API回應:', response)
      return response
    } catch (error: any) {
      console.error('❌ 查詢付款狀態失敗:', error)
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('後端服務未運行，使用模擬付款狀態')
        return {
          data: {
            orderNumber: orderNumber,
            status: 'pending',
            statusText: '待付款',
            amount: 15680,
            paidAt: undefined
          }
        }
      }
      throw error
    }
  },

  // ========== 原有的 API (保持相容) ==========
  
  // 獲取付款方式列表
  getPaymentMethods: () =>
    http.get<PaymentAPI.PaymentMethodsResponse>('/C_Payments/methods'),

  // 處理付款
  processPayment: (data: PaymentAPI.ProcessPaymentRequest) =>
    http.post<PaymentAPI.ProcessPaymentResponse>('/C_Payments/process', data),

  // 付款回調處理 (第三方金流通知)
  handlePaymentCallback: (data: PaymentAPI.PaymentCallbackRequest) =>
    http.post<PaymentAPI.PaymentCallbackResponse>('/C_Payments/callback', data),

  // 查詢付款狀態
  getPaymentStatus: (transactionId: string) =>
    http.get<PaymentAPI.PaymentStatusResponse>(`/C_Payments/status/${transactionId}`),
  
  // 查詢訂單付款狀態
  getPaymentStatusByOrderNumber: (orderNumber: string) =>
    http.get<PaymentAPI.PaymentStatusResponse>(`/C_Payments/orders/${orderNumber}/status`),

  // 處理退款
  processRefund: (data: PaymentAPI.RefundRequest) =>
    http.post<PaymentAPI.RefundResponse>('/C_Payments/refund', data)
}