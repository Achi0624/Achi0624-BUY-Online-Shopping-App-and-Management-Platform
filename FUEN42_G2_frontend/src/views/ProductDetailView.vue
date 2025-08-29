<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi } from '@/api/modules/product'
import type { ProductAPI } from '@/types/api'
import { useCartStore } from '@/stores/modules/cart'
import { useUserStore } from '@/stores/user'
import ProductImageCarousel from '@/components/product/ProductImageCarousel.vue'
import VariantSelectionModal from '@/components/product/VariantSelectionModal.vue'

// 簡化版商品詳情頁面 - 專注於資料載入和顯示

const route = useRoute()
const router = useRouter()

const productId = Number(route.params.id)
const product = ref<ProductAPI.ProductDetailInfo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const cartStore = useCartStore()
const userStore = useUserStore()

// 基本狀態
const selectedVariants = ref<Record<string, string>>({})
const quantity = ref(1)

onMounted(async () => {
  await fetchProduct()
  await initWishlist()
})

const fetchProduct = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('開始獲取商品詳情，ID:', productId)
    
    // 檢查商品ID是否有效
    if (!productId || isNaN(productId)) {
      throw new Error('商品ID無效')
    }
    
    const response = await productApi.getProductDetail(productId)
    console.log('API 響應:', response)
    
    if (!response.data) {
      throw new Error('未找到商品資料')
    }
    
    product.value = response.data
    
    // 初始化選中的規格
    if (product.value?.variants && product.value.variants.length > 0) {
      const defaultVariants: Record<string, string> = {}
      product.value.variantTypes?.forEach(type => {
        const firstVariant = product.value!.variants!.find(v => v.variantTypeId === type.id)
        if (firstVariant) {
          defaultVariants[type.typeName] = firstVariant.variantValue
        }
      })
      selectedVariants.value = defaultVariants
    }
    
  } catch (err: any) {
    console.error('獲取商品詳情失敗:', err)
    
    // 處理不同的錯誤類型
    if (err.response?.status === 404) {
      error.value = '商品不存在或已下架'
    } else if (err.response?.status === 500) {
      error.value = '伺服器錯誤，請稍後再試'
    } else if (err.request) {
      error.value = '無法連接到伺服器，請檢查網路連線'
    } else {
      error.value = err.message || '載入商品詳情失敗，請稍後重試'
    }
  } finally {
    loading.value = false
  }
}

// 計算屬性
const currentVariant = computed(() => {
  if (!product.value?.variants) return null
  
  return product.value.variants.find(variant => {
    return Object.entries(selectedVariants.value).every(([typeName, value]) => {
      const variantType = product.value!.variantTypes?.find(t => t.typeName === typeName)
      return variantType && variant.variantTypeId === variantType.id && variant.variantValue === value
    })
  })
})

const currentPrice = computed(() => {
  return currentVariant.value?.price || product.value?.basePrice || 0
})

const currentStock = computed(() => {
  return currentVariant.value?.stock || product.value?.stock || 0
})

// 已選規格文字（例如：顏色：藍 / 尺碼：L）
const selectedSpecName = computed(() => {
  if (!product.value?.variantTypes?.length) return ''
  const parts: string[] = []
  product.value.variantTypes.forEach(t => {
    const val = selectedVariants.value[t.typeName]
    if (val) parts.push(`${t.typeName}：${val}`)
  })
  return parts.join(' / ')
})

// 基本方法
const selectVariant = (typeName: string, value: string) => {
  selectedVariants.value = {
    ...selectedVariants.value,
    [typeName]: value
  }
}

