// API調試工具 - 測試後端API連接
export async function testAPI() {
  console.log('=== 測試BUY商城後端API連接 ===')
  
  const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:7044/api'
  console.log('API Base URL:', API_BASE)
  
  const endpoints = [
    { name: '公告區域列表', url: '/announcements/areas' },
    { name: '活動公告列表', url: '/announcements/active' },
    { name: '廣告區域列表', url: '/banners/areas' },
    { name: '活動廣告列表', url: '/banners/active' },
    { name: '活動優惠券', url: '/coupons/active' }
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n測試: ${endpoint.name}`)
      console.log(`URL: ${API_BASE}${endpoint.url}`)
      
      const response = await fetch(`${API_BASE}${endpoint.url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // 支援CORS credentials
      })
      
      console.log(`狀態碼: ${response.status}`)
      console.log(`狀態文字: ${response.statusText}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${endpoint.name} - 成功`)
        console.log(`資料筆數: ${Array.isArray(data) ? data.length : '1筆'}`)
        if (Array.isArray(data) && data.length > 0) {
          console.log('第一筆資料預覽:', JSON.stringify(data[0], null, 2))
        } else if (!Array.isArray(data)) {
          console.log('回應資料:', JSON.stringify(data, null, 2))
        }
      } else {
        console.log(`❌ ${endpoint.name} - 失敗`)
        const errorText = await response.text()
        console.log('錯誤詳情:', errorText)
      }
      
    } catch (error: any) {
      console.log(`❌ ${endpoint.name} - 連接失敗`)
      console.log('錯誤:', error.message)
      
      // 檢查是否為CORS錯誤
      if (error.message.includes('CORS') || error.message.includes('fetch')) {
        console.log('可能是CORS問題，請確認後端API是否正常運行')
      }
    }
  }
  
  console.log('\n=== 測試完成 ===')
  console.log('如果看到連接失敗，請確認:')
  console.log('1. 後端API是否在 http://localhost:7044 運行')
  console.log('2. 資料庫是否有測試資料')
  console.log('3. CORS設置是否正確')
}

// 暴露給全域使用
if (typeof window !== 'undefined') {
  (window as any).testAPI = testAPI
}