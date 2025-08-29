<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('colors')
const showNotification = ref(false)
const loading = ref(false)

const handlePrimaryClick = () => {
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const handleLoadingClick = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <div class="design-system">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">BUY 設計系統</h1>
        <p class="hero-subtitle">簡潔、優雅、一致的購物體驗</p>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <nav class="tabs">
      <div class="container">
        <button 
          class="tab" 
          :class="{ active: activeTab === 'colors' }"
          @click="activeTab = 'colors'"
        >
          色彩
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'typography' }"
          @click="activeTab = 'typography'"
        >
          文字
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'components' }"
          @click="activeTab = 'components'"
        >
          組件
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'cards' }"
          @click="activeTab = 'cards'"
        >
          卡片
        </button>
      </div>
    </nav>

    <!-- Content Sections -->
    <div class="container content">
      <!-- Colors Section -->
      <section v-if="activeTab === 'colors'" class="section">
        <h2 class="section-title">色彩系統</h2>
        
        <div class="color-group">
          <h3 class="group-title">主要色彩</h3>
          <div class="color-grid">
            <div class="color-card">
              <div class="color-sample" style="background: #1d1d1f;"></div>
              <div class="color-info">
                <p class="color-name">Ink Black</p>
                <p class="color-code">#1d1d1f</p>
              </div>
            </div>
            <div class="color-card">
              <div class="color-sample" style="background: #FFCC00;"></div>
              <div class="color-info">
                <p class="color-name">Brand Yellow</p>
                <p class="color-code">#FFCC00</p>
              </div>
            </div>
            <div class="color-card">
              <div class="color-sample" style="background: #007AFF;"></div>
              <div class="color-info">
                <p class="color-name">System Blue</p>
                <p class="color-code">#007AFF</p>
              </div>
            </div>
            <div class="color-card">
              <div class="color-sample" style="background: #34C759;"></div>
              <div class="color-info">
                <p class="color-name">Success Green</p>
                <p class="color-code">#34C759</p>
              </div>
            </div>
          </div>
        </div>

        <div class="color-group">
          <h3 class="group-title">中性色</h3>
          <div class="color-grid">
            <div class="color-card">
              <div class="color-sample" style="background: #48484a;"></div>
              <div class="color-info">
                <p class="color-name">Gray 700</p>
                <p class="color-code">#48484a</p>
              </div>
            </div>
            <div class="color-card">
              <div class="color-sample" style="background: #86868b;"></div>
              <div class="color-info">
                <p class="color-name">Gray 500</p>
                <p class="color-code">#86868b</p>
              </div>
            </div>
            <div class="color-card">
              <div class="color-sample" style="background: #c7c7cc;"></div>
              <div class="color-info">
                <p class="color-name">Gray 300</p>
                <p class="color-code">#c7c7cc</p>
              </div>
            </div>
            <div class="color-card">
              <div class="color-sample" style="background: #f2f2f7;"></div>
              <div class="color-info">
                <p class="color-name">Gray 100</p>
                <p class="color-code">#f2f2f7</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Typography Section -->
      <section v-if="activeTab === 'typography'" class="section">
        <h2 class="section-title">文字系統</h2>
        
        <div class="type-demo">
          <div class="type-sample">
            <h1 class="heading-1">標題一 Heading 1</h1>
            <p class="type-spec">48px / Bold / -0.02em</p>
          </div>
          
          <div class="type-sample">
            <h2 class="heading-2">標題二 Heading 2</h2>
            <p class="type-spec">32px / Semibold</p>
          </div>
          
          <div class="type-sample">
            <h3 class="heading-3">標題三 Heading 3</h3>
            <p class="type-spec">24px / Semibold</p>
          </div>
          
          <div class="type-sample">
            <p class="body-large">大型內文 Body Large</p>
            <p class="type-spec">18px / Regular</p>
          </div>
          
          <div class="type-sample">
            <p class="body">一般內文 Body Regular - 這是用於大部分內容的標準文字大小，確保良好的可讀性。</p>
            <p class="type-spec">16px / Regular / 1.5 line-height</p>
          </div>
          
          <div class="type-sample">
            <p class="caption">輔助說明 Caption Text</p>
            <p class="type-spec">14px / Regular / Gray 500</p>
          </div>
        </div>
      </section>

      <!-- Components Section -->
      <section v-if="activeTab === 'components'" class="section">
        <h2 class="section-title">組件系統</h2>
        
        <!-- Buttons -->
        <div class="component-group">
          <h3 class="group-title">按鈕 Buttons</h3>
          <div class="button-grid">
            <button class="btn btn-primary" @click="handlePrimaryClick">主要按鈕</button>
            <button class="btn btn-secondary">次要按鈕</button>
            <button class="btn btn-ghost">文字按鈕</button>
            <button class="btn btn-primary" disabled>禁用狀態</button>
          </div>
          
          <div class="button-grid mt-4">
            <button class="btn btn-primary btn-large">大型按鈕</button>
            <button class="btn btn-primary">標準按鈕</button>
            <button class="btn btn-primary btn-small">小型按鈕</button>
          </div>

          <div class="button-grid mt-4">
            <button class="btn btn-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="btn btn-primary btn-loading" @click="handleLoadingClick" :disabled="loading">
              <span v-if="!loading">點擊載入</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </div>

        <!-- Input Fields -->
        <div class="component-group">
          <h3 class="group-title">輸入框 Input Fields</h3>
          <div class="input-demo">
            <div class="form-group">
              <label class="label">電子郵件</label>
              <input type="email" class="input" placeholder="請輸入您的電子郵件">
            </div>
            
            <div class="form-group">
              <label class="label">密碼</label>
              <input type="password" class="input" placeholder="請輸入密碼">
              <p class="helper-text">密碼至少需要8個字元</p>
            </div>
            
            <div class="form-group">
              <label class="label">搜尋</label>
              <div class="input-with-icon">
                <input type="text" class="input" placeholder="搜尋商品...">
                <span class="input-icon">🔍</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="component-group">
          <h3 class="group-title">標籤 Tags</h3>
          <div class="tag-demo">
            <span class="tag">預設標籤</span>
            <span class="tag tag-primary">主要標籤</span>
            <span class="tag tag-success">成功標籤</span>
            <span class="tag tag-warning">警告標籤</span>
            <span class="tag tag-danger">危險標籤</span>
          </div>
        </div>

        <!-- Notification -->
        <div v-if="showNotification" class="notification">
          <span>✓ 操作成功完成</span>
        </div>
      </section>

      <!-- Cards Section -->
      <section v-if="activeTab === 'cards'" class="section">
        <h2 class="section-title">卡片系統</h2>
        
        <!-- Product Cards -->
        <div class="card-grid">
          <div class="product-card">
            <div class="product-image">
              <div class="image-placeholder">
                <span class="tag tag-primary tag-new">NEW</span>
              </div>
            </div>
            <div class="product-content">
              <h3 class="product-name">極簡設計筆記本</h3>
              <p class="product-description">高品質紙張，適合書寫與繪圖</p>
              <div class="product-footer">
                <span class="product-price">NT$ 580</span>
                <button class="btn btn-primary btn-small">加入購物車</button>
              </div>
            </div>
          </div>

          <div class="product-card">
            <div class="product-image">
              <div class="image-placeholder"></div>
            </div>
            <div class="product-content">
              <h3 class="product-name">無線藍牙耳機</h3>
              <p class="product-description">主動降噪，長效續航</p>
              <div class="product-footer">
                <span class="product-price">
                  <span class="price-original">NT$ 3,990</span>
                  <span class="price-sale">NT$ 2,990</span>
                </span>
                <button class="btn btn-secondary btn-small">查看詳情</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Cards -->
        <div class="info-cards">
          <div class="info-card">
            <div class="info-icon">📦</div>
            <h4 class="info-title">免費配送</h4>
            <p class="info-text">滿 NT$ 1,000 即享免運費</p>
          </div>
          
          <div class="info-card">
            <div class="info-icon">🔒</div>
            <h4 class="info-title">安全支付</h4>
            <p class="info-text">SSL 加密保護您的資料</p>
          </div>
          
          <div class="info-card">
            <div class="info-icon">↩️</div>
            <h4 class="info-title">30天退貨</h4>
            <p class="info-text">不滿意可無條件退貨</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* CSS Variables */