const adjustQuantity = (delta: number) => {
  const newQuantity = quantity.value + delta
  if (newQuantity >= 1 && newQuantity <= currentStock.value) {
    quantity.value = newQuantity
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(price)
}

const goBack = () => {
  router.back()
}

// === 購物車/購買 ===
const hasSelectableSpecs = computed(() => {
  if (product.value?.variantTypes?.length) return true
  // 從 specifications 推導（常見為 尺寸/顏色）
  const names = new Set((product.value?.specifications || []).map(s => s.specName))
  const hasSize = names.has('尺寸')
  const hasColor = names.has('顏色')
  // 只要有任一即可要求彈窗
  return hasSize || hasColor
})
const addToCart = () => {
  if (!product.value) return
  if (currentStock.value <= 0) {
    alert('此商品目前缺貨')
    return
  }

  // 如果商品有規格選項，必須通過 Modal 選擇
  if (hasSelectableSpecs.value) {
    pendingAction.value = 'addToCart'
    showVariantModal.value = true
    return
  }

  // 無規格商品直接加入購物車
  executeAddToCart({}, quantity.value)
}

const buyNow = () => {
  if (!product.value) return
  
  // 如果商品有規格選項，必須通過 Modal 選擇
  if (hasSelectableSpecs.value) {
    pendingAction.value = 'buyNow'
    showVariantModal.value = true
    return
  }

  // 無規格商品直接購買
  executeBuyNow({}, quantity.value)
}

// 依據傳入的規格解析出對應的 variant（若有）與價格/庫存
const resolveVariantDetails = (variants: Record<string, string>) => {
  if (!product.value) return { price: 0, stock: 0, specId: undefined as number | undefined }

  // 預設為商品基礎價格與庫存
  let price = product.value.basePrice || 0
  let stock = product.value.stock || 0
  let specId: number | undefined

  if (product.value.variantTypes?.length && product.value.variants?.length) {
    // 目前資料結構為「單一規格類型一筆 variant」，
    // 因此我們取第一個被選擇的規格作為實際 variant
    const firstSelectedTypeName = Object.keys(variants)[0]
    const variantType = product.value.variantTypes.find(t => t.typeName === firstSelectedTypeName)
    const chosen = variantType
      ? product.value.variants.find(v => v.variantTypeId === variantType.id && v.variantValue === variants[firstSelectedTypeName])
      : undefined

    if (chosen) {
      price = chosen.price ?? price
      stock = chosen.stock ?? stock
      specId = chosen.id
    }
  }

  // 若後端未提供 variantTypes/variants，為規格組合生成穩定的虛擬ID
  if (!specId) {
    const name = getSelectedSpecName(variants)
    if (name) {
      // 簡單字串hash轉數字，確保不同規格不同ID
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i)
        hash |= 0
      }
      specId = 900000000 + Math.abs(hash % 1000000) // 避免與真實ID衝突
    }
  }

  return { price, stock, specId }
}

// 執行加入購物車
const executeAddToCart = (variants: Record<string, string>, qty: number) => {
  if (!product.value) return

  const { price, stock, specId } = resolveVariantDetails(variants)
  
  const ok = cartStore.addItem({
    productId: product.value.id,
    productSpecId: specId,
    productName: product.value.productName,
    specName: getSelectedSpecName(variants) || undefined,
    price: price,
    maxQuantity: stock,
    imageUrl: product.value.media?.[0]?.mediaUrl,
    vendorId: product.value.vendor?.id || 0,
    vendorName: product.value.vendor?.vendorName || '未知廠商',
    quantity: qty
  })
  if (ok) {
    alert('已加入購物車')
  }
}

// 執行直接購買
const executeBuyNow = (variants: Record<string, string>, qty: number) => {
  if (!product.value) return

  const { price, stock, specId } = resolveVariantDetails(variants)
  
  const ok = cartStore.addItem({
    productId: product.value.id,
    productSpecId: specId,
    productName: product.value.productName,
    specName: getSelectedSpecName(variants) || undefined,
    price: price,
    maxQuantity: stock,
    imageUrl: product.value.media?.[0]?.mediaUrl,
    vendorId: product.value.vendor?.id || 0,
    vendorName: product.value.vendor?.vendorName || '未知廠商',
    quantity: qty
  })
  if (ok) {
    const itemId = `${product.value.id}-${specId || 0}`
    router.push({ path: '/checkout', query: { items: itemId } })
  }
}

// 獲取選中規格名稱
const getSelectedSpecName = (variants: Record<string, string>) => {
  const parts: string[] = []
  if (product.value?.variantTypes?.length) {
    product.value.variantTypes.forEach(t => {
      const val = variants[t.typeName]
      if (val) parts.push(`${t.typeName}：${val}`)
    })
  } else {
    // 無正式 variantTypes，直接按鍵名排序輸出
    Object.keys(variants).sort().forEach(key => {
      const val = variants[key]
      if (val) parts.push(`${key}：${val}`)
    })
  }
  return parts.join(' / ')
}

// 處理 modal 確認
const handleModalConfirm = (variants: Record<string, string>, qty: number) => {
  if (pendingAction.value === 'addToCart') {
    executeAddToCart(variants, qty)
  } else if (pendingAction.value === 'buyNow') {
    executeBuyNow(variants, qty)
  }
  pendingAction.value = null
}

// 處理 modal 關閉
const handleModalClose = () => {
  showVariantModal.value = false
  pendingAction.value = null
}

// === Modal 狀態管理 ===
const showVariantModal = ref(false)
const pendingAction = ref<'addToCart' | 'buyNow' | null>(null)

// === 追蹤清單（願望清單） ===
const wishlistLoading = ref(false)
const isWishlisted = ref(false)
const wishlistHint = ref('')

