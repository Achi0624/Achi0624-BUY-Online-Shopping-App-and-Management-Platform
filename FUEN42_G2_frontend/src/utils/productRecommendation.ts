// 商品推薦算法工具
import productApi from '@/api/modules/product'
import type { ProductAPI } from '@/types/api'
import userBehaviorTracker from './userBehaviorTracker'

// 推薦策略枚舉
export enum RecommendationStrategy {
  POPULAR = 'popular',           // 熱門商品：基於銷量和瀏覽量
  HIGH_RATING = 'high_rating',   // 高評分商品：基於評分
  TRENDING = 'trending',         // 趨勢商品：基於最近瀏覽量增長
  SIMILAR_PRICE = 'similar_price', // 相似價位商品
  NEW_ARRIVALS = 'new_arrivals', // 新品
  PERSONALIZED = 'personalized'  // 個人化推薦
}

// 商品評分權重配置
interface ScoringWeights {
  soldCount: number      // 銷售數量權重
  viewCount: number      // 瀏覽數量權重  
  rating: number         // 評分權重
  reviewCount: number    // 評論數量權重
  recency: number        // 新鮮度權重
}

// 不同推薦策略的權重配置
const STRATEGY_WEIGHTS: Record<RecommendationStrategy, ScoringWeights> = {
  [RecommendationStrategy.POPULAR]: {
    soldCount: 1.0,    // 100% 基於訂單數量 (簡化排序標準)
    viewCount: 0.0,    // 不考慮瀏覽量
    rating: 0.0,       // 不考慮評分
    reviewCount: 0.0,  // 不考慮評論數
    recency: 0.0       // 不考慮新鮮度
  },
  [RecommendationStrategy.HIGH_RATING]: {
    soldCount: 0.1,
    viewCount: 0.1,
    rating: 0.5,
    reviewCount: 0.3,
    recency: 0.0
  },
  [RecommendationStrategy.TRENDING]: {
    soldCount: 0.0,    // 不考慮訂單數
    viewCount: 1.0,    // 100% 基於點擊瀏覽數量 (用於推薦商品)
    rating: 0.0,       // 不考慮評分
    reviewCount: 0.0,  // 不考慮評論數
    recency: 0.0       // 不考慮新鮮度
  },
  [RecommendationStrategy.NEW_ARRIVALS]: {
    soldCount: 0.1,
    viewCount: 0.2,
    rating: 0.2,
    reviewCount: 0.1,
    recency: 0.4
  },
  [RecommendationStrategy.SIMILAR_PRICE]: {
    soldCount: 0.3,
    viewCount: 0.2,
    rating: 0.3,
    reviewCount: 0.2,
    recency: 0.0
  },
  [RecommendationStrategy.PERSONALIZED]: {
    soldCount: 0.0,    // 不考慮訂單數
    viewCount: 1.0,    // 100% 基於點擊瀏覽數量 (與推薦商品策略一致)
    rating: 0.0,       // 不考慮評分
    reviewCount: 0.0,  // 不考慮評論數
    recency: 0.0       // 不考慮新鮮度
  }
}

// 計算商品綜合評分
function calculateProductScore(product: ProductAPI.ProductInfo, weights: ScoringWeights): number {
  const maxSold = 10000      // 假設最大銷量
  const maxViews = 50000     // 假設最大瀏覽量
  const maxReviews = 1000    // 假設最大評論數

  // 正規化各項指標 (0-1)
  const normalizedSold = Math.min(product.soldCount / maxSold, 1)
  const normalizedViews = Math.min(product.viewCount / maxViews, 1) 
  const normalizedRating = (product.rating || 0) / 5
  const normalizedReviews = Math.min(product.reviewCount / maxReviews, 1)
  
  // 計算新鮮度 (假設有創建時間，這裡暫時設為隨機值)
  const normalizedRecency = Math.random() * 0.5 + 0.5

  // 加權計算綜合評分
  return (
    normalizedSold * weights.soldCount +
    normalizedViews * weights.viewCount +
    normalizedRating * weights.rating +
    normalizedReviews * weights.reviewCount +
    normalizedRecency * weights.recency
  )
}

