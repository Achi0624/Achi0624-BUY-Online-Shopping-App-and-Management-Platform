/**
 * 綠界ECPay真實整合工具
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 綠界金流真實整合
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import CryptoJS from 'crypto-js'

// 綠界ECPay配置
export const ECPAY_CONFIG = {
  // 測試環境參數
  MerchantID: '2000132',
  HashKey: '5294y06JbISpM5x9',
  HashIV: 'v77hoKGq4kWxNNIS',
  PaymentURL: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
  
  // 生產環境 (需要申請正式商店)
  // MerchantID: 'YOUR_MERCHANT_ID',
  // HashKey: 'YOUR_HASH_KEY', 
  // HashIV: 'YOUR_HASH_IV',
  // PaymentURL: 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5'
}

// 付款參數介面
export interface ECPayParameters {
  MerchantTradeNo: string    // 商店交易編號 (唯一值)
  MerchantTradeDate: string  // 商店交易時間 (yyyy/MM/dd HH:mm:ss)
  PaymentType: string        // 交易類型 (固定aio)
  TotalAmount: number        // 交易金額
  TradeDesc: string          // 交易描述
  ItemName: string           // 商品名稱
  ReturnURL: string          // 付款完成通知回傳網址
  ChoosePayment: string      // 選擇預設付款方式
  ClientBackURL?: string     // 客戶端返回網址
  OrderResultURL?: string    // 訂單處理完成後導向的網址
  PaymentInfoURL?: string    // 付款資訊通知網址
  NeedExtraPaidInfo?: string // 額外付款資訊
  IgnorePayment?: string     // 忽略付款方式
  PlatformID?: string        // 平台商代號
  CustomField1?: string      // 自訂名稱欄位1
  CustomField2?: string      // 自訂名稱欄位2
  CustomField3?: string      // 自訂名稱欄位3
  CustomField4?: string      // 自訂名稱欄位4
  EncryptType: number        // 加密類型 (固定為1)
}

// 付款方式代碼
export const PAYMENT_METHODS = {
  ALL: 'ALL',           // 不指定付款方式
  Credit: 'Credit',     // 信用卡
  WebATM: 'WebATM',     // 網路ATM
  ATM: 'ATM',           // 自動櫃員機
  CVS: 'CVS',           // 超商代碼
  BARCODE: 'BARCODE',   // 超商條碼
  AndroidPay: 'AndroidPay', // Android Pay
  GooglePay: 'GooglePay',   // Google Pay
  SamsungPay: 'SamsungPay', // Samsung Pay
  LinePay: 'LinePay',       // LINE Pay
  JKOPay: 'JKOPay',         // 街口支付
  Pi: 'Pi',                 // Pi 錢包
  TaiwanPay: 'TaiwanPay'    // 台灣Pay
}

/**
 * 產生綠界付款表單HTML
 * @param params 付款參數
 * @returns 自動提交的HTML表單
 */
