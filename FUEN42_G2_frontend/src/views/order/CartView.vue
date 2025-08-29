<template>
  <div class="cart-view">
    <div class="container">
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1>購物車</h1>
        <div class="breadcrumb">
          <router-link to="/">首頁</router-link>
          <span class="separator">></span>
          <span class="current">購物車</span>
        </div>
      </div>

      <!-- 購物車內容 -->
      <div v-if="!cartStore.isEmpty" class="cart-content">
        <div class="cart-main">
          <!-- 全選控制 -->
          <div class="select-all">
            <label class="select-all-label">
              <input 
                type="checkbox" 
                :checked="allSelected"
                :indeterminate="someSelected"
                @change="toggleSelectAll"
              >
              <span>全選 ({{ (cartStore.availableItems || []).length }})</span>
            </label>
            
            <div class="bulk-actions">
              <button 
                v-if="selectedItems.length > 0"
                class="btn-secondary"
                @click="removeSelected"
              >
                刪除選中商品 ({{ selectedItems.length }})
              </button>
            </div>
          </div>

          <!-- 按廠商分組顯示商品 -->
          <div class="vendor-groups">
            <div 
              v-for="group in (cartStore.itemsByVendor || [])" 
              :key="group.vendor.id"
              class="vendor-group"
            >
              <!-- 廠商標題 -->
              <div class="vendor-header">
                <label class="vendor-select">
                  <input 
                    type="checkbox" 
                    :checked="isVendorSelected(group.vendor.id)"
                    :indeterminate="isVendorPartialSelected(group.vendor.id)"
                    @change="toggleVendorSelect(group.vendor.id)"
                  >
                  <span class="vendor-name">
                    <i class="vendor-icon">🏪</i>
                    {{ group.vendor.name }}
                  </span>
                </label>
                
                <button 
                  class="remove-vendor-btn"
                  @click="removeVendor(group.vendor.id)"
                  title="移除此廠商所有商品"
                >
                  移除廠商商品
                </button>
              </div>

              <!-- 商品列表 -->
              <div class="items-list">
                <CartItem
                  v-for="item in group.items"
                  :key="item.id"
                  :item="item"
                  :is-selected="selectedItemIds.includes(item.id)"
                  @update-quantity="handleUpdateQuantity"
                  @remove="handleRemoveItem"
                  @toggle-select="toggleItemSelect"
                />
              </div>
            </div>
          </div>

          <!-- 無效商品提示 -->
          <div v-if="(cartStore.unavailableItems || []).length > 0" class="unavailable-section">
            <h3>以下商品暫時無法購買</h3>
            <div class="unavailable-items">
              <CartItem
                v-for="item in (cartStore.unavailableItems || [])"
                :key="item.id"
                :item="item"
                :is-selected="false"
                @remove="handleRemoveItem"
              />
            </div>
          </div>
        </div>

        <!-- 購物車摘要 -->
        <div class="cart-sidebar">
          <CartSummary
            :summary="cartStore.summary"
            :selected-count="selectedItems.length"
            :can-checkout="canCheckout"
            @checkout="goToCheckout"
          />
        </div>
      </div>

      <!-- 空購物車 -->
      <div v-else class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>購物車是空的</h2>
        <p>趕快去挑選你喜歡的商品吧！</p>
        <router-link to="/products" class="btn-primary">
          開始購物
        </router-link>
      </div>

      <!-- 推薦商品 -->
      <div v-if="!cartStore.isEmpty" class="recommendations">
        <h3>你可能也喜歡</h3>
        <div class="recommended-items">
          <!-- TODO: 整合推薦商品 API -->
          <div class="placeholder">推薦商品待整合...</div>
        </div>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="cartStore.loading" class="loading-overlay">
      <div class="loading-spinner">載入中...</div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="cartStore.error" class="error-toast" @click="cartStore.clearError">
      {{ cartStore.error }}
      <button class="close-btn">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/modules/cart'
import CartItem from '@/components/order/cart/CartItem.vue'
import CartSummary from '@/components/order/cart/CartSummary.vue'

// Composables
const router = useRouter()
const cartStore = useCartStore()

// 選中的商品 IDs
const selectedItemIds = ref<string[]>([])

// ==================== Computed ====================

// 選中的商品項目
const selectedItems = computed(() => 
  (cartStore.availableItems || []).filter(item => selectedItemIds.value.includes(item.id))
)

// 全選狀態
const allSelected = computed(() => 
  (cartStore.availableItems || []).length > 0 && 
  selectedItemIds.value.length === (cartStore.availableItems || []).length
)

// 部分選中狀態
const someSelected = computed(() => 
  selectedItemIds.value.length > 0 && 
  selectedItemIds.value.length < (cartStore.availableItems || []).length
)

// 是否可以結帳
const canCheckout = computed(() => 
  selectedItems.value.length > 0 && !cartStore.loading
)

// ==================== Methods ====================

/**
 * 切換全選
 */
const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedItemIds.value = []
  } else {
    selectedItemIds.value = (cartStore.availableItems || []).map(item => item.id)
  }
}

