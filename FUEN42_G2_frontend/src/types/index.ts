export interface User {
  id: number
  username: string
  email: string
  name: string
  phone?: string
  address?: string
  role: 'customer' | 'vendor' | 'admin'
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  imageUrl: string
  images?: string[]
  categoryId: number
  categoryName: string
  vendorId: number
  vendorName: string
  stock: number
  rating?: number
  reviewCount?: number
}

export interface CartItem {
  productId: number
  productName: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: number
  status: OrderStatus
  totalAmount: number
  shippingFee: number
  discount: number
  finalAmount: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  shippingMethod: string
  shippingAddress: string
  recipientName: string
  recipientPhone: string
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
  paidAt?: string
  shippedAt?: string
  deliveredAt?: string
  cancelledAt?: string
  notes?: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
  vendorId: number
  vendorName: string
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partial_refunded'

export interface CreateOrderRequest {
  items: CartItem[]
  shippingMethodId: number
  paymentMethodId: number
  shippingAddress: string
  recipientName: string
  recipientPhone: string
  notes?: string
  couponCode?: string
}

export interface PaymentMethod {
  id: number
  name: string
  code: string
}

export interface ShippingMethod {
  id: number
  name: string
  code: string
  fee: number
}

export interface Address {
  id: number
  userId: number
  recipientName: string
  recipientPhone: string
  city: string
  district: string
  address: string
  postalCode: string
  isDefault: boolean
}

export interface Coupon {
  id: number
  code: string
  name: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  validFrom: string
  validTo: string
  usageLimit: number
  usedCount: number
}