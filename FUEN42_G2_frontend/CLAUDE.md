# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BUY E-Commerce Platform - Vue 3 + TypeScript frontend for a B2B2C marketplace with integrated ECPay payment gateway. This is a team project (FUEN42_G2) with 5 developers working on different functional modules.

## Essential Commands

```bash
# Development
npm install              # Install dependencies
npm run dev              # Start dev server at http://localhost:5173
npm run type-check       # Run TypeScript type checking (MUST run before commits)
npm run build            # Build for production
npm run preview          # Preview production build

# Backend Services (required for full functionality)
# Navigate to backend directory first, then:
dotnet restore           # Restore packages
dotnet ef database update  # Update database if needed
dotnet run --launch-profile https    # Runs at https://localhost:7044
# Alternative: dotnet run (runs on both HTTP:5099 and HTTPS:7044)

# Verification
# Backend Swagger: https://localhost:7044/swagger
```

## Architecture Overview

### Three-Layer Payment Integration
The payment system uses a bridge pattern across three layers:
1. **Vue Frontend** → Makes requests to Web API
2. **Web API (localhost:7044)** → Bridges frontend to backend, handles CORS
3. **MVC Backend** → Integrates with ECPay payment gateway

Key integration point: `/src/api/http.ts` configured to proxy requests through Vite to Web API.

### State Management Pattern
Uses Pinia stores with a consistent pattern across modules:
- **State**: Reactive refs for data, loading, and error states
- **Getters**: Computed derived state
- **Actions**: Async operations that handle API calls and update state
- **localStorage**: Cart persists by member, auth tokens stored for session

Example: `/src/stores/modules/cart.ts` shows the complete pattern with member-specific persistence.

### API Integration Strategy
- HTTP client with interceptors: `/src/api/http.ts`
- Module-based API organization: `/src/api/modules/`
- Automatic token injection and error handling
- Smart member ID resolution for API calls
- Development mode supports test member functionality

### Payment Flow
1. Cart checkout creates order via `/api/C_Payments/create`
2. Backend generates ECPay payment URL with MD5 signature
3. User redirected to ECPay for payment
4. ECPay callback processed at `/api/C_Payments/gateway-callback`
5. Payment status updated in database

Test cards documented in `PAYMENT_SYSTEM.md`.

## Module Ownership

The codebase is divided among 5 team members:
- **A**: Auth/Members (`/auth`, `/member`)
- **B**: Products (`/product`, `/category`) 
- **C**: Orders/Payments/Shipping (`/order`, `/payment`, `/checkout`) - Team Lead
- **D**: Coupons/Promotions (`/coupon`, `/promotion`)
- **E**: Support/Reviews (`/support`, `/review`)

## Environment Configuration

```bash
# .env.development
VITE_API_URL=https://localhost:7044/api
VITE_APP_TITLE=BUY商城(開發)

# Vite proxy configuration in vite.config.ts
# Proxies /api requests to backend during development
# Note: secure: false is set to allow self-signed certificates
```

## TypeScript Patterns

### API Response Types
All API responses follow the pattern in `/src/api/http.ts`:
```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errorCode?: string
}
```

### Database-Aligned Types
Types in `/src/types/` map directly to SQL Server schema:
- `number` for SQL `int`/`bigint`/`decimal`
- `string` for SQL `nvarchar` with ISO format for `datetime2`
- Enums use numeric values matching database `tinyint`

### Error Handling Pattern
All API calls use consistent error handling in `/src/api/http.ts`:
- Automatic token injection from localStorage
- HTTP status code mapping to user messages
- Development mode: API connectivity hints
- Production mode: User-friendly error messages

## Development Workflow

### Git Workflow
Branch naming: `feature/{developer_name}` (e.g., `feature/蔡易霖`)
Main branch for PRs: `main`

Commit format: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`  
- Scopes: `order`, `payment`, `cart`, `auth`, `product`, etc.

### Pre-commit Requirements
- ALWAYS run `npm run type-check` before committing
- Ensure no TypeScript errors
- Test affected functionality manually

## C組完整功能模組

### 購物車系統
- `/cart` - 購物車頁面，支援會員別儲存
- 商品管理、數量調整、廠商分組
- 與結帳系統無縫整合

### 訂單管理系統
- `/orders` - 訂單列表，連接真實 API
- `/order/:id` - 訂單詳情頁面
- 支援動態會員 ID 查詢
- 完整的訂單狀態管理

### 金流支付系統
- `/checkout` - 多步驟結帳流程
- `/payment/:orderId` - 付款頁面
- `/payment/result` - 付款結果
- `/payment/ecpay/callback` - ECPay 回調處理
- 完整的三層式金流架構

### 物流追蹤系統
- `/tracking` - 物流狀態追蹤
- 支援訂單號與物流單號查詢

### 退貨退款系統
- `/return` - 退貨申請管理
- `/order/:id/refund` - 退款申請
- 完整的退貨流程與狀態管理

## 會員系統整合

### 開發模式支援
- 自動載入測試會員 (ID: 1)
- 支援訪客模式購物車
- 會員登入後自動切換資料

### 生產模式整合點
- 會員 ID 自動解析
- 購物車按會員分離儲存
- 訂單查詢使用動態會員 ID
- 結帳自動填入會員資料

## Critical Files

- `/src/api/http.ts` - Core HTTP client with auth/error handling
- `/src/stores/modules/cart.ts` - Cart state management with member-specific localStorage
- `/src/stores/modules/order.ts` - Order management with real API integration
- `/src/stores/user.ts` - User state management with member integration
- `/src/views/order/` - Complete order management system
- `/src/views/payment/` - Payment flow implementation  
- `/src/utils/ecpay.ts` - ECPay integration utilities
- `vite.config.ts` - Proxy configuration for API requests
- `PAYMENT_SYSTEM.md` - Complete payment system documentation

## Testing & Quality

### Manual Testing Approach
- No automated testing framework configured
- Manual testing required for all changes
- Test both guest and authenticated user flows
- Verify API integration with backend running

### ECPay Test Cards (from PAYMENT_SYSTEM.md)
```
Visa: 4311-9522-2222-2222, Exp: 12/29, CVV: 222, Pin: 1234
MasterCard: 5424-1800-0000-0015, Exp: 12/29, CVV: 222, Pin: 1234
JCB: 3528-0000-0000-0007, Exp: 12/29, CVV: 222, Pin: 1234
Test Merchant: 2000132
```