/**
 * 切換單個商品選擇
 */
const toggleItemSelect = (itemId: string) => {
  const index = selectedItemIds.value.indexOf(itemId)
  if (index > -1) {
    selectedItemIds.value.splice(index, 1)
  } else {
    selectedItemIds.value.push(itemId)
  }
}

/**
 * 檢查廠商是否全選
 */
const isVendorSelected = (vendorId: number) => {
  const vendorItems = (cartStore.availableItems || []).filter(item => item.vendorId === vendorId)
  return vendorItems.length > 0 && vendorItems.every(item => selectedItemIds.value.includes(item.id))
}

/**
 * 檢查廠商是否部分選中
 */
const isVendorPartialSelected = (vendorId: number) => {
  const vendorItems = (cartStore.availableItems || []).filter(item => item.vendorId === vendorId)
  const selectedCount = vendorItems.filter(item => selectedItemIds.value.includes(item.id)).length
  return selectedCount > 0 && selectedCount < vendorItems.length
}

/**
 * 切換廠商選擇
 */
const toggleVendorSelect = (vendorId: number) => {
  const vendorItems = (cartStore.availableItems || []).filter(item => item.vendorId === vendorId)
  const vendorItemIds = vendorItems.map(item => item.id)
  
  if (isVendorSelected(vendorId)) {
    // 取消選擇該廠商所有商品
    selectedItemIds.value = selectedItemIds.value.filter(id => !vendorItemIds.includes(id))
  } else {
    // 選擇該廠商所有商品
    vendorItemIds.forEach(id => {
      if (!selectedItemIds.value.includes(id)) {
        selectedItemIds.value.push(id)
      }
    })
  }
}

/**
 * 更新商品數量
 */
const handleUpdateQuantity = (itemId: string, quantity: number) => {
  cartStore.updateQuantity(itemId, quantity)
}

/**
 * 移除單個商品
 */
const handleRemoveItem = (itemId: string) => {
  cartStore.removeItem(itemId)
  // 同時從選中列表移除
  const index = selectedItemIds.value.indexOf(itemId)
  if (index > -1) {
    selectedItemIds.value.splice(index, 1)
  }
}

/**
 * 移除廠商所有商品
 */
const removeVendor = (vendorId: number) => {
  if (confirm('確定要移除此廠商的所有商品嗎？')) {
    cartStore.removeVendorItems(vendorId)
    // 同時從選中列表移除
    const vendorItemIds = cartStore.items
      .filter(item => item.vendorId === vendorId)
      .map(item => item.id)
    selectedItemIds.value = selectedItemIds.value.filter(id => !vendorItemIds.includes(id))
  }
}

/**
 * 移除選中商品
 */
const removeSelected = () => {
  if (confirm(`確定要移除選中的 ${selectedItems.value.length} 個商品嗎？`)) {
    selectedItemIds.value.forEach(itemId => {
      cartStore.removeItem(itemId)
    })
    selectedItemIds.value = []
  }
}

/**
 * 前往結帳
 */
const goToCheckout = () => {
  if (!canCheckout.value) return
  
  // 將選中的商品 ID 傳遞給結帳頁面
  router.push({
    name: 'checkout',
    query: {
      items: selectedItemIds.value.join(',')
    }
  })
}

/**
 * 初始化
 */
onMounted(() => {
  // 檢查庫存
  cartStore.checkInventory()
  
  // 預設全選所有可購買的商品
  selectedItemIds.value = (cartStore.availableItems || []).map(item => item.id)
})
</script>

<style scoped>
.cart-view {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #3498db;
  text-decoration: none;
}

.breadcrumb .separator {
  margin: 0 8px;
}

.breadcrumb .current {
  color: #333;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.cart-main {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.select-all {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.select-all-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
}

.select-all-label input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
}

.bulk-actions .btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.vendor-groups {
  padding: 20px;
}

.vendor-group {
  margin-bottom: 24px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.vendor-group:last-child {
  margin-bottom: 0;
}

.vendor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e5;
}

.vendor-select {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
}

.vendor-select input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
}

.vendor-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  color: #333;
}

.remove-vendor-btn {
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.remove-vendor-btn:hover {
  background: #dc3545;
  color: white;
}

.items-list {
  padding: 16px;
}

.unavailable-section {
  margin-top: 24px;
  padding: 20px;
  background: #fff3cd;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
}

.unavailable-section h3 {
  margin: 0 0 16px 0;
  color: #856404;
  font-size: 16px;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-cart h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-cart p {
  color: #666;
  margin: 0 0 24px 0;
}

.btn-primary {
  display: inline-block;
  background: #3498db;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2980b9;
}

.recommendations {
  margin-top: 40px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.recommendations h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #333;
}

.placeholder {
  padding: 40px;
  text-align: center;
  color: #999;
  background: #f8f9fa;
  border-radius: 4px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  background: white;
  padding: 20px 40px;
  border-radius: 8px;
  font-weight: 500;
}

.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #dc3545;
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .cart-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .select-all {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .vendor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
}
</style>