/**
 * 金流模組 TypeScript 類型定義
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 金流處理與付款管理
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import type { ApiResponse } from '@/api/http'

// ==================== 基礎類型 ====================

export interface PaymentMethod {
  id: number
  name: string
  code: string
  isActive: boolean
}

export interface PaymentStatus {
  transactionId: string
  status: string
  amount: number
  paymentMethod: string
  paidAt?: string
}

// ==================== API 命名空間 ====================

export namespace PaymentAPI {
  // 付款方式
  export interface PaymentMethodsResponse extends ApiResponse<PaymentMethod[]> {}

  // 處理付款
  export interface ProcessPaymentRequest {
    orderId: number
    paymentMethodId: number
  }

  export interface ProcessPaymentResponse extends ApiResponse<{
    transactionId: string
    paymentUrl?: string
    status: string
  }> {}

  // 付款回調
  export interface PaymentCallbackRequest {
    transactionId: string
    status: string
    paymentMethod: string
    amount: number
    extendedData?: Record<string, any>
  }

  export interface PaymentCallbackResponse extends ApiResponse<{
    success: boolean
    message: string
    orderNumber?: string
  }> {}

  // 付款狀態查詢
  export interface PaymentStatusResponse extends ApiResponse<PaymentStatus> {}

  // 退款
  export interface RefundRequest {
    returnId: number
    refundAmount: number
    reason: string
  }

  export interface RefundResponse extends ApiResponse<{
    refundId: number
    refundAmount: number
    status: string
    processedAt?: string
  }> {}
}

// ==================== 付款狀態枚舉 ====================

export enum PaymentStatusEnum {
  Pending = 'pending',
  Processing = 'processing', 
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Refunding = 'refunding',
  Refunded = 'refunded'
}

// ==================== 付款方式枚舉 ====================

export enum PaymentMethodEnum {
  CreditCard = 'CREDIT_CARD',
  ATM = 'ATM', 
  COD = 'COD',
  LinePay = 'LINE_PAY',
  JkoPay = 'JKOPAY'
}