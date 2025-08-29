<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnnouncementStore } from '@/stores/modules/announcement'
import { useRouter } from 'vue-router'
import type { CouponAPI } from '@/types/api'

// Router
const router = useRouter()

// Store
const announcementStore = useAnnouncementStore()

// Local state
const filters = ref({
  keyword: '',
  areaId: undefined as number | undefined,
  isActive: undefined as boolean | undefined
})

// Computed
const announcements = computed(() => announcementStore.announcements)
const areas = computed(() => announcementStore.announcementAreas)
const loading = computed(() => announcementStore.loading)
const error = computed(() => announcementStore.error)
const currentPage = computed(() => announcementStore.currentPage)
const totalPages = computed(() => announcementStore.totalPages)
const totalCount = computed(() => announcementStore.totalCount)

const areaOptions = computed(() => [
  { value: undefined, label: '全部分類' },
  ...areas.value.map(area => ({ value: area.id, label: area.areaName }))
])

// Methods
const fetchAnnouncements = async () => {
  const params: CouponAPI.AnnouncementListRequest = {
    page: announcementStore.currentPage,
    pageSize: 10,
    ...filters.value
  }
  
  await announcementStore.fetchAnnouncements(params)
}

const handleSearch = () => {
  announcementStore.setPage(1)
  fetchAnnouncements()
}

const handlePageChange = (page: number) => {
  announcementStore.setPage(page)
  fetchAnnouncements()
}

const viewAnnouncement = (id: number) => {
  router.push({ name: 'announcement-detail', params: { id: id.toString() } })
}

const clearFilters = () => {
  filters.value = {
    keyword: '',
    areaId: undefined,
    isActive: undefined
  }
  handleSearch()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getAnnouncementType = (announcement: CouponAPI.AnnouncementInfo): string => {
  // 根據公告區域或優先級判斷類型
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

// 生命周期
onMounted(async () => {
  await announcementStore.fetchAnnouncementAreas()
  await fetchAnnouncements()
})
</script>

<template>
  <div class="announcements-page">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">公告中心</h1>
        <p class="page-subtitle">查看最新公告與重要訊息</p>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-row">
          <div class="filter-group">
            <label>搜尋公告</label>
            <input 
              v-model="filters.keyword" 
              type="text" 
              placeholder="搜尋公告標題或內容"
              @keyup.enter="handleSearch"
            />
          </div>

          <div class="filter-group">
            <label>公告分類</label>
            <select v-model="filters.areaId">
              <option 
                v-for="option in areaOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>狀態</label>
            <select v-model="filters.isActive">
              <option :value="undefined">全部狀態</option>
              <option :value="true">已發佈</option>
              <option :value="false">草稿</option>
            </select>
          </div>

          <div class="filter-actions">
            <button class="btn btn-primary" @click="handleSearch">搜尋</button>
            <button class="btn btn-secondary" @click="clearFilters">清除</button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="page-content">
        <!-- Error State -->
        <div v-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="fetchAnnouncements">重新載入</button>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>載入中...</span>
        </div>

        <!-- Announcements List -->
        <div v-else-if="announcements.length > 0" class="announcements-list">
          <div class="list-header">
            <span class="result-count">共 {{ totalCount }} 則公告</span>
          </div>

          <div class="announcement-items">
            <div 
              v-for="announcement in announcements" 
              :key="announcement.id"
              class="announcement-item"
              @click="viewAnnouncement(announcement.id)"
            >
              <div class="announcement-header">
                <div class="announcement-meta">
                  <span 
                    class="announcement-tag"
                    :style="getTagStyle(getAnnouncementType(announcement))"
                  >
                    {{ getTagLabel(getAnnouncementType(announcement)) }}
                  </span>
                  <span v-if="announcement.priority > 0" class="pinned-badge">置頂</span>
                </div>
                <div class="announcement-date">
                  {{ formatDate(announcement.createdAt) }}
                </div>
              </div>

              <h3 class="announcement-title">{{ announcement.title }}</h3>
              
              <div class="announcement-preview" v-html="announcement.content.substring(0, 150) + '...'"></div>
              
              <div class="announcement-footer">
                <div class="view-count">
                  👁️ {{ announcement.viewCount }} 次瀏覽
                </div>
                <div class="read-more">
                  閱讀更多 →
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              class="page-btn" 
              :disabled="currentPage === 1"
              @click="handlePageChange(currentPage - 1)"
            >
              上一頁
            </button>

            <div class="page-numbers">
              <button
                v-for="page in Math.min(totalPages, 5)"
                :key="page"
                class="page-number"
                :class="{ active: page === currentPage }"
                @click="handlePageChange(page)"
              >
                {{ page }}
              </button>
              
              <span v-if="totalPages > 5">...</span>
              
              <button
                v-if="totalPages > 5"
                class="page-number"
                :class="{ active: totalPages === currentPage }"
                @click="handlePageChange(totalPages)"
              >
                {{ totalPages }}
              </button>
            </div>

            <button 
              class="page-btn" 
              :disabled="currentPage === totalPages"
              @click="handlePageChange(currentPage + 1)"
            >
              下一頁
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">📢</div>
          <p>沒有找到相關公告</p>
          <button class="btn btn-secondary" @click="clearFilters">清除篩選條件</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.announcements-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 36px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.page-subtitle {
  font-size: 18px;
  color: #666;
  margin: 0;
}

/* Filters */
.filters {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.filter-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.filter-group input,
.filter-group select {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-actions {
  display: flex;
  gap: 12px;
}

/* Page Content */
.page-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-state {
  gap: 16px;
}

.error-state,
.empty-state {
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
.empty-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.error-state p,
.empty-state p {
  font-size: 18px;
  color: #666;
  margin: 0;
}

/* Announcements List */
.announcements-list {
  padding: 32px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.result-count {
  color: #666;
  font-size: 14px;
}

.announcement-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.announcement-item {
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.announcement-item:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.announcement-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.announcement-tag {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.pinned-badge {
  background: #ff4757;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 4px;
}

.announcement-date {
  color: #999;
  font-size: 13px;
}

.announcement-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.announcement-preview {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-count {
  font-size: 13px;
  color: #999;
}

.read-more {
  color: var(--blue);
  font-weight: 600;
  font-size: 14px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
}

.page-btn,
.page-number {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number.active {
  background: var(--blue);
  color: white;
  border-color: var(--blue);
}

.page-btn:hover:not(:disabled),
.page-number:hover:not(.active) {
  background: #f8f9fa;
}

.page-numbers {
  display: flex;
  gap: 4px;
  align-items: center;
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
  .announcements-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 28px;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: auto;
  }

  .filter-actions {
    justify-content: stretch;
  }

  .filter-actions .btn {
    flex: 1;
  }

  .announcements-list {
    padding: 20px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .announcement-item {
    padding: 16px;
  }

  .announcement-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .announcement-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>