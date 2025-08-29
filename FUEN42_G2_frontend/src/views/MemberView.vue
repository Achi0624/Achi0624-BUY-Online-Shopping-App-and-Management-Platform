<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const userName = computed(() => userStore.user?.name || '會員')

// 側邊欄選單項目
const menuItems = [
  {
    title: '個人資料',
    icon: '👤',
    route: '/member/profile',
    description: '編輯基本資訊'
  },
  {
    title: '地址管理',
    icon: '📍',
    route: '/member/addresses',
    description: '管理收件地址'
  },
  {
    title: '我的訂單',
    icon: '📦',
    route: '/member/orders',
    description: '查看訂單狀態'
  }
]
</script>

<template>
  <div class="member-view">
    <div class="container">
      <div class="member-header">
        <h1>會員中心</h1>
        <p class="welcome-text">歡迎回來，{{ userName }}！</p>
      </div>
      
      <div class="member-content">
        <aside class="member-sidebar">
          <!-- 用戶資訊卡片 -->
          <div class="user-card">
            <div class="user-avatar">
              <span class="avatar-icon">👤</span>
            </div>
            <div class="user-info">
              <h3 class="user-name">{{ userName }}</h3>
              <p class="user-level">{{ userStore.user?.memberLevel?.name || '一般會員' }}</p>
            </div>
          </div>
          
          <!-- 導航選單 -->
          <nav class="member-nav">
            <router-link 
              v-for="item in menuItems" 
              :key="item.route"
              :to="item.route" 
              class="nav-item"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <div class="nav-content">
                <span class="nav-title">{{ item.title }}</span>
                <span class="nav-description">{{ item.description }}</span>
              </div>
              <span class="nav-arrow">→</span>
            </router-link>
          </nav>
          
          <!-- 快速操作 -->
          <div class="quick-actions">
            <h4>快速操作</h4>
            <div class="action-buttons">
              <router-link to="/member/profile?tab=password" class="action-btn">
                <span class="action-icon">🔒</span>
                變更密碼
              </router-link>
              <router-link to="/member/orders" class="action-btn">
                <span class="action-icon">📦</span>
                最近訂單
              </router-link>
            </div>
          </div>
        </aside>
        
        <main class="member-main">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.member-view {
  min-height: calc(100vh - 120px);
  padding: 40px 0;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.member-header {
  text-align: center;
  margin-bottom: 40px;
}

.member-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.welcome-text {
  color: #6b7280;
  font-size: 1.1rem;
}

.member-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 40px;
  align-items: start;
}

.member-sidebar {
  background: white;
  border-radius: 16px;
  padding: 0;
  height: fit-content;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

/* 用戶資訊卡片 */
.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 1.5rem;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-level {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

/* 導航選單 */
.member-nav {
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  text-decoration: none;
  color: #374151;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.nav-item:hover {
  background: #f3f4f6;
  border-left-color: #667eea;
}

.nav-item.router-link-active {
  background: #eff6ff;
  border-left-color: #667eea;
  color: #1d4ed8;
}

.nav-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-title {
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-description {
  font-size: 0.8rem;
  color: #6b7280;
}

.nav-arrow {
  color: #9ca3af;
  transition: transform 0.3s ease;
}

.nav-item:hover .nav-arrow {
  transform: translateX(4px);
  color: #667eea;
}

/* 快速操作 */
.quick-actions {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.quick-actions h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.action-icon {
  font-size: 1rem;
}

/* 主要內容區域 */
.member-main {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  min-height: 600px;
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .member-content {
    grid-template-columns: 280px 1fr;
    gap: 30px;
  }
  
  .member-sidebar {
    position: sticky;
    top: 100px;
  }
}

@media (max-width: 768px) {
  .member-view {
    padding: 20px 0;
  }
  
  .member-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .member-sidebar {
    position: static;
  }
  
  .member-main {
    padding: 24px;
  }
  
  .user-card {
    padding: 20px;
  }
  
  .nav-item {
    padding: 14px 20px;
  }
  
  .quick-actions {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }
  
  .member-header h1 {
    font-size: 2rem;
  }
  
  .user-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}
</style>