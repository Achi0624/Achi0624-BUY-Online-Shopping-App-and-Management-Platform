# 後端服務器啟動說明

## 前置條件

1. 確保已安裝 .NET 8.0 SDK
2. 確保 SQL Server 正在運行
3. 確保資料庫 `FUEN42_G2_DB` 已建立

## 啟動步驟

### 方法一：使用 dotnet CLI
```bash
# 1. 進入後端專案目錄 (AuthApp 或主要API專案)
cd AuthApp

# 2. 還原 NuGet 套件
dotnet restore

# 3. 更新資料庫 (如果需要)
dotnet ef database update

# 4. 啟動開發服務器
dotnet run
```

### 方法二：使用 Visual Studio
1. 開啟後端解決方案檔案 (.sln)
2. 設定啟動專案為 API 專案
3. 按 F5 或點擊「啟動」按鈕

## 驗證

後端服務器啟動後應該在以下地址運行：
- **HTTPS**: https://localhost:7044
- **HTTP**: http://localhost:5099

你可以在瀏覽器中訪問 `https://localhost:7044/swagger` 查看 API 文檔。

## 登入測試

一旦後端運行，你就可以使用真實的資料庫帳號進行登入：

1. 確保資料庫中有測試用戶數據
2. 在前端登入頁面輸入真實的電子信箱和密碼
3. 系統將調用真實的 API 進行驗證

## 常見問題

### Q: 無法連接到資料庫
A: 請檢查 `appsettings.json` 中的連接字串是否正確

### Q: CORS 錯誤
A: 確保後端已正確配置 CORS 政策允許前端域名

### Q: HTTPS 憑證錯誤
A: 在開發環境中，可能需要信任自簽名憑證：
```bash
dotnet dev-certs https --trust
```