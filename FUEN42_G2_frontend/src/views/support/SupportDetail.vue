<template> <!-- 模板開始：定義頁面結構 -->
  <div class="ticket-detail"> <!-- 外層容器：提供背景與內距 -->
    <div class="container"> <!-- 固定寬度容器：控制內容寬度與置中 -->
      <h1 class="title">客服單詳情</h1> <!-- 頁面標題：清楚說明這頁用途 -->

      <div style="text-align:right;margin-bottom:16px;"> <!-- 右上方編輯按鈕區域 -->
        <router-link :to="`/support/edit/${ticket.id}`" class="btn btn-primary">編輯</router-link> <!-- 編輯按鈕 -->
      </div> <!-- 編輯按鈕區域結束 -->

      <div class="meta-card"> <!-- 基本資訊卡片：顯示關鍵欄位摘要 -->
        <div class="meta-row"> <!-- 單列：放置多個欄位 -->
          <div class="meta-item"> <!-- 欄位盒：工單編號 -->
            <div class="meta-label">編號</div> <!-- 欄位標籤 -->
            <div class="meta-value">#{{ ticket.id }}</div> <!-- 欄位值：以井號格式展示 -->
          </div> <!-- 欄位盒結束 -->
          <div class="meta-item wide"> <!-- 欄位盒：標題，寬度加大 -->
            <div class="meta-label">標題</div> <!-- 欄位標籤 -->
            <div class="meta-value">{{ ticket.title }}</div> <!-- 欄位值：工單標題 -->
          </div> <!-- 欄位盒結束 -->
        </div> <!-- 單列結束 -->

        <div class="meta-row"> <!-- 第二列：類別與狀態 -->
          <div class="meta-item"> <!-- 欄位盒：問題類別 -->
            <div class="meta-label">問題類別</div> <!-- 標籤 -->
            <div class="meta-value">{{ ticket.category }}</div> <!-- 值 -->
          </div> <!-- 欄位盒結束 -->
          <div class="meta-item"> <!-- 欄位盒：狀態 -->
            <div class="meta-label">狀態</div> <!-- 標籤 -->
            <div class="meta-value"> <!-- 值容器：含徽章樣式 -->
              <span class="status-badge" :data-status="ticket.status">{{ ticket.status }}</span> <!-- 狀態徽章 -->
            </div> <!-- 值容器結束 -->
          </div> <!-- 欄位盒結束 -->
          <div class="meta-item"> <!-- 欄位盒：優先級 -->
            <div class="meta-label">優先級</div> <!-- 標籤 -->
            <div class="meta-value">{{ ticket.priority }}</div> <!-- 值 -->
          </div> <!-- 欄位盒結束 -->
        </div> <!-- 第二列結束 -->

        <div class="meta-row"> <!-- 第三列：負責人與問題描述 -->
          <div class="meta-item"> <!-- 欄位盒：負責人 -->
            <div class="meta-label">負責人</div> <!-- 標籤 -->
            <div class="message-center-link">
              <router-link :to="'/support/message'" class="action-btn">前往訊息中心</router-link>
            </div>
          </div> <!-- 欄位盒結束 -->
          <div class="meta-item"> <!-- 欄位盒：建立時間 -->
            <div class="meta-label">建立時間</div> <!-- 標籤 -->
            <div class="meta-value">{{ ticket.createdAt }}</div> <!-- 值 -->
          </div> <!-- 欄位盒結束 -->
          <div class="meta-item"> <!-- 欄位盒：修改時間 -->
            <div class="meta-label">修改時間</div> <!-- 標籤 -->
            <div class="meta-value">{{ ticket.updatedAt }}</div> <!-- 值 -->
          </div> <!-- 欄位盒結束 -->
        </div> <!-- 第三列結束 -->
      </div> <!-- 基本資訊卡片結束 -->


      <div class="actions"> <!-- 底部操作列：提供返回與建立新單 -->
        <router-link to="/support/list" class="btn ghost">返回列表</router-link> <!-- 返回列表按鈕 -->
        <router-link to="/support/create" class="btn primary">建立新客服單</router-link> <!-- 建立新單按鈕 -->
      </div> <!-- 底部操作列結束 -->
    </div> <!-- 固定寬度容器結束 -->
  </div> <!-- 外層容器結束 -->
</template> <!-- 模板結束 -->

<script setup lang="ts"> // 腳本開始：使用 <script setup> 與 TypeScript
import { ref, onMounted } from 'vue'; // 匯入 ref 與 onMounted 用於狀態管理與生命週期
import { useRoute } from 'vue-router'; // 匯入 useRoute 取得路由參數

const route = useRoute() // 取得目前路由物件
const ticket = ref({ id: '', title: '', category: '', status: '', priority: '', assignee: '', description: '', email: '', createdAt: '', updatedAt: '' }) // 定義工單狀態物件
const comments = ref([ // 定義留言紀錄
  { author: '王小明', role: '用戶', content: '請問什麼時候會處理？', time: '2025-08-20 10:12' },
  { author: '客服小美', role: '客服', content: '您好，已收到您的問題，會盡快處理！', time: '2025-08-20 10:15' }
])
const newComment = ref('') // 定義新留言狀態

