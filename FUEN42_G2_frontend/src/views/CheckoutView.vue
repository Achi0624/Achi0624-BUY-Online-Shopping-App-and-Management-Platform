<!--
  結帳流程頁面 - 重新設計版本
  
  開發者: 蔡易霖
  負責組別: C組 (組長)
  負責模組: 結帳流程系統
  
  FUEN42_G2 五人專題小組 - BUY商城系統
  © 2025 All rights reserved.
-->
<template>
  <div class="checkout-view">
    <div class="container">
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1>結帳流程</h1>
        <div class="breadcrumb">
          <router-link to="/">首頁</router-link>
          <span class="separator">></span>
          <router-link to="/cart">購物車</router-link>
          <span class="separator">></span>
          <span class="current">結帳</span>
        </div>
      </div>

      <!-- 步驟指示器 -->
      <div class="step-indicator">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-label">確認商品</div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-label">配送方式</div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 2 }"></div>
        <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
          <div class="step-number">3</div>
          <div class="step-label">付款方式</div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 3 }"></div>
        <div class="step" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
          <div class="step-number">4</div>
          <div class="step-label">確認訂單</div>
        </div>
      </div>

      <div class="checkout-content">
        <!-- 主要內容 -->
        <div class="checkout-main">
          <!-- 步驟 1: 確認商品 -->
          <div v-if="currentStep === 1" class="step-content">
            <h2>確認購買商品</h2>
            <div class="product-list">
              <div 
                v-for="item in selectedItems" 
                :key="item.id"
                class="product-item"
              >
                <img :src="item.imageUrl || '/placeholder-product.jpg'" :alt="item.productName">
                <div class="product-info">
                  <h3>{{ item.productName }}</h3>
                  <p v-if="item.specName" class="spec">{{ item.specName }}</p>
                  <p class="vendor">廠商：{{ item.vendorName }}</p>
                </div>
                <div class="product-price">
                  <span class="price">NT$ {{ formatPrice(item.price) }}</span>
                  <span class="quantity">× {{ item.quantity }}</span>
                  <span class="subtotal">NT$ {{ formatPrice(item.price * item.quantity) }}</span>
                </div>
              </div>
            </div>
            
            <!-- 優惠券選擇區域 -->
            <div class="coupon-section">
              <h3>選擇優惠券 (可選)</h3>
              
              <!-- 可用優惠券列表 -->
              <div v-if="availableCoupons.length > 0" class="available-coupons">
                <div class="coupon-list">
                  <div 
                    v-for="memberCoupon in availableCoupons" 
                    :key="memberCoupon.id"
                    class="coupon-item"
                    :class="{ selected: selectedCoupon?.id === memberCoupon.id }"
                    @click="selectCoupon(memberCoupon)"
                  >
                    <div class="coupon-header">
                      <div class="coupon-type">{{ getCouponTypeLabel(memberCoupon.coupon.couponType) }}</div>
                      <div class="coupon-value">
                        <template v-if="memberCoupon.coupon.discountType === 1">
                          NT$ {{ formatPrice(memberCoupon.coupon.discountValue) }}
                        </template>
                        <template v-else>
                          {{ memberCoupon.coupon.discountValue }}% 折扣
                        </template>
                      </div>
                    </div>
                    <h4>{{ memberCoupon.coupon.couponName }}</h4>
                    <p class="coupon-description">{{ memberCoupon.coupon.description }}</p>
                    <div class="coupon-conditions">
                      <span v-if="memberCoupon.coupon.minimumAmount" class="min-amount">
                        滿 NT$ {{ formatPrice(memberCoupon.coupon.minimumAmount) }} 可用
                      </span>
                      <span v-if="memberCoupon.coupon.maximumDiscount" class="max-discount">
                        最高折 NT$ {{ formatPrice(memberCoupon.coupon.maximumDiscount) }}
                      </span>
                    </div>
                    <div class="coupon-expire">
                      到期時間：{{ formatDate(memberCoupon.expiredAt) }}
                    </div>
                    <div v-if="selectedCoupon?.id === memberCoupon.id" class="discount-preview">
                      折扣金額：NT$ {{ formatPrice(couponDiscount) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 無可用優惠券 -->
              <div v-else-if="!loading" class="no-coupons">
                <div class="no-coupons-icon">🎫</div>
                <p>目前沒有可使用的優惠券</p>
                <router-link to="/coupons" class="btn-secondary">去領取優惠券</router-link>
              </div>

              <!-- 載入中 -->
              <div v-else class="loading-coupons">
                <div class="loading-spinner"></div>
                <p>載入優惠券中...</p>
              </div>

              <!-- 不使用優惠券選項 -->
              <div class="no-coupon-option">
                <label>
                  <input 
                    type="radio" 
                    :checked="!selectedCoupon" 
                    @change="clearSelectedCoupon"
                  >
                  不使用優惠券
                </label>
              </div>
            </div>
            
            <div class="step-actions">
              <button class="btn-primary" @click="nextStep" :disabled="selectedItems.length === 0">
                下一步：選擇配送方式
              </button>
            </div>
          </div>

          <!-- 步驟 2: 配送方式 -->
          <div v-if="currentStep === 2" class="step-content">
            <h2>選擇配送方式</h2>
            <div class="shipping-options">
              <div class="shipping-option" 
                   :class="{ active: formData.shippingType === 'home' }"
                   @click="selectShippingType('home')">
                <div class="option-header">
                  <input type="radio" 
                         name="shipping" 
                         value="home" 
                         v-model="formData.shippingType">
                  <h3>🏠 宅配到府</h3>
                  <span class="fee">運費 NT$ 100</span>
                </div>
                <p>由宅配人員送達指定地址，3-5個工作天</p>
                
                <!-- 宅配地址表單 -->
                <div v-if="formData.shippingType === 'home'" class="address-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label>收件人姓名 *</label>
                      <input type="text" v-model="formData.recipientName" placeholder="請輸入收件人姓名">
                    </div>
                    <div class="form-group">
                      <label>收件人電話 *</label>
                      <input type="tel" v-model="formData.recipientPhone" placeholder="請輸入手機號碼">
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>縣市 *</label>
                      <select v-model="formData.city">
                        <option value="">請選擇縣市</option>
                        <option value="台北市">台北市</option>
                        <option value="新北市">新北市</option>
                        <option value="桃園市">桃園市</option>
                        <option value="台中市">台中市</option>
                        <option value="台南市">台南市</option>
                        <option value="高雄市">高雄市</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>區域 *</label>
                      <input type="text" v-model="formData.district" placeholder="請輸入區域">
                    </div>
                    <div class="form-group">
                      <label>郵遞區號</label>
                      <input type="text" v-model="formData.postalCode" placeholder="請輸入郵遞區號">
                    </div>
                  </div>
                  <div class="form-group">
                    <label>詳細地址 *</label>
                    <input type="text" v-model="formData.address" placeholder="請輸入詳細地址">
                  </div>
                </div>
              </div>

              <div class="shipping-option" 
                   :class="{ active: formData.shippingType === 'store' }"
                   @click="selectShippingType('store')">
                <div class="option-header">
                  <input type="radio" 
                         name="shipping" 
                         value="store" 
                         v-model="formData.shippingType">
                  <h3>🏪 超商取貨</h3>
                  <span class="fee">運費 NT$ 60</span>
                </div>
                <p>商品送達指定超商，2-3個工作天，免費保管7天</p>
                
                <!-- 超商選擇 -->
                <div v-if="formData.shippingType === 'store'" class="store-form">
                  <div class="form-group">
                    <label>選擇超商 *</label>
                    <select v-model="formData.storeType">
                      <option value="">請選擇超商</option>
                      <option value="7-11">7-ELEVEN</option>
                      <option value="family">全家便利商店</option>
                      <option value="hilife">萊爾富</option>
                      <option value="ok">OK mart</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>門市名稱 *</label>
                    <input type="text" v-model="formData.storeName" placeholder="請選擇門市" readonly>
                    <button type="button" class="btn-secondary" @click="openStoreMap">選擇門市</button>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>取件人姓名 *</label>
                      <input type="text" v-model="formData.recipientName" placeholder="請輸入取件人姓名">
                    </div>
                    <div class="form-group">
                      <label>取件人電話 *</label>
                      <input type="tel" v-model="formData.recipientPhone" placeholder="請輸入手機號碼">
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="step-actions">
              <button class="btn-secondary" @click="prevStep">上一步</button>
              <button class="btn-primary" @click="nextStep" :disabled="!canProceedToPayment">
                下一步：選擇付款方式
              </button>
            </div>
          </div>

          <!-- 步驟 3: 付款方式 -->
          <div v-if="currentStep === 3" class="step-content">
            <h2>選擇付款方式</h2>
            <div class="payment-options">
              <div class="payment-option"
                   :class="{ active: formData.paymentMethod === 'credit' }"
                   @click="selectPaymentMethod('credit')">
                <div class="option-header">
                  <input type="radio" name="payment" value="credit" v-model="formData.paymentMethod">
                  <h3>💳 信用卡付款</h3>
                  <span class="fee">免手續費</span>
                </div>
                <p>支援 Visa、MasterCard、JCB，安全快速</p>
              </div>

              <div class="payment-option"
                   :class="{ active: formData.paymentMethod === 'atm' }"
                   @click="selectPaymentMethod('atm')">
                <div class="option-header">
                  <input type="radio" name="payment" value="atm" v-model="formData.paymentMethod">
                  <h3>🏦 ATM轉帳</h3>
                  <span class="fee">免手續費</span>
                </div>
                <p>虛擬帳號轉帳，3天內完成付款</p>
              </div>

              <div class="payment-option"
                   :class="{ active: formData.paymentMethod === 'cod' }"
                   @click="selectPaymentMethod('cod')">
                <div class="option-header">
                  <input type="radio" name="payment" value="cod" v-model="formData.paymentMethod">
                  <h3>💰 貨到付款</h3>
                  <span class="fee">手續費 NT$ 30</span>
                </div>
                <p>商品送達時付款，僅限宅配</p>
                <div v-if="formData.shippingType === 'store'" class="warning">
                  ⚠️ 超商取貨不支援貨到付款
                </div>
              </div>

              <div class="payment-option"
                   :class="{ active: formData.paymentMethod === 'ecpay' }"
                   @click="selectPaymentMethod('ecpay')">
                <div class="option-header">
                  <input type="radio" name="payment" value="ecpay" v-model="formData.paymentMethod">
                  <h3>🏪 超商代碼繳費</h3>
                  <span class="fee">手續費 NT$ 25</span>
                </div>
                <p>7-11、全家、萊爾富代碼繳費</p>
              </div>
            </div>
            
            <div class="step-actions">
              <button class="btn-secondary" @click="prevStep">上一步</button>
              <button class="btn-primary" @click="nextStep" :disabled="!formData.paymentMethod">
                下一步：確認訂單
              </button>
            </div>
          </div>

          <!-- 步驟 4: 確認訂單 -->
          <div v-if="currentStep === 4" class="step-content">
            <h2>確認訂單資訊</h2>
            
            <!-- 商品摘要 -->
            <div class="order-section">
              <h3>購買商品</h3>
              <div class="product-summary">
                <div v-for="item in selectedItems" :key="item.id" class="summary-item">
                  <span class="product-name">{{ item.productName }}</span>
                  <span class="product-spec" v-if="item.specName">{{ item.specName }}</span>
                  <span class="product-quantity">× {{ item.quantity }}</span>
                  <span class="product-price">NT$ {{ formatPrice(item.price * item.quantity) }}</span>
                </div>
              </div>
            </div>

            <!-- 配送資訊 -->
            <div class="order-section">
              <h3>配送資訊</h3>
              <div class="info-summary">
                <div class="info-item">
                  <span class="label">配送方式：</span>
                  <span class="value">{{ getShippingMethodLabel() }}</span>
                </div>
                <div class="info-item" v-if="formData.shippingType === 'home'">
                  <span class="label">收件地址：</span>
                  <span class="value">{{ getFullAddress() }}</span>
                </div>
                <div class="info-item" v-if="formData.shippingType === 'store'">
                  <span class="label">取貨門市：</span>
                  <span class="value">{{ formData.storeType }} {{ formData.storeName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">收件人：</span>
                  <span class="value">{{ formData.recipientName }} ({{ formData.recipientPhone }})</span>
                </div>
              </div>
            </div>

            <!-- 付款資訊 -->
            <div class="order-section">
              <h3>付款資訊</h3>
              <div class="info-summary">
                <div class="info-item">
                  <span class="label">付款方式：</span>
                  <span class="value">{{ getPaymentMethodLabel() }}</span>
                </div>
              </div>
            </div>

            <!-- 備註 -->
            <div class="order-section">
              <h3>訂單備註</h3>
              <textarea v-model="formData.notes" placeholder="有其他需求請在此填寫（選填）" rows="3"></textarea>
            </div>
            
            <div class="step-actions">
              <button class="btn-secondary" @click="prevStep">上一步</button>
              <button class="btn-primary" @click="submitOrder" :disabled="loading">
                <span v-if="loading">處理中...</span>
                <span v-else>確認付款 - NT$ {{ formatPrice(finalAmount) }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 訂單摘要 -->
        <div class="order-summary">
          <h3>訂單摘要</h3>
          <div class="summary-content">
            <div class="summary-row">
              <span>商品小計</span>
              <span>NT$ {{ formatPrice(subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>運費</span>
              <span>NT$ {{ formatPrice(shippingFee) }}</span>
            </div>
            <div class="summary-row" v-if="paymentFee > 0">
              <span>手續費</span>
              <span>NT$ {{ formatPrice(paymentFee) }}</span>
            </div>
            <div class="summary-row" v-if="couponDiscount > 0">
              <span>優惠券折扣</span>
              <span class="discount">-NT$ {{ formatPrice(couponDiscount) }}</span>
            </div>
            <div class="summary-row total">
              <span>總計</span>
              <span>NT$ {{ formatPrice(finalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 門市選擇彈窗 -->
    <div v-if="showStoreMap" class="store-modal" @click="closeStoreMap">
      <div class="modal-content" @click.stop>
        <h3>選擇取貨門市</h3>
        <p>此功能需要整合門市地圖 API</p>
        <div class="store-list">
          <div class="store-item" v-for="store in mockStores" :key="store.id" @click="selectStore(store)">
            <h4>{{ store.name }}</h4>
            <p>{{ store.address }}</p>
          </div>
        </div>
        <button class="btn-secondary" @click="closeStoreMap">關閉</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/modules/cart'
import { useOrderStore } from '@/stores/modules/order'
import { useUserStore } from '@/stores/user'
import { useCouponStore } from '@/stores/modules/coupon'
import type { OrderAPI } from '@/types/modules/order'
import type { CouponAPI } from '@/types/api'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const userStore = useUserStore()
const couponStore = useCouponStore()

// 狀態
const currentStep = ref(1)
const loading = ref(false)
const showStoreMap = ref(false)

// 表單資料
const formData = ref({
  // 配送資訊
  shippingType: 'home', // 'home' | 'store'
  recipientName: '',
  recipientPhone: '',
  city: '',
  district: '',
  address: '',
  postalCode: '',
  
  // 超商取貨
  storeType: '',
  storeName: '',
  storeAddress: '',
  
  // 付款方式
  paymentMethod: 'credit', // 'credit' | 'atm' | 'cod' | 'ecpay'
  
  // 其他
  notes: ''
})

// 優惠券相關狀態
const availableCoupons = ref<CouponAPI.MemberCouponInfo[]>([])
const selectedCoupon = ref<CouponAPI.MemberCouponInfo | null>(null)
const couponDiscount = ref(0)

// 模擬門市資料
const mockStores = ref([
  { id: 1, name: '台北忠孝店', address: '台北市大安區忠孝東路四段123號' },
  { id: 2, name: '台北信義店', address: '台北市信義區信義路五段456號' },
  { id: 3, name: '台北松山店', address: '台北市松山區南京東路三段789號' }
])

// 計算屬性
const selectedItems = computed(() => {
  const itemIds = route.query.items as string
  if (!itemIds) return cartStore.availableItems
  
  const ids = itemIds.split(',')
  return cartStore.availableItems.filter(item => ids.includes(item.id))
})

const subtotal = computed(() => 
  selectedItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
)

const shippingFee = computed(() => {
  if (formData.value.shippingType === 'home') return 100
  if (formData.value.shippingType === 'store') return 60
  return 0
})

const paymentFee = computed(() => {
  if (formData.value.paymentMethod === 'cod') return 30
  if (formData.value.paymentMethod === 'ecpay') return 25
  return 0
})

const finalAmount = computed(() => subtotal.value + shippingFee.value + paymentFee.value - couponDiscount.value)

const canProceedToPayment = computed(() => {
  if (formData.value.shippingType === 'home') {
    return formData.value.recipientName && 
           formData.value.recipientPhone && 
           formData.value.city && 
           formData.value.address
  } else if (formData.value.shippingType === 'store') {
    return formData.value.recipientName && 
           formData.value.recipientPhone && 
           formData.value.storeType && 
           formData.value.storeName
  }
  return false
})

// 方法
const formatPrice = (price: number | undefined): string => {
  return (price || 0).toLocaleString('zh-TW')
}

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
    // 切換步驟時回到頂端
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    // 切換步驟時回到頂端
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const selectShippingType = (type: 'home' | 'store') => {
  formData.value.shippingType = type
  
  // 如果選擇超商取貨，清除貨到付款選項
  if (type === 'store' && formData.value.paymentMethod === 'cod') {
    formData.value.paymentMethod = 'credit'
  }
}

const selectPaymentMethod = (method: string) => {
  // 超商取貨不支援貨到付款
  if (formData.value.shippingType === 'store' && method === 'cod') {
    return
  }
  formData.value.paymentMethod = method
}

const openStoreMap = () => {
  showStoreMap.value = true
}

const closeStoreMap = () => {
  showStoreMap.value = false
}

const selectStore = (store: any) => {
  formData.value.storeName = store.name
  formData.value.storeAddress = store.address
  closeStoreMap()
}

const getShippingMethodLabel = () => {
  if (formData.value.shippingType === 'home') return '宅配到府'
  if (formData.value.shippingType === 'store') return '超商取貨'
  return ''
}

const getPaymentMethodLabel = () => {
  const labels: Record<string, string> = {
    credit: '信用卡付款',
    atm: 'ATM轉帳',
    cod: '貨到付款',
    ecpay: '超商代碼繳費'
  }
  return labels[formData.value.paymentMethod] || ''
}

const getFullAddress = () => {
  return `${formData.value.city}${formData.value.district}${formData.value.address}`
}

const submitOrder = async () => {
  if (selectedItems.value.length === 0) {
    alert('沒有選中的商品')
    return
  }
  
  loading.value = true
  
  try {
    // 構建訂單資料
    console.log('🔍 用戶資訊:', {
      user: userStore.user,
      memberId: userStore.memberId,
      isLoggedIn: userStore.isLoggedIn
    })
    
    console.log('🛒 購物車原始資料:', cartStore.items)
    console.log('🛒 可用商品資料:', cartStore.availableItems)
    console.log('🛒 選中商品資料:', selectedItems.value)
    
    const orderData: OrderAPI.CreateOrderRequest = {
      memberId: userStore.memberId || 25, // 使用你的真實會員 ID
      items: selectedItems.value.map(item => ({
        productId: item.productId,
        productSpecId: item.productSpecId,
        quantity: item.quantity,
        price: item.price
      })),
      shippingMethodId: formData.value.shippingType === 'home' ? 1 : 2,
      paymentMethodId: getPaymentMethodId(),
      shippingAddress: formData.value.shippingType === 'home' 
        ? getFullAddress() 
        : `${formData.value.storeType} ${formData.value.storeName}`,
      recipientName: formData.value.recipientName,
      recipientPhone: formData.value.recipientPhone,
      recipientEmail: userStore.user?.email || '',
      note: formData.value.notes || ''
    }
    
    console.log('提交訂單資料:', orderData)
    
    // 建立訂單
    const order = await orderStore.createOrder(orderData)
    
    if (!order || !order.masterOrderId) {
      throw new Error('訂單建立失敗')
    }
    
    console.log('訂單建立成功:', order)
    
    // 清空購物車中選中的商品
    selectedItems.value.forEach(item => {
      cartStore.removeItem(item.id)
    })
    
    // 根據付款方式導向
    if (formData.value.paymentMethod === 'credit' || formData.value.paymentMethod === 'ecpay') {
      // 需要線上付款，導向付款確認頁面
      router.push(`/payment/confirm/${order.masterOrderId}`)
    } else {
      // ATM轉帳或貨到付款，導向訂單詳情頁面
      router.push(`/payment/${order.masterOrderId}`)
    }
    
  } catch (error) {
    console.error('訂單提交失敗:', error)
    alert('訂單提交失敗，請重試')
  } finally {
    loading.value = false
  }
}

const getPaymentMethodId = () => {
  const methodMap: Record<string, number> = {
    credit: 1,
    atm: 2,
    cod: 3,
    ecpay: 4
  }
  return methodMap[formData.value.paymentMethod] || 1
}

// 優惠券相關方法
const loadMemberCoupons = async () => {
  if (!userStore.memberId) return
  
  try {
    await couponStore.fetchMemberCoupons(userStore.memberId, true)
    availableCoupons.value = couponStore.usableMemberCoupons.filter(mc => {
      // 篩選符合最低消費金額的優惠券
      return !mc.coupon.minimumAmount || subtotal.value >= mc.coupon.minimumAmount
    })
  } catch (error) {
    console.error('載入會員優惠券失敗:', error)
  }
}

const selectCoupon = async (memberCoupon: CouponAPI.MemberCouponInfo) => {
  selectedCoupon.value = memberCoupon
  await calculateCouponDiscount()
}

const clearSelectedCoupon = () => {
  selectedCoupon.value = null
  couponDiscount.value = 0
}

const calculateCouponDiscount = async () => {
  if (!selectedCoupon.value) {
    couponDiscount.value = 0
    return
  }
  
  const coupon = selectedCoupon.value.coupon
  let discount = 0
  
  if (coupon.discountType === 1) {
    // 固定金額折扣
    discount = Math.min(coupon.discountValue, subtotal.value)
  } else {
    // 百分比折扣
    discount = subtotal.value * (coupon.discountValue / 100)
    
    // 如果有最高折扣限制
    if (coupon.maximumDiscount) {
      discount = Math.min(discount, coupon.maximumDiscount)
    }
  }
  
  couponDiscount.value = Math.max(0, Math.min(discount, subtotal.value))
}

const getCouponTypeLabel = (type: number) => {
  return type === 1 ? '廠商券' : '平台券'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
}

// 初始化
onMounted(() => {
  // 檢查購物車
  if (cartStore.items.length === 0) {
    router.push('/cart')
    return
  }
  
  // 檢查登入狀態
  if (!userStore.isLoggedIn && !userStore.isGuestMode) {
    router.push('/login?redirect=/checkout')
    return
  }
  
  // 預填會員資訊
  if (userStore.user) {
    formData.value.recipientName = userStore.user.name || ''
    formData.value.recipientPhone = userStore.user.phone || ''
  }
  
  // 載入會員優惠券
  if (userStore.isLoggedIn) {
    loadMemberCoupons()
  }
})
</script>

<style scoped>
.checkout-view {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #3498db;
  text-decoration: none;
}

.breadcrumb .separator {
  margin: 0 8px;
}

.breadcrumb .current {
  color: #333;
}

/* 步驟指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #3498db;
  color: white;
}

.step.completed .step-number {
  background: #27ae60;
  color: white;
}

.step-label {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.step.active .step-label {
  color: #333;
  font-weight: 600;
}

.step-line {
  height: 2px;
  background: #e0e0e0;
  flex: 1;
  margin: 0 20px;
  margin-top: -20px;
  transition: all 0.3s;
}

.step-line.active {
  background: #27ae60;
}

/* 主要內容 */
.checkout-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
}

.checkout-main {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.step-content h2 {
  margin: 0 0 24px 0;
  color: #333;
  font-size: 24px;
}

/* 商品列表 */
.product-list {
  margin-bottom: 30px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
}

.product-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.product-info .spec {
  color: #666;
  font-size: 14px;
  margin: 0 0 4px 0;
}

.product-info .vendor {
  color: #888;
  font-size: 14px;
  margin: 0;
}

.product-price {
  text-align: right;
}

.product-price .price {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #e74c3c;
  margin-bottom: 4px;
}

.product-price .quantity {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.product-price .subtotal {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

/* 配送和付款選項 */
.shipping-options,
.payment-options {
  margin-bottom: 30px;
}

.shipping-option,
.payment-option {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.shipping-option:hover,
.payment-option:hover {
  border-color: #3498db;
}

.shipping-option.active,
.payment-option.active {
  border-color: #3498db;
  background: #f8f9ff;
}

.option-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.option-header input[type="radio"] {
  margin-right: 12px;
}

.option-header h3 {
  flex: 1;
  margin: 0;
  font-size: 18px;
  color: #333;
}

.option-header .fee {
  color: #27ae60;
  font-weight: 600;
}

.shipping-option p,
.payment-option p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.payment-option .warning {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 8px;
}

/* 表單樣式 */
.address-form,
.store-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-group button.btn-secondary {
  margin-top: 8px;
}

/* 訂單確認 */
.order-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.order-section:last-child {
  border-bottom: none;
}

.order-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.product-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
}

.summary-item {
  display: grid;
  grid-template-columns: 2fr auto auto auto;
  gap: 16px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-item:last-child {
  border-bottom: none;
}

.product-spec {
  color: #666;
  font-size: 14px;
}

.info-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  width: 100px;
  color: #666;
}

.info-item .value {
  flex: 1;
  color: #333;
}

/* 步驟操作按鈕 */
.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* 訂單摘要側邊欄 */
.order-summary {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 20px;
  height: fit-content;
}

.order-summary h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
}

.summary-content {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #e0e0e0;
}

/* 門市選擇彈窗 */
.store-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 16px 0;
}

.store-list {
  margin: 16px 0;
}

.store-item {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
}

.store-item:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.store-item h4 {
  margin: 0 0 4px 0;
  color: #333;
}

.store-item p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 優惠券樣式 */
.coupon-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f8f9fa;
}

.coupon-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.coupon-item {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.coupon-item:hover {
  border-color: #3498db;
}

.coupon-item.selected {
  border-color: #3498db;
  background: #f8f9ff;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.coupon-type {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.coupon-value {
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
}

.coupon-item h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.coupon-description {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.coupon-conditions {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.min-amount,
.max-discount {
  font-size: 12px;
  padding: 2px 6px;
  background: #e8f4fd;
  color: #2c5aa0;
  border-radius: 4px;
}

.coupon-expire {
  font-size: 12px;
  color: #888;
}

.discount-preview {
  margin-top: 8px;
  padding: 8px;
  background: #e8f5e8;
  border-radius: 4px;
  color: #27ae60;
  font-weight: 600;
  font-size: 14px;
}

.no-coupons {
  text-align: center;
  padding: 40px 20px;
}

.no-coupons-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-coupons p {
  color: #666;
  margin-bottom: 16px;
}

.loading-coupons {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-coupon-option {
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  margin-top: 16px;
}

.no-coupon-option label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.no-coupon-option input[type="radio"] {
  margin-right: 8px;
}

.summary-row .discount {
  color: #27ae60;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .checkout-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .order-summary {
    position: static;
  }
  
  .step-indicator {
    padding: 16px;
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .step-label {
    font-size: 12px;
  }
  
  .step-line {
    margin: 0 10px;
  }
  
  .checkout-main {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .product-price {
    text-align: left;
    width: 100%;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .summary-item {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: left;
  }
}
</style>