const initWishlist = async () => {
  if (!userStore.isLoggedIn) {
    isWishlisted.value = false
    return
  }
  try {
    const res = await productApi.isInWishlist(productId)
    isWishlisted.value = !!res?.isInWishlist
  } catch (e) {
    // 保持現狀並提示錯誤
    wishlistHint.value = '讀取追蹤狀態失敗，請稍後重試'
    setTimeout(() => (wishlistHint.value = ''), 3000)
  }
}

const toggleWishlist = async () => {
  if (!product.value) return
  if (!userStore.isLoggedIn) {
    router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  wishlistLoading.value = true
  try {
    if (isWishlisted.value) {
      await productApi.removeFromWishlist(product.value.id)
      isWishlisted.value = false
      wishlistHint.value = '已從追蹤清單移除'
    } else {
      await productApi.addToWishlist(product.value.id)
      isWishlisted.value = true
      wishlistHint.value = '已加入追蹤清單'
    }
  } catch (e) {
  // 僅顯示錯誤，不改變狀態
  wishlistHint.value = '操作失敗，請稍後重試'
  } finally {
    wishlistLoading.value = false
    // 3 秒後清除提示
    setTimeout(() => (wishlistHint.value = ''), 3000)
  }
}
</script>

<template>
  <div class="product-detail-view">
    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>載入失敗</h3>
      <p>{{ error }}</p>
      <button @click="fetchProduct" class="retry-btn">重新載入</button>
    </div>

    <!-- 商品詳情 -->
    <div v-else-if="product" class="product-detail">
      <div class="container">
        <!-- 返回按鈕 -->
        <button @click="goBack" class="back-btn">← 返回</button>

        <!-- 商品基本資訊 -->
        <div class="product-main">
          <!-- 商品圖片輪播 -->
          <div class="product-gallery">
            <ProductImageCarousel
              :images="product.media || []"
              :product-name="product.productName"
            />
          </div>

          <!-- 商品資訊 -->
          <div class="product-info">
            <!-- 商品名稱 -->
            <h1 class="product-title">{{ product.productName }}</h1>

            <!-- 價格 -->
            <div class="price-section">
              <div class="current-price">{{ formatPrice(currentPrice) }}</div>
            </div>

            <!-- 基本資訊 -->
            <div class="product-meta">
              <div class="info-item">
                <span class="label">庫存：</span>
                <span class="value">{{ currentStock }} 件</span>
              </div>
              <div class="info-item">
                <span class="label">瀏覽次數：</span>
                <span class="value">{{ product.viewCount }}</span>
              </div>
              <div class="info-item">
                <span class="label">已售出：</span>
                <span class="value">{{ product.soldCount }} 件</span>
              </div>
              <div class="info-item">
                <span class="label">評價：</span>
                <span class="value">{{ product.rating?.toFixed(1) || '0.0' }} 分 ({{ product.reviewCount }} 則評價)</span>
              </div>
            </div>

            <!-- 商品規格（若頁面直接提供選擇，仍支持；但加入/購買仍會強制走彈窗以確保完整選擇） -->
            <div v-if="product.variantTypes?.length" class="variants-section">
              <div 
                v-for="variantType in product.variantTypes" 
                :key="variantType.id"
                class="variant-group"
              >
                <h4 class="variant-title">{{ variantType.typeName }}：</h4>
                <div class="variant-options">
                  <button 
                    v-for="variant in product.variants?.filter(v => v.variantTypeId === variantType.id)"
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
                      +{{ formatPrice(variant.price - currentPrice) }}
                    </span>
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

            <!-- 動作按鈕 -->
            <div class="action-buttons">
              <button class="btn-cart" :disabled="currentStock <= 0" @click="addToCart">加入購物車</button>
              <button class="btn-buy" :disabled="currentStock <= 0" @click="buyNow">直接購買</button>
              <button 
                class="btn-wishlist" 
                :class="{ active: isWishlisted }"
                :disabled="wishlistLoading"
                @click="toggleWishlist"
              >
                <span v-if="isWishlisted">❤️ 已追蹤</span>
                <span v-else>🤍 加入追蹤</span>
              </button>
              <div class="wishlist-hint" v-if="wishlistHint">{{ wishlistHint }}</div>
            </div>

            <!-- 賣家資訊 -->
            <div class="vendor-info">
              <h4>賣家資訊</h4>
              <div class="vendor-details">
                <div class="vendor-name">{{ product.vendor?.vendorName || '未知賣家' }}</div>
                <div class="vendor-rating">評分：{{ product.vendor?.rating?.toFixed(1) || '0.0' }} 分</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品詳細資訊 -->
        <div class="product-details">
          <!-- 商品描述 -->
          <div class="detail-section">
            <h3>商品描述</h3>
            <div class="description-content">
              <div v-if="product.description" v-html="product.description"></div>
              <div v-else class="no-content">暫無商品描述</div>
            </div>
          </div>

          <!-- 商品規格 -->
          <div class="detail-section">
            <h3>商品規格</h3>
            <div class="specs-content">
              <div v-if="product.specifications?.length" class="specs-list">
                <div 
                  v-for="spec in product.specifications" 
                  :key="spec.id"
                  class="spec-item"
                >
                  <span class="spec-name">{{ spec.specName }}：</span>
                  <span class="spec-value">{{ spec.specValue }}</span>
                </div>
              </div>
              <div v-else class="no-content">暫無規格資訊</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 無商品資料 -->
    <div v-else class="no-product">
      <p>找不到商品資料</p>
      <button @click="goBack" class="back-btn">返回</button>
    </div>

    <!-- 規格選擇 Modal -->
    <VariantSelectionModal
      :is-visible="showVariantModal"
      :product="product"
      :action-type="pendingAction || 'addToCart'"
      @close="handleModalClose"
      @confirm="handleModalConfirm"
    />
  </div>
</template>

<style scoped>
/* 簡化版商品詳情頁面樣式 */

.product-detail-view {
  min-height: calc(100vh - 120px);
  background: #f5f5f5;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 載入和錯誤狀態 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn, .back-btn {
  padding: 10px 20px;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
}

.retry-btn:hover, .back-btn:hover {
  background: #555;
}

/* 商品主要區域 */
.product-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

/* 商品圖片區域 */
.product-gallery {
  width: 100%;
}

/* 商品資訊區域 */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}

