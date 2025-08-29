<template>
  <main class="faq-view">
    <div class="container">
      <header class="faq-header">
        <h1 class="title">常見問題 FAQ</h1>
        <p class="subtitle">快速找到解決方案，節省您的寶貴時間！</p>
        <div class="search-wrap card">
          <label for="faq-search" class="sr-only">搜尋常見問題</label>
          <input
            id="faq-search"
            v-model="searchQuery"
            type="text"
            placeholder="輸入關鍵字搜尋…"
            class="faq-search"
            :aria-label="'搜尋常見問題'"
          />
        </div>
      </header>
      <div class="faq-body">
        <!-- 類別側欄 -->
        <aside class="faq-categories card" aria-label="FAQ 類別">
          <h2 class="section-title">分類</h2>
          <ul class="cat-list">
            <li
              v-for="category in categories"
              :key="category"
              :class="['cat-item', { active: activeCategory === category }]"
            >
              <button class="cat-btn" type="button" @click="activeCategory = category">{{ category }}</button>
            </li>
          </ul>
        </aside>

        <!-- 問題清單 -->
        <section class="faq-list card" aria-labelledby="list-title">
          <div class="list-head">
            <div class="list-head-left">
              <h2 id="list-title" class="section-title">{{ activeCategory }}</h2>
              <span class="count" aria-live="polite">{{ filteredFaqs.length }} 筆</span>
            </div>
          </div>

          <ul class="faq-items">
            <li v-for="faq in filteredFaqs" :key="faq.id" class="faq-item">
              <div class="faq-q" @click="toggleFaq(faq.id)" style="cursor:pointer;">
                <span class="faq-q-icon">Q</span>
                <span class="faq-q-text">{{ faq.question }}</span>
                <span class="faq-toggle" :class="{ open: openIds.has(faq.id) }">{{ openIds.has(faq.id) ? '－' : '＋' }}</span>
              </div>
              <transition name="fade">
                <div v-if="openIds.has(faq.id)" class="faq-a">
                  <span class="faq-a-icon">A</span>
                  <span class="faq-a-text">{{ faq.answer }}</span>
                </div>
              </transition>
            </li>
            <li v-if="filteredFaqs.length === 0" class="empty-tip">查無相關問題，請重新搜尋或聯絡客服。</li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')
const activeCategory = ref('發票相關')

const categories = [
  '新手上路',
  '訂單與物流',
  '退貨與退款',
  '付款或帳務問題',
  '發票相關',
  '信用卡 / 金融卡'
]

// 狀態：控制每筆是否展開
const openIds = ref(new Set<number>())
const toggleFaq = (id: number) => {
  const s = new Set(openIds.value);
  if (s.has(id)) s.delete(id); else s.add(id);
  openIds.value = s;
}

