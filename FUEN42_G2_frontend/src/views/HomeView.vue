<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HeroSection from '@/components/home/HeroSection.vue'
import BannerCarousel from '@/components/home/BannerCarousel.vue'
import CategoryGrid from '@/components/home/CategoryGrid.vue'
import VendorGrid from '@/components/home/VendorGrid.vue'
import AnnouncementSection from '@/components/home/AnnouncementSection.vue'
import PopularProducts from '@/components/home/PopularProducts.vue'
import RecommendedProducts from '@/components/home/RecommendedProducts.vue'

const router = useRouter()
const userStore = useUserStore()

const featuredProducts = ref([])
const categories = ref([])

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userName = computed(() => userStore.user?.name || '會員')

// 會員中心快速連結
const memberLinks = [
  {
    title: '編輯個人資料',
    subtitle: '管理您的基本資訊',
    icon: '👤',
    route: '/member/profile',
    color: '#4F46E5'
  },
  {
    title: '收件地址管理',
    subtitle: '新增或編輯收件地址',
    icon: '📍',
    route: '/member/addresses',
    color: '#059669'
  },
  {
    title: '更改密碼',
    subtitle: '修改您的登入密碼',
    icon: '🔒',
    route: '/member/profile?tab=password',
    color: '#DC2626'
  },
  {
    title: '我的訂單',
    subtitle: '查看訂單狀態與歷史',
    icon: '📦',
    route: '/member/orders',
    color: '#7C3AED'
  }
]

// 導航到會員頁面
const navigateToMember = (route: string) => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  router.push(route)
}

onMounted(() => {
  // TODO: 從 API 載入資料
})
</script>

<template>
  <div class="home-view">
    <!-- 廣告輪播 -->
    <section class="banner-section">
      <BannerCarousel />
    </section>
    
    <!-- 公告區塊 -->
    <section class="announcements-section">
      <AnnouncementSection />
    </section>
    
    <!-- 分類 -->
    <section class="categories-section">
      <CategoryGrid :categories="categories" />
    </section>
    
    <!-- 本週熱門商品 -->
    <section class="popular-products-section">
      <PopularProducts :limit="6" />
    </section>
    
    <!-- 智能推薦商品 -->
    <section class="recommended-products-section">
      <RecommendedProducts :limit="6" title="你可能會喜歡" />
    </section>
    
    <!-- 熱門廠商 -->
    <section class="vendors-section">
      <VendorGrid />
    </section>
    
    <!-- 會員中心 -->
    <section class="member-center-section" v-if="isLoggedIn">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <span class="greeting-icon">👋</span>
            您好，{{ userName }}！
          </h2>
          <p class="section-subtitle">快速管理您的帳戶設定</p>
        </div>
        
        <div class="member-grid">
          <div 
            v-for="link in memberLinks" 
            :key="link.route"
            class="member-card"
            @click="navigateToMember(link.route)"
            :style="{ '--card-color': link.color }"
          >
            <div class="member-card-icon">{{ link.icon }}</div>
            <div class="member-card-content">
              <h3 class="member-card-title">{{ link.title }}</h3>
              <p class="member-card-subtitle">{{ link.subtitle }}</p>
            </div>
            <div class="member-card-arrow">→</div>
          </div>
        </div>
        
        <div class="member-center-footer">
          <router-link to="/member" class="view-all-link">
            查看完整會員中心
            <span class="arrow">→</span>
          </router-link>
        </div>
      </div>
    </section>
    
    <!-- 會員登入提示 (未登入時顯示) -->
    <section class="member-login-section" v-else>
      <div class="container">
        <div class="login-prompt">
          <div class="login-prompt-content">
            <div class="login-prompt-icon">🔐</div>
            <h2 class="login-prompt-title">登入享受完整服務</h2>
            <p class="login-prompt-subtitle">登入會員可管理個人資料、查看訂單、設定收件地址等</p>
            <div class="login-prompt-actions">
              <router-link to="/login" class="btn btn-primary">立即登入</router-link>
              <router-link to="/register" class="btn btn-outline">免費註冊</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    
    <!-- Hero區塊 -->
    <section class="hero-section">
      <HeroSection />
    </section>
  </div>
</template>

<style scoped>
@import '@/styles/variables.css';

.home-view {
  width: 100%;
  overflow-x: hidden;
}

/* 統一section間距 */
.home-view > section {
  position: relative;
}

.section-wrapper {
  padding: var(--space-20) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Banner區域 */
.banner-section {
  margin-bottom: 0;
  /* 讓banner緊貼頂部 */
  margin-top: 0;
}

/* 公告區域 - 白色背景 */
.announcements-section {
  background: var(--brand-white);
  padding: var(--space-3) 0;
  margin-bottom: var(--space-10);
}

/* 分類區域 - 淺灰背景 */
.categories-section {
  background: var(--gray-50);
  padding: var(--space-1) 0 var(--space-3) 0;
  margin-bottom: 0;
}

/* 熱門廠商區域 - 白色背景 */
.vendors-section {
  background: var(--brand-white);
  padding: var(--space-3) 0;
  margin-bottom: 0;
}

/* 本週熱門商品區域 */
.popular-products-section {
  margin-bottom: 0;
}

/* 會員中心區域 */
.member-center-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: var(--space-4) 0;
  margin-bottom: var(--space-3);
}

