import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsView.vue')
    },
    {
      path: '/modern-marketplace',
      name: 'modern-marketplace',
      component: () => import('../views/ModernMarketplaceView.vue')
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetailView.vue')
    },
    {
      path: '/category/:categoryId',
      name: 'category',
      component: () => import('../views/CategoryView.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/order/CartView.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/CheckoutView.vue')
    },
    {
      path: '/payment/:orderId',
      name: 'payment',
      component: () => import('../views/payment/PaymentView.vue')
    },
    {
      path: '/payment/confirm/:orderId',
      name: 'payment-confirm',
      component: () => import('../views/payment/PaymentConfirmationView.vue')
    },
    {
      path: '/payment/result/:orderNumber?',
      name: 'payment-result',
      component: () => import('../views/payment/PaymentResultView.vue')
    },
    {
      path: '/payment/callback',
      name: 'payment-callback',
      component: () => import('../views/payment/PaymentCallbackView.vue')
    },
    {
      path: '/payment/:method/:transactionId',
      name: 'third-party-payment',
      component: () => import('../views/payment/ThirdPartyPaymentView.vue')
    },
    {
      path: '/payment/ecpay/callback',
      name: 'ecpay-callback',
      component: () => import('../views/payment/ECPayCallbackView.vue')
    },
    {
      path: '/design-system',
      name: 'design-system',
      component: () => import('../views/DesignSystemView.vue')
    },
    {
      path: '/order/:id',
      name: 'order-detail',
      component: () => import('../views/order/OrderDetailView.vue')
    },
    {
      path: '/tracking',
      name: 'tracking',
      component: () => import('../views/order/TrackingView.vue')
    },
    {
      path: '/tracking/:id',
      name: 'tracking-order',
      component: () => import('../views/order/TrackingView.vue')
    },
    {
      path: '/return',
      name: 'return',
      component: () => import('../views/order/ReturnView.vue')
    },
    {
      path: '/return/:orderId',
      name: 'return-apply',
      component: () => import('../views/order/ReturnView.vue')
    },
    {
      path: '/order/:id/refund',
      name: 'order-refund',
      component: () => import('../views/order/RefundView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/google-login-test',
      name: 'google-login-test',
      component: () => import('../views/GoogleLoginTestView.vue')
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue')
    },
    {
      path: '/member',
      name: 'member',
      component: () => import('../views/MemberView.vue'),
      children: [
        {
          path: 'profile',
          name: 'member-profile',
          component: () => import('../views/member/ProfileView.vue')
        },
        {
          path: 'orders',
          name: 'member-orders',
          component: () => import('../views/order/OrderListView.vue')
        },
        {
          path: 'addresses',
          name: 'member-addresses',
          component: () => import('../views/member/AddressesView.vue')
        },
        {
          path: 'coupons',
          name: 'member-coupons',
          component: () => import('../views/member/CouponsView.vue')
        }
      ]
    },
    // 公告相關路由
    {
      path: '/announcements',
      name: 'announcements',
      component: () => import('../views/AnnouncementsView.vue')
    },
    {
      path: '/announcement/:id',
      name: 'announcement-detail',
      component: () => import('../views/AnnouncementDetailView.vue')
    },
    // 優惠券相關路由
    {
      path: '/coupons',
      name: 'coupons',
      component: () => import('../views/CouponsView.vue')
    },
    // 廣告相關 (通常不需要單獨頁面，主要用於首頁輪播)
    {
      path: '/support',
      name: 'Support',
      component: () => import('../views/support/Support.vue')
    },
    {
      path: '/support/create',
      name: 'SupportCreate',
      component: () => import('../views/support/SupportCreate.vue')
    },
    {
      path: '/support/list',
      name: 'SupportList',
      component: () => import('../views/support/SupportList.vue')
    },
    {
      path: '/support/detail/:id',
      name: 'SupportDetail',
      component: () => import('../views/support/SupportDetail.vue')
    },
    {
      path: '/support/faq',
      name: 'SupportFAQ',
      component: () => import('../views/support/SupportFAQ.vue')
    },
    {
      path: '/support/edit/:id',
      name: 'support-edit',
      component: () => import('../views/support/SupportEdit.vue')
    },
    {
      path: '/support/message',
      name: 'support-message',
      component: () => import('../views/support/MessageCenter.vue')
    }
  ]
})

export default router