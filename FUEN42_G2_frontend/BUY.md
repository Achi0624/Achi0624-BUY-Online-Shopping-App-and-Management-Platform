# BUY - B2B2C商城前端開發規範

## 專案概述
**FUEN42_G2 五人專題小組 - BUY商城系統**

### 系統架構
- **後台系統**: ASP.NET Core MVC (Admin/Vendor雙後台，Area分離)
- **前台API**: ASP.NET Core Web API (三層式架構，RESTful設計)
- **前台UI**: Vue 3 + TypeScript + Vite (本專案)
- **資料庫**: SQL Server (FUEN42_G2_DB)

### 小組分工
- **A**: 會員, 廠商, 平台系統 & 帳號管理
- **B**: 商品 + 分類管理  
- **C**: 訂單 + 金流 + 物流管理 (組長)
- **D**: 優惠券 + 活動 + 廣告管理
- **E**: 客服系統 + 評價留言 + 黑名單

## 開發環境設置

### 1. 環境要求
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Git >= 2.30.0
```

### 2. 開發指令
```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 類型檢查
npm run type-check

# 構建專案
npm run build

# 預覽構建結果
npm run preview
```

### 3. 環境變數配置
```bash
# 開發環境 (.env.development)
VITE_API_URL=http://localhost:5000/api
VITE_APP_TITLE=BUY商城(開發)

# 生產環境 (.env.production)
VITE_API_URL=https://api.buyshop.com/api
VITE_APP_TITLE=BUY商城
```

## 專案結構規範

```
src/
├── api/                    # API 層
│   ├── http.ts            # HTTP 客戶端配置
│   ├── modules/           # 按模組分組的API
│   │   ├── auth.ts        # A - 會員/廠商認證 API
│   │   ├── product.ts     # B - 商品管理 API
│   │   ├── order.ts       # C - 訂單/金流/物流 API
│   │   ├── coupon.ts      # D - 優惠券/活動 API
│   │   └── support.ts     # E - 客服/評價 API
├── components/            # 組件
│   ├── common/           # 通用組件
│   │   ├── BaseButton.vue
│   │   ├── BaseModal.vue
│   │   ├── LoadingSpinner.vue
│   │   └── PaginationControls.vue
│   ├── layout/           # 佈局組件
│   │   ├── NavBar.vue
│   │   ├── FooterSection.vue
│   │   └── SideBar.vue
│   ├── home/             # 首頁組件
│   ├── auth/             # A - 會員認證組件
│   ├── product/          # B - 商品相關組件
│   ├── order/            # C - 訂單相關組件
│   ├── coupon/           # D - 優惠券組件
│   └── support/          # E - 客服組件
├── stores/               # Pinia 狀態管理
│   ├── modules/
│   │   ├── user.ts       # A - 使用者狀態
│   │   ├── product.ts    # B - 商品狀態
│   │   ├── cart.ts       # C - 購物車狀態
│   │   ├── order.ts      # C - 訂單狀態
│   │   ├── payment.ts    # C - 金流狀態
│   │   ├── shipping.ts   # C - 物流狀態
│   │   ├── coupon.ts     # D - 優惠券狀態
│   │   └── support.ts    # E - 客服狀態
│   └── index.ts          # Store 統一匯出
├── views/                # 頁面組件
│   ├── HomeView.vue
│   ├── auth/             # 會員相關頁面
│   ├── product/          # 商品相關頁面
│   ├── order/            # 訂單相關頁面
│   ├── member/           # 會員中心頁面
│   └── support/          # 客服相關頁面
├── types/                # TypeScript 類型定義
│   ├── index.ts          # 基礎類型
│   ├── api.ts            # API 類型 (基於資料庫結構)
│   └── modules/          # 各模組專用類型
├── utils/                # 工具函數
│   ├── request.ts        # API 請求工具
│   ├── format.ts         # 格式化工具
│   ├── validation.ts     # 驗證工具
│   └── constants.ts      # 常數定義
├── router/               # 路由配置
└── assets/               # 靜態資源
```

## 代碼規範

### 1. 命名規範
```typescript
// 組件名稱 - PascalCase
export default defineComponent({
  name: 'ProductCard'
})

// 檔案命名
ProductCard.vue           // Vue 組件
useProductStore.ts        // Composable
productApi.ts            // API 模組
ProductTypes.ts          // 類型定義

// 變數和函數 - camelCase
const productList = ref([])
const getUserInfo = async () => {}

// 常數 - SCREAMING_SNAKE_CASE
const API_ENDPOINTS = {
  PRODUCTS: '/products',
  ORDERS: '/orders'
}