const faqs = ref([
  // 新手上路
  { id: 1, category: '新手上路', question: '如何註冊會員？', answer: '請點選右上角「註冊」並填寫基本資訊。' },
  { id: 2, category: '新手上路', question: '會員帳號可以更改嗎？', answer: '帳號一旦建立無法更改，可修改暱稱與個人資料。' },
  { id: 3, category: '新手上路', question: '忘記密碼怎麼辦？', answer: '可於登入頁點選「忘記密碼」重新設定。' },
  { id: 4, category: '新手上路', question: '如何訂閱電子報？', answer: '在會員中心設定訂閱選項即可。' },
  { id: 5, category: '新手上路', question: '如何追蹤商品？', answer: '商品頁點擊「加入追蹤」即可。' },
  { id: 6, category: '新手上路', question: '是否需要年齡限制？', answer: '需年滿 18 歲以上才能註冊會員。' },
  { id: 7, category: '新手上路', question: '如何修改個人資料？', answer: '會員中心可更新姓名、電話、地址等資訊。' },
  { id: 8, category: '新手上路', question: '可以同時登入多個裝置嗎？', answer: '可以，但請勿將帳號分享給他人。' },
  { id: 9, category: '新手上路', question: '會員權益有哪些？', answer: '會員可享有優惠、訂單追蹤與專屬活動。' },
  { id: 10, category: '新手上路', question: '如何刪除帳號？', answer: '請聯繫客服協助刪除帳號。' },

  // 訂單與物流
  { id: 11, category: '訂單與物流', question: '如何查看訂單狀態？', answer: '可於會員中心訂單查詢查看最新狀態。' },
  { id: 12, category: '訂單與物流', question: '下單後可以取消嗎？', answer: '若尚未出貨，可於訂單頁取消訂單。' },
  { id: 13, category: '訂單與物流', question: '物流配送需要多久？', answer: '一般配送 2-5 天，偏遠地區需更久。' },
  { id: 14, category: '訂單與物流', question: '可以指定配送時間嗎？', answer: '部分物流可選擇時段，依結帳頁提供為準。' },
  { id: 15, category: '訂單與物流', question: '如何查詢物流單號？', answer: '出貨後會提供物流單號，可於訂單詳情查看。' },
  { id: 16, category: '訂單與物流', question: '配送地區有哪些限制？', answer: '部分離島與海外地區暫不支援。' },
  { id: 17, category: '訂單與物流', question: '訂單顯示出貨但未收到？', answer: '建議先聯繫物流公司或客服協助查詢。' },
  { id: 18, category: '訂單與物流', question: '收件地址輸入錯誤怎麼辦？', answer: '請立即聯繫客服協助修改。' },
  { id: 19, category: '訂單與物流', question: '是否能海外配送？', answer: '目前僅支援台灣本島配送。' },
  { id: 20, category: '訂單與物流', question: '如何追加訂單商品？', answer: '需取消原訂單重新下單。' },

  // 退貨與退款
  { id: 21, category: '退貨與退款', question: '如何申請退貨？', answer: '於會員中心訂單詳情點選「申請退貨」。' },
  { id: 22, category: '退貨與退款', question: '退貨需要付費嗎？', answer: '若非人為因素，退貨運費由平台承擔。' },
  { id: 23, category: '退貨與退款', question: '退款需要多久？', answer: '退款約需 7-14 個工作天退回原付款方式。' },
  { id: 24, category: '退貨與退款', question: '收到商品與訂單不符怎麼辦？', answer: '請立即拍照存證並申請退換貨。' },
  { id: 25, category: '退貨與退款', question: '哪些商品不接受退貨？', answer: '食品、個人衛生用品等不接受退貨。' },
  { id: 26, category: '退貨與退款', question: '退款會退到哪裡？', answer: '退款將退至原付款帳戶或信用卡。' },
  { id: 27, category: '退貨與退款', question: '退貨需要原包裝嗎？', answer: '需保留完整包裝與配件。' },
  { id: 28, category: '退貨與退款', question: '如何查看退貨進度？', answer: '可於會員中心退貨進度查詢頁查看。' },
  { id: 29, category: '退貨與退款', question: '是否能換貨？', answer: '若商品仍有庫存，可選擇換貨。' },
  { id: 30, category: '退貨與退款', question: '退貨地址是什麼？', answer: '退貨地址將於申請成功後顯示於頁面。' },

  // 付款或帳務問題
  { id: 31, category: '付款或帳務問題', question: '付款後沒有跳轉成功怎麼辦？', answer: '請先確認是否已扣款，再聯繫客服查詢訂單狀態。' },
  { id: 32, category: '付款或帳務問題', question: '支援哪些付款方式？', answer: '支援信用卡、ATM 轉帳、超商付款等。' },
  { id: 33, category: '付款或帳務問題', question: '付款逾時怎麼辦？', answer: '訂單將自動取消，需重新下單。' },
  { id: 34, category: '付款或帳務問題', question: '發票何時開立？', answer: '付款完成後系統會自動開立電子發票。' },
  { id: 35, category: '付款或帳務問題', question: '信用卡分期付款支援嗎？', answer: '部分銀行支援分期，依結帳頁顯示為準。' },
  { id: 36, category: '付款或帳務問題', question: '如何確認付款是否成功？', answer: '可於會員中心訂單查詢頁確認。' },
  { id: 37, category: '付款或帳務問題', question: 'ATM 轉帳要多久入帳？', answer: '一般 1-2 個工作天內會完成入帳。' },
  { id: 38, category: '付款或帳務問題', question: '付款後未收到簡訊通知？', answer: '可於會員中心確認訂單狀態或聯繫客服。' },
  { id: 39, category: '付款或帳務問題', question: '是否提供統編收據？', answer: '可於結帳頁輸入統編資訊取得。' },
  { id: 40, category: '付款或帳務問題', question: '超商付款要注意什麼？', answer: '請於期限內至指定超商付款，逾期將自動取消。' },

  // 發票相關
  { id: 41, category: '發票相關', question: '統編發票常見問題', answer: '若您需要開統編發票，請在結帳頁填寫完整資訊。' },
  { id: 42, category: '發票相關', question: '如何索取紙本發票？', answer: '可於會員中心選擇申請紙本發票，約 7 個工作天內寄出。' },
  { id: 43, category: '發票相關', question: '電子發票該如何歸戶？', answer: '請至財政部電子發票整合平台綁定手機條碼。' },
  { id: 44, category: '發票相關', question: '中獎發票如何領獎？', answer: '請依財政部公告方式領獎。' },
  { id: 45, category: '發票相關', question: '是否可以更改發票抬頭？', answer: '已開立發票無法修改抬頭。' },
  { id: 46, category: '發票相關', question: '發票存入載具會通知嗎？', answer: '存入成功後系統會發送通知。' },
  { id: 47, category: '發票相關', question: '發票可以重開嗎？', answer: '若有錯誤需於開立當月申請作廢重開。' },
  { id: 48, category: '發票相關', question: '如何查看歷史發票？', answer: '可於會員中心發票紀錄查詢。' },
  { id: 49, category: '發票相關', question: '雲端發票有保存期限嗎？', answer: '依財政部規定，雲端發票保存五年。' },
  { id: 50, category: '發票相關', question: '發票載具能與他人共用嗎？', answer: '不建議共用，以免造成權益問題。' },

  // 信用卡 / 金融卡
  { id: 51, category: '信用卡 / 金融卡', question: '信用卡付款失敗怎麼辦？', answer: '請確認卡片是否有效或聯繫發卡銀行。' },
  { id: 52, category: '信用卡 / 金融卡', question: '可以使用國外信用卡嗎？', answer: '支援 VISA、MasterCard 等國際信用卡。' },
  { id: 53, category: '信用卡 / 金融卡', question: '信用卡付款會收手續費嗎？', answer: '平台本身不收取額外手續費。' },
  { id: 54, category: '信用卡 / 金融卡', question: '如何設定自動扣款？', answer: '可於會員中心付款設定開啟自動扣款。' },
  { id: 55, category: '信用卡 / 金融卡', question: '金融卡可線上付款嗎？', answer: '部分銀行提供金融卡網路付款功能。' },
  { id: 56, category: '信用卡 / 金融卡', question: '信用卡安全驗證是什麼？', answer: '3D 驗證是銀行的安全措施，需輸入動態密碼。' },
  { id: 57, category: '信用卡 / 金融卡', question: '可以綁定多張卡片嗎？', answer: '可以於會員中心新增與管理卡片。' },
  { id: 58, category: '信用卡 / 金融卡', question: '卡片遺失怎麼辦？', answer: '請立即聯繫發卡銀行掛失。' },
  { id: 59, category: '信用卡 / 金融卡', question: '信用卡退款要多久？', answer: '退款約需 7-14 個工作天退回原卡帳戶。' },
  { id: 60, category: '信用卡 / 金融卡', question: '是否支援 Apple Pay / Google Pay？', answer: '部分銀行與卡別支援，依結帳頁顯示為準。' }
])

