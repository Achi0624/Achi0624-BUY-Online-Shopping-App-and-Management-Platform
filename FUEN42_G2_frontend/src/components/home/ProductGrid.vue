<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Product {
  id: number
  name: string
  brand: string
  price: number
  originalPrice?: number
  bgColor: string
  emoji: string
}

interface Props {
  products?: Product[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  products: () => [
    { id: 1, name: 'MacBook Pro 16"', brand: 'Apple', price: 89900, originalPrice: 99900, bgColor: '#F5F5F7', emoji: '💻' },
    { id: 2, name: 'iPhone 15 Pro', brand: 'Apple', price: 36900, bgColor: '#F5F5F7', emoji: '📱' },
    { id: 3, name: 'AirPods Pro', brand: 'Apple', price: 7490, originalPrice: 8990, bgColor: '#F5F5F7', emoji: '🎧' },
    { id: 4, name: 'iPad Air', brand: 'Apple', price: 18900, bgColor: '#F5F5F7', emoji: '📱' }
  ],
  title: '精選商品'
})

const router = useRouter()

function viewProduct(product: Product) {
  router.push(`/product/${product.id}`)
}

function viewAllProducts() {
  router.push('/products')
}

function formatPrice(price: number) {
  return price.toLocaleString()
}
</script>

<template>
  <section class="products-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
        <button class="view-all-btn" @click="viewAllProducts">查看全部</button>
      </div>
      <div class="products-grid">
        <div 
          class="product-card" 
          v-for="product in products" 
          :key="product.id" 
          @click="viewProduct(product)"
        >
          <div class="product-image" :style="{ backgroundColor: product.bgColor }">
            {{ product.emoji }}
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-brand">{{ product.brand }}</p>
            <div class="product-price">
              <span class="current-price">NT$ {{ formatPrice(product.price) }}</span>
              <span 
                class="original-price" 
                v-if="product.originalPrice"
              >
                NT$ {{ formatPrice(product.originalPrice) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.products-section {
  padding: 60px 0;
  background: #F5F5F7;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
}

.view-all-btn {
  background: none;
  border: 1px solid var(--blue);
  color: var(--blue);
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: var(--blue);
  color: white;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
}

.product-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.product-brand {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 8px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: 600;
}

.original-price {
  font-size: 14px;
  color: var(--muted);
  text-decoration: line-through;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>