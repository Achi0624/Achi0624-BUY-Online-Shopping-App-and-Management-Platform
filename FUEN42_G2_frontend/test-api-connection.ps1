# PowerShell API 測試腳本
# 檢查後端 API 是否正常運行

Write-Host "🔍 開始 API 連接測試..." -ForegroundColor Cyan
Write-Host "=" * 50

# 測試端口連接
Write-Host "`n📡 測試端口連接:" -ForegroundColor Yellow

$ports = @(7044, 5000)
foreach ($port in $ports) {
    try {
        $result = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($result.TcpTestSucceeded) {
            Write-Host "✅ 端口 $port : 連接成功" -ForegroundColor Green
        } else {
            Write-Host "❌ 端口 $port : 連接失敗" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ 端口 $port : 測試錯誤 - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 測試 HTTP 請求
Write-Host "`n🌐 測試 HTTP 請求:" -ForegroundColor Yellow

$testUrls = @(
    "https://localhost:7044",
    "https://localhost:7044/health",
    "https://localhost:7044/api",
    "http://localhost:5000",
    "http://localhost:5000/health",
    "http://localhost:5000/api"
)

foreach ($url in $testUrls) {
    try {
        Write-Host "📡 測試 $url..." -ForegroundColor White
        
        # 忽略 SSL 證書錯誤
        if ($url.StartsWith("https")) {
            [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
        }
        
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -UseBasicParsing
        Write-Host "✅ $url - 狀態: $($response.StatusCode)" -ForegroundColor Green
        
        # 如果是健康檢查端點，顯示內容
        if ($url.EndsWith("/health")) {
            Write-Host "   響應: $($response.Content)" -ForegroundColor Cyan
        }
        
    } catch {
        $errorMessage = $_.Exception.Message
        Write-Host "❌ $url - 錯誤: $errorMessage" -ForegroundColor Red
        
        # 錯誤分析
        if ($errorMessage -like "*連線嘗試失敗*" -or $errorMessage -like "*connection*refused*") {
            Write-Host "   💡 分析: 後端服務可能未啟動" -ForegroundColor Yellow
        } elseif ($errorMessage -like "*SSL*" -or $errorMessage -like "*certificate*") {
            Write-Host "   💡 分析: SSL 憑證問題" -ForegroundColor Yellow
        } elseif ($errorMessage -like "*timeout*") {
            Write-Host "   💡 分析: 請求超時" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n📋 系統資訊:" -ForegroundColor Yellow
Write-Host "   前端地址: http://localhost:5175" -ForegroundColor White
Write-Host "   預期後端地址: https://localhost:7044 或 http://localhost:5000" -ForegroundColor White
Write-Host "   當前時間: $(Get-Date)" -ForegroundColor White

Write-Host "`n💡 下一步建議:" -ForegroundColor Yellow
Write-Host "   1. 如果端口測試失敗，請啟動後端服務" -ForegroundColor White
Write-Host "   2. 後端啟動命令: dotnet run --urls=`"https://localhost:7044;http://localhost:5000`"" -ForegroundColor White
Write-Host "   3. 確認後端 CORS 設定包含 http://localhost:5175" -ForegroundColor White
Write-Host "   4. 檢查防火牆是否阻擋端口 7044 和 5000" -ForegroundColor White

Write-Host "`n🔚 測試完成" -ForegroundColor Cyan