export function generateECPayForm(params: ECPayParameters): string {
  try {
    console.log('🔄 開始產生綠界付款表單...')
    console.log('📋 付款參數:', params)
    
    // 1. 準備基本參數
    const baseParams = {
      MerchantID: ECPAY_CONFIG.MerchantID,
      PaymentType: 'aio', // 綠界必要參數
      ...params
    }
    
    console.log('📦 基本參數:', baseParams)
    
    // 2. 產生CheckMacValue
    const checkMacValue = generateCheckMacValue(baseParams)
    console.log('🔐 產生的CheckMacValue:', checkMacValue)
    
    // 3. 組合最終參數
    const finalParams = {
      ...baseParams,
      CheckMacValue: checkMacValue
    }
    
    // 4. 建立HTML表單
    const formFields = Object.entries(finalParams)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${String(value).replace(/"/g, '&quot;')}" />`)
      .join('\n    ')
    
    const formHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>綠界ECPay付款</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .redirect-card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #2c5aa0;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        h1 {
            color: #2c5aa0;
            margin-bottom: 10px;
            font-size: 24px;
        }
        p {
            color: #666;
            margin-bottom: 20px;
        }
        .manual-btn {
            background: #2c5aa0;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .manual-btn:hover {
            background: #1e3d6e;
        }
    </style>
</head>
<body>
    <div class="redirect-card">
        <div class="spinner"></div>
        <h1>🏦 綠界ECPay</h1>
        <p>正在為您跳轉到安全的付款頁面...</p>
        <p><small>如果頁面沒有自動跳轉，請點擊下方按鈕</small></p>
        <button class="manual-btn" onclick="document.getElementById('ecpayForm').submit();">
            手動前往付款
        </button>
    </div>
    
    <form id="ecpayForm" method="post" action="${ECPAY_CONFIG.PaymentURL}" style="display:none;">
    ${formFields}
    </form>
    
    <script>
        // 自動提交表單
        setTimeout(function() {
            document.getElementById('ecpayForm').submit();
        }, 1000);
    </script>
</body>
</html>`
    
    console.log('✅ 綠界付款表單產生成功!')
    return formHTML
    
  } catch (error) {
    console.error('❌ 產生綠界付款表單失敗:', error)
    throw new Error(`產生付款表單失敗: ${error.message}`)
  }
}

/**
 * 產生綠界付款URL (簡化版，用於測試)
 * @param params 付款參數
 * @returns 完整的付款URL
 */
export function generateECPayURL(params: ECPayParameters): string {
  try {
    console.log('🔄 開始產生綠界付款URL...')
    
    // 1. 準備基本參數
    const baseParams = {
      MerchantID: ECPAY_CONFIG.MerchantID,
      PaymentType: 'aio', // 綠界必要參數
      ...params
    }
    
    // 2. 產生CheckMacValue
    const checkMacValue = generateCheckMacValue(baseParams)
    
    // 3. 組合最終參數
    const finalParams = {
      ...baseParams,
      CheckMacValue: checkMacValue
    }
    
    // 4. 建立URL參數字串 (手動編碼以確保正確性)
    const paramPairs: string[] = []
    Object.entries(finalParams).forEach(([key, value]) => {
      const encodedValue = encodeURIComponent(String(value))
      paramPairs.push(`${key}=${encodedValue}`)
    })
    
    const finalURL = `${ECPAY_CONFIG.PaymentURL}?${paramPairs.join('&')}`
    console.log('✅ 最終付款URL:', finalURL)
    
    return finalURL
    
  } catch (error) {
    console.error('❌ 產生綠界付款URL失敗:', error)
    throw new Error(`產生付款URL失敗: ${error.message}`)
  }
}

/**
 * 產生CheckMacValue (MAC驗證碼)
 * @param params 參數物件
 * @returns CheckMacValue字串
 */
function generateCheckMacValue(params: Record<string, any>): string {
  try {
    console.log('🔐 開始產生CheckMacValue...')
    
    // 1. 移除CheckMacValue參數 (如果存在)
    const { CheckMacValue, ...cleanParams } = params
    
    // 2. 依照字母順序排序參數
    const sortedKeys = Object.keys(cleanParams).sort()
    console.log('📝 排序後的參數鍵:', sortedKeys)
    
    // 3. 組合查詢字串
    const paramPairs: string[] = []
    
    sortedKeys.forEach(key => {
      const value = cleanParams[key]
      if (value !== undefined && value !== null && value !== '') {
        paramPairs.push(`${key}=${value}`)
      }
    })
    
    const queryString = paramPairs.join('&')
    console.log('🔗 查詢字串:', queryString)
    
    // 4. 加上HashKey和HashIV
    const rawString = `HashKey=${ECPAY_CONFIG.HashKey}&${queryString}&HashIV=${ECPAY_CONFIG.HashIV}`
    console.log('🔑 原始字串:', rawString)
    
    // 5. URL編碼 (綠界特殊要求)
    const encodedString = encodeURIComponent(rawString)
      .replace(/%20/g, '+')      // 空格轉換為+
      .replace(/!/g, '%21')      // 驚嘆號編碼
      .replace(/'/g, '%27')      // 單引號編碼  
      .replace(/\(/g, '%28')     // 左括號編碼
      .replace(/\)/g, '%29')     // 右括號編碼
      .replace(/\*/g, '%2A')     // 星號編碼
      .replace(/~/g, '%7E')      // 波浪號編碼
    
    console.log('🔤 編碼後字串:', encodedString)
    
    // 6. 轉為小寫
    const lowerString = encodedString.toLowerCase()
    console.log('🔡 小寫字串:', lowerString)
    
    // 7. SHA256加密
    const hash = CryptoJS.SHA256(lowerString).toString()
    console.log('🎯 SHA256雜湊:', hash)
    
    // 8. 轉為大寫
    const checkMacValue = hash.toUpperCase()
    console.log('✅ 最終CheckMacValue:', checkMacValue)
    
    return checkMacValue
    
  } catch (error) {
    console.error('❌ 產生CheckMacValue失敗:', error)
    throw new Error(`MAC驗證碼產生失敗: ${error.message}`)
  }
}

/**
 * 驗證綠界回調的CheckMacValue
 * @param params 回調參數
 * @returns 是否驗證通過
 */
export function verifyECPayCallback(params: Record<string, any>): boolean {
  try {
    console.log('🔍 開始驗證綠界回調...')
    console.log('📋 回調參數:', params)
    
    const receivedMac = params.CheckMacValue
    if (!receivedMac) {
      console.error('❌ 缺少CheckMacValue參數')
      return false
    }
    
    // 重新計算CheckMacValue
    const calculatedMac = generateCheckMacValue(params)
    
    // 比較MAC值
    const isValid = receivedMac.toUpperCase() === calculatedMac.toUpperCase()
    
    console.log('🔐 接收到的MAC:', receivedMac)
    console.log('🔐 計算出的MAC:', calculatedMac)
    console.log('✅ 驗證結果:', isValid ? '通過' : '失敗')
    
    return isValid
    
  } catch (error) {
    console.error('❌ 驗證綠界回調失敗:', error)
    return false
  }
}

/**
 * 產生商店交易編號 (必須唯一)
 * @param orderNumber 訂單編號
 * @returns 商店交易編號
 */
export function generateMerchantTradeNo(orderNumber: string): string {
  // 格式: BUY + 日期時間 + 隨機數
  const now = new Date()
  const dateStr = now.getFullYear().toString() + 
                  (now.getMonth() + 1).toString().padStart(2, '0') +
                  now.getDate().toString().padStart(2, '0') +
                  now.getHours().toString().padStart(2, '0') +
                  now.getMinutes().toString().padStart(2, '0') +
                  now.getSeconds().toString().padStart(2, '0')
  
  const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase()
  
  // 商店交易編號限制20字元
  const tradeNo = `BUY${dateStr}${randomStr}`.substr(0, 20)
  
  console.log('🏷️ 產生商店交易編號:', tradeNo)
  return tradeNo
}

/**
 * 格式化交易時間
 * @param date 日期物件
 * @returns 格式化的時間字串 (yyyy/MM/dd HH:mm:ss)
 */
export function formatTradeDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 根據付款方式ID轉換為綠界付款代碼
 * @param paymentMethodId 付款方式ID
 * @returns 綠界付款代碼
 */
export function getECPayChoosePayment(paymentMethodId: number): string {
  console.log('🔄 轉換付款方式ID:', paymentMethodId)
  
  // 0 = 不指定付款方式，讓用戶在綠界頁面選擇
  if (paymentMethodId === 0) {
    console.log('✅ 使用 ALL (讓用戶選擇)')
    return PAYMENT_METHODS.ALL
  }
  
  // 綠界測試商店2000132的實際限制：只支援信用卡
  // 注意：共用測試商店有付款方式限制，正式商店可支援更多方式
  const mapping: Record<number, string> = {
    1: PAYMENT_METHODS.Credit,     // 信用卡 - 測試商店支援
    2: PAYMENT_METHODS.Credit,     // ATM轉帳 - 測試商店不支援，降級到信用卡
    3: PAYMENT_METHODS.Credit,     // 超商代碼 - 測試商店不支援，降級到信用卡
    4: PAYMENT_METHODS.Credit,     // 超商條碼 - 測試商店不支援，降級到信用卡
    5: PAYMENT_METHODS.Credit,     // 降級到信用卡
    6: PAYMENT_METHODS.Credit,     // 降級到信用卡
    7: PAYMENT_METHODS.Credit      // 降級到信用卡
  }
  
  const choosePayment = mapping[paymentMethodId] || PAYMENT_METHODS.Credit // 預設信用卡
  console.log(`✅ 付款方式ID ${paymentMethodId} -> 綠界代碼 ${choosePayment}`)
  
  return choosePayment
}

// 匯出工具函數
export default {
  generateECPayURL,
  generateECPayForm,
  verifyECPayCallback,
  generateMerchantTradeNo,
  formatTradeDate,
  getECPayChoosePayment,
  ECPAY_CONFIG,
  PAYMENT_METHODS
}