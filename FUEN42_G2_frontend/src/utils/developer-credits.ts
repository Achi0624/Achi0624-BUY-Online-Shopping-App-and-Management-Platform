/**
 * 開發者貢獻標記
 * FUEN42_G2 五人專題小組 - BUY商城系統
 */

export const DEVELOPER_CREDITS = {
  // C組 - 蔡易霖 負責模組
  'C_蔡易霖': {
    name: '蔡易霖',
    group: 'C組 (組長)',
    role: '訂單 + 金流 + 物流管理',
    modules: [
      '購物車系統',
      '結帳流程', 
      '訂單管理',
      '付款整合',
      '物流追蹤',
      '退貨退款'
    ],
    files: [
      // API 模組
      'src/api/modules/order.ts',
      
      // 類型定義
      'src/types/modules/order.ts',
      
      // Store 狀態管理
      'src/stores/modules/cart.ts',
      'src/stores/modules/order.ts', 
      'src/stores/modules/payment.ts',
      
      // 購物車相關組件
      'src/components/order/cart/CartItem.vue',
      'src/components/order/cart/CartSummary.vue',
      
      // 訂單相關組件
      'src/components/order/OrderStatus.vue',
      'src/components/order/OrderActions.vue',
      
      // 購物車與訂單頁面
      'src/views/order/CartView.vue',
      'src/views/order/OrderListView.vue', 
      'src/views/order/OrderDetailView.vue',
      
      // 結帳頁面
      'src/views/CheckoutView.vue',
      
      // 付款相關頁面
      'src/views/payment/PaymentView.vue',
      'src/views/payment/PaymentResultView.vue',
      'src/views/payment/PaymentCallbackView.vue',
      'src/views/payment/ThirdPartyPaymentView.vue',
      
      // 測試與工具
      'src/views/TestView.vue',
      'src/utils/mockData.ts'
    ],
    contact: '負責訂單、金流、物流管理系統',
    startDate: '2025-08-14',
    completedPhases: [
      'Phase 1: 基礎架構',
      'Phase 2: 購物車系統', 
      'Phase 3: 結帳流程',
      'Phase 4: 訂單管理',
      'Phase 5: 付款整合'
    ]
  }
} as const

/**
 * 獲取檔案的開發者資訊
 */
export function getFileDeveloper(filePath: string): string | null {
  for (const [developerId, info] of Object.entries(DEVELOPER_CREDITS)) {
    if (info.files.includes(filePath)) {
      return `${info.name} (${info.group})`
    }
  }
  return null
}

/**
 * 生成開發者標記註釋
 */
export function generateDeveloperHeader(
  developer: string,
  group: string,
  module: string,
  description?: string
): string {
  return `/**
 * ${description || ''}
 * 
 * 開發者: ${developer}
 * 負責組別: ${group}
 * 負責模組: ${module}
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */`
}