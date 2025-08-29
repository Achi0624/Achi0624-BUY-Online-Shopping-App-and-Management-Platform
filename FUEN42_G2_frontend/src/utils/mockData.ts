/**
 * 模擬數據生成工具
 * 用於開發階段測試，等後端 API 完成後移除
 * 
 * 開發者: 蔡易霖
 * 負責組別: C組 (組長)
 * 負責模組: 購物車與結帳流程測試數據
 * 
 * FUEN42_G2 五人專題小組 - BUY商城系統
 * © 2025 All rights reserved.
 */

// 模擬分類數據
export const mockCategories = [
  {
    id: 1,
    parentId: null,
    categoryName: '電子產品',
    level: 1,
    sortOrder: 1,
    children: [
      { id: 11, parentId: 1, categoryName: '手機', level: 2, sortOrder: 1 },
      { id: 12, parentId: 1, categoryName: '平板', level: 2, sortOrder: 2 },
      { id: 13, parentId: 1, categoryName: '筆電', level: 2, sortOrder: 3 }
    ]
  },
  {
    id: 2,
    parentId: null,
    categoryName: '家電用品',
    level: 1,
    sortOrder: 2,
    children: [
      { id: 21, parentId: 2, categoryName: '廚房家電', level: 2, sortOrder: 1 },
      { id: 22, parentId: 2, categoryName: '清潔家電', level: 2, sortOrder: 2 }
    ]
  },
  {
    id: 3,
    parentId: null,
    categoryName: '3C配件',
    level: 1,
    sortOrder: 3,
    children: [
      { id: 31, parentId: 3, categoryName: '耳機', level: 2, sortOrder: 1 },
      { id: 32, parentId: 3, categoryName: '充電器', level: 2, sortOrder: 2 }
    ]
  }
]

// 模擬廠商數據
export const mockVendors = [
  {
    id: 1,
    vendorName: 'Apple Store 官方旗艦店',
    rating: 4.8
  },
  {
    id: 2,
    vendorName: 'Sony 官方旗艦店',
    rating: 4.6
  },
  {
    id: 3,
    vendorName: 'Samsung 三星旗艦店',
    rating: 4.7
  },
  {
    id: 4,
    vendorName: 'Dyson 官方旗艦店',
    rating: 4.9
  }
]

