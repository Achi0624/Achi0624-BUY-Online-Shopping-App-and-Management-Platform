<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Category {
  id: number
  name: string
  count: number
  color: string
  icon: string
}

const router = useRouter()

const categories = ref<Category[]>([
  { id: 6, name: '電腦與周邊配件', count: 1250, color: '#f5f5f5', icon: '📱' },
  { id: 7, name: '寵物', count: 3200, color: '#f5f5f5', icon: '🐱' },
  { id: 9, name: '女生衣著', count: 1950, color: '#f5f5f5', icon: '👗' },
  { id: 139, name: '女鞋', count: 1950, color: '#f5f5f5', icon: '👠' },
  { id: 10, name: '母嬰用品', count: 2800, color: '#f5f5f5', icon: '🍼' },
  { id: 29, name: '男生衣著', count: 1100, color: '#f5f5f5', icon: '👔' },
  { id: 30, name: '男鞋', count: 850, color: '#f5f5f5', icon: '👟' },
  { id: 31, name: '運動/健身', count: 2200, color: '#f5f5f5', icon: '🏋️' },
  { id: 32, name: '書籍/雜誌期刊', count: 8400, color: '#f5f5f5', icon: '📚' },
  { id: 35, name: '居家生活', count: 2200, color: '#f5f5f5', icon: '🏠' },
])

function selectCategory(category: Category) {
  router.push({ name: 'products', query: { category: category.id } })
}
</script>

<template>
  <section class="categories-section">
    <div class="container">
      <h2 class="section-title">分類</h2>
      <div class="categories-grid">
        <div 
          class="category-card" 
          v-for="category in categories" 
          :key="category.id" 
          @click="selectCategory(category)"
        >
          <div class="category-image" :style="{ backgroundColor: category.color }">
            {{ category.icon }}
          </div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.count }}+ 商品</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.categories-section {
  padding: 60px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  text-align: left;
  margin-bottom: 30px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 26px;
}

.category-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 20px;
  border-radius: 16px;
}

.category-card:hover {
  transform: translateY(-8px);
}

.category-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 65px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: visible;
}

.category-card:hover .category-image {
  transform: scale(1.1);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
}

.category-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
}

.category-card h3 {
  font-size: 16px;
  margin-bottom: 4px;
}

.category-card p {
  color: var(--muted);
  font-size: 14px;
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>