// CSS類名 - kebab-case
.product-card {}
.btn-primary {}
```

### 2. Vue 組件規範
```vue
<script setup lang="ts">
// 1. 導入順序
import { ref, computed, onMounted } from 'vue'           // Vue APIs
import { useRouter } from 'vue-router'                   // 第三方庫
import { useProductStore } from '@/stores/modules/product' // 內部模組
import type { ProductInfo } from '@/types/api'           // 類型定義

// 2. Props 定義 (使用接口)
interface Props {
  products: ProductInfo[]
  showPrice?: boolean
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  showPrice: true,
  maxItems: 12
})

// 3. Emits 定義
const emit = defineEmits<{
  select: [product: ProductInfo]
  loadMore: []
}>()

// 4. Composables
const router = useRouter()
const productStore = useProductStore()

// 5. 響應式數據
const loading = ref(false)
const selectedId = ref<number | null>(null)

// 6. 計算屬性
const displayProducts = computed(() => {
  return props.products.slice(0, props.maxItems)
})

const hasMore = computed(() => {
  return props.products.length > props.maxItems
})

// 7. 方法
const handleSelect = (product: ProductInfo) => {
  selectedId.value = product.id
  emit('select', product)
}

const loadMoreProducts = () => {
  emit('loadMore')
}

// 8. 生命周期
onMounted(() => {
  // 初始化邏輯
})
</script>

<template>
  <div class="product-list">
    <div 
      v-for="product in displayProducts" 
      :key="product.id"
      class="product-card"
      :class="{ 'selected': selectedId === product.id }"
      @click="handleSelect(product)"
    >
      <!-- 商品卡片內容 -->
    </div>
    
    <button 
      v-if="hasMore" 
      class="btn btn-secondary"
      @click="loadMoreProducts"
    >
      載入更多
    </button>
  </div>
</template>

<style scoped>
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-card.selected {
  border-color: var(--blue);
}
</style>
```

### 3. TypeScript 類型規範
```typescript
// 使用資料庫對應的類型結構
export interface OrderInfo {
  id: number                    // bigint -> number
  orderNumber: string           // nvarchar(30)
  masterOrderId: number         // bigint
  vendorId: number             // int
  subTotal: number             // decimal(18,2) -> number
  totalAmount: number          // decimal(18,2)
  orderStatus: OrderStatus     // tinyint -> enum
  paymentStatus: PaymentStatus // tinyint -> enum
  createdAt: string            // datetime2 -> ISO string
}

// 枚舉使用數字對應資料庫
export enum OrderStatus {
  Pending = 0,      // 待處理
  Confirmed = 1,    // 已確認
  Processing = 2,   // 處理中
  Shipped = 3,      // 已出貨
  Delivered = 4,    // 已送達
  Completed = 5,    // 已完成
  Cancelled = 6     // 已取消
}

// API 請求/響應類型
export namespace OrderAPI {
  export interface CreateOrderRequest {
    items: OrderItemRequest[]
    recipientName: string        // nvarchar(50)
    recipientPhone: string       // nvarchar(20)
    shippingAddress: string      // nvarchar(200)
    paymentMethodId: number
    couponId?: number
  }
  
  export interface CreateOrderResponse {
    masterOrderId: number
    masterOrderNumber: string
    finalAmount: number
    paymentUrl?: string
  }
}
```

## API 規範

### 1. API 客戶端使用
```typescript
// api/modules/order.ts
import http from '../http'
import type { OrderAPI } from '@/types/api'

export const orderApi = {
  // 創建訂單
  createOrder: (data: OrderAPI.CreateOrderRequest) =>
    http.post<OrderAPI.CreateOrderResponse>('/orders', data),

  // 獲取訂單列表
  getOrders: (params?: {
    page?: number
    limit?: number
    status?: number
  }) => http.get<OrderAPI.MasterOrderInfo[]>('/orders', { params }),

  // 獲取訂單詳情
  getOrder: (id: number) =>
    http.get<OrderAPI.MasterOrderInfo>(`/orders/${id}`),

  // 取消訂單
  cancelOrder: (id: number, reason: string) =>
    http.patch(`/orders/${id}/cancel`, { reason }),

  // 申請退款
  requestRefund: (data: OrderAPI.RefundRequest) =>
    http.post<OrderAPI.RefundInfo>('/refunds', data),

  // 查詢物流
  trackShipment: (trackingNumber: string) =>
    http.get(`/shipments/track/${trackingNumber}`)
}
```

### 2. API 端點規範 (對應後端 Web API)
```
# A模組 - 會員/廠商/認證
POST /api/auth/login              # 用戶登入
POST /api/auth/register           # 用戶註冊
POST /api/auth/refresh            # 刷新Token
GET  /api/members/profile         # 會員資料
PUT  /api/members/profile         # 更新會員資料
GET  /api/members/addresses       # 地址列表
POST /api/members/addresses       # 新增地址