// 模擬商品數據 (符合 ProductAPI.ProductInfo 格式)
export const mockProducts = [
  {
    id: 1,
    vendorId: 1,
    categoryId: 11,
    productName: 'iPhone 15 Pro Max',
    description: '最新款 iPhone，搭載 A17 Pro 晶片，支援 5G 網路，擁有頂級攝影功能',
    basePrice: 42900,
    stock: 25,
    sku: 'IPH15PM256',
    barcode: '194253081234',
    isActive: true,
    status: 1,
    viewCount: 1250,
    soldCount: 89,
    rating: 4.8,
    reviewCount: 127,
    media: [
      {
        id: 1,
        productId: 1,
        mediaType: 1,
        mediaUrl: 'https://via.placeholder.com/400x400/4A90E2/fff?text=iPhone',
        isDefault: true
      }
    ],
    category: {
      id: 11,
      parentId: 1,
      categoryName: '手機',
      level: 2,
      sortOrder: 1
    },
    vendor: {
      id: 1,
      vendorName: 'Apple Store 官方旗艦店',
      rating: 4.8
    },
    specs: [
      {
        id: 1,
        productId: 1,
        specName: '顏色',
        specValue: '深空黑',
        additionalPrice: 0,
        stock: 10
      },
      {
        id: 2,
        productId: 1,
        specName: '容量',
        specValue: '256GB',
        additionalPrice: 0,
        stock: 15
      }
    ]
  },
  {
    id: 2,
    vendorId: 1,
    categoryId: 31,
    productName: 'AirPods Pro 2',
    description: '主動式降噪耳機，支援空間音訊，最長可達 6 小時聆聽時間',
    basePrice: 7990,
    stock: 45,
    sku: 'APP2023',
    barcode: '194253062345',
    isActive: true,
    status: 1,
    viewCount: 890,
    soldCount: 156,
    rating: 4.7,
    reviewCount: 203,
    media: [
      {
        id: 2,
        productId: 2,
        mediaType: 1,
        mediaUrl: 'https://via.placeholder.com/400x400/34A853/fff?text=AirPods',
        isDefault: true
      }
    ],
    category: {
      id: 31,
      parentId: 3,
      categoryName: '耳機',
      level: 2,
      sortOrder: 1
    },
    vendor: {
      id: 1,
      vendorName: 'Apple Store 官方旗艦店',
      rating: 4.8
    },
    specs: [
      {
        id: 3,
        productId: 2,
        specName: '顏色',
        specValue: '白色',
        additionalPrice: 0,
        stock: 45
      }
    ]
  },
  {
    id: 3,
    vendorId: 1,
    categoryId: 13,
    productName: 'MacBook Air M3',
    description: '13 吋 MacBook Air，搭載 M3 晶片，輕薄設計，全天候電池續航力',
    basePrice: 35900,
    stock: 15,
    sku: 'MBA13M3',
    barcode: '194253073456',
    isActive: true,
    status: 1,
    viewCount: 650,
    soldCount: 42,
    rating: 4.9,
    reviewCount: 78,
    media: [
      {
        id: 3,
        productId: 3,
        mediaType: 1,
        mediaUrl: 'https://via.placeholder.com/400x400/7C4DFF/fff?text=MacBook',
        isDefault: true
      }
    ],
    category: {
      id: 13,
      parentId: 1,
      categoryName: '筆電',
      level: 2,
      sortOrder: 3
    },
    vendor: {
      id: 1,
      vendorName: 'Apple Store 官方旗艦店',
      rating: 4.8
    },
    specs: [
      {
        id: 4,
        productId: 3,
        specName: '顏色',
        specValue: '太空灰',
        additionalPrice: 0,
        stock: 8
      },
      {
        id: 5,
        productId: 3,
        specName: '記憶體',
        specValue: '8GB',
        additionalPrice: 0,
        stock: 7
      }
    ]
  },
  {
    id: 4,
    vendorId: 2,
    categoryId: 31,
    productName: 'Sony WH-1000XM5',
    description: '頂級降噪耳機，30小時續航，支援高解析音質，舒適配戴設計',
    basePrice: 11900,
    stock: 32,
    sku: 'SNYWH1000XM5',
    barcode: '194253084567',
    isActive: true,
    status: 1,
    viewCount: 720,
    soldCount: 95,
    rating: 4.6,
    reviewCount: 145,
    media: [
      {
        id: 4,
        productId: 4,
        mediaType: 1,
        mediaUrl: 'https://via.placeholder.com/400x400/FF6B6B/fff?text=Sony',
        isDefault: true
      }
    ],
    category: {
      id: 31,
      parentId: 3,
      categoryName: '耳機',
      level: 2,
      sortOrder: 1
    },
    vendor: {
      id: 2,
      vendorName: 'Sony 官方旗艦店',
      rating: 4.6
    },
    specs: [
      {
        id: 6,
        productId: 4,
        specName: '顏色',
        specValue: '黑色',
        additionalPrice: 0,
        stock: 20
      },
      {
        id: 7,
        productId: 4,
        specName: '顏色',
        specValue: '銀色',
        additionalPrice: 0,
        stock: 12
      }
    ]
  },
  {
    id: 5,
    vendorId: 4,
    categoryId: 22,
    productName: 'Dyson V15 Detect 無線吸塵器',
    description: '智慧偵測灰塵技術，雷射顯微粒偵測，強勁吸力，60分鐘運作時間',
    basePrice: 22900,
    stock: 12,
    sku: 'DYSV15DET',
    barcode: '194253095678',
    isActive: true,
    status: 1,
    viewCount: 340,
    soldCount: 28,
    rating: 4.9,
    reviewCount: 45,
    media: [
      {
        id: 5,
        productId: 5,
        mediaType: 1,
        mediaUrl: 'https://via.placeholder.com/400x400/AA96DA/fff?text=Dyson',
        isDefault: true
      }
    ],
    category: {
      id: 22,
      parentId: 2,
      categoryName: '清潔家電',
      level: 2,
      sortOrder: 2
    },
    vendor: {
      id: 4,
      vendorName: 'Dyson 官方旗艦店',
      rating: 4.9
    },
    specs: [
      {
        id: 8,
        productId: 5,
        specName: '顏色',
        specValue: '金色',
        additionalPrice: 0,
        stock: 12
      }
    ]
  }
]