const filteredFaqs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return faqs.value.filter(faq => {
    const matchCategory = faq.category === activeCategory.value
    const matchSearch = q === '' || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
    return matchCategory && matchSearch
  })
})
</script>

<style scoped>
.faq-view {
  background: #f8f9fa;
  min-height: 80vh;
  padding: 40px 0;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  padding: 32px 24px;
}
.faq-header {
  text-align: center;
  margin-bottom: 32px;
}
.title {
  font-size: 2.2rem;
  font-weight: bold;
  color: #333;
}
.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-top: 8px;
}
.search-wrap {
  margin: 0 auto;
  max-width: 400px;
  margin-top: 18px;
}
.faq-search {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
}
.faq-body {
  display: flex;
  gap: 32px;
}
.faq-categories {
  width: 220px;
  min-width: 160px;
}
.section-title {
  font-size: 1.32rem;
  margin-bottom: 12px;
  color: #007bff;
}
.cat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.cat-item {
  margin-bottom: 8px;
}
.cat-btn {
  background: #e9ecef;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 1.2rem;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}
.cat-item.active .cat-btn {
  background: #007bff;
  color: #fff;
}
.faq-list {
  flex: 1;
}
.list-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.faq-items {
  display: block;
  list-style: none;
  padding: 0;
  margin: 0;
}
.faq-item {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px 22px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.faq-q {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.faq-q-icon {
  background: #007bff;
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
}
.faq-q-text {
  font-size: 1.75rem;
  color: #222;
}
.faq-toggle {
  margin-left: 10px;
  font-size: 1.2rem;
  color: #007bff;
  font-weight: bold;
  transition: color 0.2s;
}
.faq-toggle.open {
  color: #28a745;
}
.faq-a {
  display: flex;
  align-items: center;
}
.faq-a-icon {
  background: #28a745;
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
}
.faq-a-text {
  font-size: 1.62rem;
  color: #333;
}
.empty-tip {
  color: #888;
  font-size: 1.1rem;
  padding: 32px 0;
  text-align: center;
  grid-column: 1 / -1;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@media (max-width: 900px) {
  .container {
    padding: 10px;
  }
  .faq-body {
    flex-direction: column;
    gap: 0;
  }
  .faq-categories {
    width: 100%;
    min-width: unset;
    margin-bottom: 24px;
  }
  .faq-items {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>