.member-center-section .container {
  color: white;
}

.member-center-section .section-header {
  text-align: center;
  margin-bottom: var(--space-4);
}

.member-center-section .section-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.greeting-icon {
  font-size: 1.5rem;
}

.member-center-section .section-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.member-card {
  background: white;
  border-radius: 16px;
  padding: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.member-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--card-color, #4F46E5);
}

.member-card-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-color, #4F46E5);
  color: white;
  border-radius: 12px;
  flex-shrink: 0;
}

.member-card-content {
  flex: 1;
  color: var(--gray-800);
}

.member-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--space-1);
  color: var(--gray-900);
}

.member-card-subtitle {
  font-size: 0.9rem;
  color: var(--gray-600);
  line-height: 1.4;
}

.member-card-arrow {
  font-size: 1.2rem;
  color: var(--card-color, #4F46E5);
  font-weight: bold;
  transition: transform 0.3s ease;
}

.member-card:hover .member-card-arrow {
  transform: translateX(4px);
}

.member-center-footer {
  text-align: center;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: var(--space-2) var(--space-4);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.view-all-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.view-all-link .arrow {
  transition: transform 0.3s ease;
}

.view-all-link:hover .arrow {
  transform: translateX(4px);
}

/* 會員登入提示區域 */
.member-login-section {
  background: var(--gray-50);
  padding: var(--space-4) 0;
  margin-bottom: var(--space-3);
}

.login-prompt {
  background: white;
  border-radius: 16px;
  padding: var(--space-5);
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--gray-200);
}

.login-prompt-icon {
  font-size: 3rem;
  margin-bottom: var(--space-3);
}

.login-prompt-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.login-prompt-subtitle {
  color: var(--gray-600);
  margin-bottom: var(--space-4);
  line-height: 1.5;
}

.login-prompt-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: var(--space-2) var(--space-4);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 120px;
  text-align: center;
}

.btn-primary {
  background: var(--primary-color, #4F46E5);
  color: white;
  border: 2px solid var(--primary-color, #4F46E5);
}

.btn-primary:hover {
  background: var(--primary-dark, #3730A3);
  border-color: var(--primary-dark, #3730A3);
}

.btn-outline {
  background: transparent;
  color: var(--primary-color, #4F46E5);
  border: 2px solid var(--primary-color, #4F46E5);
}

.btn-outline:hover {
  background: var(--primary-color, #4F46E5);
  color: white;
}

/* Hero區域 - 淺灰背景 */
.hero-section {
  background: var(--gray-50);
  padding: var(--space-3) 0;
}

/* 統一標題樣式 */
.section-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  text-align: center;
  margin-bottom: var(--space-3);
  letter-spacing: var(--tracking-tight);
}

.section-subtitle {
  font-size: var(--text-lg);
  color: var(--gray-500);
  text-align: center;
  margin-bottom: var(--space-10);
  font-weight: var(--font-regular);
}

/* 沒有副標題時的標題樣式 */
.section-title:only-child {
  margin-bottom: var(--space-8);
}


/* 響應式設計 */
@media (max-width: 768px) {
  .section-wrapper {
    padding: var(--space-12) 0;
  }
  
  .categories-section .section-wrapper {
    padding: var(--space-12) 0;
  }
  
  .container {
    padding: 0 var(--space-4);
  }
  
  .section-title {
    font-size: var(--text-2xl);
  }
  
  .section-subtitle {
    font-size: var(--text-base);
    margin-bottom: var(--space-6);
  }
  
  .home-view > section {
    margin-bottom: var(--space-8);
  }
  
  .hero-section {
    margin-bottom: var(--space-10);
  }
}

/* 平滑滾動效果 */
@media (prefers-reduced-motion: no-preference) {
  .home-view {
    scroll-behavior: smooth;
  }
  
  .section-wrapper {
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  .announcements-section .section-wrapper {
    animation-delay: 0.1s;
  }
  
  .categories-section .section-wrapper {
    animation-delay: 0.2s;
  }
  
  .vendors-section .section-wrapper {
    animation-delay: 0.3s;
  }
  
  .popular-products-section .section-wrapper {
    animation-delay: 0.4s;
  }
  
  .recommended-products-section .section-wrapper {
    animation-delay: 0.5s;
  }
  
  .hero-section .section-wrapper {
    animation-delay: 0.6s;
  }
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 提升視覺層次感 */
.categories-section {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.products-section {
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.02);
}

.announcements-section {
  border-top: 1px solid var(--gray-200);
}
</style>