:root {
  /* Colors */
  --ink: #1d1d1f;
  --gray-700: #48484a;
  --gray-500: #86868b;
  --gray-300: #c7c7cc;
  --gray-100: #f2f2f7;
  --gray-50: #fbfbfd;
  
  --brand-yellow: #FFCC00;
  --system-blue: #007AFF;
  --system-green: #34C759;
  --system-orange: #FF9500;
  --system-red: #FF3B30;
  
  /* Typography */
  --font-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  
  /* Animation */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}

.design-system {
  min-height: 100vh;
  background: white;
  font-family: var(--font-system);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--space-20) 0;
  text-align: center;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-4);
}

.hero-subtitle {
  font-size: 20px;
  font-weight: 400;
  opacity: 0.9;
}

/* Tabs */
.tabs {
  background: white;
  border-bottom: 1px solid var(--gray-100);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

.tabs .container {
  display: flex;
  gap: var(--space-8);
  padding: 0 var(--space-6);
}

.tab {
  padding: var(--space-4) 0;
  background: none;
  border: none;
  color: var(--gray-500);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: var(--ink);
}

.tab.active {
  color: var(--ink);
  border-bottom-color: var(--ink);
}

/* Content */
.content {
  padding: var(--space-12) var(--space-6);
}

.section {
  animation: fadeIn var(--duration-slow) var(--ease-out);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: var(--space-8);
}

.group-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: var(--space-5);
}

