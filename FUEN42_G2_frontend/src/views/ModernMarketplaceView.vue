<template>
  <div class="modern-marketplace-view">
    <!-- Navigation Header -->
    <header class="main-header">
      <div class="container">
        <div class="header-content">
          <!-- Logo -->
          <div class="logo">
            <h1>BUY</h1>
          </div>
          
          <!-- Navigation Menu -->
          <nav class="main-nav">
            <div class="nav-item dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
              <a href="#" class="nav-link">
                商品
                <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </a>
              
              <!-- Dropdown Menu -->
              <div class="dropdown-menu" v-show="showDropdown">
                <div class="dropdown-content">
                  <div class="dropdown-section">
                    <h3>熱門類別</h3>
                    <div class="category-grid">
                      <div class="category-item">
                        <div class="category-icon">🔥</div>
                        <span>本周熱門商品</span>
                        <small>超多款式任你挑選</small>
                      </div>
                      <div class="category-item">
                        <div class="category-icon">⭐</div>
                        <span>你可能喜歡</span>
                        <small>個性化推薦商品</small>
                      </div>
                    </div>
                  </div>
                  
                  <div class="dropdown-section highlighted">
                    <div class="feature-item">
                      <div class="feature-icon">⭐</div>
                      <div class="feature-content">
                        <h4>全部商品</h4>
                        <p>瀏覽我們的完整分類</p>
                      </div>
                      <div class="feature-arrow">></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <a href="#" class="nav-link">品牌館</a>
            <a href="#" class="nav-link">優惠券</a>
            <a href="#" class="nav-link">客服中心</a>
          </nav>
          
          <!-- User Actions -->
          <div class="user-actions">
            <button class="search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.39zM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/>
              </svg>
            </button>
            <button class="cart-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4V2C7 1.45 7.45 1 8 1h8c.55 0 1 .45 1 1v2h5v2h-2v13c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6H2V4h5z"/>
              </svg>
            </button>
            <button class="login-btn">登入</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Banner Section -->
    <section class="hero-banner">
      <div class="banner-container">
        <!-- Main Carousel -->
        <div class="main-carousel">
          <div class="carousel-slide active" :style="{ backgroundImage: 'url(' + currentSlide.image + ')' }">
            <div class="slide-content">
              <h2>{{ currentSlide.title }}</h2>
              <p>{{ currentSlide.subtitle }}</p>
              <button class="cta-button">立即查看</button>
            </div>
          </div>
          
          <!-- Carousel Navigation -->
          <div class="carousel-nav">
            <button class="nav-btn prev" @click="prevSlide">❮</button>
            <button class="nav-btn next" @click="nextSlide">❯</button>
          </div>
          
          <!-- Carousel Indicators -->
          <div class="carousel-indicators">
            <button 
              v-for="(slide, index) in slides" 
              :key="index"
              class="indicator"
              :class="{ active: currentSlideIndex === index }"
              @click="goToSlide(index)"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <!-- Announcements Section -->
    <section class="announcements">
      <div class="container">
        <h2 class="section-title">最新公告</h2>
        <div class="announcement-list">
          <div v-for="announcement in announcements" :key="announcement.id" class="announcement-item">
            <span class="announcement-badge" :class="announcement.type">{{ announcement.badge }}</span>
            <span class="announcement-title">{{ announcement.title }}</span>
            <span class="announcement-date">{{ announcement.date }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Categories Section -->
    <section class="product-categories">
      <div class="container">
        <h2 class="section-title">商品分類</h2>
        <div class="category-grid">
          <div v-for="category in categories" :key="category.id" class="category-card">
            <div class="category-image">
              <img :src="category.image" :alt="category.name" />
            </div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.count }} 項商品</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="featured-products">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">熱門商品</h2>
          <div class="filter-tabs">
            <button 
              v-for="tab in filterTabs" 
              :key="tab.id"
              class="filter-tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </div>
        </div>
        
        <div class="products-grid">
          <div v-for="product in filteredProducts" :key="product.id" class="product-card">
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-discount" v-if="product.discount">
                {{ product.discount }}%折
              </div>
              <button class="wishlist-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
            
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-rating">
                <span class="stars">
                  <span v-for="i in 5" :key="i" :class="i <= product.rating ? 'star filled' : 'star'">★</span>
                </span>
                <span class="rating-text">{{ product.rating }}</span>
                <span class="review-count">({{ product.reviews }})</span>
              </div>
              <div class="product-price">
                <span class="current-price">NT$ {{ product.price.toLocaleString() }}</span>
                <span v-if="product.originalPrice" class="original-price">NT$ {{ product.originalPrice.toLocaleString() }}</span>
              </div>
              <div class="product-vendor">
                <span class="vendor-name">{{ product.vendor }}</span>
                <div class="vendor-rating">
                  <span>★</span>
                  <span>{{ product.vendorRating }}</span>
                </div>
              </div>
              <div class="product-actions">
                <button class="add-to-cart-btn">加入購物車</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="load-more">
          <button class="load-more-btn" @click="loadMoreProducts">查看更多商品</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Navigation dropdown state