// 過濾和排序商品
function filterAndSortProducts(
  products: ProductAPI.ProductInfo[], 
  strategy: RecommendationStrategy,
  options: {
    limit?: number
    minRating?: number
    priceRange?: { min: number; max: number }
    excludeIds?: number[]
  } = {}
): ProductAPI.ProductInfo[] {
  const { limit = 12, minRating = 0, priceRange, excludeIds = [] } = options
  
  let filtered = products.filter(product => {
    // 排除指定商品
    if (excludeIds.includes(product.id)) return false
    
    // 最低評分過濾
    if (product.rating && product.rating < minRating) return false
    
    // 價格範圍過濾
    if (priceRange) {
      if (product.basePrice < priceRange.min || product.basePrice > priceRange.max) {
        return false
      }
    }
    
    // 確保商品有足夠資訊進行推薦
    return product.isActive && product.stock > 0
  })

  // 根據策略特殊過濾
  switch (strategy) {
    case RecommendationStrategy.HIGH_RATING:
      filtered = filtered.filter(p => (p.rating || 0) >= 4.0)
      break
    case RecommendationStrategy.POPULAR:
      filtered = filtered.filter(p => p.soldCount > 0 || p.viewCount > 10)
      break
    case RecommendationStrategy.TRENDING:
      filtered = filtered.filter(p => p.viewCount > 50)
      break
  }

  // 計算評分並排序
  const weights = STRATEGY_WEIGHTS[strategy]
  const scored = filtered.map(product => ({
    product,
    score: calculateProductScore(product, weights)
  }))

  // 按評分排序
  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(item => item.product)
}

// 智能推薦商品 API
export class ProductRecommendationService {
  
  // 獲取熱門商品 (真正基於銷量和瀏覽量的熱門商品)
  static async getPopularProducts(limit: number = 8): Promise<ProductAPI.ProductInfo[]> {
    try {
      // 嘗試使用後端熱門商品 API
      const products = await productApi.getPopularProducts(limit * 3) // 獲取更多以便篩選
      if (products.length > 0) {
        return filterAndSortProducts(products, RecommendationStrategy.POPULAR, { limit })
      }
    } catch (error) {
      console.warn('後端熱門商品 API 不可用，使用替代策略')
    }

    // 回退策略：獲取所有商品並自行篩選
    try {
      const allProducts = await productApi.getProducts({ 
        page: 1, 
        pageSize: 50,
        sortBy: 'soldCount',
        sortOrder: 'desc'
      })
      return filterAndSortProducts(allProducts.items, RecommendationStrategy.POPULAR, { 
        limit,
        minRating: 3.0 
      })
    } catch (error) {
      console.error('無法獲取熱門商品:', error)
      return []
    }
  }

  // 獲取推薦商品 (多策略混合推薦)
  static async getRecommendedProducts(
    limit: number = 8, 
    options: {
      userId?: number
      excludePopular?: boolean
      strategy?: RecommendationStrategy
    } = {}
  ): Promise<ProductAPI.ProductInfo[]> {
    const { excludePopular = true, strategy = RecommendationStrategy.PERSONALIZED } = options

    try {
      // 如果有用戶 ID，嘗試個人化推薦
      if (options.userId) {
        try {
          const personalizedProducts = await this.getPersonalizedRecommendations(options.userId, limit)
          if (personalizedProducts.length > 0) {
            return personalizedProducts
          }
        } catch (error) {
          console.warn('個人化推薦失敗，使用通用推薦策略')
        }
      }

      // 多策略混合推薦
      const strategies = [
        RecommendationStrategy.HIGH_RATING,
        RecommendationStrategy.TRENDING, 
        RecommendationStrategy.NEW_ARRIVALS
      ]

      const allRecommendations: ProductAPI.ProductInfo[] = []
      const usedIds = new Set<number>()

      // 獲取熱門商品 ID (用於排除)
      let popularProductIds: number[] = []
      if (excludePopular) {
        try {
          const popularProducts = await this.getPopularProducts(limit)
          popularProductIds = popularProducts.map(p => p.id)
        } catch (error) {
          console.warn('無法獲取熱門商品用於排除')
        }
      }

      // 從每個策略獲取一些商品
      for (const currentStrategy of strategies) {
        try {
          const allProducts = await productApi.getProducts({
            page: 1,
            pageSize: 30,
            sortBy: this.getSortByForStrategy(currentStrategy),
            sortOrder: 'desc'
          })

          const strategyProducts = filterAndSortProducts(
            allProducts.items, 
            currentStrategy, 
            { 
              limit: Math.ceil(limit / strategies.length) + 2,
              excludeIds: [...Array.from(usedIds), ...popularProductIds]
            }
          )

          for (const product of strategyProducts) {
            if (!usedIds.has(product.id) && allRecommendations.length < limit) {
              allRecommendations.push(product)
              usedIds.add(product.id)
            }
          }
        } catch (error) {
          console.warn(`策略 ${currentStrategy} 推薦失敗:`, error)
        }
      }

      // 如果還需要更多商品，使用新品填充
      if (allRecommendations.length < limit) {
        try {
          const newProducts = await productApi.getNewProducts(limit - allRecommendations.length + 5)
          const additionalProducts = newProducts.filter(p => !usedIds.has(p.id))
          
          for (const product of additionalProducts) {
            if (allRecommendations.length < limit) {
              allRecommendations.push(product)
            }
          }
        } catch (error) {
          console.warn('無法獲取新品作為補充推薦')
        }
      }

      return allRecommendations.slice(0, limit)
      
    } catch (error) {
      console.error('推薦商品獲取失敗:', error)
      return []
    }
  }

