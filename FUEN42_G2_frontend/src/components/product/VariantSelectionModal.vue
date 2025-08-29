<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ProductAPI } from '@/types/api'

interface Props {
  isVisible: boolean
  product: ProductAPI.ProductDetailInfo | null
  actionType: 'addToCart' | 'buyNow'
}

interface Emits {
  close: []
  confirm: [selectedVariants: Record<string, string>, quantity: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedVariants = ref<Record<string, string>>({})
const quantity = ref(1)
const showError = ref(false)
const errorMessage = ref('')

// 重置表單
const resetForm = () => {
  selectedVariants.value = {}
  quantity.value = 1
  showError.value = false
  errorMessage.value = ''
  
  // 不預設選擇任何規格，讓用戶必須主動選擇
}

// 監聽 modal 開啟狀態
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

// 規格來源：優先使用後端提供的 variantTypes/variants，若無則從 specifications 推導（尺寸/顏色）
const effectiveVariantTypes = computed(() => {
  const vt = props.product?.variantTypes || []
  if (vt.length > 0) return vt

  const sizeColorNames = ['尺寸', '顏色']
  const specs = props.product?.specifications || []
  const groups: Record<string, Set<string>> = {}
  specs.forEach(s => {
    if (sizeColorNames.includes(s.specName)) {
      groups[s.specName] = groups[s.specName] || new Set<string>()
      groups[s.specName].add(s.specValue)
    }
  })
  const names = Object.keys(groups)
  return names.map((name, idx) => ({ id: 1000 + idx, typeName: name }))
})

const effectiveVariants = computed(() => {
  const v = props.product?.variants || []
  if (v.length > 0) return v

  // 從 specifications 生成虛擬 variants（使用商品基礎價格與庫存）
  const sizeColorNames = ['尺寸', '顏色']
  const specs = props.product?.specifications || []
  const groups: Record<string, string[]> = {}
  specs.forEach(s => {
    if (sizeColorNames.includes(s.specName)) {
      groups[s.specName] = groups[s.specName] || []
      if (!groups[s.specName].includes(s.specValue)) groups[s.specName].push(s.specValue)
    }
  })
  const types = effectiveVariantTypes.value
  const result: Array<ProductAPI.ProductVariantInfo> = [] as any
  types.forEach((t, ti) => {
    const values = groups[t.typeName] || []
    values.forEach((val, vi) => {
      result.push({
        id: 10000 + ti * 100 + vi,
        productId: props.product?.id || 0,
        variantTypeId: t.id,
        variantValue: val,
        price: props.product?.basePrice || 0,
        stock: props.product?.stock || 0
      } as ProductAPI.ProductVariantInfo)
    })
  })
  return result
})

// 計算當前選中的規格
const currentVariant = computed(() => {
  if (!effectiveVariants.value.length) return null
  
  return effectiveVariants.value.find(variant => {
    return Object.entries(selectedVariants.value).every(([typeName, value]) => {
      const variantType = effectiveVariantTypes.value.find(t => t.typeName === typeName)
      return variantType && variant.variantTypeId === variantType.id && variant.variantValue === value
    })
  })
})

// 計算當前價格和庫存
const currentPrice = computed(() => {
  return currentVariant.value?.price || props.product?.basePrice || 0
})

const currentStock = computed(() => {
  return currentVariant.value?.stock || props.product?.stock || 0
})

// 檢查是否所有必要規格都已選擇
const isAllVariantsSelected = computed(() => {
  if (!effectiveVariantTypes.value.length) return true
  return effectiveVariantTypes.value.every(type => selectedVariants.value[type.typeName])
})

// 格式化價格
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(price)
}

// 選擇規格
const selectVariant = (typeName: string, value: string) => {
  selectedVariants.value = {
    ...selectedVariants.value,
    [typeName]: value
  }
  showError.value = false
}

// 調整數量
const adjustQuantity = (delta: number) => {
  const newQuantity = quantity.value + delta
  if (newQuantity >= 1 && newQuantity <= currentStock.value) {
    quantity.value = newQuantity
  }
}

// 關閉 modal
const closeModal = () => {
  emit('close')
}

// 確認選擇
const confirmSelection = () => {
  // 驗證是否所有規格都已選擇
  if (!isAllVariantsSelected.value) {
    showError.value = true
    errorMessage.value = '請選擇所有商品規格'
    return
  }
  
  // 檢查庫存
  if (currentStock.value <= 0) {
    showError.value = true
    errorMessage.value = '此規格商品目前缺貨'
    return
  }
  
  // 檢查數量
  if (quantity.value > currentStock.value) {
    showError.value = true
    errorMessage.value = `數量不能超過庫存 ${currentStock.value}`
    return
  }
  
  emit('confirm', selectedVariants.value, quantity.value)
  closeModal()
}

// 取得動作按鈕文字
const actionButtonText = computed(() => {
  return props.actionType === 'addToCart' ? '加入購物車' : '直接購買'
})
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Modal 標題 -->
      <div class="modal-header">
        <h3 class="modal-title">選擇商品規格</h3>
        <button class="close-btn" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- 商品基本資訊 -->
      <div v-if="product" class="product-summary">
        <div class="product-image">
          <img 
            :src="product.media?.[0]?.mediaUrl || '/images/placeholder-product.jpg'" 
            :alt="product.productName"
          >
        </div>
        <div class="product-info">
          <h4 class="product-name">{{ product.productName }}</h4>
          <div class="product-price">{{ formatPrice(currentPrice) }}</div>
          <div class="product-stock">庫存：{{ currentStock }} 件</div>
        </div>
      </div>