const showDropdown = ref(false)

// Carousel data
const currentSlideIndex = ref(0)
const slides = ref([
  {
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    title: '春季特賣 5 折起',
    subtitle: '本週六、日 12:00-20:00 中庭廣場登場，消費滿額贈好禮',
  },
  {
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80', 
    title: '新品上市',
    subtitle: '最新商品搶先看，限時優惠中',
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    title: '免運優惠',
    subtitle: '全館免運費，滿額再享折扣',
  }
])

const currentSlide = computed(() => slides.value[currentSlideIndex.value])

// Announcements data
const announcements = ref([
  { id: 1, badge: '優惠', type: 'sale', title: '春節購物市集｜週末限定', date: '2025-08-05' },
  { id: 2, badge: '紫點', type: 'featured', title: '停車場動線優化公告', date: '2025-08-01' },
  { id: 3, badge: '重點', type: 'important', title: '會員點數 2 倍回饋', date: '2025-07-28' }
])

// Categories data
const categories = ref([
  { id: 1, name: '男生衣著', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', count: 1500 },
  { id: 2, name: '女生衣著', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', count: 2300 },
  { id: 3, name: '運動用品', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', count: 800 },
  { id: 4, name: '3C產品', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', count: 650 },
  { id: 5, name: '居家生活', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', count: 1200 },
  { id: 6, name: '美妝保養', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', count: 900 }
])

// Product filter tabs
const activeTab = ref('popular')
const filterTabs = ref([
  { id: 'popular', name: '熱門推薦' },
  { id: 'newest', name: '最新上架' },
  { id: 'discount', name: '特價商品' },
  { id: 'rating', name: '高評分' }
])

// Products data
const products = ref([
  {
    id: 1,
    name: '【台灣現貨】【主打冰涼】男生內褲 男士涼感透氣短褲',
    image: 'https://images.unsplash.com/photo-1624378515195-6bbdb73dff1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    price: 18,
    originalPrice: 25,
    discount: 28,
    rating: 4.8,
    reviews: 2000,
    vendor: '優質商家',
    vendorRating: 4.9,
    category: 'popular',
    sold: 5000
  },
  {
    id: 2,
    name: '台灣現貨【主打冰涼】男生內褲',
    image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    price: 15,
    originalPrice: 20,
    discount: 25,
    rating: 4.6,
    reviews: 6000,
    vendor: '優質賣家',
    vendorRating: 4.8,
    category: 'popular',
    sold: 8000
  },
  {
    id: 3,
    name: '台灣現貨【主打冰涼】男生內褲 男士涼感短褲',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    price: 23,
    originalPrice: 30,
    discount: 23,
    rating: 4.7,
    reviews: 5000,
    vendor: '品質保證',
    vendorRating: 4.9,
    category: 'popular',
    sold: 7000
  },
  {
    id: 4,
    name: '【免運▲6H出貨】男生內褲 純棉透氣四角褲',
    image: 'https://images.unsplash.com/photo-1566479179817-7a8f1ef94c65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    price: 9,
    originalPrice: 15,
    discount: 40,
    rating: 4.5,
    reviews: 7000,
    vendor: '快速出貨',
    vendorRating: 4.7,
    category: 'discount',
    sold: 10000
  },
  {
    id: 5,
    name: '【現貨/送▼整潔純白男內褲 透氣舒適',
    image: 'https://images.unsplash.com/photo-1502736020907-99a7b346c617?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    price: 2,
    originalPrice: 5,
    discount: 60,
    rating: 4.4,
    reviews: 3000,
    vendor: '特價專家',
    vendorRating: 4.6,
    category: 'discount',
    sold: 15000
  },
  {
    id: 6,
    name: '韓系休閒男裝 百搭素色T恤',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    price: 299,
    originalPrice: 399,
    discount: 25,
    rating: 4.9,
    reviews: 1500,
    vendor: '韓風小店',
    vendorRating: 4.8,
    category: 'newest',
    sold: 3000
  }
])

const filteredProducts = computed(() => {
  if (activeTab.value === 'popular') {
    return products.value.filter(p => p.sold > 5000)
  } else if (activeTab.value === 'discount') {
    return products.value.filter(p => p.discount > 20)
  } else if (activeTab.value === 'rating') {
    return products.value.filter(p => p.rating >= 4.7)
  } else {
    return products.value
  }
})

// Carousel methods
const nextSlide = () => {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % slides.value.length
}

const prevSlide = () => {
  currentSlideIndex.value = currentSlideIndex.value === 0 ? slides.value.length - 1 : currentSlideIndex.value - 1
}

const goToSlide = (index: number) => {
  currentSlideIndex.value = index
}

const loadMoreProducts = () => {
  // Simulate loading more products
  console.log('Loading more products...')
}

// Auto-play carousel
onMounted(() => {
  setInterval(() => {
    nextSlide()
  }, 5000)
})
</script>

<style scoped>
.modern-marketplace-view {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header Styles */
.main-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 8px 0;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #7cb342;
}

.dropdown-icon {
  transition: transform 0.2s;
}

.nav-item:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 16px;
  min-width: 400px;
  z-index: 1001;
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dropdown-section h3 {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.category-item:hover {
  background: #f8f9fa;
}

.category-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.category-item span {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.category-item small {
  color: #666;
  font-size: 12px;
}

.dropdown-section.highlighted {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  color: white;
  cursor: pointer;
}

.feature-icon {
  font-size: 20px;
  margin-right: 12px;
}

.feature-content {
  flex: 1;
}

.feature-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.feature-content p {
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
}

.feature-arrow {
  font-size: 18px;
  font-weight: bold;
}

/* User Actions */
.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-btn,
.cart-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.search-btn:hover,
.cart-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.login-btn {
  background: #7cb342;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover {
  background: #689f38;
}

/* Hero Banner */
.hero-banner {
  margin-bottom: 40px;
}

.banner-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-carousel {
  position: relative;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
}

.carousel-slide {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.carousel-slide::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.slide-content {
  text-align: center;
  color: white;
  z-index: 1;
  position: relative;
}

.slide-content h2 {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 12px 0;
}

.slide-content p {
  font-size: 16px;
  margin: 0 0 24px 0;
  opacity: 0.9;
}

.cta-button {
  background: #7cb342;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cta-button:hover {
  background: #689f38;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  pointer-events: none;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
  transition: all 0.2s;
  pointer-events: all;
}

.nav-btn:hover {
  background: white;
  transform: scale(1.1);
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background 0.2s;
}

.indicator.active {
  background: white;
}

/* Sections */
.announcements,
.product-categories,
.featured-products {
  background: white;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 24px 0;
  text-align: center;
}

/* Announcements */
.announcements {
  padding: 20px 0;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.announcement-badge.sale { background: #ff4757; }
.announcement-badge.featured { background: #5352ed; }
.announcement-badge.important { background: #ffa502; }

.announcement-title {
  flex: 1;
  color: #333;
  font-weight: 500;
}

.announcement-date {
  color: #666;
  font-size: 14px;
}

/* Categories */
.product-categories {
  padding: 40px 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.category-card {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  transition: transform 0.2s;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
}

.category-image {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  background: #f8f9fa;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.category-card p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* Products Section */
.featured-products {
  padding: 40px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #666;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.filter-tab.active,
.filter-tab:hover {
  background: #7cb342;
  color: white;
  border-color: #7cb342;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.product-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-discount {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #ff4757;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.wishlist-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.wishlist-btn:hover {
  background: white;
  color: #ff4757;
  transform: scale(1.1);
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 12px;
}

.stars {
  color: #fbbf24;
}

.star {
  color: #e5e7eb;
}

.star.filled {
  color: #fbbf24;
}

.rating-text {
  font-weight: 500;
  color: #333;
}

.review-count {
  color: #999;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff4757;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.product-vendor {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #666;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.vendor-name {
  font-weight: 500;
  color: #333;
}

.vendor-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #fbbf24;
}

.vendor-rating span:last-child {
  color: #666;
  margin-left: 2px;
}

.add-to-cart-btn {
  width: 100%;
  padding: 10px;
  background: #7cb342;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add-to-cart-btn:hover {
  background: #689f38;
}

.load-more {
  text-align: center;
}

.load-more-btn {
  padding: 12px 32px;
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .header-content {
    height: 56px;
  }
  
  .main-nav {
    display: none;
  }
  
  .main-carousel {
    height: 200px;
  }
  
  .slide-content h2 {
    font-size: 24px;
  }
  
  .slide-content p {
    font-size: 14px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-tabs {
    justify-content: center;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .dropdown-menu {
    min-width: 300px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .product-card {
    font-size: 13px;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
