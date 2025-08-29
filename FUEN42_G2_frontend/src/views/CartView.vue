<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/modules/cart'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const cartItems = computed(() => cartStore.items)
const totalAmount = computed(() => cartStore.summary.totalAmount)
const isEmpty = computed(() => cartItems.value.length === 0)

function updateQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    cartStore.removeItem(itemId)
  } else {
    cartStore.updateQuantity(itemId, quantity)
  }
}

function removeItem(itemId: string) {
  cartStore.removeItem(itemId)
}

function proceedToCheckout() {
  if (!userStore.isLoggedIn) {
    router.push('/login?redirect=/checkout')
  } else {
    router.push('/checkout')
  }
}

function continueShopping() {
  router.push('/products')
}
</script>

<template>
  <div class="cart-view">
    <div class="container">
      <h1 class="page-title">購物車</h1>
      
      <div v-if="isEmpty" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>您的購物車是空的</h2>
        <p>快去挑選您喜歡的商品吧！</p>
        <button class="btn btn-primary" @click="continueShopping">繼續購物</button>
      </div>
      
      <div v-else class="cart-content">
        <div class="cart-items">
          <div class="cart-item" v-for="item in cartItems" :key="item.productId">
            <div class="item-image">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.productName">
              <div v-else class="placeholder-image">📦</div>
            </div>
            
            <div class="item-info">
              <h3>{{ item.productName }}</h3>
              <p class="item-price">NT$ {{ (item.price || 0).toLocaleString() }}</p>
            </div>
            
            <div class="item-quantity">
              <button class="qty-btn" @click="updateQuantity(item.id, item.quantity - 1)">-</button>
              <input 
                type="number" 
                :value="item.quantity"
                @change="updateQuantity(item.id, parseInt($event.target.value))"
                min="1"
                class="qty-input"
              >
              <button class="qty-btn" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
            </div>
            
            <div class="item-subtotal">
              NT$ {{ ((item.price || 0) * item.quantity).toLocaleString() }}
            </div>
            
            <button class="remove-btn" @click="removeItem(item.id)">刪除</button>
          </div>
        </div>
        
        <div class="cart-summary">
          <h2>訂單摘要</h2>
          <div class="summary-row">
            <span>商品總計</span>
            <span>NT$ {{ (totalAmount || 0).toLocaleString() }}</span>
          </div>
          <div class="summary-row">
            <span>運費</span>
            <span>結帳時計算</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>總計</span>
            <span>NT$ {{ (totalAmount || 0).toLocaleString() }}</span>
          </div>
          <button class="btn btn-primary checkout-btn" @click="proceedToCheckout">
            前往結帳
          </button>
          <button class="btn btn-secondary" @click="continueShopping">
            繼續購物
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-view {
  min-height: calc(100vh - 120px);
  padding: 40px 0;
}

.page-title {
  font-size: 32px;
  margin-bottom: 30px;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-cart h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-cart p {
  color: var(--muted);
  margin-bottom: 30px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.cart-items {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eee;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr 150px 120px 80px;
  gap: 20px;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f7;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.item-info h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.item-price {
  color: var(--muted);
  font-size: 14px;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.qty-btn:hover {
  background: #f5f5f7;
}

.qty-input {
  width: 50px;
  height: 32px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.item-subtotal {
  font-weight: 600;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--red);
  cursor: pointer;
  font-size: 14px;
}

.remove-btn:hover {
  text-decoration: underline;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #eee;
  height: fit-content;
  position: sticky;
  top: 80px;
}

.cart-summary h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 600;
}

.summary-divider {
  border-top: 1px solid #eee;
  margin: 16px 0;
}

.checkout-btn {
  width: 100%;
  margin-bottom: 12px;
}

.btn-secondary {
  width: 100%;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 15px;
  }
  
  .item-quantity,
  .item-subtotal,
  .remove-btn {
    grid-column: 2;
  }
  
  .cart-summary {
    position: static;
  }
}
</style>