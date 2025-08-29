<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnnouncementStore } from '@/stores/modules/announcement'

// Router
const route = useRoute()
const router = useRouter()

// Store
const announcementStore = useAnnouncementStore()

// Computed
const announcement = computed(() => announcementStore.currentAnnouncement)
const loading = computed(() => announcementStore.loading)
const error = computed(() => announcementStore.error)

const announcementId = computed(() => parseInt(route.params.id as string))

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAnnouncementType = (announcement: any): string => {
  if (announcement.priority > 5) return 'event'
  if (announcement.announcementAreaId === 1) return 'promo'
  if (announcement.announcementAreaId === 2) return 'service'
  return 'news'
}

const getTagLabel = (type: string) => {
  const labels: Record<string, string> = {
    promo: '優惠',
    event: '活動',
    service: '服務',
    news: '公告'
  }
  return labels[type] || '公告'
}

const getTagStyle = (type: string) => {
  const styles: Record<string, { background: string; color: string }> = {
    promo: { background: '#FFE8A3', color: '#6B4E00' },
    event: { background: '#D6F5FF', color: '#004B5A' },
    service: { background: '#EAEAFF', color: '#2D1E7A' },
    news: { background: '#EAF7E6', color: '#215D16' }
  }
  return styles[type] || { background: '#EEE', color: '#333' }
}

const goBack = () => {
  // 檢查是否有歷史記錄可以返回
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // 如果沒有歷史記錄，默認返回首頁
    router.push({ name: 'home' })
  }
}

const goToAnnouncementsList = () => {
  router.push({ name: 'announcements' })
}

const shareAnnouncement = () => {
  if (navigator.share && announcement.value) {
    navigator.share({
      title: announcement.value.title,
      text: announcement.value.title,
      url: window.location.href
    })
  } else {
    // 複製連結到剪貼簿
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('連結已複製到剪貼簿')
    })
  }
}

// 生命周期
onMounted(async () => {
  if (announcementId.value) {
    await announcementStore.fetchAnnouncementById(announcementId.value)
  }
})
</script>

<template>
  <div class="announcement-detail-page">
    <div class="container">
      <!-- Error State -->
      <div v-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button class="btn btn-primary" @click="$router.go(-1)">返回上頁</button>
          <button class="btn btn-secondary" @click="goBack">回到公告列表</button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>載入中...</span>
      </div>

      <!-- Announcement Content -->
      <div v-else-if="announcement" class="announcement-content">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-item">首頁</router-link>
          <span class="breadcrumb-separator">/</span>
          <router-link to="/announcements" class="breadcrumb-item">公告中心</router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ announcement.title }}</span>
        </nav>

        <!-- Article Header -->
        <header class="article-header">
          <div class="article-meta">
            <span 
              class="article-tag"
              :style="getTagStyle(getAnnouncementType(announcement))"
            >
              {{ getTagLabel(getAnnouncementType(announcement)) }}
            </span>
            <span v-if="announcement.priority > 0" class="pinned-badge">置頂</span>
          </div>

          <h1 class="article-title">{{ announcement.title }}</h1>

          <div class="article-info">
            <div class="publish-date">
              <span class="info-label">發佈日期：</span>
              <time :datetime="announcement.createdAt">
                {{ formatDate(announcement.createdAt) }}
              </time>
            </div>
            
            <div class="view-count">
              <span class="info-label">瀏覽次數：</span>
              <span>{{ announcement.viewCount }}</span>
            </div>

            <div class="validity-period" v-if="announcement.startAt || announcement.endAt">
              <span class="info-label">有效期間：</span>
              <span>
                {{ formatDateTime(announcement.startAt) }} 
                - 
                {{ formatDateTime(announcement.endAt) }}
              </span>
            </div>
          </div>

          <div class="article-actions">
            <button class="action-btn" @click="goBack">
              ← 返回
            </button>
            <button class="action-btn" @click="goToAnnouncementsList">
              📄 公告列表
            </button>
            <button class="action-btn" @click="shareAnnouncement">
              🔗 分享
            </button>
          </div>
        </header>

        <!-- Article Body -->
        <article class="article-body">
          <div class="content-wrapper" v-html="announcement.content"></div>
        </article>

        <!-- Article Footer -->
        <footer class="article-footer">
          <div class="footer-info">
            <div class="created-by" v-if="announcement.createdBy">
              發佈者：{{ announcement.createdBy }}
            </div>
            <div class="last-updated">
              最後更新：{{ formatDateTime(announcement.updatedAt) }}
            </div>
          </div>

          <div class="footer-actions">
            <button class="btn btn-secondary" @click="goBack">
              返回上頁
            </button>
            <button class="btn btn-primary" @click="goToAnnouncementsList">
              瀏覽更多公告
            </button>
          </div>
        </footer>
      </div>

      <!-- Not Found State -->
      <div v-else class="not-found-state">
        <div class="not-found-icon">📄</div>
        <h2>找不到此公告</h2>
        <p>您要查看的公告可能已被刪除或不存在</p>
        <div class="not-found-actions">
          <button class="btn btn-primary" @click="goBack">返回公告列表</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.announcement-detail-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

