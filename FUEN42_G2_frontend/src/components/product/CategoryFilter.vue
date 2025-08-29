<script setup lang="ts">
import { ref, computed, onMounted, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '@/api/modules/product'
import type { ProductAPI } from '@/types/api'

// B組 (李奕錡) - 分類篩選組件 (參考 Shopee/Momo 側邊欄設計)

const router = useRouter()

interface Props {
  selectedCategoryId?: number | string | null
  priceRange?: { min: number | null; max: number | null }
  selectedRating?: number | null
  showInStockOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategoryId: null,
  priceRange: () => ({ min: null, max: null }),
  selectedRating: null,
  showInStockOnly: false
})

const emit = defineEmits<{
  categoryChange: [categoryId: number | string | null]
  priceRangeChange: [priceRange: { min: number | null; max: number | null }]
  ratingChange: [rating: number | null]
  stockFilterChange: [showInStockOnly: boolean]
  clearFilters: []
}>()

// 響應式數據
const categories = ref<ProductAPI.CategoryInfo[]>([])
const expandedCategories = ref<Set<number>>(new Set())
const loading = ref(false)
const showCategoryDropdown = ref(false) // 控制分類下拉選單顯示

// 價格範圍選項
const priceRanges = [
  { label: '全部價格', min: null, max: null },
  { label: 'NT$ 0 - 500', min: 0, max: 500 },
  { label: 'NT$ 500 - 1,000', min: 500, max: 1000 },
  { label: 'NT$ 1,000 - 2,000', min: 1000, max: 2000 },
  { label: 'NT$ 2,000 - 5,000', min: 2000, max: 5000 },
  { label: 'NT$ 5,000 以上', min: 5000, max: null }
]

// 評分選項
const ratingOptions = [
  { label: '全部評分', value: null },
  { label: '4星以上', value: 4 },
  { label: '3星以上', value: 3 },
  { label: '2星以上', value: 2 },
  { label: '1星以上', value: 1 }
]

// 本地狀態
const localPriceRange = ref({ ...props.priceRange })
const localRating = ref(props.selectedRating)
const localShowInStockOnly = ref(props.showInStockOnly)
const hasUserInteracted = ref(false) // 追蹤用戶是否有互動過

// 計算屬性 - 建立分類樹狀結構
const categoryTree = computed(() => {
  const tree: ProductAPI.CategoryInfo[] = []
  const categoryMap = new Map<number, ProductAPI.CategoryInfo>()

  // 創建所有分類的映射
  categories.value.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  // 建立樹狀結構
  categories.value.forEach(category => {
    const categoryNode = categoryMap.get(category.id)!
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(categoryNode)
      }
    } else {
      tree.push(categoryNode)
    }
  })

  return tree.sort((a, b) => a.sortOrder - b.sortOrder)
})

// 判斷分類是否展開
const isCategoryExpanded = (categoryId: number) => {
  return expandedCategories.value.has(categoryId)
}

// 切換分類展開狀態
const toggleCategory = (categoryId: number) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId)
  } else {
    expandedCategories.value.add(categoryId)
  }
}

// 選擇分類
const selectCategory = (categoryId: number | null) => {
  hasUserInteracted.value = true
  emit('categoryChange', categoryId)
}

// 切換分類下拉選單
const toggleCategoryDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value
}

// 選擇分類並導航到商品頁面
const selectCategoryAndNavigate = (categoryId: number) => {
  router.push(`/products?category=${categoryId}`)
  showCategoryDropdown.value = false
}