# B模組 - 商品/分類
GET  /api/products               # 商品列表
GET  /api/products/{id}          # 商品詳情
GET  /api/categories             # 分類列表
GET  /api/categories/{id}/products # 分類商品
POST /api/products/{id}/reviews   # 新增評價

# C模組 - 訂單/金流/物流
POST /api/orders                 # 創建訂單
GET  /api/orders                 # 訂單列表
GET  /api/orders/{id}            # 訂單詳情
PATCH /api/orders/{id}/cancel    # 取消訂單
GET  /api/payments/methods       # 付款方式
POST /api/payments/process       # 處理付款
POST /api/refunds               # 申請退款
GET  /api/shipments/track/{trackingNumber} # 物流追蹤

# D模組 - 優惠券/活動/廣告
GET  /api/coupons               # 優惠券列表
POST /api/coupons/validate      # 驗證優惠券
GET  /api/banners               # 廣告橫幅
GET  /api/announcements         # 公告列表

# E模組 - 客服/評價/黑名單
POST /api/support/tickets       # 創建客服工單
GET  /api/support/tickets       # 工單列表
POST /api/support/tickets/{id}/messages # 新增訊息
```

## 狀態管理規範

### 1. Pinia Store 結構
```typescript
// stores/modules/order.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orderApi } from '@/api/modules/order'
import type { OrderAPI } from '@/types/api'

export const useOrderStore = defineStore('order', () => {
  // State
  const orders = ref<OrderAPI.MasterOrderInfo[]>([])
  const currentOrder = ref<OrderAPI.MasterOrderInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const pendingOrders = computed(() =>
    orders.value.filter(order => order.status === 0)
  )

  const completedOrders = computed(() =>
    orders.value.filter(order => order.status === 5)
  )

  // Actions
  const fetchOrders = async (params?: { page?: number; status?: number }) => {
    try {
      loading.value = true
      error.value = null
      const response = await orderApi.getOrders(params)
      orders.value = response.data
    } catch (err) {
      error.value = '獲取訂單失敗'
      console.error('Failed to fetch orders:', err)
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (orderData: OrderAPI.CreateOrderRequest) => {
    try {
      loading.value = true
      error.value = null
      const response = await orderApi.createOrder(orderData)
      
      // 創建成功後重新獲取訂單列表
      await fetchOrders()
      
      return response.data
    } catch (err) {
      error.value = '創建訂單失敗'
      console.error('Failed to create order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelOrder = async (orderId: number, reason: string) => {
    try {
      loading.value = true
      await orderApi.cancelOrder(orderId, reason)
      
      // 更新本地狀態
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.status = 6 // 已取消
      }
    } catch (err) {
      error.value = '取消訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,
    
    // Getters
    pendingOrders,
    completedOrders,
    
    // Actions
    fetchOrders,
    createOrder,
    cancelOrder
  }
})
```

## Git 工作流程

### 1. 分支策略
```bash
# 主分支
main                    # 生產環境 (受保護)
develop                 # 開發整合分支

# 功能分支 (從 develop 分出)
feature/auth-system     # A - 會員認證系統
feature/product-catalog # B - 商品目錄系統
feature/order-system    # C - 訂單系統
feature/coupon-system   # D - 優惠券系統
feature/support-system  # E - 客服系統

# 修復分支
bugfix/login-issue      # 一般修復
hotfix/payment-error    # 緊急修復 (從 main 分出)
```

### 2. 提交規範 (Conventional Commits)
```bash
# 格式: type(scope): description
git commit -m "feat(order): 新增訂單創建功能"
git commit -m "fix(payment): 修復金流回調處理錯誤"
git commit -m "docs(api): 更新API文檔"

# 類型說明
feat:     新功能
fix:      修復bug
docs:     文檔更新
style:    代碼格式調整
refactor: 重構
test:     測試相關
chore:    其他雜項
perf:     性能優化
ci:       CI/CD相關

# 範圍 (scope) 對應模組
auth:     A - 會員認證
product:  B - 商品管理
order:    C - 訂單管理
payment:  C - 金流處理
shipping: C - 物流管理
coupon:   D - 優惠券
banner:   D - 廣告管理
support:  E - 客服系統
review:   E - 評價系統
```

### 3. 開發流程
```bash
# 1. 從 develop 創建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/order-system

# 2. 開發功能
# ... 進行開發 ...
git add .
git commit -m "feat(order): 新增訂單創建API整合"

# 3. 定期同步 develop 分支
git fetch origin
git merge origin/develop

# 4. 推送功能分支
git push origin feature/order-system

# 5. 創建 Pull Request
# - 標題: [C] 新增訂單管理系統
# - 描述: 詳細說明功能實現
# - 指派給組長審查

# 6. 審查通過後合併到 develop
git checkout develop
git merge feature/order-system
git push origin develop

# 7. 刪除功能分支
git branch -d feature/order-system
git push origin --delete feature/order-system
```

## 測試規範

### 1. 單元測試
```typescript
// tests/components/ProductCard.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ProductCard from '@/components/product/ProductCard.vue'
import type { ProductInfo } from '@/types/api'

const mockProduct: ProductInfo = {
  id: 1,
  productName: '測試商品',
  basePrice: 1000,
  imageUrl: '/test.jpg'
  // ... 其他必要屬性
}

describe('ProductCard', () => {
  it('應該正確顯示商品資訊', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct }
    })
    
    expect(wrapper.text()).toContain('測試商品')
    expect(wrapper.text()).toContain('NT$ 1,000')
  })

  it('點擊時應該發出選擇事件', async () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct }
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual([mockProduct])
  })
})
```

### 2. API 測試
```typescript
// tests/api/order.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { orderApi } from '@/api/modules/order'
import type { OrderAPI } from '@/types/api'

