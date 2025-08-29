<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const heroData = ref({
  title: '連接企業與消費者',
  subtitle: '探索無限可能的商業生態系統',
  brands: [
    { name: 'Apple', logo: '🍎', color: '#007AFF' },
    { name: 'Samsung', logo: '📱', color: '#1428A0' },
    { name: 'Nike', logo: '👟', color: '#FF6900' },
    { name: 'Sony', logo: '🎧', color: '#000000' },
    { name: 'Adidas', logo: '⚽', color: '#000000' },
    { name: 'Uniqlo', logo: '👕', color: '#FF0000' }
  ]
})

function startShopping() {
  router.push('/products')
}

function becomeSeller() {
  router.push('/seller/register')
}
</script>

<template>
  <section class="hero-section">
    <div class="hero-content">
      <h2 class="hero-title">{{ heroData.title }}</h2>
      <p class="hero-subtitle">{{ heroData.subtitle }}</p>
      <div class="hero-actions">
        <button class="btn btn-primary" @click="startShopping">開始購物</button>
        <button class="btn btn-primary" @click="becomeSeller">成為賣家</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  min-height: 25vh;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 20px;
  text-align: center;
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 46px;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 14px;
}

.hero-subtitle {
  font-size: 20px;
  color: var(--muted);
  margin-bottom: 24px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #007AFF !important;
  color: white !important;
}

.btn-primary:hover {
  background: #0056CC !important;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 32px 20px;
  }
  
  .hero-title {
    font-size: 34px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
}
</style>