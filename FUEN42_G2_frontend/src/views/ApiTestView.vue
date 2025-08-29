<template>
  <div class="api-test-container">
    <h1>🔍 API 連接測試頁面</h1>
    
    <div class="system-info">
      <h2>📋 系統資訊</h2>
      <div class="info-grid">
        <div class="info-item">
          <strong>前端地址:</strong> {{ systemInfo.currentURL }}
        </div>
        <div class="info-item">
          <strong>API 基礎地址:</strong> {{ systemInfo.apiBaseURL }}
        </div>
        <div class="info-item">
          <strong>環境:</strong> {{ systemInfo.environment }}
        </div>
        <div class="info-item">
          <strong>開發模式:</strong> {{ systemInfo.isDev ? '是' : '否' }}
        </div>
      </div>
    </div>

    <div class="test-section">
      <h2>🔗 基本連接測試</h2>
      <button @click="runBasicTests" :disabled="isTestingBasic" class="test-button">
        {{ isTestingBasic ? '測試中...' : '開始基本連接測試' }}
      </button>
      
      <div v-if="basicTestResults.length > 0" class="test-results">
        <h3>測試結果:</h3>
        <div v-for="result in basicTestResults" :key="result.url" class="test-result">
          <div class="result-header" :class="result.success ? 'success' : 'error'">
            {{ result.success ? '✅' : '❌' }} {{ result.url }}
          </div>
          <div class="result-details">
            <div v-if="result.success">
              狀態: {{ result.status }} ({{ result.statusText }})
            </div>
            <div v-else class="error-message">
              錯誤: {{ result.error }}
            </div>
            <div v-if="result.analysis" class="analysis">
              分析: {{ result.analysis }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h2>📢 公告 API 測試</h2>
      <button @click="runAnnouncementTests" :disabled="isTestingAnnouncement" class="test-button">
        {{ isTestingAnnouncement ? '測試中...' : '開始公告API測試' }}
      </button>
      
      <div v-if="announcementTestResult" class="test-results">
        <h3>公告API測試結果:</h3>
        <div class="test-result">
          <div class="result-header" :class="announcementTestResult.success ? 'success' : 'error'">
            {{ announcementTestResult.success ? '✅ 成功' : '❌ 失敗' }}
          </div>
          <div class="result-details">
            <div v-if="announcementTestResult.success">
              成功獲取公告數據！
            </div>
            <div v-else>
              <div class="error-message">錯誤: {{ announcementTestResult.error }}</div>
              <div class="analysis">分析: {{ announcementTestResult.analysis }}</div>
              <div v-if="announcementTestResult.details" class="details">
                <strong>詳細資訊:</strong>
                <ul>
                  <li>錯誤代碼: {{ announcementTestResult.details.code }}</li>
                  <li>HTTP狀態: {{ announcementTestResult.details.status }}</li>
                  <li>請求URL: {{ announcementTestResult.details.url }}</li>
                  <li>請求方法: {{ announcementTestResult.details.method }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="recommendations">
      <h2>💡 修復建議</h2>
      <div class="recommendation-list">
        <div class="recommendation">
          <h3>1. 檢查後端服務</h3>
          <p>確保後端 API 服務正在運行在 <code>https://localhost:7044</code> 或 <code>http://localhost:5000</code></p>
          <pre><code>dotnet run --urls="https://localhost:7044;http://localhost:5000"</code></pre>
        </div>
        
        <div class="recommendation">
          <h3>2. 修正 CORS 設定</h3>
          <p>後端需要允許前端地址 <code>{{ systemInfo.currentURL }}</code></p>
          <p>請參考 <strong>CORS_修正建議.md</strong> 文件中的設定</p>
        </div>
        
        <div class="recommendation">
          <h3>3. 檢查防火牆</h3>
          <p>確保防火牆沒有阻擋端口 7044 和 5000</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ApiConnectionTester from '@/utils/api-connection-tester'

// 響應式資料
const systemInfo = ref({
  currentURL: '',
  apiBaseURL: '',
  environment: '',
  isDev: false
})

const isTestingBasic = ref(false)
const isTestingAnnouncement = ref(false)
const basicTestResults = ref<any[]>([])
const announcementTestResult = ref<any>(null)

// 載入系統資訊
onMounted(() => {
  systemInfo.value = ApiConnectionTester.getSystemInfo()
})

// 基本連接測試
async function runBasicTests() {
  isTestingBasic.value = true
  basicTestResults.value = []
  
  const testUrls = [
    'https://localhost:7044',
    'https://localhost:7044/api',
    'https://localhost:7044/api/announcements',
    'http://localhost:5000',
    'http://localhost:5000/api',
    'http://localhost:5000/api/announcements'
  ]
  
  for (const url of testUrls) {
    try {
      console.log(`📡 測試 ${url}...`)
      const response = await fetch(url, { 
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      basicTestResults.value.push({
        url,
        success: true,
        status: response.status,
        statusText: response.statusText
      })
      
    } catch (error: any) {
      let analysis = ''
      
      if (error.message.includes('CORS')) {
        analysis = 'CORS 錯誤 - 檢查後端 CORS 設定'
      } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        analysis = '連接被拒絕 - 後端服務可能未啟動'
      } else if (error.message.includes('net::ERR_CERT_AUTHORITY_INVALID')) {
        analysis = 'SSL 憑證問題 - 可能需要接受自簽憑證或使用 HTTP'
      } else if (error.message.includes('Failed to fetch')) {
        analysis = '無法連接 - 檢查網路或服務狀態'
      }
      
      basicTestResults.value.push({
        url,
        success: false,
        error: error.message,
        analysis
      })
    }
  }
  
  isTestingBasic.value = false
}

// 公告API測試
async function runAnnouncementTests() {
  isTestingAnnouncement.value = true
  announcementTestResult.value = null
  
  try {
    const result = await ApiConnectionTester.testAnnouncementAPI()
    announcementTestResult.value = result
  } catch (error) {
    announcementTestResult.value = {
      success: false,
      error: '測試工具執行失敗',
      analysis: '請檢查控制台獲取更多資訊'
    }
  }
  
  isTestingAnnouncement.value = false
}
</script>

<style scoped>
.api-test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

h2 {
  color: #34495e;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
}

.system-info, .test-section, .recommendations {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 10px;
}

.info-item {
  background: white;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #3498db;
}

.test-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.test-button:hover:not(:disabled) {
  background: #2980b9;
}

.test-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.test-results {
  margin-top: 20px;
}

.test-result {
  background: white;
  border-radius: 6px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.result-header {
  padding: 12px 16px;
  font-weight: bold;
  font-size: 14px;
}

.result-header.success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.result-header.error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.result-details {
  padding: 12px 16px;
  font-size: 14px;
}

.error-message {
  color: #e74c3c;
  font-weight: 500;
  margin-bottom: 8px;
}

.analysis {
  color: #f39c12;
  font-style: italic;
  margin-bottom: 8px;
}

.details {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.details ul {
  margin: 5px 0;
  padding-left: 20px;
}

.recommendation-list {
  display: grid;
  gap: 16px;
}

.recommendation {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #f39c12;
}

.recommendation h3 {
  margin-top: 0;
  color: #e67e22;
}

.recommendation pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

.recommendation code {
  background: #ecf0f1;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
</style>
