<template>
	<main class="support-view">
		<div class="container">
			<header class="support-header">
				<h1 class="title">客服中心</h1>
				<p class="subtitle">有任何問題、建議或需要協助，歡迎隨時聯絡我們！</p>
			</header>
			<div class="support-content">
				<aside class="support-sidebar">
					<section class="contact-info card">
						<h3>聯絡方式</h3>
						<div class="contact-item">
							<div class="contact-title">客服電話</div>
							<div class="contact-value"><a href="tel:0800123456">0800-123-456</a></div>
						</div>
						<div class="contact-item">
							<div class="contact-title">客服信箱</div>
							<div class="contact-value"><a href="mailto:support@buyshop.com">support@buyshop.com</a></div>
						</div>
						<div class="contact-item">
							<div class="contact-title">服務時間</div>
							<div class="contact-value">週一至週日 09:00-21:00</div>
						</div>
					</section>
					<nav class="quick-actions card">
						<h3>客服功能導覽</h3>
						<router-link to="/support/create" class="action-btn">建立客服單</router-link>
						<router-link to="/support/faq" class="action-btn">常見問題</router-link>
						<router-link to="/support/list" class="action-btn">查看我的客服單列表</router-link>
					</nav>
					<section class="tips card">
						<h3>小提醒</h3>
						<ul class="tips-list">
							<li>請盡量詳述您的問題，方便客服快速協助。</li>
							<li>可於「我的客服單」追蹤處理進度與回覆。</li>
							<li>常見問題可先參考 FAQ，節省等待時間。</li>
							<li>如需緊急協助，請撥打客服電話。</li>
						</ul>
					</section>
				</aside>
				<section class="support-main">
					<div class="welcome card">
						<h2>歡迎來到客服中心</h2>
						<p>無論您有任何疑問、問題或建議，我們都樂於協助您解決。</p>
						<div class="feature-list">
							<div class="feature-item">
								<span class="feature-icon">📝</span>
								<div>
									<div class="feature-title">建立客服單</div>
									<div class="feature-desc">填寫問題描述，客服將盡快回覆。</div>
								</div>
							</div>
							<div class="feature-item">
								<span class="feature-icon">📋</span>
								<div>
									<div class="feature-title">查詢進度</div>
									<div class="feature-desc">隨時追蹤您的客服單處理狀態。</div>
								</div>
							</div>
							<div class="feature-item">
								<span class="feature-icon">💡</span>
								<div>
									<div class="feature-title">常見問題</div>
									<div class="feature-desc">快速搜尋 FAQ，立即獲得解答。</div>
								</div>
							</div>
							<div class="feature-item">
								<span class="feature-icon">📞</span>
								<div>
									<div class="feature-title">多元聯絡</div>
									<div class="feature-desc">電話、信箱、線上留言皆可聯繫。</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'

const ready = ref(false)

const allTickets = [
	{ id: 12, title: '包裝破損', status: '已關閉', createdAt: '2025-08-07' },
	{ id: 11, title: '退貨運費相關問題', status: '處理中', createdAt: '2025-08-08' },
	{ id: 10, title: '收到錯的商品', status: '已回覆', createdAt: '2025-08-09' }
]

const recentTickets = computed(() => {
	return [...allTickets].sort((a, b) => b.id - a.id).slice(0, 3)
})

const announcements = ref([
	{ id: 201, title: '客服系統將於 2025-09-01 凌晨維護，工單建立與查詢暫停', date: '2025-08-20', type: '系統' },
	{ id: 202, title: '客服服務時間延長：每日 09:00–21:30', date: '2025-08-18', type: '服務' },
	{ id: 203, title: '線上客服回覆體驗升級：新增工單狀態即時提醒', date: '2025-08-15', type: '更新' }
])

onMounted(() => {
	document.title = '客服中心 | BuyShop'
	requestAnimationFrame(() => { ready.value = true })
})
</script>

<style scoped>
.support-view {
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
.support-header {
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
.support-content {
  display: flex;
  gap: 32px;
}
.support-sidebar {
  width: 260px;
  min-width: 200px;
}
.card {
  background: #f1f1f1;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}
.contact-info h3,
.quick-actions h3,
.tips h3 {
  font-size: 1.1rem;
  margin-bottom: 12px;
  color: #007bff;
}
.contact-title {
  font-weight: bold;
  color: #555;
}
.contact-value {
  color: #222;
  font-size: 1rem;
  margin-bottom: 8px;
}
.action-btn {
  display: block;
  background: #007bff;
  color: #fff;
  border-radius: 6px;
  padding: 10px 0;
  text-align: center;
  margin-bottom: 10px;
  text-decoration: none;
  font-size: 1rem;
  transition: background 0.2s;
}
.action-btn:hover {
  background: #0056b3;
}
.tips-list {
  list-style: disc inside;
  color: #555;
  font-size: 0.98rem;
  padding-left: 12px;
}
.support-main {
  flex: 1;
}
.welcome.card {
  text-align: center;
  padding: 40px 24px;
}
.welcome h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 16px;
}
.welcome p {
  color: #555;
  font-size: 1.1rem;
  margin-bottom: 18px;
}
.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  margin-top: 24px;
}
.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 18px 24px;
  min-width: 220px;
  max-width: 320px;
}
.feature-icon {
  font-size: 2rem;
  margin-right: 8px;
}
.feature-title {
  font-weight: bold;
  color: #007bff;
  font-size: 1.08rem;
}
.feature-desc {
  color: #555;
  font-size: 0.98rem;
  margin-top: 2px;
}
@media (max-width: 900px) {
  .container {
    padding: 10px;
  }
  .support-content {
    flex-direction: column;
    gap: 0;
  }
  .support-sidebar {
    width: 100%;
    min-width: unset;
    margin-bottom: 24px;
  }
  .feature-list {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
}
</style>
