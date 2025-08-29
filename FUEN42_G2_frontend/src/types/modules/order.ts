/**
 * 訂單系統類型定義
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 訂單 + 金流 + 物流管理
 * 對應資料庫: FUEN42_G2_DB
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

// ==================== 主訂單 (MasterOrders) ====================
export interface MasterOrder {
  id: number                    // bigint IDENTITY(1,1)
  masterOrderNumber: string      // nvarchar(30)
  memberId: number              // int
  totalAmount: number           // decimal(18,2) - 總金額
  shippingFee: number          // decimal(10,2) - 運費
  discountAmount: number       // decimal(18,2) - 折扣金額
  finalAmount: number          // decimal(18,2) - 最終金額
  recipientName: string        // nvarchar(50) - 收件人姓名
  recipientPhone: string       // nvarchar(20) - 收件人電話
  shippingAddress: string      // nvarchar(200) - 送貨地址
  note?: string               // nvarchar(500) - 備註
  couponId?: number           // int - 優惠券ID
  status: OrderStatus         // tinyint - 訂單狀態
  paymentStatus?: PaymentStatus // tinyint - 付款狀態 (新增)
  createdAt: string          // datetime2(7)
  updatedAt: string          // datetime2(7)
  
  // 列表用額外欄位
  items?: OrderItemSummary[]  // 商品摘要列表
  totalItemCount?: number     // 商品總數量
  productSummary?: string     // 商品摘要文字
  
  // 關聯資料
  orders?: Order[]           // 子訂單列表
  member?: MemberInfo        // 會員資訊
  payment?: Payment          // 付款資訊
}

// ==================== 子訂單 (Orders) ====================
export interface Order {
  id: number                    // bigint IDENTITY(1,1)
  orderNumber: string           // nvarchar(30) - 子訂單編號
  masterOrderId: number         // bigint - 主訂單ID
  vendorId: number             // int - 廠商ID
  subTotal: number             // decimal(18,2) - 小計
  shippingFee: number          // decimal(10,2) - 運費
  totalAmount: number          // decimal(18,2) - 總金額
  orderStatus: OrderStatus     // tinyint - 訂單狀態
  paymentStatus: PaymentStatus // tinyint - 付款狀態
  shippingStatus: ShippingStatus // tinyint - 物流狀態
  note?: string               // nvarchar(500) - 備註
  createdAt: string          // datetime2(7)
  updatedAt: string          // datetime2(7)
  
  // 關聯資料
  orderItems?: OrderItem[]    // 訂單項目
  vendor?: VendorInfo        // 廠商資訊
  shipment?: Shipment        // 物流資訊
}

// ==================== 訂單項目 (OrderItems) ====================
export interface OrderItem {
  id: number                  // bigint IDENTITY(1,1)
  orderId: number            // bigint - 訂單ID
  productId: number          // int - 商品ID
  productSpecId?: number     // int - 商品規格ID
  productName: string        // nvarchar(100) - 商品名稱
  specName?: string         // nvarchar(50) - 規格名稱
  quantity: number          // int - 數量
  unitPrice: number         // decimal(10,2) - 單價
  subTotal: number          // decimal(10,2) - 小計
  note?: string            // nvarchar(200) - 備註
  createdAt: string        // datetime2(7)
  
  // 關聯資料
  product?: ProductInfo    // 商品資訊
}

// ==================== 訂單商品摘要 ====================
export interface OrderItemSummary {
  productId: number        // int - 商品ID
  productName: string      // nvarchar(100) - 商品名稱
  specName?: string       // nvarchar(50) - 規格名稱
  quantity: number        // int - 數量
  unitPrice: number       // decimal(10,2) - 單價
  subTotal: number        // decimal(10,2) - 小計
}

// ==================== 訂單狀態 (OrderStatuses) ====================
export interface OrderStatusInfo {
  id: number               // tinyint
  statusName: string       // nvarchar(50)
  statusCode: string       // nvarchar(20)
  description?: string     // nvarchar(200)
  colorCode?: string      // nvarchar(10)
  sortOrder: number       // int
  isActive: boolean       // bit
  createdAt: string       // datetime2(7)
}

// ==================== 訂單日誌 (OrderLogs) ====================
export interface OrderLog {
  id: number              // bigint IDENTITY(1,1)
  orderId: number         // bigint
  action: string          // nvarchar(50) - 動作
  oldStatus?: OrderStatus // tinyint - 舊狀態
  newStatus?: OrderStatus // tinyint - 新狀態
  description: string     // nvarchar(500) - 描述
  operatorId?: string    // nvarchar(450) - 操作者ID
  operatorType?: string  // nvarchar(20) - 操作者類型
  ipAddress?: string     // nvarchar(50) - IP地址
  userAgent?: string     // nvarchar(500) - User Agent
  createdAt: string      // datetime2(7)
}

// ==================== 付款 (Payments) ====================
export interface Payment {
  id: number                    // bigint IDENTITY(1,1)
  masterOrderId: number         // bigint
  paymentMethodId: number       // int
  amount: number               // decimal(18,2)
  transactionId?: string       // nvarchar(100) - 交易編號
  gatewayResponse?: string     // nvarchar(max) - 金流回應
  status: PaymentStatus        // tinyint
  paidAt?: string             // datetime2(7) - 付款時間
  createdAt: string           // datetime2(7)
  updatedAt: string           // datetime2(7)
  
  // 關聯資料
  paymentMethod?: PaymentMethod
}

// ==================== 付款方式 (PaymentMethods) ====================
export interface PaymentMethod {
  id: number            // int IDENTITY(1,1)
  methodName: string    // nvarchar(50) - 付款方式名稱
  methodCode: string    // nvarchar(20) - 付款方式代碼
  description?: string  // nvarchar(200)
  iconUrl?: string     // nvarchar(500)
  isActive: boolean    // bit
  sortOrder: number    // int
  createdAt: string    // datetime2(7)
}

// ==================== 物流 (Shipments) ====================
export interface Shipment {
  id: number                     // bigint IDENTITY(1,1)
  orderId: number                // bigint
  logisticsProviderId: number    // int - 物流供應商ID
  trackingNumber?: string         // nvarchar(50) - 物流單號
  shippingMethod: string          // nvarchar(50) - 配送方式
  estimatedDelivery?: string      // datetime2(7) - 預計送達時間
  actualDelivery?: string         // datetime2(7) - 實際送達時間
  status: ShippingStatus          // tinyint
  note?: string                  // nvarchar(500)
  createdAt: string              // datetime2(7)
  updatedAt: string              // datetime2(7)
  
  // 關聯資料
  logisticsProvider?: LogisticsProvider
  trackingLogs?: TrackingLog[]
}

// ==================== 物流供應商 (LogisticsProviders) ====================
export interface LogisticsProvider {
  id: number             // int IDENTITY(1,1)
  providerName: string   // nvarchar(50)
  providerCode: string   // nvarchar(20)
  apiUrl?: string       // nvarchar(500)
  contactPhone?: string // nvarchar(20)
  isActive: boolean     // bit
  createdAt: string     // datetime2(7)
}

// ==================== 物流追蹤 (TrackingLogs) ====================
export interface TrackingLog {
  id: number              // bigint IDENTITY(1,1)
  shipmentId: number      // bigint
  status: string          // nvarchar(50)
  location?: string       // nvarchar(200)
  description: string     // nvarchar(500)
  logTime: string        // datetime2(7)
  createdAt: string      // datetime2(7)
}

// ==================== 退貨 (Returns) ====================
export interface Return {
  id: number                // bigint IDENTITY(1,1)
  orderId: number          // bigint
  returnNumber: string     // nvarchar(30)
  reason: string           // nvarchar(500) - 退貨原因
  requestType: ReturnType  // tinyint - 退貨類型
  status: ReturnStatus     // tinyint
  refundAmount?: number    // decimal(18,2)
  returnShipmentId?: number // bigint
  createdAt: string        // datetime2(7)
  updatedAt: string        // datetime2(7)
  
  // 關聯資料
  order?: Order
  refund?: Refund
}

// ==================== 退款 (Refunds) ====================
export interface Refund {
  id: number               // bigint IDENTITY(1,1)
  returnId: number         // bigint
  refundNumber: string     // nvarchar(30)
  amount: number          // decimal(18,2)
  refundMethod: string    // nvarchar(50)
  transactionId?: string  // nvarchar(100)
  status: RefundStatus    // tinyint
  processedAt?: string    // datetime2(7)
  createdAt: string       // datetime2(7)
  updatedAt: string       // datetime2(7)
}

// ==================== 枚舉定義 ====================

// 訂單狀態 - 與後端系統同步
export enum OrderStatus {
  Cancelled = 0,       // 已取消
  Pending = 1,         // 待付款
  PendingConfirm = 2,  // 待確認
  Processing = 3,      // 處理中
  PendingShip = 4,     // 待出貨
  Shipped = 5,         // 已出貨
  Delivered = 6,       // 已送達
  Completed = 7,       // 已完成
  Returning = 8,       // 退貨中
  Returned = 9         // 已退貨
}

// 付款狀態
export enum PaymentStatus {
  Pending = 0,        // 待付款
  Unpaid = 1,         // 未付款（修正：1=未付款，應顯示「待付款」）
  Paid = 2,           // 已付款（修正：2=已付款）
  Refunding = 3,      // 退款中
  Refunded = 4        // 已退款
}

// 物流狀態
export enum ShippingStatus {
  Pending = 0,        // 待出貨
  Processing = 1,     // 準備中
  Shipped = 2,        // 已出貨
  InTransit = 3,      // 運送中
  Delivered = 4,      // 已送達
  Failed = 5,         // 配送失敗
  Returned = 6        // 已退回
}

// 退貨類型
export enum ReturnType {
  Return = 0,         // 退貨
  Exchange = 1,       // 換貨
  Refund = 2         // 退款
}

// 退貨狀態
export enum ReturnStatus {
  Pending = 0,        // 待審核
  Approved = 1,       // 已批准
  Rejected = 2,       // 已拒絕
  Processing = 3,     // 處理中
  Completed = 4,      // 已完成
  Cancelled = 5       // 已取消
}

// 退款狀態
export enum RefundStatus {
  Pending = 0,        // 待處理
  Processing = 1,     // 處理中
  Completed = 2,      // 已完成
  Failed = 3,         // 失敗
  Cancelled = 4       // 已取消
}

// ==================== 物流相關類型 ====================

// 物流資訊 (Shipments)
export interface ShippingInfo {
  id: number                    // bigint
  orderId: number               // bigint - 對應子訂單ID
  trackingNumber: string        // nvarchar(50) - 物流單號
  logisticsProviderId: number  // int - 物流供應商ID
  status: ShippingStatus       // tinyint - 物流狀態
  shippedDate?: string         // datetime2(7) - 發貨日期
  estimatedDeliveryDate?: string // datetime2(7) - 預計送達日期
  actualDeliveryDate?: string  // datetime2(7) - 實際送達日期
  recipientName: string        // nvarchar(50) - 收件人姓名
  recipientPhone: string       // nvarchar(20) - 收件人電話
  shippingAddress: string      // nvarchar(200) - 送貨地址
  shippingFee: number         // decimal(10,2) - 運費
  createdAt: string           // datetime2(7)
  updatedAt: string           // datetime2(7)
}


// ==================== 輔助類型 ====================

// 會員基本資訊 (用於顯示)
export interface MemberInfo {
  id: number
  name: string
  email: string
  phone: string
}

// 廠商基本資訊 (用於顯示)
export interface VendorInfo {
  id: number
  vendorName: string
  contactPhone: string
}

// 商品基本資訊 (用於顯示)
export interface ProductInfo {
  id: number
  productName: string
  imageUrl?: string
}

// ==================== API 請求/響應類型 ====================

// 創建訂單請求
export interface CreateOrderRequest {
  items: CreateOrderItem[]
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  paymentMethodId: number
  shippingMethodId: number
  couponId?: number
  note?: string
}

// 創建訂單項目
export interface CreateOrderItem {
  productId: number
  productSpecId?: number
  quantity: number
}

// 訂單列表查詢參數
export interface OrderListParams {
  page?: number
  pageSize?: number
  status?: OrderStatus
  startDate?: string
  endDate?: string
  keyword?: string
}

// 更新訂單狀態
export interface UpdateOrderStatusRequest {
  orderId: number
  newStatus: OrderStatus
  note?: string
}

// 取消訂單  
export interface CancelOrderRequest {
  orderId: number
  reason: string
}

// 申請退貨
export interface ReturnRequest {
  orderId: number
  reason: string
  description?: string
  amount?: number
  requestType?: ReturnType
  items?: Array<{
    productId: number
    quantity: number
  }>
  images?: string[]
}

export namespace OrderAPI {

  // 創建訂單響應
  export interface CreateOrderResponse {
    masterOrderId: number
    masterOrderNumber: string
    finalAmount: number
    paymentUrl?: string
    createdAt: string
  }

  // 主訂單資訊 (擴展版，包含所有關聯資料)
  export interface MasterOrderInfo extends MasterOrder {
    orders: Order[]
    payment?: Payment
    orderStatus: OrderStatus
    paymentStatus: PaymentStatus
    shippingMethod?: string
    paymentMethod?: string
  }

}