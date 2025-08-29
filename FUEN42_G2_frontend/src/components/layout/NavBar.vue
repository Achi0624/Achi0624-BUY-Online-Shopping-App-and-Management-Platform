<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/modules/cart'
import userBehaviorTracker from '@/utils/userBehaviorTracker'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const showSearch = ref(false)
const searchQuery = ref('')
const showProductsDropdown = ref(false)
const showMemberDropdown = ref(false)

const cartCount = computed(() => cartStore.itemCount)
const isLoggedIn = computed(() => userStore.isLoggedIn)

async function handleSearch() {
  if (searchQuery.value) {
    // 追蹤搜尋行為
    try {
      // 暫時設定結果數量為0，實際應該從搜尋結果頁面回傳
      userBehaviorTracker.trackSearch(searchQuery.value, 0)
    } catch (error) {
      console.error('搜尋追蹤失敗:', error)
    }
    
    router.push({ name: 'products', query: { q: searchQuery.value } })
    showSearch.value = false
    searchQuery.value = ''
  }
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}

function closeDropdowns() {
  showProductsDropdown.value = false
  showMemberDropdown.value = false
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo">
        <router-link to="/" class="logo-link">
          <h1>BUY</h1>
        </router-link>
      </div>
      
      <div class="nav-menu">
        <div class="nav-dropdown" @mouseenter="showProductsDropdown = true" @mouseleave="showProductsDropdown = false">
          <span class="nav-link dropdown-trigger non-clickable">
            商品
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="dropdown-arrow">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <div class="dropdown-menu" :class="{ show: showProductsDropdown }">
            <div class="dropdown-content">
              <div class="dropdown-section">
                <h4 class="dropdown-title">熱門推薦</h4>
                <router-link to="/products?category=hot" class="dropdown-item" @click="closeDropdowns">
                  <div class="item-icon">🔥</div>
                  <div class="item-info">
                    <span class="item-name">本周熱門商品</span>
                    <span class="item-desc">最受歡迎的商品推薦</span>
                  </div>
                </router-link>
                <router-link to="/products?category=recommended" class="dropdown-item" @click="closeDropdowns">
                  <div class="item-icon">✨</div>
                  <div class="item-info">
                    <span class="item-name">你可能喜歡</span>
                    <span class="item-desc">個性化推薦商品</span>
                  </div>
                </router-link>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-section">
                <router-link to="/products" class="dropdown-item featured" @click="closeDropdowns">
                  <div class="item-icon">🛍️</div>
                  <div class="item-info">
                    <span class="item-name">全部商品</span>
                    <span class="item-desc">瀏覽所有商品分類</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="item-arrow">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <router-link to="/brands" class="nav-link">品牌館</router-link>
        <router-link to="/coupons" class="nav-link">優惠券</router-link>
        <router-link to="/support" class="nav-link">客服中心</router-link>
        
        <!-- 會員中心下拉選單 -->
        <div class="nav-dropdown" @mouseenter="showMemberDropdown = true" @mouseleave="showMemberDropdown = false">
          <router-link 
            :to="isLoggedIn ? '/member' : '/login'" 
            class="nav-link dropdown-trigger"
            :title="isLoggedIn ? '會員中心' : '登入後進入會員中心'"
          >
            會員中心
            <svg v-if="isLoggedIn" width="12" height="12" viewBox="0 0 12 12" fill="none" class="dropdown-arrow">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </router-link>
          
          <!-- 只有登入用戶才顯示下拉選單 -->
          <div v-if="isLoggedIn" class="dropdown-menu" :class="{ show: showMemberDropdown }">
            <div class="dropdown-content">
              <div class="dropdown-section">
                <h4 class="dropdown-title">個人設定</h4>
                <router-link to="/member/profile" class="dropdown-item" @click="closeDropdowns">
                  <div class="item-icon">👤</div>
                  <div class="item-info">
                    <span class="item-name">編輯個人資訊</span>
                    <span class="item-desc">修改基本資料和聯絡方式</span>
                  </div>
                </router-link>
                <router-link to="/member/addresses" class="dropdown-item" @click="closeDropdowns">
                  <div class="item-icon">📍</div>
                  <div class="item-info">
                    <span class="item-name">編輯收件地址</span>
                    <span class="item-desc">管理收件地址簿</span>
                  </div>
                </router-link>
                <router-link to="/member/profile?tab=password" class="dropdown-item" @click="closeDropdowns">
                  <div class="item-icon">🔒</div>
                  <div class="item-info">
                    <span class="item-name">更改密碼</span>
                    <span class="item-desc">修改登入密碼</span>
                  </div>
                </router-link>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-section">
                <router-link to="/member/orders" class="dropdown-item" @click="closeDropdowns">
                  <div class="item-icon">📦</div>
                  <div class="item-info">
                    <span class="item-name">我的訂單</span>
                    <span class="item-desc">查看訂單狀態與歷史</span>
                  </div>
                </router-link>
                <router-link to="/member" class="dropdown-item featured" @click="closeDropdowns">
                  <div class="item-icon">🏠</div>
                  <div class="item-info">
                    <span class="item-name">會員中心首頁</span>
                    <span class="item-desc">前往完整會員中心</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="item-arrow">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="nav-actions">
        <button class="search-btn" @click="showSearch = !showSearch">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        
        <router-link to="/cart" class="cart-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <!-- 袋子主體 -->
            <path d="M4 8h16v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8z"></path>
            <!-- 手提把 -->
            <path d="M7 8V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2"></path>
          </svg>
          <span v-if="cartCount > 0" class="cart-count">{{ cartCount }}</span>
        </router-link>
        
        <template v-if="isLoggedIn">
          <router-link to="/member" class="user-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </router-link>
          <button class="logout-btn" @click="handleLogout">登出</button>
        </template>
        <router-link v-else to="/login" class="login-btn">登入</router-link>
      </div>
    </div>
    
    <div v-if="showSearch" class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜尋商品..."
        @keyup.enter="handleSearch"
        class="search-input"
      >
      <button @click="handleSearch" class="search-submit">搜尋</button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.nav-logo h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #1d1d1f;
  font-size: 14px;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #007AFF;
}