  // 個人化推薦 (基於用戶行為)
  private static async getPersonalizedRecommendations(
    userId: number, 
    limit: number
  ): Promise<ProductAPI.ProductInfo[]> {
    try {
      // 嘗試使用後端個人化推薦 API
      const response = await productApi.getRecommendedProducts(limit)
      if (response.length > 0) {
        return response
      }
    } catch (error) {
      console.warn('後端個人化推薦 API 不可用，使用本地行為分析')
    }

    // 基於本地用戶行為數據的推薦
    try {
      return await this.getSmartBehaviorBasedRecommendations(limit)
    } catch (error) {
      console.warn('智能行為推薦失敗:', error)
    }

    // 基於用戶瀏覽歷史的推薦（原有邏輯保留作為後備）
    try {
      const viewHistory = await productApi.getViewHistory(20)
      if (viewHistory.length > 0) {
        const categoryIds = [...new Set(viewHistory.map(p => p.categoryId).filter(Boolean))]
        const avgPrice = viewHistory.reduce((sum, p) => sum + p.basePrice, 0) / viewHistory.length
        const priceRange = {
          min: avgPrice * 0.7,
          max: avgPrice * 1.5
        }

        const allProducts = await productApi.getProducts({
          page: 1,
          pageSize: 50,
          categoryId: categoryIds[0]
        })

        const viewedIds = viewHistory.map(p => p.id)
        return filterAndSortProducts(
          allProducts.items,
          RecommendationStrategy.PERSONALIZED,
          {
            limit,
            priceRange,
            excludeIds: viewedIds,
            minRating: 3.5
          }
        )
      }
    } catch (error) {
      console.warn('基於瀏覽歷史的推薦失敗:', error)
    }

    return []
  }

