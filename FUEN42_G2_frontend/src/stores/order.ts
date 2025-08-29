import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, CreateOrderRequest, PaymentMethod, ShippingMethod } from '@/types'
import { orderApi } from '@/api/order'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const paymentMethods = ref<PaymentMethod[]>([
    { id: 1, name: '信用卡', code: 'credit_card' },
    { id: 2, name: 'LINE Pay', code: 'line_pay' },
    { id: 3, name: '貨到付款', code: 'cod' },
    { id: 4, name: '超商付款', code: 'cvs' }
  ])
  
  const shippingMethods = ref<ShippingMethod[]>([
    { id: 1, name: '宅配', code: 'home_delivery', fee: 80 },
    { id: 2, name: '7-11取貨', code: 'seven_eleven', fee: 60 },
    { id: 3, name: '全家取貨', code: 'family_mart', fee: 60 },
    { id: 4, name: '萊爾富取貨', code: 'hi_life', fee: 60 }
  ])
  
  async function createOrder(orderData: CreateOrderRequest) {
    loading.value = true
    error.value = null
    
    try {
      const response = await orderApi.createOrder(orderData)
      currentOrder.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || '建立訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchOrders() {
    loading.value = true
    error.value = null
    
    try {
      const response = await orderApi.getOrders()
      orders.value = response.data
    } catch (err: any) {
      error.value = err.message || '載入訂單失敗'
    } finally {
      loading.value = false
    }
  }
  
  async function fetchOrderDetail(orderId: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await orderApi.getOrderDetail(orderId)
      currentOrder.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || '載入訂單詳情失敗'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function cancelOrder(orderId: string) {
    loading.value = true
    error.value = null
    
    try {
      await orderApi.cancelOrder(orderId)
      await fetchOrders()
    } catch (err: any) {
      error.value = err.message || '取消訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function processPayment(orderId: string, paymentData: any) {
    loading.value = true
    error.value = null
    
    try {
      const response = await orderApi.processPayment(orderId, paymentData)
      return response.data
    } catch (err: any) {
      error.value = err.message || '付款失敗'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    orders,
    currentOrder,
    loading,
    error,
    paymentMethods,
    shippingMethods,
    createOrder,
    fetchOrders,
    fetchOrderDetail,
    cancelOrder,
    processPayment
  }
})