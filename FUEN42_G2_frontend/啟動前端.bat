@echo off
echo ================================
echo    BUY 商城前端啟動
echo ================================
echo.

echo 正在檢查 Node.js 環境...
node --version
if errorlevel 1 (
    echo 錯誤: 找不到 Node.js
    echo 請確保已安裝 Node.js 18.0 或更新版本
    pause
    exit /b 1
)

echo 正在檢查 npm...
npm --version
if errorlevel 1 (
    echo 錯誤: 找不到 npm
    pause
    exit /b 1
)

echo.
echo 正在安裝/更新依賴...
npm install
if errorlevel 1 (
    echo 錯誤: npm install 失敗
    pause
    exit /b 1
)

echo.
echo ================================
echo 🚀 啟動前端開發伺服器...
echo ================================
echo 前端: http://localhost:5173
echo API:  http://localhost:5105/api
echo ================================
echo.
echo 請保持此視窗開啟，前端伺服器正在運行...
echo 按 Ctrl+C 停止伺服器
echo.

npm run dev