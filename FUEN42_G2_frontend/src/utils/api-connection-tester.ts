/**
 * API 連接測試工具
 * 用於診斷後端API連接問題
 */

import { announcementApi } from '@/api/modules/announcement'

export class ApiConnectionTester {
  static async testAnnouncementAPI() {
    console.log('🔍 開始測試公告API連接...')
    
    try {
      // 測試獲取活動公告
      console.log('📡 測試 getActiveAnnouncements...')
      const activeResult = await announcementApi.getActiveAnnouncements(1, 3)
      console.log('✅ getActiveAnnouncements 成功:', activeResult)
      
      // 測試獲取公告列表
      console.log('📡 測試 getAnnouncements...')
      const listResult = await announcementApi.getAnnouncements({ 
        page: 1, 
        pageSize: 5, 
        isActive: true 
      })
      console.log('✅ getAnnouncements 成功:', listResult)
      
      // 如果有公告，測試獲取詳情
      if (listResult.data.items.length > 0) {
        const firstAnnouncementId = listResult.data.items[0].id
        console.log(`📡 測試 getAnnouncement (ID: ${firstAnnouncementId})...`)
        const detailResult = await announcementApi.getAnnouncement(firstAnnouncementId)
        console.log('✅ getAnnouncement 成功:', detailResult)
      }
      
      return {
        success: true,
        message: 'API連接測試成功'
      }
      
    } catch (error: any) {
      console.error('❌ API連接測試失敗:', error)
      
      // 詳細錯誤分析
      let errorAnalysis = ''
      
      if (error.code === 'ERR_NETWORK') {
        errorAnalysis = '網路連接錯誤 - 後端服務器可能未啟動'
      } else if (error.code === 'ECONNREFUSED') {
        errorAnalysis = '連接被拒絕 - 端口7044可能未開放'
      } else if (error.response) {
        const status = error.response.status
        switch (status) {
          case 404:
            errorAnalysis = 'API端點不存在 - 檢查後端路由配置'
            break
          case 500:
            errorAnalysis = '後端服務器內部錯誤'
            break
          case 401:
            errorAnalysis = '認證失敗 - 檢查API金鑰或JWT令牌'
            break
          default:
            errorAnalysis = `HTTP ${status} 錯誤`
        }
      } else if (error.request) {
        errorAnalysis = '請求已發送但無響應 - 檢查CORS設定或網路連接'
      } else {
        errorAnalysis = '請求配置錯誤'
      }
      
      return {
        success: false,
        error: error.message,
        analysis: errorAnalysis,
        details: {
          code: error.code,
          status: error.response?.status,
          url: error.config?.url,
          method: error.config?.method
        }
      }
    }
  }
  
  static async testBasicConnectivity() {
    console.log('🔍 測試基本連接性...')
    
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
        console.log(`✅ ${url} - 狀態: ${response.status} (${response.statusText})`)
        
        // 如果是API端點，嘗試讀取響應
        if (url.includes('/api/')) {
          try {
            const data = await response.text()
            console.log(`📄 響應內容預覽: ${data.substring(0, 200)}...`)
          } catch (e) {
            console.log(`📄 無法讀取響應內容`)
          }
        }
        
      } catch (error: any) {
        console.log(`❌ ${url} - 錯誤: ${error.message}`)
        
        // 詳細錯誤分析
        if (error.message.includes('CORS')) {
          console.log(`  💡 CORS 錯誤 - 檢查後端 CORS 設定`)
        } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
          console.log(`  💡 連接被拒絕 - 後端服務可能未啟動`)
        } else if (error.message.includes('net::ERR_CERT_AUTHORITY_INVALID')) {
          console.log(`  💡 SSL 憑證問題 - 嘗試使用 HTTP 連接`)
        }
      }
    }
  }
  
  static getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      currentURL: window.location.href,
      apiBaseURL: import.meta.env.VITE_API_URL,
      environment: import.meta.env.VITE_APP_ENV,
      isDev: import.meta.env.DEV
    }
  }
}

// 在開發環境自動執行測試
if (import.meta.env.DEV) {
  // 延遲執行，確保應用完全載入
  setTimeout(() => {
    console.log('🚀 自動執行API連接測試...')
    console.log('📋 系統資訊:', ApiConnectionTester.getSystemInfo())
    ApiConnectionTester.testBasicConnectivity()
    ApiConnectionTester.testAnnouncementAPI()
  }, 2000)
}

export default ApiConnectionTester