// 生成分頁響應的輔助函數
export const createMockPaginationResponse = (data: any[], page: number = 1, limit: number = 12) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedData = data.slice(startIndex, endIndex)

  return {
    data: paginatedData,
    total: data.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(data.length / limit)
  }
}

// 舊格式商品數據 (保持向後兼容)
export const mockProductsOld = [
  {
    productId: 1,
    productName: 'iPhone 15 Pro Max',
    price: 42900,
    maxQuantity: 20,
    imageUrl: 'https://via.placeholder.com/200x200/34A853/fff?text=AirPods',
    vendorId: 1,
    vendorName: 'Apple Store 官方旗艦店',
    categoryId: 2,
    categoryName: '耳機',
    description: '主動式降噪耳機，支援空間音訊'
  },
  {
    productId: 3,
    productName: 'MacBook Air M3',
    price: 35900,
    maxQuantity: 5,
    imageUrl: 'https://via.placeholder.com/200x200/7C4DFF/fff?text=MacBook',
    vendorId: 1,
    vendorName: 'Apple Store 官方旗艦店',
    categoryId: 3,
    categoryName: '筆電',
    description: '13 吋 MacBook Air，搭載 M3 晶片'
  },
  {
    productId: 4,
    productName: 'Sony WH-1000XM5',
    price: 11900,
    maxQuantity: 15,
    imageUrl: 'https://via.placeholder.com/200x200/FF6B6B/fff?text=Sony',
    vendorId: 2,
    vendorName: 'Sony 官方旗艦店',
    categoryId: 2,
    categoryName: '耳機',
    description: '頂級降噪耳機，30小時續航'
  },
  {
    productId: 5,
    productName: 'PlayStation 5',
    price: 15480,
    maxQuantity: 8,
    imageUrl: 'https://via.placeholder.com/200x200/4ECDC4/fff?text=PS5',
    vendorId: 2,
    vendorName: 'Sony 官方旗艦店',
    categoryId: 4,
    categoryName: '遊戲主機',
    description: '次世代遊戲主機，支援 4K 遊戲'
  },
  {
    productId: 6,
    productName: 'Samsung Galaxy S24 Ultra',
    price: 39900,
    maxQuantity: 12,
    imageUrl: 'https://via.placeholder.com/200x200/95E1D3/fff?text=Samsung',
    vendorId: 3,
    vendorName: 'Samsung 三星旗艦店',
    categoryId: 1,
    categoryName: '手機',
    description: '頂級 Android 旗艦，搭載 S Pen'
  },
  {
    productId: 7,
    productName: 'Galaxy Watch 6',
    price: 9900,
    maxQuantity: 25,
    imageUrl: 'https://via.placeholder.com/200x200/F38181/fff?text=Watch',
    vendorId: 3,
    vendorName: 'Samsung 三星旗艦店',
    categoryId: 5,
    categoryName: '智慧手錶',
    description: '智慧手錶，健康監測功能完整'
  },
  {
    productId: 8,
    productName: 'Dyson V15 吸塵器',
    price: 22900,
    maxQuantity: 6,
    imageUrl: 'https://via.placeholder.com/200x200/AA96DA/fff?text=Dyson',
    vendorId: 4,
    vendorName: 'Dyson 官方旗艦店',
    categoryId: 6,
    categoryName: '家電',
    description: '無線吸塵器，智慧偵測灰塵'
  }
]

// 模擬用戶地址數據
export const mockAddresses = [
  {
    id: 1,
    recipientName: '王小明',
    recipientPhone: '0912345678',
    postalCode: '106',
    city: '台北市',
    district: '大安區',
    address: '忠孝東路三段123號5樓',
    isDefault: true
  },
  {
    id: 2,
    recipientName: '李小華',
    recipientPhone: '0923456789',
    postalCode: '404',
    city: '台中市',
    district: '北區',
    address: '三民路三段456號',
    isDefault: false
  },
  {
    id: 3,
    recipientName: '張大同',
    recipientPhone: '0934567890',
    postalCode: '802',
    city: '高雄市',
    district: '苓雅區',
    address: '中正一路789號10樓之2',
    isDefault: false
  }
]

