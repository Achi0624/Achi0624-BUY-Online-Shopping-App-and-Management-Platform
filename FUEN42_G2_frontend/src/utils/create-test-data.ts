// 建立測試資料工具 - 透過API建立測試資料
import { announcementApi } from '@/api/modules/announcement'
import { bannerApi } from '@/api/modules/banner'
import { couponApi } from '@/api/modules/coupon'

export async function createTestData() {
  console.log('=== 開始建立測試資料 ===')
  
  try {
    // 建立公告測試資料
    console.log('\n📢 建立公告測試資料...')
    const testAnnouncements = [
      {
        announcementAreaId: 1, // 前台區域
        title: '系統維護公告',
        content: '親愛的用戶，本系統將於2025年8月25日凌晨2:00-4:00進行例行性維護，期間暫停服務，造成不便敬請見諒。',
        priority: 1,
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天後
        isActive: true
      },
      {
        announcementAreaId: 1,
        title: '新功能上線通知', 
        content: '我們很高興宣布，新的會員積點功能已正式上線！現在您可以透過購物累積積點，兌換專屬優惠。',
        priority: 2,
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25天後
        isActive: true
      }
    ]

    for (const announcement of testAnnouncements) {
      try {
        const response = await announcementApi.createAnnouncement(announcement)
        console.log(`✅ 建立公告成功: ${announcement.title}`)
      } catch (error) {
        console.log(`❌ 建立公告失敗: ${announcement.title}`, error)
      }
    }

    // 建立廣告測試資料
    console.log('\n🎯 建立廣告測試資料...')
    const testBanners = [
      {
        bannerAreaId: 1, // 首頁輪播區域
        title: '夏日大促銷',
        imageUrl: 'https://via.placeholder.com/1200x400/007bff/ffffff?text=夏日大促銷',
        linkUrl: '/products',
        priority: 1,
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天後
        isActive: true,
        carouselInterval: 5000
      },
      {
        bannerAreaId: 1,
        title: '新品上市',
        imageUrl: 'https://via.placeholder.com/1200x400/28a745/ffffff?text=新品上市',
        linkUrl: '/products?sort=newest',
        priority: 2,
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25天後
        isActive: true,
        carouselInterval: 4000
      }
    ]

    for (const banner of testBanners) {
      try {
        const response = await bannerApi.createBanner(banner)
        console.log(`✅ 建立廣告成功: ${banner.title}`)
      } catch (error) {
        console.log(`❌ 建立廣告失敗: ${banner.title}`, error)
      }
    }

    // 建立優惠券測試資料
    console.log('\n🎫 建立優惠券測試資料...')
    const testCoupons = [
      {
        couponName: '新會員歡迎禮',
        couponCode: 'WELCOME100',
        couponType: 1, // 平台優惠券
        discountType: 1, // 固定金額
        discountValue: 100.00,
        minOrderAmount: 500.00,
        maxDiscountAmount: 100.00,
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60天後
        maxUsageTotal: 1000,
        maxUsagePerMember: 1,
        status: 1, // 啟用
        isActive: true
      },
      {
        couponName: '滿千折百',
        couponCode: 'SAVE100',
        couponType: 1,
        discountType: 1,
        discountValue: 100.00,
        minOrderAmount: 1000.00,
        maxDiscountAmount: 100.00,
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45天後
        maxUsageTotal: 500,
        maxUsagePerMember: 3,
        status: 1,
        isActive: true
      }
    ]

    for (const coupon of testCoupons) {
      try {
        const response = await couponApi.createCoupon(coupon)
        console.log(`✅ 建立優惠券成功: ${coupon.couponName}`)
      } catch (error) {
        console.log(`❌ 建立優惠券失敗: ${coupon.couponName}`, error)
      }
    }

    console.log('\n🎉 測試資料建立完成！')
    console.log('請重新整理頁面查看結果')

  } catch (error) {
    console.error('建立測試資料時發生錯誤:', error)
  }
}

// 暴露給全域使用
if (typeof window !== 'undefined') {
  (window as any).createTestData = createTestData
}