# 🚀 FUEN42_G2 團隊協作指引

## 📁 專案資訊
- **專案名稱**: BUY - B2B2C商城前端系統
- **技術棧**: Vue 3 + TypeScript + Vite + Pinia + Vue Router
- **倉庫類型**: Private Repository
- **開發模式**: 功能分支開發，develop 分支整合

## 🔧 環境設置

### 系統需求
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git >= 2.30.0

### 初始設置
```bash
# 1. Clone 專案 (需先接受 GitHub 邀請)
git clone https://github.com/[組長用戶名]/FUEN42_G2_frontend.git
cd FUEN42_G2_frontend

# 2. 安裝依賴
npm install

# 3. 啟動開發服務器
npm run dev
# 訪問 http://localhost:5173

# 4. 設置 Git 用戶資訊 (如果沒設置過)
git config --global user.name "您的姓名"
git config --global user.email "您的email"
```

## 👥 模組分工與分支規劃

### 分工對照表
| 組員 | 負責模組 | 功能分支 | 主要開發範圍 |
|-----|---------|----------|-------------|
| **A** | 會員/廠商/認證系統 | `feature/auth-system` | 登入、註冊、會員管理、地址管理、廠商系統 |
| **B** | 商品/分類管理 | `feature/product-catalog` | 商品列表、商品詳情、分類管理、商品評價 |
| **C** | 訂單/金流/物流 | `feature/order-system` | 購物車、結帳流程、訂單管理、付款、物流追蹤 |
| **D** | 優惠券/活動/廣告 | `feature/coupon-system` | 優惠券系統、活動管理、橫幅廣告 |
| **E** | 客服/評價/黑名單 | `feature/support-system` | 客服工單、評價系統、黑名單管理 |

### 開發範圍詳細說明
每個組員主要負責：
- **組件**: `src/components/[模組名]/`
- **頁面**: `src/views/[模組名]/`
- **狀態管理**: `src/stores/modules/[模組名].ts`
- **API 層**: `src/api/modules/[模組名].ts`
- **類型定義**: `src/types/[模組名].ts` (如需要)

## 🔄 開發流程

### 🎯 分支說明
```
main            # 生產環境代碼 (🚫 禁止直接推送)
├── develop     # 開發整合分支 (✅ 可推送)
    ├── feature/auth-system      # A - 會員系統
    ├── feature/product-catalog  # B - 商品系統
    ├── feature/order-system     # C - 訂單系統
    ├── feature/coupon-system    # D - 優惠券系統
    └── feature/support-system   # E - 客服系統
```

### 🚀 首次開發設置
```bash
# 1. 切換到 develop 分支
git checkout develop

# 2. 創建你的功能分支 (根據分工選擇)
# A組員:
git checkout -b feature/auth-system

# B組員:
git checkout -b feature/product-catalog

# C組員:
git checkout -b feature/order-system

# D組員:
git checkout -b feature/coupon-system

# E組員:
git checkout -b feature/support-system

# 3. 推送你的分支到 GitHub
git push -u origin feature/[你的分支名]
```

### 📝 日常開發循環

#### 開始工作 (每日必做)
```bash
# 1. 切換到 develop 並拉取最新代碼
git checkout develop
git pull origin develop

# 2. 切換到你的功能分支並同步
git checkout feature/[你的分支名]
git merge develop

# 3. 開始開發...
```

#### 提交代碼
```bash
# 1. 查看變更
git status

# 2. 添加變更
git add .
# 或者添加特定檔案
git add src/components/auth/LoginForm.vue

# 3. 提交 (遵循提交規範)
git commit -m "feat(auth): 新增用戶登入表單組件"

# 4. 推送到你的功能分支
git push origin feature/[你的分支名]
```

#### 功能完成時合併
```bash
# 1. 確保功能分支是最新的
git checkout feature/[你的分支名]
git pull origin feature/[你的分支名]

# 2. 切換到 develop 並拉取最新代碼
git checkout develop
git pull origin develop

# 3. 合併你的功能分支
git merge feature/[你的分支名]

# 4. 推送到 develop
git push origin develop

# 5. 通知群組合併完成
```

