// API相關類型定義 - 基於FUEN42_G2_DB資料庫結構

// 基礎API響應格式
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  code?: string
}

export interface PaginationRequest {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// A模組 - 會員/廠商/平台系統 API
export namespace AuthAPI {
  export interface LoginRequest {
    email: string
    password: string
    rememberMe?: boolean
  }

  export interface GoogleLoginRequest {
    idToken: string
    rememberMe?: boolean
  }

  export interface LoginResponse {
    success?: boolean
    data?: {
      user?: MemberInfo
      token: string
      refreshToken?: string
      userId?: number
      email?: string
      name?: string
      memberId?: number
      phone?: string
      birthday?: string
      defaultAddressId?: number
      memberLevelId?: number
      memberLevel?: any
      totalSpending?: number
      points?: number
      isActive?: boolean
      createdAt?: string
      updatedAt?: string
    }
    user?: MemberInfo
    token?: string
    refreshToken?: string
    expiresIn?: number
  }

  export interface RegisterRequest {
    email: string
    password: string
    confirmPassword: string
    name: string
    phone: string
    birthday?: string
    agreesToTerms: boolean
  }

  export interface RegisterResponse {
    success: boolean
    message: string
    requireEmailVerification?: boolean
  }

  export interface RefreshTokenResponse {
    token: string
    refreshToken: string
    expiresIn: number
  }

  export interface ResetPasswordRequest {
    token: string
    email: string
    password: string
    confirmPassword: string
  }

  export interface UpdateProfileRequest {
    name: string                 // 會員姓名 (必填, nvarchar(50))
    phone?: string               // 手機號碼 (選填, nvarchar(20))
    birthday?: string            // 生日 (選填, date格式: YYYY-MM-DD)
    defaultAddressId?: number    // 預設地址ID (選填, int)
  }

  export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }

  export interface MemberInfo {
    id: number                    // 會員ID (主鍵)
    userId: number               // 對應 Users 表的外鍵
    name: string                 // 會員姓名 (nvarchar(50))
    email: string                // 電子信箱 (從 Users 表關聯取得)
    phone?: string               // 手機號碼 (nvarchar(20), nullable)
    birthday?: string            // 生日 (date, nullable)
    defaultAddressId?: number    // 預設地址ID (int, nullable)
    memberLevelId: number        // 會員等級ID (int)
    memberLevel: {               // 會員等級詳細資訊 (關聯查詢)
      id: number
      name: string
      levelCode: string
      discountRate: number
    }
    totalSpending: number        // 累計消費金額 (decimal(18,2))
    points: number              // 點數餘額 (int)
    defaultAddress?: AddressInfo // 預設地址資訊 (關聯查詢)
    isActive: boolean           // 是否啟用 (bit)
    createdAt: string           // 建立時間 (datetime)
    updatedAt?: string          // 更新時間 (datetime, nullable)
  }

  export interface AddressInfo {
    id: number
    userId: number              // 修正為 number 類型對應資料庫
    addressType: string         // 地址類型 (如: 家裡、公司)
    recipientName: string       // 收件人姓名
    recipientPhone: string      // 收件人電話
    city: string               // 城市
    district: string           // 區域
    street: string             // 街道地址
    postalCode: string         // 郵遞區號
    isDefault: boolean         // 是否為預設地址
    createdAt?: string         // 建立時間
    updatedAt?: string         // 更新時間
  }

  export interface VendorInfo {
    id: number
    vendorName: string
    contactName: string
    contactEmail: string
    contactPhone: string
    businessNumber?: string
    address: string
    description?: string
    logoUrl?: string
    rating: number
    isActive: boolean
  }
}

// B模組 - 商品/分類管理 API
export namespace ProductAPI {
  export interface ProductListRequest extends PaginationRequest {
    categoryId?: number
    vendorId?: number
    keyword?: string
    priceMin?: number
    priceMax?: number
    rating?: number
    inStock?: boolean
  }

