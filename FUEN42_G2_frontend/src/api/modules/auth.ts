import http from '../http'
import type { AuthAPI } from '@/types/api'

export const authApi = {
    // 會員登入
    login: (data: AuthAPI.LoginRequest) =>
        http.post<AuthAPI.LoginResponse>('/Auth/Login', data),

    // Google 第三方登入
    googleLogin: (data: AuthAPI.GoogleLoginRequest) =>
        http.post<AuthAPI.LoginResponse>('/Auth/GoogleLogin', data),

    // 會員註冊
    register: (data: AuthAPI.RegisterRequest) =>
        http.post<AuthAPI.RegisterResponse>('/Auth/Register', data),

    // 刷新 Token
    refreshToken: (refreshToken: string) =>
        http.post<AuthAPI.RefreshTokenResponse>('/Auth/RefreshToken', { refreshToken }),

    // 登出
    logout: () =>
        http.post('/Auth/Logout'),

    // 忘記密碼
    forgotPassword: (email: string) =>
        http.post('/Auth/ForgotPassword', { email }),

    // 重設密碼
    resetPassword: (data: AuthAPI.ResetPasswordRequest) =>
        http.post('/Auth/ResetPassword', data),

    // 驗證 Email
    verifyEmail: (token: string) =>
        http.post('/Auth/VerifyEmail', { token }),

    // 取得會員資料
    getProfile: () =>
        http.get<AuthAPI.MemberInfo>('/Members/Profile'),

    // 更新會員資料
    updateProfile: (data: AuthAPI.UpdateProfileRequest) =>
        http.put<AuthAPI.MemberInfo>('/Members/Profile', data),

    // 變更密碼
    changePassword: (data: AuthAPI.ChangePasswordRequest) =>
        http.post('/Auth/ChangePassword', data),

    // 檢查 Email 是否已存在
    checkEmailExists: (email: string) =>
        http.get<{ data: boolean }>(`/Auth/CheckEmail/${encodeURIComponent(email)}`),

    // 檢查手機號碼是否已存在
    checkPhoneExists: (phone: string) =>
        http.get<{ data: boolean }>(`/Auth/CheckPhone/${encodeURIComponent(phone)}`),

    // 取得會員地址列表
    getAddresses: () =>
        http.get<AuthAPI.AddressInfo[]>('/Members/Addresses'),

    // 新增會員地址
    addAddress: (data: Omit<AuthAPI.AddressInfo, 'id'>) =>
        http.post<AuthAPI.AddressInfo>('/Members/Addresses', data),

    // 更新會員地址
    updateAddress: (id: number, data: Omit<AuthAPI.AddressInfo, 'id'>) =>
        http.put<AuthAPI.AddressInfo>(`/Members/Addresses/${id}`, data),

    // 刪除會員地址
    deleteAddress: (id: number) =>
        http.delete(`/Members/Addresses/${id}`),

    // 設定預設地址
    setDefaultAddress: (id: number) =>
        http.patch(`/Members/Addresses/${id}/default`)
}
