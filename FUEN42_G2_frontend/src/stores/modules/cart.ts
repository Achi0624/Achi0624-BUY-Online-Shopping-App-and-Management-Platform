/**
 * 購物車狀態管理
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 購物車系統
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userBehaviorTracker, { type CartItem as BehaviorCartItem } from '@/utils/userBehaviorTracker'

// 購物車項目類型
export interface CartItem {
  id: string                // 購物車項目唯一ID (productId + specId)
  productId: number         // 商品ID
  productSpecId?: number    // 商品規格ID (可選)
  productName: string       // 商品名稱
  specName?: string         // 規格名稱
  price: number            // 單價
  quantity: number         // 數量
  maxQuantity: number      // 庫存上限
  imageUrl?: string        // 商品圖片
  vendorId: number         // 廠商ID
  vendorName: string       // 廠商名稱
  isAvailable: boolean     // 是否可購買
  note?: string           // 備註
  createdAt: Date         // 加入購物車時間
}

// 購物車摘要
export interface CartSummary {
  totalItems: number       // 總商品數量
  totalAmount: number      // 總金額
  totalDiscount: number    // 總折扣
  shippingFee: number      // 運費
  finalAmount: number      // 最終金額
}

export const useCartStore = defineStore('cart', () => {
  // ==================== State ====================
  const items = ref<CartItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ==================== Getters ====================
  
  // 購物車項目數量
  const itemCount = computed(() => 
    items.value.reduce((total, item) => total + item.quantity, 0)
  )

  // 購物車是否為空
  const isEmpty = computed(() => items.value.length === 0)

  // 按廠商分組的商品
  const itemsByVendor = computed(() => {
    const groups: Record<number, { vendor: { id: number; name: string }, items: CartItem[] }> = {}
    
    items.value.forEach(item => {
      if (!groups[item.vendorId]) {
        groups[item.vendorId] = {
          vendor: { id: item.vendorId, name: item.vendorName },
          items: []
        }
      }
      groups[item.vendorId].items.push(item)
    })
    
    return Object.values(groups)
  })

  // 購物車摘要
  const summary = computed<CartSummary>(() => {
    const totalItems = itemCount.value
    const totalAmount = items.value
      .filter(item => item.isAvailable)
      .reduce((total, item) => total + ((item.price || 0) * item.quantity), 0)
    
    // TODO: 後續整合優惠券系統計算折扣
    const totalDiscount = 0
    
    // TODO: 後續整合物流系統計算運費
    const shippingFee = totalAmount >= 1000 ? 0 : 100 // 滿1000免運費
    
    return {
      totalItems,
      totalAmount,
      totalDiscount,
      shippingFee,
      finalAmount: totalAmount - totalDiscount + shippingFee
    }
  })

  // 選中的商品（可購買的商品）
  const availableItems = computed(() => 
    items.value.filter(item => item.isAvailable)
  )

  // 不可購買的商品
  const unavailableItems = computed(() => 
    items.value.filter(item => !item.isAvailable)
  )

  // ==================== Actions ====================

  /**
   * 載入購物車（從 localStorage 恢復）
   * C組修改：支援會員別購物車
   */
  const loadCart = () => {
    try {
      // 取得會員 ID
      const userStore = localStorage.getItem('user')
      let memberId = 'guest'
      
      if (userStore) {
        try {
          const user = JSON.parse(userStore)
          memberId = (user.id || user.memberId || 'guest').toString()
        } catch (e) {
          // 保持 guest
        }
      }
      
      // 優先載入會員專屬購物車
      const cartKey = `cart_${memberId}`
      let saved = localStorage.getItem(cartKey)
      
      // 如果沒有會員購物車，嘗試載入通用購物車
      if (!saved) {
        saved = localStorage.getItem('cart')
      }
      
      if (saved) {
        const data = JSON.parse(saved)
        items.value = data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }))
      }
    } catch (err) {
      console.error('載入購物車失敗:', err)
    }
  }

  /**
   * 保存購物車到 localStorage
   * C組修改：支援會員別購物車
   */
  const saveCart = () => {
    try {
      // 取得會員 ID
      const userStore = localStorage.getItem('user')
      let memberId = 'guest'
      
      if (userStore) {
        try {
          const user = JSON.parse(userStore)
          memberId = (user.id || user.memberId || 'guest').toString()
        } catch (e) {
          // 保持 guest
        }
      }
      
      // 依會員 ID 儲存購物車
      const cartKey = `cart_${memberId}`
      localStorage.setItem(cartKey, JSON.stringify(items.value))
      
      // 同時保存通用購物車（向下相容）
      localStorage.setItem('cart', JSON.stringify(items.value))
      
      // 追蹤購物車變化
      trackCartBehavior()
    } catch (err) {
      console.error('保存購物車失敗:', err)
    }
  }

  /**
   * 追蹤購物車行為變化
   */
  const trackCartBehavior = () => {
    try {
      // 轉換購物車項目格式為行為追蹤格式
      const behaviorCartItems: BehaviorCartItem[] = items.value.map(item => ({
        productId: item.productId,
        productName: item.productName,
        categoryId: 1, // 暫時設定為1，實際應該從商品信息中獲取
        categoryName: '一般商品', // 暫時設定，實際應該從商品信息中獲取
        price: item.price,
        quantity: item.quantity,
        vendorId: item.vendorId,
        addedAt: item.createdAt.getTime()
      }))
      
      userBehaviorTracker.trackCartChange(behaviorCartItems)
    } catch (error) {
      console.error('購物車行為追蹤失敗:', error)
    }
  }

  /**
   * 添加商品到購物車
   */
  const addItem = (product: {
    productId: number
    productSpecId?: number
    productName: string
    specName?: string
    price: number
    maxQuantity: number
    imageUrl?: string
    vendorId: number
    vendorName: string
    quantity?: number
  }) => {
    const itemId = `${product.productId}-${product.productSpecId || 0}`
    const existingItem = items.value.find(item => item.id === itemId)
    
    if (existingItem) {
      // 如果商品已存在，增加數量
      const newQuantity = existingItem.quantity + (product.quantity || 1)
      if (newQuantity <= product.maxQuantity) {
        existingItem.quantity = newQuantity
      } else {
        error.value = '商品數量超過庫存上限'
        return false
      }
    } else {
      // 新增商品
      const newItem: CartItem = {
        id: itemId,
        productId: product.productId,
        productSpecId: product.productSpecId,
        productName: product.productName,
        specName: product.specName,
        price: product.price,
        quantity: product.quantity || 1,
        maxQuantity: product.maxQuantity,
        imageUrl: product.imageUrl,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        isAvailable: true,
        createdAt: new Date()
      }
      items.value.push(newItem)
    }
    
    saveCart()
    error.value = null
    return true
  }

  /**
   * 更新商品數量
   */
  const updateQuantity = (itemId: string, quantity: number) => {
    const item = items.value.find(item => item.id === itemId)
    if (!item) return false
    
    if (quantity <= 0) {
      removeItem(itemId)
      return true
    }
    
    if (quantity > item.maxQuantity) {
      error.value = '商品數量超過庫存上限'
      return false
    }
    
    item.quantity = quantity
    saveCart()
    error.value = null
    return true
  }

  /**
   * 移除商品
   */
  const removeItem = (itemId: string) => {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      items.value.splice(index, 1)
      saveCart()
    }
  }

  /**
   * 移除廠商的所有商品
   */
  const removeVendorItems = (vendorId: number) => {
    items.value = items.value.filter(item => item.vendorId !== vendorId)
    saveCart()
  }

  /**
   * 清空購物車
   */
  const clearCart = () => {
    items.value = []
    saveCart()
  }

  /**
   * 檢查庫存並更新商品狀態
   * TODO: 後續整合後端 API
   */
  const checkInventory = async () => {
    loading.value = true
    try {
      // TODO: 調用庫存檢查 API
      // const response = await inventoryApi.checkItems(items.value)
      
      // Mock 實現
      items.value.forEach(item => {
        // 模擬庫存檢查
        item.isAvailable = item.quantity <= item.maxQuantity
      })
    } catch (err) {
      error.value = '庫存檢查失敗'
    } finally {
      loading.value = false
    }
  }

  /**
   * 獲取購物車項目詳細資訊
   * TODO: 後續整合商品 API
   */
  const refreshItemDetails = async () => {
    loading.value = true
    try {
      // TODO: 批量獲取商品最新資訊
      // const productIds = items.value.map(item => item.productId)
      // const response = await productApi.getProducts(productIds)
      
      // 更新商品資訊（價格、庫存等）
      console.log('刷新商品資訊 - TODO: 整合商品 API')
    } catch (err) {
      error.value = '刷新商品資訊失敗'
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除錯誤訊息
   */
  const clearError = () => {
    error.value = null
  }

  // 初始化時載入購物車
  loadCart()
  
  // 清空舊的不完整資料
  if (items.value.some(item => !item.maxQuantity || !item.productName)) {
    console.log('🧹 偵測到不完整的購物車資料，正在清空...')
    clearCart()
  }

  return {
    // State
    items,
    loading,
    error,
    
    // Getters
    itemCount,
    isEmpty,
    itemsByVendor,
    summary,
    availableItems,
    unavailableItems,
    
    // Actions
    loadCart,
    saveCart,
    addItem,
    updateQuantity,
    removeItem,
    removeVendorItems,
    clearCart,
    checkInventory,
    refreshItemDetails,
    clearError
  }
})