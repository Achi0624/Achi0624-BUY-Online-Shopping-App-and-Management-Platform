<template>
  <div class="message-center">
    <h1 class="title">客服訊息中心</h1>
    <div v-if="ticketId" class="ticket-id">工單編號：{{ ticketId }}</div>
    <div v-if="ticketId">
      <div class="message-list">
        <div v-for="(c, idx) in comments" :key="idx" class="message-item" :class="c.role">
          <div class="message-header">
            <span class="message-author">{{ c.author }} <span v-if="c.role==='客服'" class="badge">客服</span></span>
            <span class="message-time">{{ c.time }}</span>
          </div>
          <div class="message-content">{{ c.content }}</div>
        </div>
      </div>
      <form @submit.prevent="sendComment" class="message-form">
        <input v-model="newComment" type="text" placeholder="輸入留言內容..." required />
        <button type="submit" class="btn">送出</button>
      </form>
    </div>
    <div v-else class="empty-tip" style="text-align:center;color:#888;margin-top:32px;">請從客服單列表點選「訊息中心」進入指定工單</div>
  </div>
</template>

<script setup lang="ts"> // 使用 <script setup> 並指定 TypeScript

import { computed } from 'vue' // 匯入 computed 來建立可計算屬性
import { useRoute } from 'vue-router' // 匯入 useRoute 讀取目前路由參數與查詢字串

// 宣告本元件可接受的 props，保留你原本的 ticketId 設計（例如父層以 :ticket-id 傳入）
const props = defineProps<{ ticketId?: string | number }>() // props 物件包含可選的 ticketId 欄位

const route = useRoute() // 取得當前路由物件，之後可讀取 route.params 與 route.query

// 將 ticketId 正規化：優先使用 props，其次使用路由參數 :id，再來支援 query string ticketId
const ticketId = computed<string | undefined>(() => {
  // 1. props 傳入
  if (props.ticketId !== undefined && props.ticketId !== null) {
    return String(props.ticketId)
  }
  // 2. 路由參數 /support/message/:id
  if (route.params?.id !== undefined && route.params?.id !== null) {
    return String(route.params.id)
  }
  // 3. 查詢字串 /support/message?ticketId=xxx
  if (route.query?.ticketId !== undefined && route.query?.ticketId !== null) {
    return String(route.query.ticketId)
  }
  // 4. 查詢字串 /support/message?id=xxx（兼容舊寫法）
  if (route.query?.id !== undefined && route.query?.id !== null) {
    return String(route.query.id)
  }
  // 都沒有則 undefined
  return undefined
})

// 以下為你的留言暫存資料與送出邏輯，保持不變
import { ref } from 'vue' // 匯入 ref 來建立響應式資料
const comments = ref([ // 建立留言陣列的響應式變數
  { author: '王小明', role: '用戶', content: '請問什麼時候會處理？', time: '2025-08-20 10:12' }, // 範例留言一
  { author: '客服小美', role: '客服', content: '您好，已收到您的問題，會盡快處理！', time: '2025-08-20 10:15' } // 範例留言二
]) // ref 結束

const newComment = ref('') // 文字輸入框的雙向綁定內容

const sendComment = () => { // 送出留言的事件處理器
  if (!newComment.value.trim()) return // 若輸入為空白則不處理
  comments.value.push({ // 將新留言推入列表
    author: '王小明', // 此處示範用，實務上請改為登入者資訊
    role: '用戶', // 角色標記為用戶
    content: newComment.value, // 使用者輸入的留言內容
    time: new Date().toLocaleString('zh-TW', { hour12: false }) // 產生目前時間字串（24 小時制）
  }) // push 結束
  newComment.value = '' // 清空輸入框
} // sendComment 結束

</script> // 腳本結束


<style scoped>
.message-center {
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  padding: 32px 24px;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 24px;
  color: #333;
  text-align: center;
}
.message-list {
  margin-bottom: 24px;
}
.message-item {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}
.message-item.客服 {
  background: #e6f7ff;
}
.message-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  margin-bottom: 4px;
}
.message-author {
  font-weight: bold;
}
.badge {
  background: #007bff;
  color: #fff;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.8rem;
  margin-left: 4px;
}
.message-time {
  color: #888;
}
.message-content {
  font-size: 1rem;
  color: #222;
}
.message-form {
  display: flex;
  gap: 8px;
}
.message-form input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #f8f9fa;
}
.message-form .btn {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 6px;
  background: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}
</style>
