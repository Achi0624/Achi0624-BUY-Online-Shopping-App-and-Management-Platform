<script setup lang="ts">
import { ref } from 'vue'
import GoogleLoginButton from '@/components/auth/GoogleLoginButton.vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const testResults = ref<string[]>([])

const addTestResult = (message: string) => {
  testResults.value.unshift(`${new Date().toLocaleTimeString()}: ${message}`)
}

const handleGoogleLoginSuccess = (userData: any) => {
  addTestResult('✅ Google 登入成功')
  addTestResult(`用戶資料: ${JSON.stringify(userData, null, 2)}`)
  
  // 可以選擇導向其他頁面
  // router.push('/')
}

const handleGoogleLoginError = (error: string) => {
  addTestResult(`❌ Google 登入失敗: ${error}`)
}

const clearResults = () => {
  testResults.value = []
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="test-view">
    <div class="container">
      <div class="test-card">
        <div class="test-header">
          <h1>Google 登入測試頁面</h1>
          <p>測試 Google 第三方登入功能</p>
        </div>

        <!-- 當前登入狀態 -->
        <div class="status-section">
          <h3>當前登入狀態</h3>
          <div class="status-info">
            <p><strong>是否已登入：</strong>{{ userStore.isLoggedIn ? '是' : '否' }}</p>
            <p v-if="userStore.user"><strong>用戶名稱：</strong>{{ userStore.user.name }}</p>
            <p v-if="userStore.user"><strong>電子信箱：</strong>{{ userStore.user.email }}</p>
          </div>
        </div>

        <!-- Google 登入按鈕 -->
        <div class="login-section">
          <h3>Google 登入測試</h3>
          <GoogleLoginButton
            @success="handleGoogleLoginSuccess"
            @error="handleGoogleLoginError"
          />
        </div>

        <!-- 測試結果 -->
        <div class="results-section">
          <div class="results-header">
            <h3>測試結果</h3>
            <button class="clear-btn" @click="clearResults">清除結果</button>
          </div>
          <div class="results-log">
            <div 
              v-for="(result, index) in testResults" 
              :key="index" 
              class="result-item"
              :class="{
                'success': result.includes('✅'),
                'error': result.includes('❌')
              }"
            >
              {{ result }}
            </div>
            <div v-if="testResults.length === 0" class="no-results">
              尚無測試結果
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="actions">
          <button class="back-btn" @click="goBack">返回</button>
          <button v-if="userStore.isLoggedIn" class="logout-btn" @click="userStore.logout">登出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-view {
  min-height: calc(100vh - 120px);
  padding: 20px;
  background: #f8fafc;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.test-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.test-header {
  text-align: center;
  margin-bottom: 30px;
}

.test-header h1 {
  color: #1f2937;
  margin-bottom: 8px;
}

.test-header p {
  color: #6b7280;
}

.status-section,
.login-section,
.results-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.status-section h3,
.login-section h3,
.results-section h3 {
  margin: 0 0 16px 0;
  color: #374151;
}

.status-info p {
  margin: 8px 0;
  color: #4b5563;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.clear-btn {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn:hover {
  background: #dc2626;
}

.results-log {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
  background: #f9fafb;
}

.result-item {
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
}

.result-item.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.result-item.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.no-results {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 20px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.back-btn,
.logout-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.back-btn {
  background: #6b7280;
  color: white;
}

.back-btn:hover {
  background: #4b5563;
}

.logout-btn {
  background: #dc2626;
  color: white;
}

.logout-btn:hover {
  background: #b91c1c;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .test-card {
    padding: 20px;
  }
  
  .results-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>