import http from './http'
import type { Order, CreateOrderRequest } from '@/types'

export const orderApi = {
  createOrder(data: CreateOrderRequest) {
    return http.post<Order>('/orders', data)
  },
  
  getOrders(params?: { page?: number; pageSize?: number; status?: string }) {
    return http.get<Order[]>('/orders', { params })
  },
  
  getOrderDetail(orderId: string) {
    return http.get<Order>(`/orders/${orderId}`)
  },
  
  cancelOrder(orderId: string) {
    return http.post(`/orders/${orderId}/cancel`)
  },
  
  processPayment(orderId: string, paymentData: any) {
    return http.post(`/orders/${orderId}/payment`, paymentData)
  },
  
  getPaymentStatus(orderId: string) {
    return http.get(`/orders/${orderId}/payment-status`)
  },
  
  getShippingStatus(orderId: string) {
    return http.get(`/orders/${orderId}/shipping-status`)
  },
  
  requestReturn(orderId: string, reason: string) {
    return http.post(`/orders/${orderId}/return`, { reason })
  },
  
  getShippingFee(data: { shippingMethodId: number; items: any[] }) {
    return http.post<{ fee: number }>('/orders/shipping-fee', data)
  },
  
  validateCoupon(code: string, orderAmount: number) {
    return http.post('/orders/validate-coupon', { code, orderAmount })
  }
}