  export interface ProductInfo {
    id: number
    vendorId: number
    categoryId: number
    productName: string
    description: string
    basePrice: number
    stock: number
    sku: string
    barcode?: string
    isActive: boolean
    status: number
    viewCount: number
    soldCount: number
    rating?: number
    reviewCount: number
    media: ProductMediaInfo[]
    category: CategoryInfo
    vendor: VendorBasicInfo
    specs: ProductSpecInfo[]
  }

  export interface ProductMediaInfo {
    id: number
    productId: number
    mediaType: number // 1: 圖片, 2: 影片
    mediaUrl: string
    isDefault: boolean
  }

  export interface CategoryInfo {
    id: number
    parentId?: number
    categoryName: string
    description?: string
    iconUrl?: string
    level: number
    sortOrder: number
    children?: CategoryInfo[]
    parentCategory?: CategoryInfo
  }

  export interface ProductSpecInfo {
    id: number
    productId: number
    specName: string
    specValue: string
    additionalPrice: number
    stock: number
  }

  export interface VendorBasicInfo {
    id: number
    vendorName: string
    rating: number
  }

  export interface ProductReviewInfo {
    id: number
    orderItemId: number
    productId: number
    memberId: number
    memberName: string
    rating: number
    comment: string
    vendorReply?: string
    images: ReviewImageInfo[]
    createdAt: string
  }

  export interface ReviewImageInfo {
    id: number
    reviewId: number
    imageUrl: string
  }

  // 商品詳情頁面專用類型
  export interface ProductDetailInfo extends ProductInfo {
    specifications: ProductSpecificationInfo[]
    variants: ProductVariantInfo[]
    variantTypes: VariantTypeInfo[]
  }

  export interface ProductSpecificationInfo {
    id: number
    productId: number
    specName: string
    specValue: string
  }

  export interface ProductVariantInfo {
    id: number
    productId: number
    variantTypeId: number
    variantValue: string
    price: number
    stock: number
  }

  export interface VariantTypeInfo {
    id: number
    typeName: string
  }

  export interface ReviewInfo {
    id: number
    productId: number
    memberName: string
    rating: number
    comment: string
    createdAt: string
  }
}

// C模組 - 訂單/金流/物流管理 API
export namespace OrderAPI {
  export interface CreateOrderRequest {
    items: OrderItemRequest[]
    recipientName: string
    recipientPhone: string
    shippingAddress: string
    paymentMethodId: number
    couponId?: number
    notes?: string
  }

  export interface OrderItemRequest {
    productId: number
    productSpecId?: number
    quantity: number
  }

  export interface MasterOrderInfo {
    id: number
    masterOrderNumber: string
    memberId: number
    totalAmount: number
    shippingFee: number
    discountAmount: number
    finalAmount: number
    recipientName: string
    recipientPhone: string
    shippingAddress: string
    couponId?: number
    status: number
    orders: OrderInfo[]
    payment?: PaymentInfo
    createdAt: string
    updatedAt: string
  }

  export interface OrderInfo {
    id: number
    orderNumber: string
    masterOrderId: number
    vendorId: number
    vendorName: string
    subTotal: number
    shippingFee: number
    totalAmount: number
    orderStatus: number
    paymentStatus: number
    shippingStatus: number
    orderItems: OrderItemInfo[]
    shipment?: ShipmentInfo
    createdAt: string
  }

  export interface OrderItemInfo {
    id: number
    orderId: number
    productId: number
    productSpecId?: number
    productName: string
    quantity: number
    unitPrice: number
    subTotal: number
    productImageUrl?: string
  }

  export interface PaymentInfo {
    id: number
    masterOrderId: number
    paymentNumber: string
    paymentMethod: string
    amount: number
    status: number
    transactionId?: string
    paidAt?: string
    errorMessage?: string
    createdAt: string
  }

  export interface PaymentMethodInfo {
    id: number
    methodName: string
    methodCode: string
    methodType: string
    handlingFee: number
    minAmount: number
    maxAmount: number
    isActive: boolean
  }

