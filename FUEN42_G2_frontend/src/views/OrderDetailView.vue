<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = route.params.id
const order = ref(null)
const loading = ref(false)

onMounted(() => {
  fetchOrderDetail()
})

function fetchOrderDetail() {
  loading.value = true
  // TODO: 從API載入訂單詳情
  setTimeout(() => {
    loading.value = false
  }, 1000)
}
</script>

<template>
  <div class="order-detail-view">
    <div class="container">
      <h1>訂單詳情</h1>
      <div v-if="loading" class="loading">載入中...</div>
      <div v-else>
        <p>訂單ID: {{ orderId }}</p>
        <p>訂單詳情頁面尚在開發中</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-detail-view {
  min-height: calc(100vh - 120px);
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading {
  text-align: center;
  padding: 40px;
}
</style>