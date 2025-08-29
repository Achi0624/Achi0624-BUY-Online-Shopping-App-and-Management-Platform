<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCouponStore } from '@/stores/modules/coupon'
import { useUserStore } from '@/stores/user'
import CouponCard from './CouponCard.vue'
import type { CouponAPI } from '@/types/api'

interface Props {
  title?: string
  limit?: number
  showFilters?: boolean
  showPagination?: boolean
  filterParams?: Partial<CouponAPI.CouponListRequest>
}

const props = withDefaults(defineProps<Props>(), {
  title: '優惠券',
  limit: 12,
  showFilters: true,
  showPagination: true,
  filterParams: () => ({})
})

// Stores
const couponStore = useCouponStore()
const userStore = useUserStore()

// Local state
const filters = ref({
  keyword: '',
  ...props.filterParams
})

// Computed
const coupons = computed(() => couponStore.coupons)
const loading = computed(() => couponStore.loading)
const error = computed(() => couponStore.error)
const currentPage = computed(() => couponStore.currentPage)
const totalPages = computed(() => couponStore.totalPages)
const totalCount = computed(() => couponStore.totalCount)

// 已移除「狀態」與「折扣類型」下拉選單相關選項

// Methods
const fetchCoupons = async () => {
  // Spread filters first, then explicitly set required paging fields to
  // ensure we don't accidentally overwrite them with undefined values
  // coming from props.filterParams. Use `limit` to match backend/API types.
  const params: CouponAPI.CouponListRequest = {
    ...filters.value as Partial<CouponAPI.CouponListRequest>,
    page: currentPage.value,
    pageSize: props.limit
  }

  await couponStore.fetchCoupons(params)
}

const handleSearch = () => {
  couponStore.setPage(1)
  fetchCoupons()
}

const handlePageChange = (page: number) => {
  couponStore.setPage(page)
  fetchCoupons()
}

const handleClaimCoupon = async (coupon: CouponAPI.CouponInfo) => {
  try {
    const currentUser = userStore.user
    if (!currentUser) {
      // 導向登入頁面
      alert('請先登入會員')
      return
    }

    await couponStore.claimCoupon(coupon.id, currentUser.id)
    alert('優惠券領取成功！')
  } catch (error) {
    console.error('領取優惠券失敗:', error)
    alert('領取失敗，請稍後再試')
  }
}

const handleUseCoupon = (coupon: CouponAPI.CouponInfo) => {
  // 複製優惠券代碼到剪貼簿
  navigator.clipboard.writeText(coupon.couponCode).then(() => {
    alert(`優惠券代碼已複製: ${coupon.couponCode}`)
  }).catch(() => {
    alert(`優惠券代碼: ${coupon.couponCode}`)
  })
}

// 判斷當前使用者是否已領取指定 coupon
const isClaimed = (couponId: number) => {
  return couponStore.memberCoupons.some(mc => mc.couponId === couponId)
}

const clearFilters = () => {
  filters.value = {
    keyword: '',
    ...props.filterParams
  }
  handleSearch()
}

// 生命周期
onMounted(() => {
  fetchCoupons()
})
</script>

<template>
  <div class="coupon-list">
    <!-- Header -->
    <div class="list-header">
      <h2 class="list-title">{{ title }}</h2>
      <div class="list-meta" v-if="!loading">
        共 {{ totalCount }} 張優惠券
      </div>
    </div>

    <!-- Filters -->
    <div class="filters" v-if="showFilters">
      <div class="filter-row">
        <div class="filter-group">
          <label>搜尋</label>
          <input 
            v-model="filters.keyword" 
            type="text" 
            placeholder="搜尋優惠券名稱或代碼"
            @keyup.enter="handleSearch"
          />
        </div>

  <!-- 已移除狀態與折扣類型下拉選單 -->

  <div class="filter-actions">
          <button class="btn btn-primary" @click="handleSearch">搜尋</button>
          <button class="btn btn-secondary" @click="clearFilters">清除</button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchCoupons">重新載入</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>載入中...</span>
    </div>

    <!-- Coupons Grid -->
    <div v-else-if="coupons.length > 0" class="coupons-grid">
      <CouponCard
        v-for="coupon in coupons"
        :key="coupon.id"
        :coupon="coupon"
        :claimed="isClaimed(coupon.id)"
        @claim="handleClaimCoupon"
        @use="handleUseCoupon"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎫</div>
      <p>沒有找到符合條件的優惠券</p>
      <button class="btn btn-secondary" @click="clearFilters">清除篩選條件</button>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && totalPages > 1" class="pagination">
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
</template>

<style scoped>
.coupon-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.list-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}

.list-meta {
  color: #666;
  font-size: 14px;
}

/* Filters */
.filters {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.filter-group input,
.filter-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-actions {
  display: flex;
  gap: 8px;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-state {
  gap: 12px;
}

.error-state,
.empty-state {
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--blue);
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

/* Grid */
.coupons-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
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
  padding: 10px 20px;
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
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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

  .coupons-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>