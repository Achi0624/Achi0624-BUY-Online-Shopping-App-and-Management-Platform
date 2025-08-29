# 啟動BUY商城真實後端服務指南

## 🎯 目標
啟動真實的後端服務以獲取資料庫中的真實付款方式，替代目前的模擬資料。

## 📋 前置檢查

### 1. 確認.NET環境
在Windows命令提示字元中檢查：
```cmd
dotnet --version
```
應該顯示 .NET 6.0 或更高版本

### 2. 確認專案路徑
確認以下路徑存在：
- `C:\Projects\20250809\FUEN42_G2_frontend` (Web API)
- `C:\Projects\20250809\FUEN42_G2_MVC` (MVC Backend)

## 🚀 啟動步驟

### 步驟1: 啟動Web API橋接服務
1. 開啟**Windows命令提示字元**（以系統管理員身分執行）
2. 執行以下命令：
```cmd
cd C:\Projects\20250809\FUEN42_G2_frontend
dotnet restore
dotnet run --launch-profile https
```

成功啟動後會看到：
```
Now listening on: https://localhost:7156
Now listening on: http://localhost:5100
Application started. Press Ctrl+C to shut down.
```

### 步驟2: 啟動MVC Backend核心服務
1. 開啟**另一個**Windows命令提示字元
2. 執行以下命令：
```cmd
cd C:\Projects\20250809\FUEN42_G2_MVC
dotnet restore
dotnet run --urls="https://localhost:7278;http://localhost:5014"
```

成功啟動後會看到：
```
Now listening on: https://localhost:7278
Now listening on: http://localhost:5014
Application started. Press Ctrl+C to shut down.
```

## ✅ 驗證服務啟動

### 1. 檢查API服務
在瀏覽器中訪問：
- Swagger API文檔: `https://localhost:7156/swagger/index.html`
- 付款方式API: `https://localhost:7156/api/C_Payments/vendors/1/methods`

### 2. 檢查MVC服務
在瀏覽器中訪問：
- MVC首頁: `http://localhost:5014`
- 管理後台: `http://localhost:5014/Admin`

### 3. 測試前端連接
重新訪問付款頁面：`http://localhost:5175/payment/1`

**成功連接後應該看到：**
- 瀏覽器控制台顯示：`✅ 成功取得 X 個付款方式`（X可能是7個真實方式）
- 付款頁面顯示來自資料庫的真實付款選項

## 🔧 常見問題排解

### 問題1: 端口被占用
```
Error: Failed to bind to address https://localhost:7156
```
**解決方法：**
```cmd
netstat -ano | findstr :7156
taskkill /PID [PID號碼] /F
```

### 問題2: 資料庫連接失敗
檢查`appsettings.json`中的連接字串：
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FUEN42_G2_DB;..."
  }
}
```

### 問題3: CORS錯誤持續
確認Web API中的CORS設定允許前端端口：
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5175", "http://localhost:5174")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

## 📊 成功指標

後端服務啟動成功後，您會看到：

### 前端變化
- 付款方式從3個模擬 → 7個真實方式
- 手續費從固定值 → 資料庫實際設定
- API呼叫從模擬 → 真實資料庫查詢

### 控制台日誌
```
開始載入付款方式，廠商ID: 1
📤 [GET] /C_Payments/vendors/1/methods
✅ 成功取得 7 個付款方式 (而不是使用模擬付款方式)
付款方式載入成功，數量: 7
```

## 🎉 預期結果

成功啟動後，付款頁面將顯示：
1. **信用卡付款** (ECPay真實整合)
2. **ATM轉帳** (虛擬帳號)
3. **超商代碼** (7-11, 全家, 萊爾富)
4. **超商條碼** (實體條碼)
5. **Apple Pay** (行動支付)
6. **Google Pay** (行動支付) 
7. **LINE Pay** (第三方支付)

所有資料都來自資料庫，包含真實的手續費設定和ECPay整合參數。

---

**重要提醒：**
- 兩個服務都必須同時運行
- 確保防火牆允許這些端口
- 如遇問題請檢查Windows事件日誌