.price-section {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #333;
}

.current-price {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
  background: #fafafa;
  border-radius: 6px;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  color: #333;
}

/* 規格選擇 */
.variants-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.variant-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.variant-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.variant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.variant-option {
  padding: 8px 16px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.variant-option:hover:not(:disabled) {
  border-color: #333;
  color: #333;
}

.variant-option--selected {
  border-color: #333;
  background: #333;
  color: white;
}

.variant-option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.variant-price {
  font-size: 12px;
  font-weight: 500;
}

/* 數量選擇 */
.quantity-section {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.quantity-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #666;
  transition: background-color 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background: #e5e5e5;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 60px;
  height: 36px;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}

.quantity-input:focus {
  outline: none;
}

/* 動作按鈕 */
.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-cart,
.btn-buy {
  padding: 12px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-cart {
  background: #333;
  color: #fff;
}

.btn-cart:hover:not(:disabled) { background: #555; }

.btn-buy {
  background: #e53935;
  color: #fff;
}

.btn-buy:hover:not(:disabled) { background: #c62828; }

.btn-cart:disabled,
.btn-buy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-wishlist {
  padding: 12px 18px;
  border-radius: 6px;
  border: 2px solid #ddd;
  background: #f5f5f5;
  color: #444;
  cursor: pointer;
  font-weight: 600;
}

.btn-wishlist:hover:not(:disabled) {
  border-color: #999;
}

.btn-wishlist.active {
  background: #ffe6ea;
  border-color: #e91e63;
  color: #c2185b;
}

.wishlist-hint {
  align-self: center;
  color: #2e7d32;
  font-size: 13px;
}

/* 賣家資訊 */
.vendor-info {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.vendor-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.vendor-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.vendor-name {
  font-weight: 500;
  color: #333;
}

.vendor-rating {
  color: #666;
  font-size: 14px;
}

/* 商品詳細資訊 */
.product-details {
  display: flex;
  flex-direction: column;
  gap: 30px;
  border-top: 2px solid #f0f0f0;
  padding-top: 30px;
}

.detail-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.description-content, .specs-content {
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
  line-height: 1.6;
}

.specs-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spec-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #e5e5e5;
}

.spec-item:last-child {
  border-bottom: none;
}

.spec-name {
  font-weight: 600;
  color: #333;
  min-width: 120px;
}

.spec-value {
  color: #666;
}

.no-content {
  color: #999;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.no-product {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .product-detail-view {
    padding: 10px;
  }
  
  .container {
    padding: 20px;
  }
  
  .product-main {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .product-title {
    font-size: 20px;
  }
  
  .current-price {
    font-size: 24px;
  }
  
  .variant-options {
    gap: 6px;
  }
  
  .variant-option {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .quantity-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 15px;
  }
  
  .product-title {
    font-size: 18px;
  }
  
  .current-price {
    font-size: 22px;
  }
  
  .thumbnail {
    width: 60px;
    height: 60px;
  }
  
  .info-item {
    flex-direction: column;
    gap: 2px;
  }
}
</style>