// 模擬訂單數據
export const mockOrders = [
  {
    id: 1,
    masterOrderNumber: 'ORD202501140001',
    totalAmount: 50890,
    finalAmount: 50890,
    orderStatus: 2, // 待確認  
    paymentStatus: 2, // 已付款（修正：2=已付款，不是1）
    createdAt: '2025-01-14T10:30:00',
    orders: [
      {
        id: 1,
        orderNumber: 'ORD202501140001-01',
        vendorId: 1,
        vendorName: 'Apple Store 官方旗艦店',
        subTotal: 42900,
        orderStatus: 2,
        items: [
          {
            productName: 'iPhone 15 Pro Max',
            price: 42900,
            quantity: 1,
            imageUrl: 'https://via.placeholder.com/100x100/4A90E2/fff?text=iPhone'
          }
        ]
      },
      {
        id: 2,
        orderNumber: 'ORD202501140001-02',
        vendorId: 1,
        vendorName: 'Apple Store 官方旗艦店',
        subTotal: 7990,
        orderStatus: 2,
        items: [
          {
            productName: 'AirPods Pro 2',
            price: 7990,
            quantity: 1,
            imageUrl: 'https://via.placeholder.com/100x100/34A853/fff?text=AirPods'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    masterOrderNumber: 'ORD202501130002',
    totalAmount: 27390,
    finalAmount: 27390,
    orderStatus: 5, // 已出貨
    paymentStatus: 2, // 已付款（修正：2=已付款，不是1）
    createdAt: '2025-01-13T14:20:00',
    orders: [
      {
        id: 3,
        orderNumber: 'ORD202501130002-01',
        vendorId: 2,
        vendorName: 'Sony 官方旗艦店',
        subTotal: 27380,
        orderStatus: 7,
        items: [
          {
            productName: 'Sony WH-1000XM5',
            price: 11900,
            quantity: 1,
            imageUrl: 'https://via.placeholder.com/100x100/FF6B6B/fff?text=Sony'
          },
          {
            productName: 'PlayStation 5',
            price: 15480,
            quantity: 1,
            imageUrl: 'https://via.placeholder.com/100x100/4ECDC4/fff?text=PS5'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    masterOrderNumber: 'ORD202501120003',
    totalAmount: 22900,
    finalAmount: 22900,
    orderStatus: 7, // 已完成
    paymentStatus: 2, // 已付款（修正：2=已付款，不是1）
    createdAt: '2025-01-12T09:15:00',
    orders: [
      {
        id: 4,
        orderNumber: 'ORD202501120003-01',
        vendorId: 4,
        vendorName: 'Dyson 官方旗艦店',
        subTotal: 22900,
        orderStatus: 7,
        items: [
          {
            productName: 'Dyson V15 吸塵器',
            price: 22900,
            quantity: 1,
            imageUrl: 'https://via.placeholder.com/100x100/AA96DA/fff?text=Dyson'
          }
        ]
      }
    ]
  }
]

// 模擬優惠券數據
export const mockCoupons = [
  {
    id: 1,
    code: 'NEWUSER100',
    name: '新用戶專屬優惠',
    type: 1, // 固定金額
    discount: 100,
    minAmount: 1000,
    description: '滿 1000 元折 100 元',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isValid: true
  },
  {
    id: 2,
    code: 'VIP95',
    name: 'VIP 會員優惠',
    type: 2, // 百分比
    discount: 5,
    minAmount: 2000,
    description: '滿 2000 元享 95 折',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isValid: true
  },
  {
    id: 3,
    code: 'FREESHIP',
    name: '免運費優惠',
    type: 3, // 免運費
    discount: 0,
    minAmount: 500,
    description: '滿 500 元免運費',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isValid: true
  }
]


// 生成隨機訂單號
export const generateOrderNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD${year}${month}${day}${random}`
}

// 添加模擬商品到購物車的輔助函數
export const addMockProductsToCart = (cartStore: any, count: number = 3) => {
  const shuffled = [...mockProducts].sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, Math.min(count, mockProducts.length))

  selected.forEach(product => {
    cartStore.addItem({
      ...product,
      quantity: Math.floor(Math.random() * 3) + 1 // 隨機數量 1-3
    })
  })

  return selected
}

// 模擬 API 延遲
export const mockApiDelay = (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 模擬創建訂單響應
export const mockCreateOrderResponse = (orderData: any) => {
  return {
    masterOrderId: Math.floor(Math.random() * 100000),
    masterOrderNumber: generateOrderNumber(),
    finalAmount: orderData.totalAmount || 0,
    paymentUrl: '/payment/mock',
    createdAt: new Date().toISOString()
  }
}