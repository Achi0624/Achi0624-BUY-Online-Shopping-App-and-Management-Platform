/**
 * 模擬公告數據 - 開發環境使用
 * 當後端API不可用時，使用此模擬數據
 */

import type { CouponAPI } from '@/types/api'

export const mockAnnouncements: CouponAPI.AnnouncementInfo[] = [
  {
    id: 1,
    announcementAreaId: 1,
    title: '🎉 2025年春節限定活動開跑！',
    content: `親愛的會員們，

春節即將到來，我們為您準備了豐富的限定活動！

🧧 活動內容：
• 全館商品 8 折起
• 消費滿 $2000 送 $200 購物金
• 春節限定商品獨家販售
• 免運費優惠（消費滿 $1000）

🗓️ 活動期間：
2025年1月20日 至 2025年2月15日

💰 特殊優惠：
新會員註冊立即獲得 $500 購物金！

⚠️ 注意事項：
1. 活動商品數量有限，售完為止
2. 優惠不得與其他促銷活動併用
3. 春節期間配送時間可能延長，請提前下單

感謝您的支持，祝您新年快樂！

客服專線：0800-123-456
LINE客服：@buyshop`,
    priority: 8,
    startAt: '2025-01-20T00:00:00Z',
    endAt: '2025-02-15T23:59:59Z',
    isActive: true,
    viewCount: 1256,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
    createdBy: 'admin'
  },
  {
    id: 2,
    announcementAreaId: 1,
    title: '📱 手機配件新品上市通知',
    content: `各位親愛的顧客，

我們很興奮地宣布，最新款手機配件已正式上架！

🆕 新品介紹：
• iPhone 15 系列保護殼（多種顏色可選）
• 無線充電板 2.0（支援 15W 快充）
• 藍牙耳機 Pro Max（主動降噪功能）
• 手機支架組合包（車用+桌用）

✨ 限時優惠：
前 100 名購買者享有 85 折優惠！

🚚 配送資訊：
• 台北市、新北市：隔日到貨
• 其他縣市：2-3個工作天

有任何問題歡迎聯繫客服！`,
    priority: 6,
    startAt: '2025-01-10T09:00:00Z',
    endAt: '2025-02-10T23:59:59Z',
    isActive: true,
    viewCount: 892,
    createdAt: '2025-01-08T14:20:00Z',
    updatedAt: '2025-01-08T14:20:00Z',
    createdBy: 'admin'
  },
  {
    id: 3,
    announcementAreaId: 1,
    title: '⚙️ 系統維護公告',
    content: `親愛的用戶，

為了提供更好的服務品質，我們將進行系統維護升級。

🕐 維護時間：
2025年1月25日（週四）凌晨 2:00 - 4:00

🔧 維護內容：
• 資料庫效能優化
• 新功能部署
• 安全性更新
• Bug 修復

⚠️ 影響範圍：
維護期間網站將暫時無法使用，已下單的訂單不受影響。

📱 緊急聯繫：
如有緊急問題，請聯繫客服 LINE：@buyshop

造成不便，敬請見諒！`,
    priority: 9,
    startAt: '2025-01-20T00:00:00Z',
    endAt: '2025-01-26T00:00:00Z',
    isActive: true,
    viewCount: 2341,
    createdAt: '2025-01-18T16:45:00Z',
    updatedAt: '2025-01-18T16:45:00Z',
    createdBy: 'admin'
  },
  {
    id: 4,
    announcementAreaId: 1,
    title: '🎁 會員升級制度說明',
    content: `尊敬的會員，

我們全新的會員升級制度已正式啟動！

💎 會員等級：
• 銅牌會員：消費滿 $5,000（9.5折優惠）
• 銀牌會員：消費滿 $15,000（9折優惠）
• 金牌會員：消費滿 $30,000（8.5折優惠）
• 鑽石會員：消費滿 $50,000（8折優惠）

🎯 專屬權益：
• 生日專屬優惠券
• 新品搶先購買權
• 專屬客服專線
• 免費商品延保服務

📊 積分計算：
每消費 $1 = 1 積分
積分可用於兌換商品或折抵購物金

立即查看您的會員等級！`,
    priority: 5,
    startAt: '2025-01-01T00:00:00Z',
    endAt: '2025-12-31T23:59:59Z',
    isActive: true,
    viewCount: 3456,
    createdAt: '2024-12-28T11:15:00Z',
    updatedAt: '2024-12-28T11:15:00Z',
    createdBy: 'admin'
  },
  {
    id: 5,
    announcementAreaId: 1,
    title: '🚛 配送政策更新',
    content: `親愛的顧客，

為了提供更優質的配送服務，我們更新了配送政策。

📦 配送方式：
• 宅配到府：$60 運費（滿 $1000 免運）
• 超商取貨：$45 運費（滿 $800 免運）
• 門市自取：免運費

⏰ 配送時間：
• 台北市：當日配送（下午2點前訂購）
• 新北市、桃園市：隔日配送
• 其他地區：2-3個工作天

📱 配送追蹤：
• 出貨後立即發送簡訊通知
• 提供即時物流追蹤
• 支援配送時間指定

感謝您的理解與支持！`,
    priority: 4,
    startAt: '2025-01-15T00:00:00Z',
    endAt: '2025-03-15T23:59:59Z',
    isActive: true,
    viewCount: 1789,
    createdAt: '2025-01-12T09:30:00Z',
    updatedAt: '2025-01-12T09:30:00Z',
    createdBy: 'admin'
  }
]

// 模擬API響應格式
export const createMockAnnouncementResponse = (announcements: CouponAPI.AnnouncementInfo[] = mockAnnouncements) => {
  return {
    data: announcements,
    status: 200,
    headers: {
      'x-total-count': announcements.length.toString(),
      'x-page': '1',
      'x-page-size': '10'
    }
  }
}

// 根據ID獲取單個公告
export const getMockAnnouncementById = (id: number): CouponAPI.AnnouncementInfo | undefined => {
  return mockAnnouncements.find(announcement => announcement.id === id)
}

// 獲取活動公告（高優先級）
export const getMockActiveAnnouncements = (limit: number = 5): CouponAPI.AnnouncementInfo[] => {
  return mockAnnouncements
    .filter(announcement => announcement.isActive)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
}
