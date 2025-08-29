<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementStore } from '@/stores/modules/announcement'
import { announcementApi } from '@/api/modules/announcement'
import type { CouponAPI } from '@/types/api'

// Router
const router = useRouter()

// Store
const announcementStore = useAnnouncementStore()

// Local state for expand/collapse
const expandedItems = ref<Set<number>>(new Set())

// Computed
const announcements = computed(() => announcementStore.homeAnnouncements)
const loading = computed(() => announcementStore.loading)

// Methods
function toggleAnnouncement(announcementId: number) {
  if (expandedItems.value.has(announcementId)) {
    expandedItems.value.delete(announcementId)
  } else {
    expandedItems.value.add(announcementId)
  }
}

function isExpanded(announcementId: number): boolean {
  return expandedItems.value.has(announcementId)
}

function goToAnnouncementDetail(announcementId: number) {
  router.push({ name: 'announcement-detail', params: { id: announcementId.toString() } })
}

function getAnnouncementType(announcement: CouponAPI.AnnouncementInfo): string {
  // 根據公告區域或優先級判斷類型
  if (announcement.priority > 5) return 'event'
  if (announcement.announcementAreaId === 1) return 'promo'
  if (announcement.announcementAreaId === 2) return 'service'
  return 'news'
}

function getTagLabel(type: string) {
  const labels: Record<string, string> = {
    event: '活動',
    service: '服務',
    news: '公告'
  }
  return labels[type] || '公告'
}

function getTagBg(type: string) {
  const colors: Record<string, string> = {
    promo: '#FFE8A3',
    event: '#D6F5FF',
    service: '#EAEAFF',
    news: '#EAF7E6'
  }
  return colors[type] || '#EEE'
}

function getTagFg(type: string) {
  const colors: Record<string, string> = {
    promo: '#6B4E00',
    event: '#004B5A',
    service: '#2D1E7A',
    news: '#215D16'
  }
  return colors[type] || '#333'
}

function formatDate(iso: string) {
  const date = new Date(iso)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 生命周期
onMounted(async () => {
  console.log('📢 AnnouncementSection 載入中...')
  
  // 載入首頁公告 - 獲取前台區域(ID=1)的活動公告
  await announcementStore.fetchHomeAnnouncements(1, 5)
  
  // 如果沒有數據，嘗試獲取所有活動公告
  if (announcements.value.length === 0) {
    console.log('📢 前台區域無公告，嘗試獲取所有活動公告...')
    await announcementStore.fetchHomeAnnouncements(undefined, 5)
  }
  
  // 如果還是沒數據，直接調用API測試
  if (announcements.value.length === 0) {
    console.log('📢 嘗試直接調用API...')
    try {
      const response = await announcementApi.getActiveAnnouncements(1, 5)
      console.log('📢 直接API調用結果:', response.data)
      if (response.data && response.data.length > 0) {
        announcementStore.homeAnnouncements = response.data
      }
    } catch (error) {
      console.error('📢 直接API調用失敗:', error)
    }
  }
  
  // 預設展開第一個公告
  if (announcements.value.length > 0) {
    expandedItems.value.add(announcements.value[0].id)
  }
  
  // 調試信息
  console.log('📢 最終公告數據:', announcements.value)
  console.log('📢 homeAnnouncements:', announcementStore.homeAnnouncements)
})
</script>

<template>
  <section class="announcements-section">
    <div class="container">
      <h2 class="section-title">最新公告</h2>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>載入中...</span>
      </div>
      
      <!-- Announcements List -->
      <div v-else-if="announcements.length > 0" class="notice-list">
        <div class="notice-item" v-for="announcement in announcements" :key="announcement.id">
          <div class="notice-head">
            <div class="notice-info">
              <span 
                class="notice-tag" 
                :style="{ 
                  background: getTagBg(getAnnouncementType(announcement)),
                  color: getTagFg(getAnnouncementType(announcement))
                }"
              >
                {{ getTagLabel(getAnnouncementType(announcement)) }}
              </span>
              <span 
                class="notice-title clickable" 
                @click="goToAnnouncementDetail(announcement.id)"
                :title="'點擊查看完整內容'"
              >
                {{ announcement.title }}
              </span>
            </div>
            <div class="notice-meta">
              <span>{{ formatDate(announcement.createdAt) }}</span>
              <span v-if="announcement.priority > 0" class="pinned">置頂</span>
              <button 
                class="expand-btn"
                @click="toggleAnnouncement(announcement.id)"
                :class="{ expanded: isExpanded(announcement.id) }"
                :title="isExpanded(announcement.id) ? '收合預覽' : '展開預覽'"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="notice-body">
            <div class="collapse" :class="{ open: isExpanded(announcement.id) }">
              <div class="notice-content">
                <div class="content-preview" v-html="announcement.content"></div>
                <div class="view-full-btn">
                  <button 
                    class="btn-primary"
                    @click="goToAnnouncementDetail(announcement.id)"
                  >
                    查看完整內容
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📢</div>
        <p>目前沒有公告</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.announcements-section {
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  text-align: left;
  margin-bottom: 18px;
}

.notice-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.notice-item {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
}

.notice-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  transition: background 0.2s;
}

.notice-head:hover {
  background: #f9f9f9;
}

.notice-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.notice-tag {
  font-size: 12px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.notice-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-title.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.notice-title.clickable:hover {
  color: var(--system-blue);
  text-decoration: underline;
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 12px;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-btn:hover {
  background: #f0f0f0;
  color: var(--system-blue);
}

.expand-btn.expanded {
  transform: rotate(180deg);
}

.expand-btn svg {
  transition: transform 0.2s ease;
}

.pinned {
  color: #d0021b;
  font-weight: 700;
}

.collapse {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}

.collapse.open {
  max-height: 360px;
}

.notice-body {
  padding: 0 16px;
}

.notice-content {
  padding: 8px 0 16px;
  color: #666;
  line-height: 1.6;
}

.content-preview {
  max-height: 100px;
  overflow: hidden;
  position: relative;
  margin-bottom: 12px;
}

.content-preview::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(transparent, white);
}

.view-full-btn {
  text-align: right;
  margin-top: 8px;
}

.btn-primary {
  background: var(--system-blue);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--system-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

@media (max-width: 768px) {
  .notice-head {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .notice-info {
    width: 100%;
  }
}
</style>