  export interface ShipmentInfo {
    id: number
    orderId: number
    shipmentNumber: string
    logisticsProviderId: number
    trackingNumber?: string
    estimatedDelivery?: string
    actualDelivery?: string
    status: number
    recipientName: string
    shippingAddress: string
    logisticsProvider: LogisticsProviderInfo
    trackingLogs: TrackingLogInfo[]
  }

  export interface LogisticsProviderInfo {
    id: number
    providerName: string
    providerCode: string
    trackingUrl?: string
  }

  export interface TrackingLogInfo {
    id: number
    shipmentId: number
    status: string
    location: string
    description: string
    eventTime: string
  }

  export interface RefundRequest {
    orderId: number
    orderItemIds?: number[]
    refundAmount: number
    refundReason: string
  }

  export interface RefundInfo {
    id: number
    refundNumber: string
    orderId: number
    refundAmount: number
    refundMethod: string
    status: number
    createdAt: string
    processedAt?: string
  }

  export interface ReturnRequest {
    orderItemId: number
    returnReason: string
    returnQuantity: number
    description?: string
    images?: string[]
  }

  export interface ReturnInfo {
    id: number
    returnNumber: string
    orderId: number
    orderItemId: number
    returnReason: string
    returnQuantity: number
    returnAmount: number
    status: number
    createdAt: string
  }
}

// D模組 - 優惠券/活動/廣告管理 API
export namespace CouponAPI {
  // 優惠券相關類型
  export interface CouponInfo {
    id: number
    couponCode: string
    couponName: string
    couponType: number // 1=平台券 2=廠商券
    discountType: number // 1=固定金額 2=百分比
    discountValue: number
    minimumAmount?: number
    maximumDiscount?: number
    totalQty: number
    issuedQty: number
    usedQty: number
    startAt: string
    endAt: string
    maxUsagePerMember: number
    maxUsageTotal?: number
    description?: string
    terms?: string
    applicableProducts?: string
    applicableCategories?: string
    status: number // 0=草稿 1=啟用 2=停用 3=已過期
    isDeleted: boolean
    createdAt: string
    updatedAt: string
    createdBy: string
    canUse?: boolean // 前端計算用
  }

  export interface CouponListRequest extends PaginationRequest {
    keyword?: string
    status?: number
    discountType?: number
    startDate?: string
    endDate?: string
  }

  export interface CreateCouponRequest {
    couponName: string
    couponType: number
    discountType: number
    discountValue: number
    minimumAmount?: number
    maximumDiscount?: number
    totalQty: number
    startAt: string
    endAt: string
    maxUsagePerMember: number
    maxUsageTotal?: number
    description?: string
    terms?: string
    applicableProducts?: string
    applicableCategories?: string
    status: number
  }

  export interface UpdateCouponRequest extends CreateCouponRequest {
    id: number
  }

  export interface MemberCouponInfo {
    id: number
    memberId: number
    couponId: number
    receivedAt: string
    expiredAt: string
    usedAt?: string
    status: number
    coupon: CouponInfo
  }

  export interface CouponValidationRequest {
    couponCode: string
    orderAmount: number
    memberLevelId: number
  }

  export interface CouponValidationResponse {
    isValid: boolean
    couponInfo?: CouponInfo
    discountAmount?: number
    errorMessage?: string
  }

  // 廣告橫幅相關類型
  export interface BannerInfo {
    id: number
    bannerAreaId: number
    title: string
    imageUrl: string
    linkUrl?: string
    priority: number
    startAt: string
    endAt: string
    clickCount: number
    viewCount: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    createdBy: string
    carouselInterval: number
    bannerArea?: BannerAreaInfo
  }

  export interface BannerAreaInfo {
    id: number
    areaName: string
    description?: string
    isActive: boolean
  }

  export interface BannerListRequest extends PaginationRequest {
    areaId?: number
    keyword?: string
    isActive?: boolean
    startDate?: string
    endDate?: string
  }

  export interface CreateBannerRequest {
    bannerAreaId: number
    title: string
    imageFile?: File
    linkUrl?: string
    priority: number
    startAt?: string
    endAt?: string
    isActive: boolean
    carouselInterval: number
  }