// Mock HTTP 客戶端
vi.mock('@/api/http')

describe('Order API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('應該正確創建訂單', async () => {
    const orderData: OrderAPI.CreateOrderRequest = {
      items: [{ productId: 1, quantity: 2 }],
      recipientName: '測試用戶',
      recipientPhone: '0912345678',
      shippingAddress: '台北市信義區',
      paymentMethodId: 1
    }

    const mockResponse = {
      masterOrderId: 123,
      masterOrderNumber: 'ORDER123',
      finalAmount: 2000
    }

    // 設置模擬響應
    vi.mocked(http.post).mockResolvedValue({ data: mockResponse })

    const result = await orderApi.createOrder(orderData)
    
    expect(result.data).toEqual(mockResponse)
    expect(http.post).toHaveBeenCalledWith('/orders', orderData)
  })
})
```

## 部署流程

### 1. 環境部署
```bash
# 開發環境 (自動部署)
git push origin develop
# → 觸發 GitHub Actions
# → 部署到 dev.buyshop.com

# 生產環境 (手動部署)
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
# → 手動觸發部署到 buyshop.com
```

### 2. 構建檢查
```bash
# 部署前必須通過的檢查
npm run type-check    # TypeScript 類型檢查
npm run build        # 構建檢查
npm run test         # 測試檢查 (如果有)
```

## 代碼審查清單

### 功能檢查
- [ ] 功能是否按需求完整實現
- [ ] 是否有適當的錯誤處理
- [ ] 是否有載入狀態提示
- [ ] API 錯誤是否有用戶友好的提示

### 代碼質量
- [ ] TypeScript 類型是否正確完整
- [ ] 是否遵循命名規範
- [ ] 組件是否適當拆分
- [ ] 是否有適當的註釋

### 性能考慮
- [ ] 是否有不必要的重新渲染
- [ ] 列表數據是否有分頁處理
- [ ] 圖片是否有適當的優化
- [ ] 是否使用了合適的快取策略

### 安全性
- [ ] 用戶輸入是否有適當驗證
- [ ] API 請求是否有權限檢查
- [ ] 敏感資料是否有適當保護

## 常用指令速查

```bash
# 開發環境
npm run dev                     # 啟動開發服務器
npm run type-check             # TypeScript 檢查
npm run build                  # 構建專案

# Git 操作
git checkout develop                    # 切換到開發分支
git checkout -b feature/order-system   # 創建功能分支
git add . && git commit -m "feat(order): ..." # 提交變更
git push origin feature/order-system   # 推送分支

# 依賴管理
npm install <package>          # 安裝新依賴
npm install <package> --save-dev # 安裝開發依賴
npm update                     # 更新依賴

# 調試工具
console.log()                  # 基本調試
Vue.js DevTools               # Vue 組件調試
Network Tab                   # API 請求調試
```

## 注意事項

1. **嚴格遵循此規範**: 所有組員必須按照規範開發
2. **類型安全**: 代碼提交前必須通過 TypeScript 檢查
3. **代碼審查**: 重要功能需要組長或其他組員審查
4. **及時溝通**: 遇到問題及時在群組討論
5. **定期同步**: 每日開始工作前同步 develop 分支
6. **資料庫對應**: API 類型定義必須與資料庫結構保持一致
7. **模組獨立**: 各組員負責的模組盡量保持獨立，減少衝突
8. **測試覆蓋**: 核心功能需要有對應的測試案例

---

**重要提醒**: 
- 本規範基於 FUEN42_G2_DB 資料庫結構制定
- 各模組 API 對應後端 ASP.NET Core Web API 專案
- 所有組員都要熟悉自己負責模組的資料庫結構
- 遵循規範可確保專案整體品質和團隊協作效率