<template>
  <div class="ticket-list">
    <div class="container">
      <div class="header-row">
        <h1 class="title">我的客服單</h1>
        <router-link to="/support/create" class="btn btn-primary">＋ 建立新客服單</router-link>
      </div>
      <div class="search-row">
        <input v-model="search" type="text" placeholder="搜尋標題或狀態..." class="search-input" />
      </div>
      <table class="ticket-table">
        <thead>
          <tr>
            <th>標題</th>
            <th>狀態</th>
            <th>建立時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in filteredTickets" :key="ticket.id">
            <td>{{ ticket.title }}</td>
            <td>
              <span :class="['status-badge', ticket.status]">{{ ticket.status }}</span>
            </td>
            <td>{{ ticket.createdAt }}</td>
            <td>
              <router-link :to="`/support/detail/${ticket.id}`" class="btn-small">查看</router-link>
              <router-link :to="`/support/edit/${ticket.id}`" class="btn-small btn-edit">編輯</router-link>
              <router-link :to="`/support/message?ticketId=${ticket.id}`" class="btn-small btn-message">訊息中心</router-link>
            </td>
          </tr>
          <tr v-if="filteredTickets.length === 0">
            <td colspan="4" class="empty-tip">查無資料，請重新搜尋或建立新客服單。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
const tickets = ref([
  { id: 1, title: '訂單延遲', status: '處理中', createdAt: '2025-08-20' },
  { id: 2, title: '商品破損', status: '已回覆', createdAt: '2025-08-18' },
  { id: 3, title: '信用卡付款失敗', status: '已關閉', createdAt: '2025-08-16' },
  { id: 4, title: '沒收到發票', status: '處理中', createdAt: '2025-08-15' },
  { id: 5, title: '退貨申請一直沒回覆', status: '處理中', createdAt: '2025-08-14' },
  { id: 6, title: '物流資訊錯誤', status: '已回覆', createdAt: '2025-08-13' },
  { id: 7, title: '帳號被鎖住', status: '已關閉', createdAt: '2025-08-12' },
  { id: 8, title: '想修改地址', status: '處理中', createdAt: '2025-08-11' },
  { id: 9, title: '付款後沒跳轉成功', status: '處理中', createdAt: '2025-08-10' },
  { id: 10, title: '收到錯的商品', status: '已回覆', createdAt: '2025-08-09' },
  { id: 11, title: '退貨運費誰出？', status: '處理中', createdAt: '2025-08-08' },
  { id: 12, title: '包裝破損', status: '已關閉', createdAt: '2025-08-07' }
]);
const search = ref('');
const filteredTickets = computed(() => {
  if (!search.value.trim()) return tickets.value;
  const keyword = search.value.trim().toLowerCase();
  return tickets.value.filter(t =>
    t.title.toLowerCase().includes(keyword) || t.status.toLowerCase().includes(keyword)
  );
});
</script>

<style scoped>
.ticket-list {
  padding: 60px 20px;
  background-color: #f8f9fa;
  min-height: 80vh;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.btn.btn-primary {
  background-color: #007bff;
  color: #fff;
  padding: 8px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn.btn-primary:hover {
  background-color: #0056b3;
}
.search-row {
  margin-bottom: 18px;
}
.search-input {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
}
.ticket-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}
.ticket-table th,
.ticket-table td {
  padding: 16px;
  border: 1px solid #ddd;
  text-align: center;
}
.ticket-table th {
  background-color: #f1f1f1;
  color: #333;
}
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #fff;
}
.status-badge.處理中 {
  background: #ffc107;
  color: #222;
}
.status-badge.已回覆 {
  background: #17a2b8;
}
.status-badge.已關閉 {
  background: #6c757d;
}
.btn-small {
  background-color: #007bff;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
  margin-right: 6px;
}
.btn-small.btn-edit {
  background-color: #28a745;
}
.btn-small:hover {
  background-color: #0056b3;
}
.empty-tip {
  color: #888;
  font-size: 1.1rem;
  padding: 32px 0;
}
@media (max-width: 600px) {
  .container {
    padding: 10px;
  }
  .ticket-table th,
  .ticket-table td {
    padding: 8px;
    font-size: 0.95rem;
  }
  .header-row {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
