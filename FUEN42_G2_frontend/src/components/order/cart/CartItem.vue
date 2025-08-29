<!--
  購物車商品項目組件
  
  開發者: 蔡易霖
  負責組別: C組 (組長)
  負責模組: 購物車系統
  
  FUEN42_G2 五人專題小組 - BUY商城系統
  © 2025 All rights reserved.
-->
<template>
  <div class="cart-item" :class="{ 'unavailable': !item.isAvailable }">
    <div class="item-checkbox">
      <input 
        type="checkbox" 
        :checked="isSelected" 
        :disabled="!item.isAvailable"
        @change="$emit('toggle-select', item.id)"
      >
    </div>
    
    <div class="item-image">
      <img 
        :src="item.imageUrl || '/placeholder-product.jpg'" 
        :alt="item.productName"
        loading="lazy"
      >
    </div>
    
    <div class="item-info">
      <h3 class="product-name">{{ item.productName }}</h3>
      <p v-if="item.specName" class="spec-name">{{ item.specName }}</p>
      <p class="vendor-name">廠商：{{ item.vendorName }}</p>
      
      <div class="price-info">
        <span class="current-price">NT$ {{ formatPrice(item.price) }}</span>
      </div>
      
      <div v-if="!item.isAvailable" class="unavailable-notice">
        商品暫時無法購買
      </div>
    </div>
    
    <div class="item-controls">
      <div class="quantity-control">
        <button 
          class="qty-btn decrease"
          :disabled="item.quantity <= 1 || !item.isAvailable"
          @click="updateQuantity(item.quantity - 1)"
        >
          <i class="icon-minus">−</i>
        </button>
        
        <input 
          type="number" 
          class="qty-input"
          :value="item.quantity"
          :min="1"
          :max="item.maxQuantity"
          :disabled="!item.isAvailable"
          @input="onQuantityInput"
          @blur="onQuantityBlur"
        >
        
        <button 
          class="qty-btn increase"
          :disabled="item.quantity >= item.maxQuantity || !item.isAvailable"
          @click="updateQuantity(item.quantity + 1)"
        >
          <i class="icon-plus">+</i>
        </button>
      </div>
      
      <p class="stock-info">庫存：{{ item.maxQuantity }}</p>
    </div>
    
    <div class="item-total">
      <span class="total-price">
        NT$ {{ formatPrice(item.price * item.quantity) }}
      </span>
    </div>
    
    <div class="item-actions">
      <button 
        class="remove-btn"
        @click="$emit('remove', item.id)"
        title="移除商品"
      >
        <i class="icon-delete">🗑️</i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CartItem } from '@/stores/modules/cart'

// Props
interface Props {
  item: CartItem
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
})

// Emits
const emit = defineEmits<{
  'update-quantity': [itemId: string, quantity: number]
  'remove': [itemId: string]
  'toggle-select': [itemId: string]
}>()

// 臨時數量輸入值
const tempQuantity = ref(props.item.quantity)

/**
 * 格式化價格
 */
const formatPrice = (price: number | undefined | null): string => {
  if (price == null || isNaN(price)) {
    return '0'
  }
  return price.toLocaleString('zh-TW')
}

/**
 * 更新數量
 */
const updateQuantity = (newQuantity: number) => {
  if (newQuantity < 1) return
  if (newQuantity > props.item.maxQuantity) return
  
  emit('update-quantity', props.item.id, newQuantity)
}

/**
 * 數量輸入處理
 */
const onQuantityInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)
  
  if (isNaN(value) || value < 1) {
    tempQuantity.value = 1
  } else if (value > props.item.maxQuantity) {
    tempQuantity.value = props.item.maxQuantity
  } else {
    tempQuantity.value = value
  }
}

/**
 * 數量輸入失焦處理
 */
const onQuantityBlur = () => {
  updateQuantity(tempQuantity.value)
}
</script>

<style scoped>
.cart-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fff;
  transition: all 0.2s;
}

.cart-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cart-item.unavailable {
  opacity: 0.6;
  background: #f5f5f5;
}

.item-checkbox {
  margin-right: 12px;
}

.item-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 16px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  margin-right: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: #333;
}

.spec-name {
  font-size: 14px;
  color: #666;
  margin: 0 0 4px 0;
}

.vendor-name {
  font-size: 14px;
  color: #888;
  margin: 0 0 8px 0;
}

.price-info {
  margin-bottom: 8px;
}

.current-price {
  font-size: 16px;
  font-weight: 600;
  color: #e74c3c;
}

.unavailable-notice {
  font-size: 12px;
  color: #e74c3c;
  background: #fff2f2;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.item-controls {
  margin-right: 16px;
  text-align: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #bbb;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-btn.decrease {
  border-radius: 4px 0 0 4px;
}

.qty-btn.increase {
  border-radius: 0 4px 4px 0;
}

.qty-input {
  width: 60px;
  height: 32px;
  text-align: center;
  border: 1px solid #ddd;
  border-left: none;
  border-right: none;
  font-size: 14px;
}

.qty-input:disabled {
  background: #f5f5f5;
  color: #999;
}

.stock-info {
  font-size: 12px;
  color: #888;
  margin: 0;
}

.item-total {
  width: 120px;
  text-align: right;
  margin-right: 16px;
}

.total-price {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.item-actions {
  width: 40px;
  text-align: center;
}

.remove-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap;
    padding: 12px;
  }
  
  .item-image {
    width: 60px;
    height: 60px;
    margin-right: 12px;
  }
  
  .item-controls {
    margin-top: 12px;
    margin-right: 0;
    order: 1;
  }
  
  .item-total {
    margin-top: 12px;
    width: auto;
    text-align: left;
    order: 2;
  }
  
  .item-actions {
    margin-top: 12px;
    order: 3;
  }
}
</style>