      <!-- 規格選擇 -->
      <div v-if="effectiveVariantTypes.length" class="variants-section">
        <div 
          v-for="variantType in effectiveVariantTypes" 
          :key="variantType.id"
          class="variant-group"
        >
          <h5 class="variant-title">{{ variantType.typeName }}：</h5>
          <div class="variant-options">
            <button 
              v-for="variant in effectiveVariants.filter(v => v.variantTypeId === variantType.id)"
              :key="variant.id"
              class="variant-option"
              :class="{ 
                'variant-option--selected': selectedVariants[variantType.typeName] === variant.variantValue,
                'variant-option--disabled': variant.stock <= 0
              }"
              :disabled="variant.stock <= 0"
              @click="selectVariant(variantType.typeName, variant.variantValue)"
            >
              {{ variant.variantValue }}
              <span v-if="variant.price !== currentPrice" class="variant-price">
                +{{ formatPrice(Math.abs(variant.price - currentPrice)) }}
              </span>
              <span v-if="variant.stock <= 0" class="out-of-stock">缺貨</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 數量選擇 -->
      <div class="quantity-section">
        <label class="quantity-title">數量：</label>
        <div class="quantity-controls">
          <button 
            class="quantity-btn"
            :disabled="quantity <= 1"
            @click="adjustQuantity(-1)"
          >
            -
          </button>
          <input 
            v-model.number="quantity"
            type="number"
            min="1"
            :max="currentStock"
            class="quantity-input"
          >
          <button 
            class="quantity-btn"
            :disabled="quantity >= currentStock"
            @click="adjustQuantity(1)"
          >
            +
          </button>
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="showError" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- 操作按鈕 -->
      <div class="modal-actions">
        <button class="btn-cancel" @click="closeModal">取消</button>
        <button 
          class="btn-confirm" 
          :disabled="!isAllVariantsSelected || currentStock <= 0"
          @click="confirmSelection"
        >
          {{ actionButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Modal 標題 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #374151;
}

/* 商品摘要 */
.product-summary {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 4px;
}

.product-stock {
  font-size: 14px;
  color: #6b7280;
}

/* 規格選擇 */
.variants-section {
  padding: 20px 24px;
}

.variant-group {
  margin-bottom: 20px;
}

.variant-group:last-child {
  margin-bottom: 0;
}

.variant-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.variant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.variant-option {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;
  position: relative;
  min-width: 80px;
  text-align: center;
}

.variant-option:hover:not(:disabled) {
  border-color: #6b7280;
}

.variant-option--selected {
  border-color: #1e293b;
  background: #1e293b;
  color: white;
}

.variant-option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.variant-price {
  display: block;
  font-size: 12px;
  color: #dc2626;
  font-weight: 600;
  margin-top: 2px;
}

.variant-option--selected .variant-price {
  color: #fef2f2;
}

.out-of-stock {
  display: block;
  font-size: 11px;
  color: #ef4444;
  margin-top: 2px;
}

/* 數量選擇 */
.quantity-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
}

.quantity-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f9fafb;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  transition: background-color 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 60px;
  height: 40px;
  border: none;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  background: white;
}

.quantity-input:focus {
  outline: none;
}

/* 錯誤訊息 */
.error-message {
  padding: 12px 24px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  border-left: 4px solid #dc2626;
  margin: 0 24px;
  border-radius: 0 4px 4px 0;
}

/* 操作按鈕 */
.modal-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f8fafc;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-cancel:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
}

.btn-confirm {
  background: #1e293b;
  color: white;
  border: 2px solid #1e293b;
}

.btn-confirm:hover:not(:disabled) {
  background: #334155;
  border-color: #334155;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .product-summary {
    padding: 16px 20px;
  }
  
  .variants-section,
  .quantity-section,
  .modal-actions {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .variant-options {
    gap: 6px;
  }
  
  .variant-option {
    padding: 8px 12px;
    min-width: 70px;
    font-size: 13px;
  }
}
</style>