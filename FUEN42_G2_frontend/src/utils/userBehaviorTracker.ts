// 用戶行為追蹤服務
// 用於收集用戶的搜尋關鍵字、點擊行為、購物車內容等數據，以提供個人化推薦

export interface SearchKeyword {
  keyword: string
  timestamp: number
  resultCount: number
  category?: string
}

export interface ClickBehavior {
  type: 'product' | 'category' | 'vendor' | 'brand'
  targetId: number
  targetName: string
  timestamp: number
  page: string
  position?: number // 在列表中的位置
}

export interface CartItem {
  productId: number
  productName: string
  categoryId: number
  categoryName: string
  price: number
  quantity: number
  vendorId: number
  addedAt: number
}

export interface UserBehaviorData {
  searches: SearchKeyword[]
  clicks: ClickBehavior[]
  cartItems: CartItem[]
  preferences: {
    categories: Record<number, number>  // categoryId -> interest score
    priceRange: { min: number; max: number; avg: number }
    vendors: Record<number, number>     // vendorId -> preference score
    brands: Record<string, number>      // brand -> preference score
  }
  lastUpdated: number
}

class UserBehaviorTracker {
  private readonly STORAGE_KEY = 'user_behavior_data'
  private readonly MAX_SEARCH_HISTORY = 50
  private readonly MAX_CLICK_HISTORY = 100
  private readonly DATA_RETENTION_DAYS = 30