onMounted(() => { // 元件掛載後取得資料
  const ticketId = String(route.params.id); // 取得路由中的工單編號參數並轉字串
  // 模擬從後端獲取數據
  const mockData = [
    { id: '1', title: '訂單延遲', category: 'order', status: '處理中', priority: '高', assignee: '張三', description: '訂單延遲說明', email: 'test1@mail.com', createdAt: '2025-08-20', updatedAt: '2025-08-21' },
    { id: '2', title: '商品破損', category: 'product', status: '已回覆', priority: '中', assignee: '李四', description: '商品破損說明', email: 'test2@mail.com', createdAt: '2025-08-18', updatedAt: '2025-08-19' },
    { id: '3', title: '信用卡付款失敗', category: 'payment', status: '已關閉', priority: '低', assignee: '王五', description: '付款失敗說明', email: 'test3@mail.com', createdAt: '2025-08-16', updatedAt: '2025-08-17' },
  ]; // 假資料清單
  ticket.value = mockData.find((t) => t.id === ticketId) || ticket.value // 根據 ID 尋找對應的工單資料
}) // onMounted 結束

const sendComment = () => { // 發送留言函式
  if (!newComment.value.trim()) return // 忽略空白留言
  comments.value.push({ // 新增留言到留言清單
    author: '王小明', // 實際應根據登入者資訊取得
    role: '用戶',
    content: newComment.value,
    time: new Date().toLocaleString('zh-TW', { hour12: false }) // 使用當前時間
  })
  newComment.value = '' // 清空留言輸入框
}
</script> <!-- 腳本結束 -->

<style scoped> /* 樣式開始：僅作用於此元件 */
.ticket-detail { /* 頁面外層背景與內距 */
  padding: 60px 20px; /* 四周間距 */
  background-color: #f8f9fa; /* 淺灰背景 */
  min-height: 80vh; /* 最小高度 */
} /* 外層樣式結束 */

.container { /* 固定寬度容器 */
  max-width: 900px; /* 最大寬度 */
  margin: 0 auto; /* 水平置中 */
  background: white; /* 背景白色 */
  padding: 40px; /* 內距 */
  border-radius: 12px; /* 圓角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 陰影 */
} /* 容器樣式結束 */

.title { /* 頁面標題樣式 */
  font-size: 2rem; /* 字級 */
  font-weight: bold; /* 粗體 */
  margin-bottom: 30px; /* 下方距離 */
  color: #333; /* 文字色 */
  text-align: center; /* 文字置中 */
} /* 標題樣式結束 */

.meta-card { /* 基本資訊卡片樣式 */
  background: #f1f1f1; /* 卡片底色 */
  border-radius: 8px; /* 圓角 */
  padding: 24px; /* 內距 */
  margin-bottom: 24px; /* 下方距離 */
} /* 基本資訊卡片樣式結束 */

.meta-row { /* 基本資訊行容器 */
  display: flex; /* 水平排列 */
  gap: 24px; /* 欄間距 */
  margin-bottom: 16px; /* 與下一行距離 */
} /* 行容器樣式結束 */

.meta-item { /* 單一欄位容器 */
  flex: 1; /* 彈性盒子：等比擴展 */
} /* 欄位容器樣式結束 */

.meta-item.wide { /* 需要加寬的欄位 */
  flex: 2; /* 彈性盒子：雙倍擴展 */
} /* 加寬樣式結束 */

.meta-label { /* 欄位標籤樣式 */
  font-weight: bold; /* 粗體 */
  color: #555; /* 文字色 */
  margin-bottom: 4px; /* 下方距離 */
} /* 標籤樣式結束 */

.meta-value { /* 欄位值樣式 */
  color: #222; /* 文字色 */
  font-size: 1.1rem; /* 字級 */
} /* 值樣式結束 */

.status-badge { /* 狀態徽章樣式 */
  padding: 2px 8px; /* 內距 */
  border-radius: 4px; /* 圓角 */
  font-size: 0.85rem; /* 字級 */
  color: #fff; /* 文字白 */
} /* 徽章樣式結束 */

.status-badge[data-status="處理中"] { /* 處理中狀態顏色 */
  background: #ffc107; /* 背景橘黃 */
} /* 處理中樣式結束 */

.status-badge[data-status="已回覆"] { /* 已回覆狀態顏色 */
  background: #17a2b8; /* 背景藍綠 */
} /* 已回覆樣式結束 */

.status-badge[data-status="已關閉"] { /* 已關閉狀態顏色 */
  background: #6c757d; /* 背景灰 */
} /* 已關閉樣式結束 */

.actions { /* 底部操作列樣式 */
  display: flex; /* 水平排列 */
  gap: 12px; /* 按鈕間距 */
  justify-content: flex-end; /* 向右對齊 */
  margin-top: 12px; /* 與上方卡片距離 */
} /* 底部操作列樣式結束 */

