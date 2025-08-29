<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentYear = computed(() => new Date().getFullYear())

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>BUY</h3>
          <p>連接企業與消費者的全方位商業平台</p>
        </div>
        <div class="footer-section">
          <h4>購物指南</h4>
          <a @click="navigateTo('/help/how-to-buy')">如何購買</a>
          <a @click="navigateTo('/help/shipping')">配送資訊</a>
          <a @click="navigateTo('/help/return-policy')">退換貨政策</a>
        </div>
        <div class="footer-section">
          <h4>賣家中心</h4>
          <a @click="navigateTo('/seller/register')">成為賣家</a>
          <a @click="navigateTo('/seller/dashboard')">賣家後台</a>
          <a @click="navigateTo('/seller/policy')">賣家政策</a>
        </div>
        <div class="footer-section">
          <h4>客戶服務</h4>
          <a @click="navigateTo('/contact')">聯絡我們</a>
          <a @click="navigateTo('/faq')">常見問題</a>
          <a @click="navigateTo('/feedback')">意見回饋</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© {{ currentYear }} BUY. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #1d1d1f;
  color: #fff;
  padding: 50px 0 26px;
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 28px;
  margin-bottom: 18px;
}

.footer-section h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}

.footer-section h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #f5f5f7;
}

.footer-section p,
.footer-section a {
  color: #c8c8cc;
}

.footer-section a {
  display: block;
  text-decoration: none;
  margin-bottom: 6px;
  cursor: pointer;
  transition: color 0.2s;
}

.footer-section a:hover {
  color: #fff;
}

.footer-bottom {
  text-align: center;
  padding-top: 18px;
  border-top: 1px solid #424245;
}

.footer-bottom p {
  color: #c8c8cc;
  font-size: 14px;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>