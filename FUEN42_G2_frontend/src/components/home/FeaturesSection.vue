<script setup lang="ts">
import { ref } from 'vue'

interface Feature {
  id: number
  icon: string
  title: string
  description: string
}

const features = ref<Feature[]>([
  { id: 1, icon: '⚡', title: '極速配送', description: '24小時內快速到貨' },
  { id: 2, icon: '✅', title: '品質保證', description: '嚴選優質商品與服務' },
  { id: 3, icon: '👥', title: '企業服務', description: '專業B2B採購解決方案' }
])
</script>

<template>
  <section class="features-section">
    <div class="container">
      <div class="features-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.id">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  padding: 60px 0;
  background: #F5F5F7;
  border-top: 6px solid var(--brand-yellow);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 32px 20px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eee;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 72px;
  height: 72px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  font-size: 30px;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: var(--ink);
}

.feature-card p {
  color: var(--muted);
  line-height: 1.6;
}
</style>