## 📝 代碼規範

### 提交訊息規範 (Conventional Commits)
```bash
# 格式: type(scope): description

# 類型說明:
feat:     新功能
fix:      修復bug
docs:     文檔更新
style:    代碼格式調整 (不影響功能)
refactor: 重構代碼
test:     測試相關
chore:    其他雜項工作

# scope 對應模組:
auth:     A - 會員認證
product:  B - 商品管理
order:    C - 訂單管理
payment:  C - 金流處理
shipping: C - 物流管理
coupon:   D - 優惠券
banner:   D - 廣告管理
support:  E - 客服系統
review:   E - 評價系統

# 範例:
git commit -m "feat(auth): 新增用戶註冊功能"
git commit -m "fix(product): 修復商品圖片載入問題"
git commit -m "docs: 更新API使用說明"
```

### 檔案命名規範
```bash
# Vue 組件 - PascalCase
LoginForm.vue
ProductCard.vue
OrderSummary.vue

# 普通檔案 - camelCase
userApi.ts
orderTypes.ts
formatUtils.ts

# 資料夾 - kebab-case
components/auth-system/
views/product-detail/
stores/order-management/
```

### Vue 組件結構規範
```vue
<script setup lang="ts">
// 1. 導入 (按順序)
import { ref, computed, onMounted } from 'vue'     // Vue APIs
import { useRouter } from 'vue-router'              // 第三方庫
import { useAuthStore } from '@/stores/modules/auth' // 內部 stores
import { authApi } from '@/api/modules/auth'        // 內部 API
import type { User } from '@/types/api'             // 類型定義

// 2. Props 定義
interface Props {
  user: User
  showActions?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

// 3. Emits 定義
const emit = defineEmits<{
  submit: [user: User]
  cancel: []
}>()

// 4. Composables
const router = useRouter()
const authStore = useAuthStore()

// 5. 響應式數據
const loading = ref(false)
const formData = ref({})

// 6. 計算屬性
const isValid = computed(() => {
  // 驗證邏輯
})

// 7. 方法
const handleSubmit = async () => {
  // 處理邏輯
}

// 8. 生命周期
onMounted(() => {
  // 初始化
})
</script>

<template>
  <div class="component-name">
    <!-- 模板內容 -->
  </div>
</template>

<style scoped>
.component-name {
  /* 樣式 */
}
</style>
```

## 🛠️ 開發工具與環境

### 推薦的 VS Code 插件
```
# 必裝插件
- Vue - Official                    # Vue 3 支援
- TypeScript Vue Plugin (Volar)     # TypeScript 支援

# 推薦插件
- ESLint                           # 代碼檢查
- Prettier - Code formatter        # 代碼格式化
- GitLens — Git supercharged       # Git 增強
- Auto Rename Tag                  # HTML 標籤自動重命名
- Bracket Pair Colorizer           # 括號高亮
- Path Intellisense                # 路徑自動完成
```

### 常用開發指令
```bash
# 專案指令
npm run dev          # 啟動開發服務器 (http://localhost:5173)
npm run build        # 構建專案
npm run preview      # 預覽構建結果
npm run type-check   # TypeScript 類型檢查

# Git 指令
git status           # 查看檔案狀態
git branch          # 查看分支
git branch -a       # 查看所有分支 (包含遠端)
git log --oneline   # 查看提交歷史
git diff            # 查看變更差異

# 清理指令
npm ci              # 清潔安裝依賴
rm -rf node_modules && npm install  # 重新安裝依賴
```

## 🚨 重要規則與注意事項

### ✅ 允許的操作
- 推送到自己的功能分支 (`feature/[你的分支]`)
- 推送到 develop 分支
- 創建子功能分支 (如 `feature/auth-login`)
- 刪除自己的功能分支

### ❌ 嚴格禁止的操作
- **🚫 直接推送到 main 分支**
- **🚫 刪除 main 或 develop 分支**
- **🚫 強制推送 (git push --force)** 除非確實必要
- **🚫 修改其他人的功能分支**
- **🚫 直接修改 CLAUDE.md 或 package.json** (需群組討論)