  export interface UpdateBannerRequest extends CreateBannerRequest {
    id: number
  }

  // 公告相關類型
  export interface AnnouncementInfo {
    id: number
    title: string
    content: string
    announcementAreaId: number
    priority: number
    startAt: string
    endAt: string
    viewCount: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    createdBy: string
    announcementArea?: AnnouncementAreaInfo
  }

  export interface AnnouncementAreaInfo {
    id: number
    areaName: string
    description?: string
    isActive: boolean
  }

  export interface AnnouncementListRequest extends PaginationRequest {
    areaId?: number
    keyword?: string
    isActive?: boolean
    startDate?: string
    endDate?: string
  }

  export interface CreateAnnouncementRequest {
    title: string
    content: string
    announcementAreaId: number
    priority?: number
    startAt?: string
    endAt?: string
    isActive: boolean
  }

  export interface UpdateAnnouncementRequest extends CreateAnnouncementRequest {
    id: number
  }

  // 統計相關類型
  export interface CouponStatistics {
    totalCoupons: number
    activeCoupons: number
    expiredCoupons: number
    totalUsed: number
    totalSavings: number
    usageRate: number
  }

  export interface BannerStatistics {
    totalBanners: number
    activeBanners: number
    totalViews: number
    totalClicks: number
    averageClickRate: number
  }

  export interface AnnouncementStatistics {
    totalAnnouncements: number
    activeAnnouncements: number
    totalViews: number
    averageViewsPerAnnouncement: number
  }
}

// E模組 - 客服/評價/黑名單 API
export namespace SupportAPI {
  export interface CreateTicketRequest {
    categoryId: number
    orderId?: number
    subject: string
    description: string
    priority: number
    attachments?: string[]
  }

  export interface TicketInfo {
    id: number
    ticketNumber: string
    memberId: number
    categoryId: number
    orderId?: number
    subject: string
    description: string
    priority: number
    status: number
    assignedTo?: number
    category: TicketCategoryInfo
    messages: TicketMessageInfo[]
    createdAt: string
    updatedAt: string
  }

  export interface TicketCategoryInfo {
    id: number
    categoryName: string
    description: string
    isActive: boolean
  }

  export interface TicketMessageInfo {
    id: number
    ticketId: number
    senderId: string
    senderType: string
    message: string
    attachments?: string
    isInternal: boolean
    createdAt: string
  }

  export interface AddMessageRequest {
    ticketId: number
    message: string
    attachments?: string[]
  }

  export interface BlacklistInfo {
    id: number
    memberId: number
    reason: string
    blockedBy: number
    blockedAt: string
    expiresAt?: string
    isActive: boolean
  }
}

// 購物車相關 API
export namespace CartAPI {
  export interface AddToCartRequest {
    productId: number
    productSpecId?: number
    quantity: number
  }

  export interface UpdateCartRequest {
    productId: number
    productSpecId?: number
    quantity: number
  }

  export interface CartItemInfo {
    productId: number
    productSpecId?: number
    productName: string
    productImageUrl: string
    price: number
    quantity: number
    maxStock: number
    vendorId: number
    vendorName: string
    productSpec?: {
      specName: string
      specValue: string
      additionalPrice: number
    }
  }

  export interface CartSummary {
    items: CartItemInfo[]
    totalItems: number
    totalAmount: number
    availableShippingMethods: OrderAPI.PaymentMethodInfo[]
    estimatedShippingFee: number
  }
}

// 統計和報表相關
export namespace StatsAPI {
  export interface OrderStatistics {
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    completedOrders: number
    cancelledOrders: number
    averageOrderValue: number
    monthlyRevenue: number[]
    topProducts: {
      productId: number
      productName: string
      soldCount: number
      revenue: number
    }[]
  }

  export interface SalesReport {
    period: string
    totalSales: number
    totalOrders: number
    averageOrderValue: number
    topCategories: {
      categoryId: number
      categoryName: string
      salesCount: number
      revenue: number
    }[]
  }
}