  // 基於用戶行為的智能推薦
  private static async getSmartBehaviorBasedRecommendations(limit: number): Promise<ProductAPI.ProductInfo[]> {
    try {
      // 獲取用戶行為數據
      const preferredCategories = userBehaviorTracker.getPreferredCategories(3)
      const priceRange = userBehaviorTracker.getPreferredPriceRange()
      const relatedProductIds = userBehaviorTracker.getRelatedProductIds(10)
      const popularKeywords = userBehaviorTracker.getPopularKeywords(5)

      const recommendations: ProductAPI.ProductInfo[] = []
      const usedIds = new Set<number>()

      // 1. 基於偏好分類推薦 (40%)
      if (preferredCategories.length > 0) {
        try {
          for (const { categoryId } of preferredCategories) {
            const categoryProducts = await productApi.getProductsByCategory(categoryId, {
              page: 1,
              pageSize: Math.ceil(limit * 0.4 / preferredCategories.length) + 2
            })

            const filtered = filterAndSortProducts(
              categoryProducts.items,
              RecommendationStrategy.PERSONALIZED,
              {
                limit: Math.ceil(limit * 0.4 / preferredCategories.length),
                priceRange,
                excludeIds: [...relatedProductIds, ...Array.from(usedIds)],
                minRating: 3.0
              }
            )

            filtered.forEach(product => {
              if (recommendations.length < limit && !usedIds.has(product.id)) {
                recommendations.push(product)
                usedIds.add(product.id)
              }
            })
          }
        } catch (error) {
          console.warn('基於偏好分類推薦失敗:', error)
        }
      }

      // 2. 基於搜尋關鍵字推薦 (30%)
      if (popularKeywords.length > 0 && recommendations.length < limit) {
        try {
          for (const { keyword } of popularKeywords) {
            const searchResults = await productApi.searchProducts(keyword, {
              page: 1,
              pageSize: Math.ceil(limit * 0.3 / popularKeywords.length) + 2
            })

            const filtered = filterAndSortProducts(
              searchResults.items,
              RecommendationStrategy.TRENDING,
              {
                limit: Math.ceil(limit * 0.3 / popularKeywords.length),
                priceRange,
                excludeIds: [...relatedProductIds, ...Array.from(usedIds)],
                minRating: 3.0
              }
            )

            filtered.forEach(product => {
              if (recommendations.length < limit && !usedIds.has(product.id)) {
                recommendations.push(product)
                usedIds.add(product.id)
              }
            })
          }
        } catch (error) {
          console.warn('基於搜尋關鍵字推薦失敗:', error)
        }
      }

      // 3. 基於價格範圍的相似商品推薦 (30%)
      if (recommendations.length < limit) {
        try {
          const allProducts = await productApi.getProducts({
            page: 1,
            pageSize: 50,
            sortBy: 'rating',
            sortOrder: 'desc'
          })

          const priceFiltered = allProducts.items.filter(p => 
            p.basePrice >= priceRange.min && 
            p.basePrice <= priceRange.max &&
            !usedIds.has(p.id) &&
            !relatedProductIds.includes(p.id)
          )

          const sorted = filterAndSortProducts(
            priceFiltered,
            RecommendationStrategy.SIMILAR_PRICE,
            {
              limit: limit - recommendations.length,
              minRating: 3.5
            }
          )

          sorted.forEach(product => {
            if (recommendations.length < limit && !usedIds.has(product.id)) {
              recommendations.push(product)
              usedIds.add(product.id)
            }
          })
        } catch (error) {
          console.warn('基於價格範圍推薦失敗:', error)
        }
      }

      console.log(`行為推薦完成: ${recommendations.length}件商品, 基於${preferredCategories.length}個偏好分類, ${popularKeywords.length}個關鍵字`)
      return recommendations

    } catch (error) {
      console.error('智能行為推薦完全失敗:', error)
      return []
    }
  }

  // 根據策略獲取排序字段
  private static getSortByForStrategy(strategy: RecommendationStrategy): string {
    switch (strategy) {
      case RecommendationStrategy.POPULAR:
        return 'soldCount'
      case RecommendationStrategy.HIGH_RATING:
        return 'rating'
      case RecommendationStrategy.TRENDING:
        return 'viewCount'
      case RecommendationStrategy.NEW_ARRIVALS:
        return 'createdAt'
      default:
        return 'soldCount'
    }
  }

  // 獲取相似商品
  static async getSimilarProducts(
    productId: number, 
    limit: number = 6
  ): Promise<ProductAPI.ProductInfo[]> {
    try {
      // 先嘗試後端相似商品 API
      const similar = await productApi.getSimilarProducts(productId, limit)
      if (similar.length > 0) {
        return similar
      }
    } catch (error) {
      console.warn('後端相似商品 API 不可用')
    }

    try {
      // 獲取基準商品信息
      const baseProduct = await productApi.getProduct(productId)
      
      // 基於分類和價格範圍找相似商品
      const similarProducts = await productApi.getProductsByCategory(
        baseProduct.categoryId,
        {
          page: 1,
          pageSize: limit * 2
        }
      )

      const priceRange = {
        min: baseProduct.basePrice * 0.7,
        max: baseProduct.basePrice * 1.3
      }

      return filterAndSortProducts(
        similarProducts.items,
        RecommendationStrategy.SIMILAR_PRICE,
        {
          limit,
          priceRange,
          excludeIds: [productId],
          minRating: 3.0
        }
      )
    } catch (error) {
      console.error('無法獲取相似商品:', error)
      return []
    }
  }
}

export default ProductRecommendationService