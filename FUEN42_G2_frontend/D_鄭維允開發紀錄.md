# D組開發紀錄 - 鄭維允

**負責模組**: 公告、廣告、優惠券系統前端開發與API串接  
**開發時間**: 2025-08-19  
**專案**: FUEN42_G2 B2B2C商城前端系統

## 📋 開發任務概述

### 主要功能模組
1. **公告系統 (Announcement)**
   - 首頁公告展示
   - 公告列表頁面
   - 公告詳情頁面
   - 公告瀏覽次數統計

2. **廣告橫幅系統 (Banner)**
   - 首頁輪播廣告
   - 廣告點擊/瀏覽統計
   - 多區域廣告支援

3. **優惠券系統 (Coupon)**
   - 優惠券中心
   - 會員優惠券管理
   - 優惠券領取與使用
   - 優惠券驗證功能

## 🎯 技術架構

### 前端技術棧
- **框架**: Vue 3 + TypeScript + Vite
- **狀態管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客戶端**: Axios / Fetch API
- **樣式**: CSS3 + 響應式設計（可選 Bootstrap 5 / Tailwind）

- **說明**: 前端以前後端分離的 Vue.js 應用為主（現有專案即為 Vue 3 + Vite 架構），透過 Web API 與 ASP.NET Core 後端溝通；後台管理介面仍可保留 ASP.NET MVC 作為管理入口（或逐步前移為 SPA 管理介面）。

### 架構設計
- **三層式架構**: API層 → Store層 → Component層
- **模組化設計**: 按功能模組分離代碼
- **類型安全**: 完整的TypeScript類型定義
- **響應式設計**: 支援桌面和移動端

### 前/後端主要技術（後端保留）
- **後端框架**: ASP.NET Core MVC（管理介面/後台）、ASP.NET Core Web API（前台資料接口）
- **資料存取**: Entity Framework Core (.NET 8)
- **後端安全/工具**: Ganss.Xss（HTML 清洗）、AngleSharp（iframe 白名單檢查）

## 📁 檔案結構（更新為 Vue 前端對應）

### API層 (`src/api/modules/`)
```
src/api/modules/
├── announcement.ts    # 公告API調用
├── banner.ts         # 廣告API調用
└── coupon.ts        # 優惠券API調用
```

### 狀態管理 (`src/stores/modules/`)
```
src/stores/modules/
├── announcement.ts   # 公告狀態管理
├── banner.ts        # 廣告狀態管理
└── coupon.ts       # 優惠券狀態管理
```

### 組件層 (`src/components/`)
```
src/components/
├── home/
│   ├── AnnouncementSection.vue  # 首頁公告區塊
│   └── BannerCarousel.vue       # 首頁廣告輪播
└── coupon/
    ├── CouponCard.vue          # 優惠券卡片
    └── CouponList.vue          # 優惠券列表
```

### 頁面層 (`src/views/`)
```
src/views/
├── AnnouncementsView.vue        # 公告列表頁
├── AnnouncementDetailView.vue   # 公告詳情頁
├── CouponsView.vue             # 優惠券中心
└── member/
    └── CouponsView.vue         # 會員優惠券
```

### 類型定義 (`src/types/api.ts`)
- 擴展了 `CouponAPI` 命名空間
- 包含公告、廣告、優惠券的完整類型定義
- 支援API請求/響應、列表查詢、統計數據等類型

## 🔗 API端點設計

### 公告相關 API
```typescript
GET    /api/announcements              // 獲取公告列表
GET    /api/announcements/{id}         // 獲取公告詳情
POST   /api/announcements              // 創建公告
PUT    /api/announcements/{id}         // 更新公告
DELETE /api/announcements/{id}         // 刪除公告
GET    /api/announcements/areas        // 獲取公告區域
POST   /api/announcements/{id}/view    // 記錄瀏覽次數
GET    /api/announcements/home         // 獲取首頁公告
GET    /api/announcements/statistics   // 獲取公告統計
```

