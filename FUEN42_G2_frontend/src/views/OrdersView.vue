<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()
const orders = ref([])
const loading = ref(false)

onMounted(() => {
  fetchOrders()
})

function fetchOrders() {
  loading.value = true
  // TODO: 從API載入訂單列表
  setTimeout(() => {
    loading.value = false
  }, 1000)
}
</script>

<template>
  <div class="orders-view">
    <div class="container">
      <h1>我的訂單</h1>
      <div v-if="loading" class="loading">載入中...</div>
      <div v-else>
        <p>訂單列表頁面尚在開發中</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-view {
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