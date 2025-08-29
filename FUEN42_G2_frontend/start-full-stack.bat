@echo off
echo =========================================
echo   啟動 FUEN42_G2 全端開發環境
echo   C組 - 訂單/金流/物流整合
echo =========================================

:: 啟動後端 API (新視窗)
echo.
echo [1/2] 啟動後端 API (https://localhost:7150)...
start "FUEN42 Backend API" cmd /k "cd /d C:\Projects\20250820\FUEN42_G2_BUY_Backend_ && dotnet run --launch-profile https"

:: 等待後端啟動
echo.
echo 等待後端服務啟動...
timeout /t 5 /nobreak > nul

:: 啟動前端 Vue (新視窗)
echo.
echo [2/2] 啟動前端 Vue 應用 (http://localhost:5173)...
start "FUEN42 Frontend" cmd /k "cd /d C:\Projects\FUEN42_G2_frontend && npm run dev"

echo.
echo =========================================
echo   系統啟動完成！
echo =========================================
echo.
echo 訪問地址：
echo   - 前端應用: http://localhost:5173
echo   - 後端 API: https://localhost:7150/swagger
echo.
echo 提示：
echo   - 前端會自動代理 API 請求到後端
echo   - 確保 Node.js 和 .NET 8 SDK 已安裝
echo   - 按 Ctrl+C 可停止服務
echo.
pause