.btn { /* 通用按鈕樣式 */
  display: inline-block; /* 行內區塊 */
  background-color: #007bff; /* 背景主色 */
  color: #fff; /* 文字白 */
  padding: 6px 16px; /* 內距 */
  border-radius: 4px; /* 圓角 */
  text-decoration: none; /* 無底線 */
  font-size: 1rem; /* 字級 */
  border: none; /* 無邊框 */
  cursor: pointer; /* 滑鼠指標變手勢 */
  transition: background-color 0.2s; /* 過場動畫 */
} /* 通用按鈕樣式結束 */

.btn-primary { /* 主要按鈕樣式 */
  background-color: #007bff; /* 背景主色 */
} /* 主要按鈕樣式結束 */

.btn-primary:hover { /* 主要按鈕滑過樣式 */
  background-color: #0056b3; /* 深一點藍 */
} /* 主要按鈕滑過結束 */

.btn.ghost { /* 次要透明按鈕樣式 */
  background-color: #ffffff; /* 白底 */
  color: #333333; /* 深色字 */
  border: 1px solid #e5e7eb; /* 淺灰邊框 */
} /* 透明按鈕樣式結束 */

.btn.ghost:hover { /* 透明按鈕滑過樣式 */
  background-color: #f8f9fa; /* 微灰底 */
  border-color: #d1d5db; /* 邊框變深 */
} /* 透明按鈕滑過結束 */

.comment-section { /* 留言紀錄區塊樣式 */
  margin-top: 32px; /* 上方距離 */
  background: #f9f9f9; /* 背景色 */
  border-radius: 8px; /* 圓角 */
  padding: 24px; /* 內距 */
} /* 留言紀錄區塊樣式結束 */

.comment-title { /* 留言標題樣式 */
  font-size: 1.2rem; /* 字級 */
  font-weight: bold; /* 粗體 */
  margin-bottom: 16px; /* 下方距離 */
} /* 留言標題樣式結束 */

.comment-list { /* 留言清單樣式 */
  margin-bottom: 16px; /* 下方距離 */
} /* 留言清單樣式結束 */

.comment-item { /* 單一留言項目樣式 */
  padding: 12px 0; /* 上下內距 */
  border-bottom: 1px solid #eee; /* 下方邊框 */
} /* 單一留言項目樣式結束 */

.comment-item.客服 { /* 客服留言特殊樣式 */
  background: #e6f7ff; /* 背景藍色 */
} /* 客服留言樣式結束 */

.comment-header { /* 留言頭部樣式 */
  display: flex; /* 水平排列 */
  justify-content: space-between; /* 兩端對齊 */
  font-size: 0.95rem; /* 字級 */
  margin-bottom: 4px; /* 下方距離 */
} /* 留言頭部樣式結束 */

.comment-author { /* 留言者名稱樣式 */
  font-weight: bold; /* 粗體 */
} /* 留言者名稱樣式結束 */

.badge { /* 標籤樣式 */
  background: #007bff; /* 背景主色 */
  color: #fff; /* 文字白 */
  border-radius: 4px; /* 圓角 */
  padding: 2px 6px; /* 內距 */
  font-size: 0.8rem; /* 字級 */
  margin-left: 4px; /* 左方距離 */
} /* 標籤樣式結束 */

.comment-time { /* 留言時間樣式 */
  color: #888; /* 文字色 */
} /* 留言時間樣式結束 */

.comment-content { /* 留言內容樣式 */
  font-size: 1rem; /* 字級 */
  color: #222; /* 文字色 */
} /* 留言內容樣式結束 */

.comment-form { /* 留言表單樣式 */
  display: flex; /* 水平排列 */
  gap: 8px; /* 欄位間距 */
} /* 留言表單樣式結束 */

.comment-form input { /* 留言輸入框樣式 */
  flex: 1; /* 彈性盒子：填滿剩餘空間 */
  padding: 0.5rem; /* 內距 */
  font-size: 1rem; /* 字級 */
  border-radius: 6px; /* 圓角 */
  border: 1px solid #ddd; /* 淺灰邊框 */
  background: #f8f9fa; /* 淺灰背景 */
} /* 留言輸入框樣式結束 */

.comment-form .btn { /* 表單內按鈕樣式 */
  padding: 0.5rem 1rem; /* 內距 */
  font-size: 1rem; /* 字級 */
  border-radius: 6px; /* 圓角 */
} /* 表單內按鈕樣式結束 */

@media (max-width: 600px) { /* 響應式樣式：手機與小平板 */
  .container { /* 固定寬度容器 */
    padding: 10px; /* 內距 */
  } /* 容器樣式結束 */

  .meta-card { /* 基本資訊卡片 */
    padding: 12px; /* 內距 */
  } /* 基本資訊卡片樣式結束 */

  .comment-section { /* 留言區塊 */
    padding: 12px; /* 內距 */
  } /* 留言區塊樣式結束 */
} /* 響應式樣式結束 */
</style> <!-- 樣式結束 -->
