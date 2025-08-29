<template>
  <div class="c-group-integration-test">
    <div class="header">
      <h2>🚀 C組前後端整合測試</h2>
      <p class="subtitle">完整的 API 服務層測試與展示</p>
    </div>

    <!-- 整體健康狀況 -->
    <div class="health-status" :class="healthData?.healthy ? 'healthy' : 'unhealthy'">
      <div class="health-indicator">
        <span class="status-icon">{{ healthData?.healthy ? '✅' : '❌' }}</span>
        <div class="status-info">
          <h3>系統狀態: {{ healthData?.healthy ? '正常運行' : '異常' }}</h3>
          <p v-if="healthData">回應時間: {{ healthData.responseTime }}ms</p>
          <p v-if="healthData">檢查時間: {{ formatTime(healthData.timestamp) }}</p>
        </div>
      </div>
      <button @click="runHealthCheck" :disabled="isCheckingHealth" class="health-check-btn">
        {{ isCheckingHealth ? '檢查中...' : '重新檢查' }}
      </button>
    </div>

    <!-- API 服務測試區域 -->
    <div class="services-grid">
      <!-- 訂單服務 -->
      <div class="service-card orders">
        <div class="service-header">
          <h3>🛒 訂單管理服務</h3>
          <span :class="['service-status', serviceStatus.orders ? 'online' : 'offline']">
            {{ serviceStatus.orders ? 'ONLINE' : 'OFFLINE' }}
          </span>
        </div>
        
        <div class="service-info">
          <p><strong>端點:</strong> /api/C_Orders</p>
          <p><strong>功能:</strong> 訂單 CRUD、狀態管理、統計</p>
        </div>

        <div class="service-actions">
          <button @click="testOrdersService" :disabled="loading.orders" class="test-btn">
            {{ loading.orders ? '測試中...' : '測試連接' }}
          </button>
          <button @click="showOrdersDemo" class="demo-btn">功能演示</button>
        </div>

        <div v-if="results.orders" class="service-result">
          <h4>測試結果:</h4>
          <div class="result-data">
            <pre>{{ JSON.stringify(results.orders, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 金流服務 -->
      <div class="service-card payments">
        <div class="service-header">
          <h3>💳 金流管理服務</h3>
          <span :class="['service-status', serviceStatus.payments ? 'online' : 'offline']">
            {{ serviceStatus.payments ? 'ONLINE' : 'OFFLINE' }}
          </span>
        </div>
        
        <div class="service-info">
          <p><strong>端點:</strong> /api/C_Payments</p>
          <p><strong>功能:</strong> 付款處理、金流閘道、回調處理</p>
        </div>

        <div class="service-actions">
          <button @click="testPaymentsService" :disabled="loading.payments" class="test-btn">
            {{ loading.payments ? '測試中...' : '測試連接' }}
          </button>
          <button @click="showPaymentsDemo" class="demo-btn">功能演示</button>
        </div>

        <div v-if="results.payments" class="service-result">
          <h4>測試結果:</h4>
          <div class="result-data">
            <pre>{{ JSON.stringify(results.payments, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 物流服務 -->
      <div class="service-card shipments">
        <div class="service-header">
          <h3>🚚 物流管理服務</h3>
          <span :class="['service-status', serviceStatus.shipments ? 'online' : 'offline']">
            {{ serviceStatus.shipments ? 'ONLINE' : 'OFFLINE' }}
          </span>
        </div>
        
        <div class="service-info">
          <p><strong>端點:</strong> /api/C_Shipments</p>
          <p><strong>功能:</strong> 運單管理、物流追蹤、配送狀態</p>
        </div>

        <div class="service-actions">
          <button @click="testShipmentsService" :disabled="loading.shipments" class="test-btn">
            {{ loading.shipments ? '測試中...' : '測試連接' }}
          </button>
          <button @click="showShipmentsDemo" class="demo-btn">功能演示</button>
        </div>

        <div v-if="results.shipments" class="service-result">
          <h4>測試結果:</h4>
          <div class="result-data">
            <pre>{{ JSON.stringify(results.shipments, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量操作區域 -->
    <div class="batch-operations">
      <h3>批量操作</h3>
      <div class="batch-buttons">
        <button @click="testAllServices" :disabled="isBatchTesting" class="batch-btn primary">
          {{ isBatchTesting ? '批量測試中...' : '測試所有服務' }}
        </button>
        <button @click="clearAllResults" class="batch-btn secondary">
          清空結果
        </button>
        <button @click="exportResults" class="batch-btn secondary">
          匯出結果
        </button>
      </div>
    </div>

    <!-- 開發者資訊 -->
    <div class="developer-info">
      <h3>開發者資訊</h3>
      <div class="dev-details">
        <div class="dev-item">
          <strong>開發者:</strong> 蔡易霖 (C組組長)
        </div>
        <div class="dev-item">
          <strong>服務版本:</strong> v1.0.0
        </div>
        <div class="dev-item">
          <strong>API 基礎URL:</strong> {{ apiBaseUrl }}
        </div>
        <div class="dev-item">
          <strong>最後更新:</strong> 2025-08-20
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  testCOrdersApi, 
  testCPaymentsApi, 
  testCShipmentsApi,
  healthCheck 
} from '@/api/c-group'

// ==================== 響應式資料 ====================
const healthData = ref<any>(null)
const isCheckingHealth = ref(false)

const serviceStatus = ref({
  orders: false,
  payments: false,
  shipments: false
})

const loading = ref({
  orders: false,
  payments: false,
  shipments: false
})

const results = ref({
  orders: null as any,
  payments: null as any,
  shipments: null as any
})

const isBatchTesting = ref(false)

// ==================== 計算屬性 ====================
const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5105/api'
})

// ==================== 方法 ====================

/**
 * 執行健康檢查
 */
const runHealthCheck = async () => {
  isCheckingHealth.value = true
  try {
    healthData.value = await healthCheck()
    serviceStatus.value = healthData.value.details.services
  } catch (error) {
    console.error('健康檢查失敗:', error)
  } finally {
    isCheckingHealth.value = false
  }
}

/**
 * 測試訂單服務
 */
const testOrdersService = async () => {
  loading.value.orders = true
  try {
    const response = await testCOrdersApi()
    results.value.orders = response
    serviceStatus.value.orders = true
  } catch (error) {
    results.value.orders = { error: error instanceof Error ? error.message : String(error) }
    serviceStatus.value.orders = false
  } finally {
    loading.value.orders = false
  }
}

/**
 * 測試金流服務
 */
const testPaymentsService = async () => {
  loading.value.payments = true
  try {
    const response = await testCPaymentsApi()
    results.value.payments = response
    serviceStatus.value.payments = true
  } catch (error) {
    results.value.payments = { error: error instanceof Error ? error.message : String(error) }
    serviceStatus.value.payments = false
  } finally {
    loading.value.payments = false
  }
}

/**
 * 測試物流服務
 */
const testShipmentsService = async () => {
  loading.value.shipments = true
  try {
    const response = await testCShipmentsApi()
    results.value.shipments = response
    serviceStatus.value.shipments = true
  } catch (error) {
    results.value.shipments = { error: error instanceof Error ? error.message : String(error) }
    serviceStatus.value.shipments = false
  } finally {
    loading.value.shipments = false
  }
}

/**
 * 測試所有服務
 */
const testAllServices = async () => {
  isBatchTesting.value = true
  
  // 清空之前的結果
  results.value = { orders: null, payments: null, shipments: null }
  
  // 並行執行所有測試
  await Promise.all([
    testOrdersService(),
    testPaymentsService(),
    testShipmentsService()
  ])
  
  isBatchTesting.value = false
}

/**
 * 清空所有結果
 */
const clearAllResults = () => {
  results.value = { orders: null, payments: null, shipments: null }
  healthData.value = null
}

/**
 * 匯出測試結果
 */
const exportResults = () => {
  const data = {
    timestamp: new Date().toISOString(),
    healthData: healthData.value,
    serviceStatus: serviceStatus.value,
    results: results.value,
    developer: '蔡易霖 (C組組長)'
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `c-group-test-results-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 格式化時間
 */
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-TW')
}

// 演示方法（預留）
const showOrdersDemo = () => {
  alert('訂單服務演示功能開發中...')
}

const showPaymentsDemo = () => {
  alert('金流服務演示功能開發中...')
}

const showShipmentsDemo = () => {
  alert('物流服務演示功能開發中...')
}

// ==================== 生命週期 ====================
onMounted(async () => {
  await runHealthCheck()
})
</script>

<style scoped>
.c-group-integration-test {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft JhengHei', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
}

/* 健康狀況區域 */
.health-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  border: 2px solid;
}

.health-status.healthy {
  background-color: #d5f4e6;
  border-color: #27ae60;
}

.health-status.unhealthy {
  background-color: #fdf2f2;
  border-color: #e74c3c;
}

.health-indicator {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-icon {
  font-size: 24px;
}

.status-info h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.status-info p {
  margin: 2px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.health-check-btn {
  padding: 12px 24px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.health-check-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

/* 服務網格 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.service-card {
  border: 2px solid #ecf0f1;
  border-radius: 10px;
  padding: 20px;
  background: white;
}

.service-card.orders {
  border-left: 5px solid #e74c3c;
}

.service-card.payments {
  border-left: 5px solid #f39c12;
}

.service-card.shipments {
  border-left: 5px solid #27ae60;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.service-header h3 {
  color: #2c3e50;
  margin: 0;
}

.service-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.service-status.online {
  background-color: #d5f4e6;
  color: #27ae60;
}

.service-status.offline {
  background-color: #fdf2f2;
  color: #e74c3c;
}

.service-info {
  margin-bottom: 15px;
}

.service-info p {
  margin: 5px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.service-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.test-btn {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
}

.test-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.demo-btn {
  padding: 8px 16px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
}

.service-result {
  border-top: 1px solid #ecf0f1;
  padding-top: 15px;
}

.service-result h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 14px;
}

.result-data {
  max-height: 200px;
  overflow-y: auto;
}

.result-data pre {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 12px;
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}

/* 批量操作 */
.batch-operations {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.batch-operations h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.batch-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.batch-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.batch-btn.primary {
  background-color: #27ae60;
  color: white;
}

.batch-btn.secondary {
  background-color: #95a5a6;
  color: white;
}

.batch-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

/* 開發者資訊 */
.developer-info {
  background-color: #ecf0f1;
  border-radius: 10px;
  padding: 20px;
}

.developer-info h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.dev-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 10px;
}

.dev-item {
  color: #7f8c8d;
}

.dev-item strong {
  color: #2c3e50;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .health-status {
    flex-direction: column;
    gap: 15px;
  }
  
  .batch-buttons {
    flex-direction: column;
  }
  
  .dev-details {
    grid-template-columns: 1fr;
  }
}
</style>