### 廣告相關 API
```typescript
GET    /api/banners                    // 獲取廣告列表
GET    /api/banners/{id}               // 獲取廣告詳情
POST   /api/banners                    // 創建廣告 (FormData)
PUT    /api/banners/{id}               // 更新廣告 (FormData)
DELETE /api/banners/{id}               // 刪除廣告
GET    /api/banners/areas              // 獲取廣告區域
POST   /api/banners/{id}/click         // 記錄點擊次數
POST   /api/banners/{id}/view          // 記錄瀏覽次數
GET    /api/banners/carousel           // 獲取輪播廣告
GET    /api/banners/statistics         // 獲取廣告統計
PATCH  /api/banners/batch-status       // 批量更新狀態
DELETE /api/banners/batch              // 批量刪除
```

### 優惠券相關 API
```typescript
GET    /api/coupons                    // 獲取優惠券列表
GET    /api/coupons/{id}               // 獲取優惠券詳情
POST   /api/coupons                    // 創建優惠券
PUT    /api/coupons/{id}               // 更新優惠券
DELETE /api/coupons/{id}               // 軟刪除優惠券
POST   /api/coupons/validate           // 驗證優惠券
GET    /api/members/{id}/coupons       // 獲取會員優惠券
POST   /api/coupons/claim              // 領取優惠券
POST   /api/coupons/use                // 使用優惠券
GET    /api/coupons/available          // 獲取可用優惠券
POST   /api/coupons/calculate-discount // 計算折扣
GET    /api/coupons/statistics         // 獲取優惠券統計
POST   /api/coupons/generate-code      // 生成優惠券代碼
GET    /api/coupons/check-code         // 檢查代碼可用性
GET    /api/coupons/export             // 匯出優惠券資料
```

## 🎨 UI/UX 設計特色

### 設計原則
- **現代化設計**: 使用漸層色彩和圓角設計
- **響應式佈局**: 適配各種螢幕尺寸
- **互動回饋**: 懸停效果和動畫過渡
- **無障礙設計**: 語義化HTML和鍵盤導航

### 視覺特色
1. **優惠券卡片**: 使用漸層背景，模擬真實優惠券外觀
2. **廣告輪播**: 支援自動播放、點擊導航和指示點
3. **公告展示**: 可展開/收合的手風琴式佈局
4. **狀態指示**: 清晰的視覺狀態區分（可用/已用/過期）

### 互動功能
- **一鍵複製**: 優惠券代碼複製到剪貼簿
- **分享功能**: 支援原生分享API或連結複製
- **瀏覽統計**: 自動記錄瀏覽和點擊次數
- **篩選搜尋**: 多條件篩選和關鍵字搜尋

## 📊 狀態管理架構

### Store設計模式
每個模組都採用統一的Store設計模式：

```typescript
// 狀態定義
const items = ref([])                    // 主要資料列表
const currentItem = ref(null)            // 當前選中項目
const loading = ref(false)               // 載入狀態
const error = ref(null)                  // 錯誤訊息
const pagination = ref({})               // 分頁資訊

// 計算屬性
const activeItems = computed(...)        // 篩選後的資料
const hasMore = computed(...)           // 是否有更多資料

// 動作方法
const fetchItems = async (...)          // 獲取資料
const createItem = async (...)          // 創建資料
const updateItem = async (...)          // 更新資料
const deleteItem = async (...)          // 刪除資料
```

### 錯誤處理機制
- **統一錯誤處理**: 在HTTP攔截器中處理常見錯誤
- **用戶友好提示**: 將技術錯誤轉換為用戶可理解的訊息
- **重試機制**: 提供重新載入按鈕
- **錯誤恢復**: 自動清除錯誤狀態

## 🔄 路由配置

### 新增路由
```typescript
// 公告相關路由
{
  path: '/announcements',
  name: 'announcements',
  component: () => import('../views/AnnouncementsView.vue')
},
{
  path: '/announcement/:id',
  name: 'announcement-detail',
  component: () => import('../views/AnnouncementDetailView.vue')
},

// 優惠券相關路由
{
  path: '/coupons',
  name: 'coupons',
  component: () => import('../views/CouponsView.vue')
},

// 會員優惠券路由
{
  path: '/member/coupons',
  name: 'member-coupons',
  component: () => import('../views/member/CouponsView.vue')
}
```

## 🚀 功能實作細節