// 所有頂級分類（用於下拉選單）
const topLevelCategories = computed(() => {
  return categories.value.filter(category => !category.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
})

// 分類圖標映射（與首頁 CategoryGrid 保持一致）
const categoryIconMap: Record<number, string> = {
  6: '📱', // 電腦與周邊配件
  7: '🐱', // 寵物
  9: '👗', // 女生衣著
  139: '👠', // 女鞋
  10: '🍼', // 母嬰用品
  29: '👔', // 男生衣著
  30: '👟', // 男鞋
  31: '🏋️', // 運動/健身
  32: '📚', // 書籍/雜誌期刊
  35: '🏠', // 居家生活
}

// 獲取分類圖標
const getCategoryIcon = (categoryId: number): string => {
  return categoryIconMap[categoryId] || '📦'
}

// 獲取當前選中的分類信息
const selectedCategoryInfo = computed(() => {
  if (!props.selectedCategoryId || typeof props.selectedCategoryId !== 'number') {
    return null
  }
  
  const category = categories.value.find(c => c.id === props.selectedCategoryId)
  if (category) {
    return {
      ...category,
      icon: getCategoryIcon(category.id)
    }
  }
  return null
})

// 選擇價格範圍
const selectPriceRange = (priceRange: { min: number | null; max: number | null }) => {
  localPriceRange.value = { ...priceRange }
  emit('priceRangeChange', priceRange)
}

// 選擇評分
const selectRating = (rating: number | null) => {
  localRating.value = rating
  emit('ratingChange', rating)
}

// 切換庫存篩選
const toggleStockFilter = () => {
  localShowInStockOnly.value = !localShowInStockOnly.value
  emit('stockFilterChange', localShowInStockOnly.value)
}

// 清除所有篩選
const clearAllFilters = () => {
  localPriceRange.value = { min: null, max: null }
  localRating.value = null
  localShowInStockOnly.value = false
  hasUserInteracted.value = false
  emit('clearFilters')
}

// 檢查價格範圍是否被選中
const isPriceRangeSelected = (range: { min: number | null; max: number | null }) => {
  return localPriceRange.value.min === range.min && localPriceRange.value.max === range.max
}

// 獲取分類列表
const fetchCategories = async () => {
  try {
    loading.value = true
    categories.value = await productApi.getCategories()
    
    // 預設展開第一層分類
    categories.value.forEach(category => {
      if (!category.parentId) {
        expandedCategories.value.add(category.id)
      }
    })
  } catch (error) {
    console.error('獲取分類失敗:', error)
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchCategories()
})

// 分類節點組件
const CategoryNode = defineComponent({
  props: {
    category: {
      type: Object as () => ProductAPI.CategoryInfo,
      required: true
    },
    level: {
      type: Number,
      required: true
    },
    selectedId: {
      type: [Number, null] as any,
      default: null
    },
    expandedIds: {
      type: Object as () => Set<number>,
      required: true
    }
  },
  emits: ['select', 'toggle'],
  setup(props, { emit }) {
    const hasChildren = computed(() => {
      return props.category.children && props.category.children.length > 0
    })

    const isSelected = computed(() => {
      return props.selectedId === props.category.id
    })

    const isExpanded = computed(() => {
      return props.expandedIds.has(props.category.id)
    })

    return {
      hasChildren,
      isSelected,
      isExpanded,
      selectCategory: (id: number) => emit('select', id),
      toggleCategory: (id: number) => emit('toggle', id)
    }
  },
  template: `
    <div class="category-node">
      <div 
        class="category-item"
        :class="{
          'category-item--selected': isSelected,
          [\`category-item--level-\${level}\`]: true
        }"
        :style="{ paddingLeft: \`\${level * 16 + 12}px\` }"
      >
        <button 
          v-if="hasChildren"
          class="category-toggle"
          @click.stop="toggleCategory(category.id)"
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12"
            :class="{ 'rotated': isExpanded }"
          >
            <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" fill="none" stroke-width="1.5"/>
          </svg>
        </button>
        
        <span 
          class="category-name"
          @click="selectCategory(category.id)"
        >
          {{ category.categoryName }}
        </span>
      </div>
      
      <!-- 遞歸渲染子分類 -->
      <div v-if="hasChildren && isExpanded" class="category-children">
        <CategoryNode 
          v-for="child in category.children"
          :key="child.id"
          :category="child"
          :level="level + 1"
          :selected-id="selectedId"
          :expanded-ids="expandedIds"
          @select="selectCategory"
          @toggle="toggleCategory"
        />
      </div>
    </div>
  `
})
</script>

<template>
  <div class="category-filter">
    <!-- 篩選標題 -->
    <div class="filter-header">
      <h3 class="filter-title">篩選條件</h3>
      <button 
        class="clear-filters-btn"
        @click="clearAllFilters"
      >
        清除篩選
      </button>
    </div>

    <!-- 分類篩選 -->
    <div class="filter-section">
      <div class="category-dropdown-wrapper">
        <button 
          class="category-dropdown-trigger"
          @click="toggleCategoryDropdown"
          :class="{ 'active': showCategoryDropdown }"
        >
          <span class="category-dropdown-title">商品分類</span>
          <svg 
            class="category-dropdown-arrow"
            :class="{ 'rotated': showCategoryDropdown }"
            width="12" 
            height="12" 
            viewBox="0 0 12 12"
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" fill="none" stroke-width="1.5"/>
          </svg>
        </button>
        
        <!-- 下拉選單 -->
        <div 
          v-if="showCategoryDropdown" 
          class="category-dropdown-menu"
        >
          <div v-if="loading" class="dropdown-loading">
            載入中...
          </div>
          <div v-else class="dropdown-categories">
            <div 
              v-for="category in topLevelCategories" 
              :key="category.id"
              class="dropdown-category-item"
              @click="selectCategoryAndNavigate(category.id)"
            >
              <div class="category-icon">
                <span class="category-emoji">
                  {{ getCategoryIcon(category.id) }}
                </span>
              </div>
              <div class="category-info">
                <span class="category-name">{{ category.categoryName }}</span>
                <span v-if="category.description" class="category-desc">
                  {{ category.description }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 當前選中分類顯示 -->
      <div v-if="selectedCategoryInfo" class="current-category">
        <div class="current-category-content">
          <div class="current-category-icon">
            <span class="current-category-emoji">
              {{ selectedCategoryInfo.icon }}
            </span>
          </div>
          <div class="current-category-info">
            <span class="current-category-label">目前分類</span>
            <span class="current-category-name">{{ selectedCategoryInfo.categoryName }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 價格篩選 -->
    <div class="filter-section">
      <h4 class="filter-section__title">價格範圍</h4>
      <div class="price-filter">
        <div 
          v-for="range in priceRanges" 
          :key="`${range.min}-${range.max}`"
          class="price-option"
          :class="{ 'price-option--selected': isPriceRangeSelected(range) }"
          @click="selectPriceRange(range)"
        >
          {{ range.label }}
        </div>
      </div>
    </div>

    <!-- 評分篩選 -->
    <div class="filter-section">
      <h4 class="filter-section__title">用戶評分</h4>
      <div class="rating-filter">
        <div 
          v-for="rating in ratingOptions" 
          :key="rating.value || 'all'"
          class="rating-option"
          :class="{ 'rating-option--selected': localRating === rating.value }"
          @click="selectRating(rating.value)"
        >
          <span v-if="rating.value" class="rating-stars">
            <span v-for="i in 5" :key="i" 
                  :class="i <= rating.value ? 'star star--filled' : 'star'">
              ★
            </span>
          </span>
          <span class="rating-label">{{ rating.label }}</span>
        </div>
      </div>
    </div>

    <!-- 庫存篩選 -->
    <div class="filter-section">
      <h4 class="filter-section__title">其他條件</h4>
      <div class="other-filters">
        <label class="checkbox-filter">
          <input 
            type="checkbox" 
            v-model="localShowInStockOnly"
            @change="toggleStockFilter"
          >
          <span class="checkbox-label">只顯示有庫存</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-filter {
  background: #ffffff;
  color: #0f172a;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f8fafc;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
  height: fit-content;
  position: sticky;
  top: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 篩選標題 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f977;
}

.filter-title {
  font-size: 18px;
  font-weight: 700;
  color: #0b1220;
  margin: 0;
}

.clear-filters-btn {
  background: none;
  border: none;
  color: #0b1220;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: #f1f5f977;
}

/* 篩選區塊 */
.filter-section {
  margin-bottom: 28px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-section__title {
  font-size: 16px;
  font-weight: 600;
  color: #0b1220;
  margin: 0 0 16px 0;
}

/* 載入狀態 */
.filter-loading {
  text-align: center;
  padding: 20px;
  color: #6b7280;
}

/* 分類下拉選單 */
.category-dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e6e9ee;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #0b1220;
  transition: all 0.2s ease;
}

.category-dropdown-trigger:hover {
  border-color: #0b1220;
  background: #f8fafc;
}

.category-dropdown-trigger.active {
  border-color: #0b1220;
  background: #f8fafc;
}

.category-dropdown-title {
  font-size: 16px;
  font-weight: 600;
}

.category-dropdown-arrow {
  color: #6b7280;
  transition: transform 0.2s ease;
}

.category-dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.category-dropdown-menu {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e6e9ee;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
  margin-bottom: 16px;
}

.dropdown-loading {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.dropdown-categories {
  padding: 8px 0;
}

.dropdown-category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-category-item:hover {
  background: #f8fafc;
}

.dropdown-category-item:hover .category-icon {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-category-item:last-child {
  border-bottom: none;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.category-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
}

.category-emoji {
  font-size: 20px;
  position: relative;
  z-index: 1;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-placeholder {
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  position: relative;
  z-index: 1;
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-category-item .category-name {
  font-size: 14px;
  font-weight: 500;
  color: #0b1220;
  line-height: 1.4;
}

.category-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 當前選中分類顯示 */
.current-category {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.current-category-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-category-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  flex-shrink: 0;
}

.current-category-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
}

.current-category-emoji {
  font-size: 24px;
  position: relative;
  z-index: 1;
}

.current-category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.current-category-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.current-category-name {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

/* 分類列表 */
.category-list {
  max-height: 300px;
  overflow-y: auto;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #374151;
  position: relative;
  margin-bottom: 4px;
}

.category-item:hover {
  background: #f8fafc;
  color: #0b1220;
}

.category-item--selected {
  background: #c7c9cc77;
  color: #1d1d1f;
  font-weight: 600;
}

.category-item--all {
  font-weight: 600;
  color: #0b1220;
  border-bottom: 1px solid #f1f5f977;
  margin-bottom: 12px;
}

.category-toggle {
  background: none;
  border: none;
  padding: 4px;
  margin-right: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.category-toggle svg.rotated {
  transform: rotate(90deg);
}

.category-name {
  flex: 1;
  cursor: pointer;
}

/* 價格篩選 */
.price-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-option {
  padding: 12px 16px;
  border: 1px solid #e6e9ee;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s ease;
  background: #ffffff;
}

.price-option:hover {
  border-color: #0b1220;
  background: #f8fafc;
}

.price-option--selected {
  background: #c7c9cc77;
  color: #0b1220;
  border-color: #e2e8f0;
  font-weight: 600;
}

/* 評分篩選 */
.rating-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
}

.rating-option:hover {
  background: #f8fafc;
}

.rating-option--selected {
  background: #c7c9cc77;
  color: #0b1220;
  font-weight: 600;
}

.rating-stars {
  display: flex;
}

.star {
  color: #e5e7eb;
  font-size: 16px;
}

.star--filled {
  color: #f59e0b;
}

.rating-label {
  font-size: 14px;
}

/* 其他篩選 */
.other-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 0;
}

.checkbox-filter input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #0b1220;
}

.checkbox-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .category-filter {
    padding: 20px;
  }
  
  .filter-header {
    margin-bottom: 16px;
  }
  
  .filter-section {
    margin-bottom: 24px;
  }
}
</style>