/* Color Section */
.color-group {
  margin-bottom: var(--space-12);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
}

.color-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--gray-100);
  transition: all var(--duration-base) var(--ease-out);
}

.color-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.color-sample {
  height: 120px;
  width: 100%;
}

.color-info {
  padding: var(--space-4);
}

.color-name {
  font-weight: 600;
  color: var(--ink);
  margin-bottom: var(--space-1);
}

.color-code {
  font-size: 14px;
  color: var(--gray-500);
  font-family: 'SF Mono', monospace;
}

/* Typography Section */
.type-demo {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.type-sample {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--gray-100);
}

.heading-1 {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: var(--space-2);
}

.heading-2 {
  font-size: 32px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: var(--space-2);
}

.heading-3 {
  font-size: 24px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: var(--space-2);
}

.body-large {
  font-size: 18px;
  color: var(--ink);
  margin-bottom: var(--space-2);
}

.body {
  font-size: 16px;
  line-height: 1.5;
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}

.caption {
  font-size: 14px;
  color: var(--gray-500);
  margin-bottom: var(--space-2);
}

.type-spec {
  font-size: 12px;
  color: var(--gray-500);
  font-family: 'SF Mono', monospace;
}

/* Components Section */
.component-group {
  margin-bottom: var(--space-12);
}

.button-grid {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  align-items: center;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  font-family: var(--font-system);
}

.btn-primary {
  background: var(--ink);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--gray-700);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: white;
  color: var(--ink);
  border: 1px solid var(--gray-300);
}

.btn-secondary:hover {
  background: var(--gray-50);
  border-color: var(--ink);
}

.btn-ghost {
  background: transparent;
  color: var(--system-blue);
  padding: 8px 16px;
}

.btn-ghost:hover {
  background: rgba(0, 122, 255, 0.08);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
  min-height: 52px;
}

.btn-small {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.btn-icon {
  padding: 10px;
  min-height: 40px;
  width: 40px;
  background: white;
  border: 1px solid var(--gray-300);
}

.btn-icon:hover {
  background: var(--gray-50);
}

.btn-loading {
  position: relative;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Input Fields */
.input-demo {
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: all var(--duration-base) var(--ease-out);
  min-height: 44px;
  font-family: var(--font-system);
}

.input:focus {
  outline: none;
  border-color: var(--system-blue);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.input::placeholder {
  color: var(--gray-500);
}

.helper-text {
  font-size: 12px;
  color: var(--gray-500);
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
}

/* Tags */
.tag-demo {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  background: var(--gray-100);
  color: var(--gray-700);
  transition: all var(--duration-fast) var(--ease-out);
}

.tag-primary {
  background: var(--brand-yellow);
  color: var(--ink);
}

.tag-success {
  background: rgba(52, 199, 89, 0.1);
  color: var(--system-green);
}

.tag-warning {
  background: rgba(255, 149, 0, 0.1);
  color: var(--system-orange);
}

.tag-danger {
  background: rgba(255, 59, 48, 0.1);
  color: var(--system-red);
}

.tag-new {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
}

/* Cards */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all var(--duration-base) var(--ease-out);
  border: 1px solid var(--gray-100);
}

.product-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.product-image {
  position: relative;
  padding-top: 100%;
  background: var(--gray-50);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-50) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: var(--gray-300);
}

.product-content {
  padding: var(--space-5);
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: var(--space-2);
}

.product-description {
  font-size: 14px;
  color: var(--gray-500);
  margin-bottom: var(--space-4);
  line-height: 1.5;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
}

.price-original {
  font-size: 16px;
  color: var(--gray-500);
  text-decoration: line-through;
  margin-right: var(--space-2);
}

.price-sale {
  color: var(--system-red);
}

/* Info Cards */
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

.info-card {
  text-align: center;
  padding: var(--space-8) var(--space-6);
  background: var(--gray-50);
  border-radius: 16px;
  transition: all var(--duration-base) var(--ease-out);
}

.info-card:hover {
  background: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.info-icon {
  font-size: 48px;
  margin-bottom: var(--space-4);
}

.info-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: var(--space-2);
}

.info-text {
  font-size: 14px;
  color: var(--gray-500);
  line-height: 1.5;
}

/* Notification */
.notification {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  background: var(--ink);
  color: white;
  padding: var(--space-4) var(--space-6);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: slideIn var(--duration-slow) var(--ease-out);
  z-index: 1000;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Utilities */
.mt-4 {
  margin-top: var(--space-4);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 40px;
  }
  
  .tabs .container {
    overflow-x: auto;
    padding: 0 var(--space-4);
  }
  
  .content {
    padding: var(--space-8) var(--space-4);
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
  }
}
</style>