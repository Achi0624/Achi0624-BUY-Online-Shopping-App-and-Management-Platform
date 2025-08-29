<template>
  <div class="create-ticket">
    <div class="container">
      <h1 class="title">建立客服單</h1>
      <form @submit.prevent="submitTicket" class="ticket-form">
        <div class="form-group">
          <label>問題類別</label>
          <select v-model="ticket.category" required>
            <option value="">請選擇問題類別</option>
            <option value="order">訂單相關</option>
            <option value="payment">付款問題</option>
            <option value="product">商品問題</option>
            <option value="account">帳號問題</option>
            <option value="other">其他問題</option>
          </select>
        </div>
        <div class="form-group">
          <label>標題</label>
          <input v-model="ticket.title" type="text" required placeholder="請輸入標題" />
        </div>
        <div class="form-group">
          <label>問題描述</label>
          <textarea v-model="ticket.description" rows="5" required placeholder="請輸入問題詳情"></textarea>
        </div>
        <div class="form-group">
          <label>聯絡信箱</label>
          <input v-model="ticket.email" type="email" required placeholder="請輸入聯絡信箱" />
        </div>
        <div class="form-group">
          <label>優先級</label>
          <select v-model="ticket.priority">
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>
        <div class="form-group">
          <label>負責人</label>
          <input v-model="ticket.assignee" type="text" placeholder="請輸入負責人" />
        </div>
        <div class="form-group">
          <label>附件上傳</label>
          <input type="file" multiple @change="handleFileChange" />
          <div v-if="attachments.length" class="attachment-preview">
            <div v-for="(file, idx) in attachments" :key="idx" class="preview-item">
              <img v-if="file.type.startsWith('image/')" :src="file.preview" style="max-width:80px;max-height:80px;" />
              <span v-else>{{ file.name }}</span>
            </div>
          </div>
        </div>
        <button type="submit" class="btn">提交工單</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const ticket = ref({
  title: '',
  category: '',
  description: '',
  email: '',
  priority: '',
  assignee: '',
  attachments: [] as File[]
});
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
const submitTicket = () => {
  console.log('提交工單', ticket.value);
  router.push('/support');
};
</script>

<style scoped>
.create-ticket {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.container {
  background: unset;
  box-shadow: unset;
  padding: unset;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}
.ticket-form .form-group {
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
.btn {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
}
.btn:hover {
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
  .create-ticket {
    padding: 10px;
  }
}
</style>