### ⚠️ 注意事項
1. **每日同步**: 開始工作前務必同步 develop 分支
2. **頻繁提交**: 完成小功能就提交，避免大量變更
3. **描述清楚**: 提交訊息要清楚描述變更內容
4. **測試功能**: 推送前確保功能正常運作
5. **解決衝突**: 遇到衝突立即處理，不要累積

## 🆘 常見問題與解決方案

### Q1: 無法 Clone 專案？
```bash
# 檢查是否已接受 GitHub 邀請
# 確認用戶名和倉庫名稱正確
git clone https://github.com/[正確的用戶名]/FUEN42_G2_frontend.git
```

### Q2: npm install 失敗？
```bash
# 檢查 Node.js 版本
node --version  # 應該 >= 18.0.0

# 清理 npm 快取
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Q3: 代碼衝突怎麼辦？
```bash
# 1. 先提交你的變更
git add .
git commit -m "WIP: 臨時提交"

# 2. 拉取最新的 develop
git checkout develop
git pull origin develop

# 3. 回到你的分支並合併
git checkout feature/[你的分支]
git merge develop

# 4. 解決衝突後重新提交
git add .
git commit -m "resolve: 解決合併衝突"
```

### Q4: 想要撤銷最後一次提交？
```bash
# 保留變更，只撤銷提交
git reset --soft HEAD~1

# 完全撤銷 (小心使用)
git reset --hard HEAD~1
```

### Q5: 忘記從 develop 創建分支？
```bash
# 1. 先提交當前工作
git add .
git commit -m "WIP: 臨時工作"

# 2. 創建正確的分支
git checkout develop
git checkout -b feature/correct-name

# 3. 合併之前的工作
git merge previous-branch
```

## 📞 溝通與協調

### 日常溝通規範
- **每日同步**: 早上開始工作時在群組報告今日計劃
- **完成通知**: 完成重要功能時通知群組
- **問題求助**: 遇到阻礙立即在群組求助
- **衝突處理**: 發現代碼衝突立即討論解決

### 代碼審查流程
1. **功能完成** → 通知群組審查
2. **組長檢查** → 確認功能正確性
3. **其他組員** → 互相檢查相關代碼
4. **問題回饋** → 及時修正並重新審查

### 會議與討論
- **每週例會**: 討論進度與問題
- **技術討論**: 遇到技術難題集體討論
- **規範調整**: 開發過程中規範需要調整時討論

## 📚 學習資源

### 專案相關文檔
- **[CLAUDE.md](./CLAUDE.md)** - 完整開發規範 (必讀)
- **[src/types/api.ts](./src/types/api.ts)** - API 類型定義
- **[package.json](./package.json)** - 專案依賴與腳本

### 技術學習資源
- [Vue 3 官方文檔](https://vuejs.org/)
- [TypeScript 手冊](https://www.typescriptlang.org/docs/)
- [Pinia 狀態管理](https://pinia.vuejs.org/)
- [Vue Router 4](https://router.vuejs.org/)
- [Vite 構建工具](https://vitejs.dev/)

### Git 學習資源
- [Git 基礎教學](https://learngitbranching.js.org/)
- [GitHub 協作流程](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🎯 成功協作的關鍵

1. **📖 熟讀規範** - 仔細閱讀 CLAUDE.md 和此文檔
2. **🔄 定期同步** - 每日同步代碼，避免大量衝突
3. **💬 積極溝通** - 有問題立即討論，不要悶著頭做
4. **🤝 互相幫助** - 我們是一個團隊，共同成功
5. **🎪 保持耐心** - 學習新技術需要時間，慢慢來
6. **🚀 追求品質** - 寫出乾淨、可維護的代碼

---

## 🏆 專案目標

我們的目標是打造一個：
- **功能完整** 的 B2B2C 商城系統
- **代碼優雅** 且易於維護
- **團隊協作** 順暢高效
- **學習成長** 共同進步

**讓我們一起努力，創造出色的作品！** 🎉

---

**📧 有任何問題隨時在群組討論，我們一起解決！**

**🚀 準備好了嗎？讓我們開始這個精彩的開發之旅！**