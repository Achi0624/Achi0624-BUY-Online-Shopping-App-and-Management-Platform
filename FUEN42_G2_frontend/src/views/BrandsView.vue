<template>
  <div class="brands-view">
    <div class="container">
      <div class="brands-header">
        <h1 class="title">品牌館</h1>
        <p class="subtitle">探索優質品牌商品</p>
      </div>
      
      <div class="brands-grid">
        <div v-for="brand in brands" :key="brand.id" class="brand-card">
          <div class="brand-logo">
            <img :src="brand.logoUrl" :alt="brand.name" />
          </div>
          <h3 class="brand-name">{{ brand.name }}</h3>
          <p class="brand-description">{{ brand.description }}</p>
          <router-link :to="`/products?brand=${brand.id}`" class="btn btn-primary">
            查看商品
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Brand {
  id: number
  name: string
  logoUrl: string
  description: string
}

const brands = ref<Brand[]>([
  {
    id: 1,
    name: 'Apple',
    logoUrl: 'https://via.placeholder.com/150x80?text=Apple',
    description: '創新科技產品領導品牌'
  },
  {
    id: 2,
    name: 'Samsung',
    logoUrl: 'https://via.placeholder.com/150x80?text=Samsung',
    description: '全球知名電子產品品牌'
  },
  {
    id: 3,
    name: 'Nike',
    logoUrl: 'https://via.placeholder.com/150x80?text=Nike',
    description: '運動用品第一品牌'
  }
])

onMounted(() => {
  // TODO: 從API獲取品牌資料
})
</script>

<style scoped>
.brands-view {
  padding: 40px 0;
  min-height: 80vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.brands-header {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.brand-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.brand-card:hover {
  transform: translateY(-5px);
}

.brand-logo {
  width: 150px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo img {
  max-width: 100%;
  max-height: 100%;
}

.brand-name {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 12px;
}

.brand-description {
  color: #666;
  margin-bottom: 20px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>