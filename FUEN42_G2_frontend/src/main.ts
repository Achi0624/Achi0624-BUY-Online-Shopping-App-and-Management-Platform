import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

// A組 (李泠秭) 新增: 會員認證系統相關功能
// - 完成登入/註冊API整合
// - 實作會員資料管理
// - 建立Token管理機制
// - 完成會員中心功能

// C組 (蔡易霖) 新增: 載入 API 測試工具
import { C_ApiTester } from './utils/C_ApiTester'

// API 連接測試工具
import './utils/api-connection-tester'

// 在開發環境載入瀏覽器測試腳本
if (import.meta.env.DEV) {
  const script = document.createElement('script')
  script.src = '/src/utils/browser-api-test.js'
  script.type = 'module'
  document.head.appendChild(script)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// A組 (李泠秭) 新增: 初始化用戶狀態
// 等待應用掛載後再載入用戶狀態
const userStore = useUserStore()
userStore.loadFromStorage()

console.log('🔐 用戶狀態初始化完成', {
  isLoggedIn: userStore.isLoggedIn,
  user: userStore.user
})

// C組 (蔡易霖) 新增: 在開發環境中暴露測試工具到全域
if (import.meta.env.DEV) {
  (window as any).C_ApiTester = C_ApiTester
  console.log('🛠️ C組 API 測試工具已載入')
  console.log('📋 可用指令:')
  console.log('  - C_ApiTester.checkAPIHealth()')
  console.log('  - C_ApiTester.runAllTests()')
  console.log('  - C_ApiTester.testOrderAPI()')
  console.log('  - C_ApiTester.testPaymentAPI()')
  console.log('  - C_ApiTester.testShippingAPI()')
}