.nav-link.non-clickable {
  cursor: default;
}

.nav-link.non-clickable:hover {
  color: #1d1d1f;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-btn,
.cart-btn,
.user-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #1d1d1f;
}

.search-btn:hover,
.cart-btn:hover,
.user-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.cart-count {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #FF3B30;
  color: white;
  border-radius: 999px;
  width: 18px;
  height: 18px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn,
.logout-btn {
  background: #007AFF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover,
.logout-btn:hover {
  background: #0056CC;
}

.search-bar {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 20px;
  display: flex;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.search-submit {
  padding: 8px 20px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

/* 下拉選單樣式 */
.nav-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
}

.nav-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  min-width: 280px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-content {
  padding: 16px;
}

.dropdown-section {
  margin-bottom: 8px;
}

.dropdown-section:last-child {
  margin-bottom: 0;
}

.dropdown-title {
  font-size: 12px;
  font-weight: 600;
  color: #86868b;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #1d1d1f;
  transition: all 0.2s ease;
  position: relative;
}

.dropdown-item:hover {
  background: rgba(0, 0, 0, 0.04);
  transform: translateX(2px);
}

.dropdown-item.featured {
  background: #f5f5f7;
  color: #1d1d1f;
  margin-top: 8px;
}

.dropdown-item.featured:hover {
  background: #e8e8ed;
  transform: translateX(2px) scale(1.02);
}

.item-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.dropdown-item.featured .item-icon {
  background: rgba(0, 0, 0, 0.08);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
}

.item-desc {
  font-size: 12px;
  opacity: 0.7;
  line-height: 1.3;
}

.item-arrow {
  opacity: 0.6;
  transition: all 0.2s ease;
}

.dropdown-item:hover .item-arrow {
  opacity: 1;
  transform: translateX(2px);
}

.dropdown-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 12px 0;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .dropdown-menu {
    left: -50px;
    min-width: 250px;
  }
}
</style>