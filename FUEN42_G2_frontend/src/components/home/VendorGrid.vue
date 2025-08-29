<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Vendor {
  id: number
  name: string
  productCount: number
  logoUrl?: string
  color: string
  description: string
}

const router = useRouter()

const vendors = ref<Vendor[]>([
  { 
    id: 1, 
    name: 'Apple', 
    productCount: 156, 
    color: '#007AFF', 
    description: '創新科技領導品牌'
  },
  { 
    id: 2, 
    name: 'Samsung', 
    productCount: 243, 
    color: '#1428A0', 
    description: '全球電子產品製造商'
  },
  { 
    id: 3, 
    name: 'Nike', 
    productCount: 189, 
    color: '#FF6900', 
    description: '運動用品知名品牌'
  },
  { 
    id: 4, 
    name: 'Sony', 
    productCount: 167, 
    color: '#000000', 
    description: '娛樂科技專家'
  },
  { 
    id: 5, 
    name: 'Adidas', 
    productCount: 134, 
    color: '#000000', 
    description: '運動服飾領導品牌'
  },
  { 
    id: 6, 
    name: 'Uniqlo', 
    productCount: 98, 
    color: '#FF0000', 
    description: '簡約時尚服飾'
  }
])

function selectVendor(vendor: Vendor) {
  router.push({ name: 'products', query: { vendor: vendor.id } })
}
</script>

<template>
  <section class="vendors-section">
    <div class="container">
      <h2 class="section-title">熱門廠商</h2>
      <div class="vendors-grid">
        <div 
          class="vendor-card" 
          v-for="vendor in vendors" 
          :key="vendor.id" 
          @click="selectVendor(vendor)"
        >
          <div class="vendor-logo" :style="{ backgroundColor: vendor.color }">
            {{ vendor.name.charAt(0) }}
          </div>
          <div class="vendor-info">
            <h3 class="vendor-name">{{ vendor.name }}</h3>
            <p class="vendor-description">{{ vendor.description }}</p>
            <p class="vendor-count">{{ vendor.productCount }}+ 商品</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import '@/styles/variables.css';

.vendors-section {
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  text-align: left;
  margin-bottom: 30px;
  color: var(--gray-900);
}

.vendors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  padding: var(--space-4) 0;
}

.vendor-card {
  background: var(--brand-white);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  border: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.vendor-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--gray-200);
}

.vendor-logo {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  flex-shrink: 0;
}

.vendor-info {
  flex: 1;
  min-width: 0;
}

.vendor-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.vendor-description {
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin-bottom: var(--space-2);
  line-height: var(--leading-normal);
}

.vendor-count {
  font-size: var(--text-sm);
  color: var(--gray-700);
  font-weight: var(--font-medium);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .vendors-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .vendor-card {
    padding: var(--space-4);
  }
  
  .vendor-logo {
    width: 50px;
    height: 50px;
    font-size: var(--text-lg);
  }
}

@media (max-width: 480px) {
  .vendor-card {
    flex-direction: column;
    text-align: center;
    gap: var(--space-3);
  }
  
  .vendor-logo {
    width: 60px;
    height: 60px;
  }
}
</style>