  // 獲取用戶行為數據
  getBehaviorData(): UserBehaviorData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return this.getDefaultBehaviorData()
      }

      const data = JSON.parse(stored) as UserBehaviorData
      
      // 清理過期數據
      const cutoffTime = Date.now() - (this.DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000)
      
      data.searches = data.searches.filter(s => s.timestamp > cutoffTime)
      data.clicks = data.clicks.filter(c => c.timestamp > cutoffTime)
      data.cartItems = data.cartItems.filter(item => item.addedAt > cutoffTime)
      
      return data
    } catch (error) {
      console.error('Failed to load behavior data:', error)
      return this.getDefaultBehaviorData()
    }
  }

  // 記錄搜尋關鍵字
  trackSearch(keyword: string, resultCount: number, category?: string): void {
    try {
      const data = this.getBehaviorData()
      
      const searchRecord: SearchKeyword = {
        keyword: keyword.toLowerCase().trim(),
        timestamp: Date.now(),
        resultCount,
        category
      }

      // 避免重複記錄相同的搜尋（5分鐘內）
      const recentSearch = data.searches.find(s => 
        s.keyword === searchRecord.keyword && 
        Date.now() - s.timestamp < 5 * 60 * 1000
      )

      if (!recentSearch) {
        data.searches.unshift(searchRecord)
        data.searches = data.searches.slice(0, this.MAX_SEARCH_HISTORY)
      }

      this.updateBehaviorData(data)
    } catch (error) {
      console.error('Failed to track search:', error)
    }
  }

  // 記錄點擊行為
  trackClick(
    type: ClickBehavior['type'],
    targetId: number,
    targetName: string,
    page: string,
    position?: number
  ): void {
    try {
      const data = this.getBehaviorData()
      
      const clickRecord: ClickBehavior = {
        type,
        targetId,
        targetName,
        timestamp: Date.now(),
        page,
        position
      }

      data.clicks.unshift(clickRecord)
      data.clicks = data.clicks.slice(0, this.MAX_CLICK_HISTORY)

      this.updateBehaviorData(data)
    } catch (error) {
      console.error('Failed to track click:', error)
    }
  }

  // 記錄購物車變化
  trackCartChange(cartItems: CartItem[]): void {
    try {
      const data = this.getBehaviorData()
      data.cartItems = cartItems
      this.updateBehaviorData(data)
    } catch (error) {
      console.error('Failed to track cart change:', error)
    }
  }

  // 獲取用戶偏好的分類
  getPreferredCategories(limit: number = 5): Array<{ categoryId: number; score: number }> {
    const data = this.getBehaviorData()
    
    // 基於點擊和購物車內容計算分類偏好
    const categoryScores: Record<number, number> = {}

    // 從點擊行為計算分類偏好
    data.clicks
      .filter(c => c.type === 'product' || c.type === 'category')
      .forEach(click => {
        // 這裡需要從產品ID獲取分類ID，暫時使用targetId
        const categoryId = click.type === 'category' ? click.targetId : click.targetId
        const timeDecay = this.calculateTimeDecay(click.timestamp)
        categoryScores[categoryId] = (categoryScores[categoryId] || 0) + (1 * timeDecay)
      })

    // 從購物車內容計算分類偏好（權重更高）
    data.cartItems.forEach(item => {
      const timeDecay = this.calculateTimeDecay(item.addedAt)
      categoryScores[item.categoryId] = (categoryScores[item.categoryId] || 0) + (2 * timeDecay)
    })

    // 從搜尋歷史推斷分類興趣
    data.searches.forEach(search => {
      if (search.category) {
        // 假設這裡有分類名稱到ID的映射
        const timeDecay = this.calculateTimeDecay(search.timestamp)
        // 暫時忽略，因為需要分類名稱到ID的映射
      }
    })

    return Object.entries(categoryScores)
      .map(([categoryId, score]) => ({ categoryId: parseInt(categoryId), score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  // 獲取用戶偏好的價格範圍
  getPreferredPriceRange(): { min: number; max: number; avg: number } {
    const data = this.getBehaviorData()
    
    const prices = data.cartItems.map(item => item.price)
    
    if (prices.length === 0) {
      return { min: 0, max: 100000, avg: 5000 }
    }

    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length

    return {
      min: Math.max(0, min * 0.7), // 擴大範圍70%-130%
      max: max * 1.3,
      avg
    }
  }

  // 獲取熱門搜尋關鍵字
  getPopularKeywords(limit: number = 10): Array<{ keyword: string; count: number; lastUsed: number }> {
    const data = this.getBehaviorData()
    
    const keywordCount: Record<string, { count: number; lastUsed: number }> = {}
    
    data.searches.forEach(search => {
      if (keywordCount[search.keyword]) {
        keywordCount[search.keyword].count++
        keywordCount[search.keyword].lastUsed = Math.max(
          keywordCount[search.keyword].lastUsed,
          search.timestamp
        )
      } else {
        keywordCount[search.keyword] = {
          count: 1,
          lastUsed: search.timestamp
        }
      }
    })

    return Object.entries(keywordCount)
      .map(([keyword, data]) => ({ keyword, ...data }))
      .sort((a, b) => b.count - a.count || b.lastUsed - a.lastUsed)
      .slice(0, limit)
  }

  // 獲取相關商品ID（基於行為相似性）
  getRelatedProductIds(limit: number = 20): number[] {
    const data = this.getBehaviorData()
    
    // 從點擊歷史獲取相關商品
    const productIds = data.clicks
      .filter(c => c.type === 'product')
      .map(c => c.targetId)
    
    // 從購物車獲取相關商品
    const cartProductIds = data.cartItems.map(item => item.productId)
    
    // 合併並去重，優先顯示最近的
    const allProductIds = [...new Set([...productIds, ...cartProductIds])]
    
    return allProductIds.slice(0, limit)
  }

  // 清除用戶行為數據
  clearBehaviorData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // 獲取行為統計
  getBehaviorStats(): {
    totalSearches: number
    totalClicks: number
    cartItemsCount: number
    mostSearchedKeyword: string | null
    mostClickedCategory: string | null
  } {
    const data = this.getBehaviorData()
    
    const keywordCounts = this.getPopularKeywords(1)
    const categoryPrefs = this.getPreferredCategories(1)
    
    return {
      totalSearches: data.searches.length,
      totalClicks: data.clicks.length,
      cartItemsCount: data.cartItems.length,
      mostSearchedKeyword: keywordCounts[0]?.keyword || null,
      mostClickedCategory: categoryPrefs[0]?.categoryId.toString() || null
    }
  }

  private getDefaultBehaviorData(): UserBehaviorData {
    return {
      searches: [],
      clicks: [],
      cartItems: [],
      preferences: {
        categories: {},
        priceRange: { min: 0, max: 100000, avg: 5000 },
        vendors: {},
        brands: {}
      },
      lastUpdated: Date.now()
    }
  }

  private updateBehaviorData(data: UserBehaviorData): void {
    try {
      data.lastUpdated = Date.now()
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save behavior data:', error)
      
      // 如果儲存失敗，可能是因為空間不足，清理舊數據
      try {
        this.cleanupOldData()
        data.lastUpdated = Date.now()
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      } catch (retryError) {
        console.error('Failed to save behavior data after cleanup:', retryError)
      }
    }
  }

  private cleanupOldData(): void {
    const data = this.getBehaviorData()
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000) // 保留7天

    data.searches = data.searches.filter(s => s.timestamp > cutoffTime).slice(0, 20)
    data.clicks = data.clicks.filter(c => c.timestamp > cutoffTime).slice(0, 50)
    data.cartItems = data.cartItems.filter(item => item.addedAt > cutoffTime)

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
  }

  private calculateTimeDecay(timestamp: number): number {
    const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
    return Math.exp(-daysSince / 7) // 7天的衰減係數
  }
}

// 全局單例
export const userBehaviorTracker = new UserBehaviorTracker()
export default userBehaviorTracker