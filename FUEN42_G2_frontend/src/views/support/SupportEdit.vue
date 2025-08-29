<template>
  <div class="support-edit">
    <h1>編輯客服單</h1>
    <form @submit.prevent="saveChanges">
      <div>
        <label for="ticket-title">標題</label>
        <input id="ticket-title" type="text" v-model="ticket.title" />
      </div>
      <div>
        <label for="ticket-category">問題類別</label>
        <select id="ticket-category" v-model="ticket.category">
          <option value="order">訂單相關</option>
          <option value="payment">付款問題</option>
          <option value="product">商品問題</option>
          <option value="account">帳號問題</option>
          <option value="other">其他問題</option>
        </select>
      </div>
      <div>
        <label for="ticket-status">狀態</label>
        <select id="ticket-status" v-model="ticket.status">
          <option value="處理中">處理中</option>
          <option value="已回覆">已回覆</option>
          <option value="已關閉">已關閉</option>
        </select>
      </div>
      <div>
        <label for="ticket-priority">優先級</label>
        <select id="ticket-priority" v-model="ticket.priority">
          <option value="高">高</option>
          <option value="中">中</option>
          <option value="低">低</option>
        </select>
      </div>
      <div>
        <label for="ticket-assignee">負責人</label>
        <input id="ticket-assignee" type="text" v-model="ticket.assignee" />
      </div>
      <div>
        <label for="ticket-description">問題描述</label>
        <textarea id="ticket-description" v-model="ticket.description" rows="4"></textarea>
      </div>
      <div>
        <label for="ticket-email">聯絡信箱</label>
        <input id="ticket-email" type="email" v-model="ticket.email" />
      </div>
      <div>
        <label for="ticket-created-at">建立時間</label>
        <input id="ticket-created-at" type="text" :value="ticket.createdAt" disabled />
      </div>
      <div>
        <label for="ticket-updated-at">修改時間</label>
        <input id="ticket-updated-at" type="text" :value="ticket.updatedAt" disabled />
      </div>
      <div>
        <label>附件上傳</label>
        <input type="file" multiple @change="handleFileChange" />
        <div v-if="attachments.length" class="attachment-preview">
          <div v-for="(file, idx) in attachments" :key="idx" class="preview-item">
            <img v-if="file.type.startsWith('image/')" :src="file.preview" style="max-width:80px;max-height:80px;" />
            <span v-else>{{ file.name }}</span>
          </div>
        </div>
      </div>
      <button type="submit">保存</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const ticket = ref({ id: '', title: '', category: '', status: '', priority: '', assignee: '', description: '', email: '', createdAt: '', updatedAt: '', attachments: [] as File[] });
const attachments: Ref<Array<{ name: string; type: string; file: File; preview?: string }>> = ref([]);
const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  attachments.value = [];
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const item: { name: string; type: string; file: File; preview?: string } = { name: file.name, type: file.type, file };
      if (file.type.startsWith('image/')) {
        item.preview = URL.createObjectURL(file);
      }
      attachments.value.push(item);
    }
    ticket.value.attachments = attachments.value.map(a => a.file);
  }
};
onMounted(() => {
  const ticketId = String(route.params.id);
  // 模擬從後端獲取數據
  const mockData = [
    { id: '1', title: '訂單延遲', category: 'order', status: '處理中', priority: '高', assignee: '張三', description: '訂單延遲說明', email: 'test1@mail.com', createdAt: '2025-08-20', updatedAt: '2025-08-21', attachments: [] },
    { id: '2', title: '商品破損', category: 'product', status: '已回覆', priority: '中', assignee: '李四', description: '商品破損說明', email: 'test2@mail.com', createdAt: '2025-08-18', updatedAt: '2025-08-19', attachments: [] },
    { id: '3', title: '信用卡付款失敗', category: 'payment', status: '已關閉', priority: '低', assignee: '王五', description: '付款失敗說明', email: 'test3@mail.com', createdAt: '2025-08-16', updatedAt: '2025-08-17', attachments: [] },
  ];
  ticket.value = mockData.find((t) => t.id === ticketId) || ticket.value;
});
const saveChanges = () => {
  console.log('保存修改', ticket.value);
  router.push('/support');
};
</script>

<style scoped>
.support-edit {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
form div {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}
input,
select,
textarea {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #f8f9fa;
}
button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
}
button:hover {
  background-color: #0056b3;
}
.attachment-preview {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
@media (max-width: 600px) {
  .support-edit {
    padding: 10px;
  }
}
</style>
