import http from '../http'
import type { AuthAPI } from '@/types/api'

// 會員資料相關介面
export interface MemberProfile {
  email: string
  name: string
  phone?: string
  birthday?: string
  memberLevel: string
  totalSpending: number
  points: number
  createdAt: string
}

export interface UpdateMemberProfile {
  name: string
  phone?: string
  birthday?: string
}

export interface ChangePassword {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

// 地址相關介面 - 對應後端 AddressDto
export interface Address {
  id: number
  addressType: string
  addressName?: string
  recipientName?: string
  recipientPhone?: string
  companyName?: string
  city: string
  district: string
  street: string
  postalCode: string
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUpdateAddress {
  addressType: string
  addressName?: string
  recipientName?: string
  recipientPhone?: string
  companyName?: string
  city: string
  district: string
  street: string
  postalCode: string
  isDefault: boolean
}

// 忘記密碼相關介面
export interface ForgotPassword {
  email: string
}

export interface ResetPassword {
  email: string
  token: string
  newPassword: string
  confirmNewPassword: string
}

export interface VerifyResetToken {
  email: string
  token: string
}

export const memberApi = {
  // ==================== 會員資料管理 ====================
  
  /**
   * 獲取會員個人資料
   */
  getProfile: () => 
    http.get<MemberProfile>('/Member/profile'),

  /**
   * 更新會員個人資料
   */
  updateProfile: (data: UpdateMemberProfile) =>
    http.put('/Member/profile', data),

  /**
   * 修改密碼
   */
  changePassword: (data: ChangePassword) =>
    http.post('/Member/change-password', data),

  // ==================== 地址管理 ====================
  
  /**
   * 獲取會員地址列表
   */
  getAddresses: () =>
    http.get<Address[]>('/Member/addresses'),

  /**
   * 新增地址
   */
  addAddress: (data: CreateUpdateAddress) =>
    http.post<Address>('/Member/addresses', data),

  /**
   * 更新地址
   */
  updateAddress: (id: number, data: CreateUpdateAddress) =>
    http.put(`/Member/addresses/${id}`, data),

  /**
   * 刪除地址
   */
  deleteAddress: (id: number) =>
    http.delete(`/Member/addresses/${id}`),

  /**
   * 設定預設地址
   */
  setDefaultAddress: (id: number) =>
    http.post(`/Member/addresses/${id}/set-default`),

  // ==================== 忘記密碼 ====================
  
  /**
   * 忘記密碼 - 發送重設密碼連結
   */
  forgotPassword: (data: ForgotPassword) =>
    http.post('/Auth/forgot-password', data),

  /**
   * 驗證重設密碼 token
   */
  verifyResetToken: (data: VerifyResetToken) =>
    http.post('/Auth/verify-reset-token', data),

  /**
   * 重設密碼
   */
  resetPassword: (data: ResetPassword) =>
    http.post('/Auth/reset-password', data),

  // ==================== 原有功能保留 ====================
  
  // 取得會員訂單列表 (原有功能)
  getOrders: (params?: {
    page?: number
    limit?: number
    status?: number
  }) => http.get('/members/orders', { params }),

  // 取得會員點數記錄 (原有功能)
  getPointsHistory: (params?: {
    page?: number
    limit?: number
  }) => http.get('/members/points-history', { params })
}