### 1. 公告系統
**後台（後端）**:
- Areas/Admin/Controllers/AnnouncementController.cs
- 使用 EF Core 作 CRUD 與分頁
- 內容儲存為 HTML（注意清洗）

**前台（Vue）**:
- `AnnouncementSection.vue` (src/components/home/)：首頁顯示最新 N 筆公告
- `AnnouncementsView.vue` / `AnnouncementDetailView.vue` (src/views/)
- 使用 API 取得資料，使用 Pinia 管理列表與分頁
- 內文顯示：建議前端再做一層 client-side sanitization（例如 DOMPurify 或 vue-dompurify-wrapper）後使用 v-html 呈現，且後端仍要以 Ganss.Xss 做一遍白名單清洗與 iframe 來源檢查
- YouTube 連結自動轉換為可嵌入 `<iframe>`（QueryHelpers 解析 v 參數），並在後端/前端共同檢查來源與屬性（sandbox、loading=lazy）

### 2. 廣告系統
**後台（後端）**:
- Banner、BannerArea 實體、檔案上傳（FormData）
- BannerStatistic 實體用於統計

**前台（Vue）**:
- `BannerCarousel.vue`（src/components/home/）: 使用 `vue-slick-carousel` 或 `swiper` 來取代純 jQuery 的 Slick，方便與 Vue component 整合
- 從 API 取得輪播資料（圖片 URL、連結、alt、target）並綁定
- 點擊/曝光事件上報 API（debounce/節流）

### 3. 優惠券系統
**後台（後端）**:
- Areas/Admin/Controllers/CouponsController.cs
- AdminPlatformCouponService / CouponGuard
- 檢查條件：時間、數量、使用次數、折扣型別

**前台（Vue）**:
- `CouponsView.vue` / `member/CouponsView.vue` (src/views/)
- `CouponCard.vue`、`CouponList.vue` (src/components/coupon/)
- 可呼叫 `/api/coupons/available` 查詢可用平台券，並在結帳流程中套用（由前端呼叫驗證 API）

前端驗證與使用流程要以 API 為最終權威（前端僅做 UX 與快速驗證）

## 前台展示與互動（更新為 Vue 實作）
- 公告：首頁顯示最新公告列表與建立日期；詳情頁支援安全的 YouTube 內嵌（iframe 應在後端與前端雙重檢查）
- 廣告：首頁使用 `vue-slick-carousel` / `swiper` 做輪播，圖片與連結由資料庫驅動
- 優惠券：前台提供查詢/領取/套用流程（Web API 支援），並在 UI 顯示狀態標籤（可用/已用/過期）

## 非功能性與治理
- **安全**：公告內容雙重清洗（後端用 Ganss.Xss + AngleSharp；前端用 DOMPurify），後台授權（角色/身分）、Anti-forgery
- **效能**：清單分頁、必要索引（CreatedAt/Status/外鍵）、熱門/列表快取可考慮以 Redis 或 HTTP cache headers

## 開發工具與規範（補充 Vue 專案相關）
- 建議 dev scripts：`npm run dev` (vite), `npm run build`, `npm run lint`, `npm run test`
- 使用 ESLint + Prettier（TypeScript 配置）
- 建議加入 `vue-dompurify-wrapper` 或 `dompurify` 作為 client-side sanitization
- 建議在 CI 加入 type-check 與 lint 檢查

## 📋 開發進度

### ✅ 已完成
- [x] API層設計與實作
- [x] TypeScript類型定義
- [x] Pinia狀態管理
- [x] Vue 組件開發
- [x] 頁面路由配置
- [x] 響應式設計實作
- [x] 錯誤處理機制
- [x] 載入狀態管理

### 🔄 進行中
- [ ] API串接測試
- [ ] 功能整合測試
- [ ] 效能優化
- [ ] 瀏覽器兼容性測試

### 📅 待完成
- [ ] 單元測試撰寫
- [ ] E2E測試設定
- [ ] 文檔完善
- [ ] 部署配置

---

**開發者**: 鄭維允  
**最後更新**: 2025-08-19  
**版本**: v1.0.1  
**狀態**: 開發完成，待測試與整合