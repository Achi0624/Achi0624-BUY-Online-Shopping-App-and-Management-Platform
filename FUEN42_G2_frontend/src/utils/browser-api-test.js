/**
 * 瀏覽器控制台測試腳本
 * 請在瀏覽器開發者工具的控制台中運行
 */

// 測試函數1: 基本連接測試
async function testBasicConnection() {
    console.log('🔍 開始基本連接測試...')
    
    const testUrls = [
        'https://localhost:7044',
        'https://localhost:7044/api',
        'https://localhost:7044/api/announcements',
        'http://localhost:5000',
        'http://localhost:5000/api', 
        'http://localhost:5000/api/announcements'
    ]
    
    const results = []
    
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
            results.push({ url, success: true, status: response.status, statusText: response.statusText })
            
        } catch (error) {
            console.log(`❌ ${url} - 錯誤: ${error.message}`)
            
            let analysis = ''
            if (error.message.includes('CORS')) {
                analysis = 'CORS 錯誤 - 後端需要允許 http://localhost:5175'
            } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
                analysis = '連接被拒絕 - 後端服務未啟動'
            } else if (error.message.includes('net::ERR_CERT_AUTHORITY_INVALID')) {
                analysis = 'SSL 憑證問題 - 需要接受自簽憑證'
            } else if (error.message.includes('Failed to fetch')) {
                analysis = '無法連接 - 檢查後端服務狀態'
            }
            
            console.log(`  💡 分析: ${analysis}`)
            results.push({ url, success: false, error: error.message, analysis })
        }
    }
    
    return results
}

// 測試函數2: 使用 axios 測試（如果可用）
async function testWithAxios() {
    if (typeof axios === 'undefined') {
        console.log('❌ axios 不可用，跳過 axios 測試')
        return
    }
    
    console.log('🔍 使用 axios 測試...')
    
    try {
        const response = await axios.get('https://localhost:7044/api/announcements', {
            timeout: 5000,
            withCredentials: true
        })
        console.log('✅ axios 測試成功:', response.data)
    } catch (error) {
        console.log('❌ axios 測試失敗:', error.message)
        if (error.response) {
            console.log(`   HTTP 狀態: ${error.response.status}`)
            console.log(`   響應數據: ${JSON.stringify(error.response.data)}`)
        }
    }
}

// 測試函數3: 檢查系統資訊
function checkSystemInfo() {
    console.log('📋 系統資訊:')
    console.log(`   當前 URL: ${window.location.href}`)
    console.log(`   User Agent: ${navigator.userAgent}`)
    console.log(`   協議: ${window.location.protocol}`)
    console.log(`   主機: ${window.location.host}`)
}

// 主測試函數
async function runAPITests() {
    console.log('🚀 開始 API 連接測試...')
    console.log('='.repeat(50))
    
    checkSystemInfo()
    console.log('='.repeat(50))
    
    const basicResults = await testBasicConnection()
    console.log('='.repeat(50))
    
    await testWithAxios()
    console.log('='.repeat(50))
    
    // 分析結果
    const successCount = basicResults.filter(r => r.success).length
    const failureCount = basicResults.length - successCount
    
    console.log('📊 測試總結:')
    console.log(`   成功: ${successCount}`)
    console.log(`   失敗: ${failureCount}`)
    
    if (failureCount > 0) {
        console.log('💡 建議:')
        console.log('   1. 檢查後端服務是否運行在 https://localhost:7044 或 http://localhost:5000')
        console.log('   2. 確認 CORS 設定包含 http://localhost:5175')
        console.log('   3. 檢查防火牆設定')
        console.log('   4. 如果使用 HTTPS，請接受自簽憑證')
    }
    
    return basicResults
}

// 自動執行測試
console.log('🎯 API 測試腳本已載入')
console.log('💻 請執行 runAPITests() 開始測試')

// 如果在開發環境，自動執行
if (window.location.hostname === 'localhost') {
    setTimeout(() => {
        runAPITests()
    }, 1000)
}