/* States */
.loading-state,
.error-state,
.not-found-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.loading-state {
  gap: 16px;
}

.error-state,
.not-found-state {
  gap: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.not-found-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.error-state p,
.not-found-state p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.not-found-state h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.error-actions,
.not-found-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

/* Announcement Content */
.announcement-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Breadcrumb */
.breadcrumb {
  padding: 20px 32px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #666;
}

.breadcrumb-item {
  color: var(--blue);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #2563eb;
}

.breadcrumb-separator {
  margin: 0 8px;
}

.breadcrumb-current {
  color: #333;
  font-weight: 600;
}

/* Article Header */
.article-header {
  padding: 32px 32px 24px 32px;
  border-bottom: 1px solid #eee;
}

.article-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.article-tag {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
}

.pinned-badge {
  background: #ff4757;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.article-title {
  font-size: 32px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.3;
  margin: 0 0 20px 0;
}

.article-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.info-label {
  font-weight: 600;
  color: #333;
}

.publish-date,
.view-count,
.validity-period {
  color: #666;
}

.article-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

/* Article Body */
.article-body {
  padding: 32px;
}

.content-wrapper {
  line-height: 1.8;
  font-size: 16px;
  color: #333;
}

.content-wrapper :deep(h1),
.content-wrapper :deep(h2),
.content-wrapper :deep(h3),
.content-wrapper :deep(h4),
.content-wrapper :deep(h5),
.content-wrapper :deep(h6) {
  margin: 24px 0 16px 0;
  font-weight: 700;
  color: #1a1a1a;
}

.content-wrapper :deep(p) {
  margin: 16px 0;
  line-height: 1.8;
}

.content-wrapper :deep(ul),
.content-wrapper :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.content-wrapper :deep(li) {
  margin: 8px 0;
}

.content-wrapper :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
}

.content-wrapper :deep(iframe) {
  max-width: 100%;
  border-radius: 8px;
  margin: 16px 0;
}

.content-wrapper :deep(blockquote) {
  margin: 16px 0;
  padding: 16px 20px;
  background: #f8f9fa;
  border-left: 4px solid var(--blue);
  border-radius: 0 8px 8px 0;
}

.content-wrapper :deep(code) {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}

.content-wrapper :deep(pre) {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

/* Article Footer */
.article-footer {
  padding: 24px 32px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.created-by,
.last-updated {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background: var(--blue);
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .announcement-detail-page {
    padding: 20px 0;
  }

  .container {
    padding: 0 16px;
  }

  .breadcrumb,
  .article-header,
  .article-body,
  .article-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-actions {
    flex-wrap: wrap;
  }

  .article-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .footer-actions {
    width: 100%;
  }

  .footer-actions .btn {
    width: 100%;
  }
}
</style>