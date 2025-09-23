import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: {
        title: '登录',
        requiresAuth: false
      }
    },
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/',
      component: () => import('@/components/layout/MainLayout.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: {
            title: '工作台',
            roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER, UserRole.SALES]
          }
        },
        // 商品管理路由
        {
          path: 'product',
          meta: {
            title: '商品管理',
            roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
          },
          children: [
            {
              path: 'list',
              name: 'ProductList',
              component: () => import('@/views/product/ProductList.vue'),
              meta: {
                title: '商品列表',
                roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
              }
            },
            {
              path: 'create',
              name: 'ProductCreate',
              component: () => import('@/views/product/ProductCreate.vue'),
              meta: {
                title: '新增商品',
                roles: [UserRole.ADMIN, UserRole.OPERATOR]
              }
            },
            {
              path: 'category',
              name: 'ProductCategory',
              component: () => import('@/views/product/ProductCategory.vue'),
              meta: {
                title: '商品分类',
                roles: [UserRole.ADMIN, UserRole.OPERATOR]
              }
            },
            {
              path: 'component',
              name: 'ProductComponent',
              component: () => import('@/views/product/ProductComponent.vue'),
              meta: {
                title: '服装部件',
                roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
              }
            }
          ]
        },
        // 订单管理路由
        {
          path: 'order',
          meta: {
            title: '订单管理',
            roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SALES]
          },
          children: [
            {
              path: 'list',
              name: 'OrderList',
              component: () => import('@/views/order/OrderList.vue'),
              meta: {
                title: '订单列表',
                roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SALES]
              }
            },
            {
              path: 'audit',
              name: 'OrderAudit',
              component: () => import('@/views/order/OrderAudit.vue'),
              meta: {
                title: '订单审核',
                roles: [UserRole.ADMIN, UserRole.OPERATOR]
              }
            },
            {
              path: 'custom',
              name: 'OrderCustom',
              component: () => import('@/views/order/OrderCustom.vue'),
              meta: {
                title: '定制订单',
                roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SALES]
              }
            }
          ]
        },
        // 用户管理路由
        {
          path: 'user',
          meta: {
            title: '用户管理',
            roles: [UserRole.ADMIN, UserRole.OPERATOR]
          },
          children: [
            {
              path: 'channel',
              name: 'ChannelUser',
              component: () => import('@/views/user/ChannelUser.vue'),
              meta: {
                title: '渠道商管理',
                roles: [UserRole.ADMIN, UserRole.OPERATOR]
              }
            },
            {
              path: 'platform',
              name: 'PlatformUser',
              component: () => import('@/views/user/PlatformUser.vue'),
              meta: {
                title: '平台用户',
                roles: [UserRole.ADMIN, UserRole.OPERATOR]
              }
            },
            {
              path: 'role',
              name: 'RolePermission',
              component: () => import('@/views/user/RolePermission.vue'),
              meta: {
                title: '角色权限',
                roles: [UserRole.ADMIN, UserRole.OPERATOR]
              }
            }
          ]
        },
        // 资源库管理路由
        {
          path: 'resource',
          meta: {
            title: '资源库管理',
            roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
          },
          children: [
            {
              path: 'fabric',
              name: 'ResourceFabric',
              component: () => import('@/views/resource/ResourceFabric.vue'),
              meta: {
                title: '面料库',
                roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
              }
            },
            {
              path: 'case',
              name: 'ResourceCase',
              component: () => import('@/views/resource/ResourceCase.vue'),
              meta: {
                title: '案例库',
                roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
              }
            },
            {
              path: 'model',
              name: 'ModelLibrary',
              component: () => import('@/views/resource/ModelLibrary.vue'),
              meta: {
                title: '模特库',
                roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
              }
            },
            {
              path: 'trend',
              name: 'TrendLibrary',
              component: () => import('@/views/resource/TrendLibrary.vue'),
              meta: {
                title: '趋势库',
                roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
              }
            }
          ]
        },
        // AI设计管理路由
        {
          path: 'ai-design',
          meta: {
            title: 'AI设计管理',
            roles: [UserRole.ADMIN, UserRole.DESIGNER]
          },
          children: [
            {
              path: 'template',
              name: 'AiTemplate',
              component: () => import('@/views/ai/AIDesignTemplate.vue'),
              meta: {
                title: '设计模板',
                roles: [UserRole.ADMIN, UserRole.DESIGNER]
              }
            },
            {
              path: 'scheme',
              name: 'AiScheme',
              component: () => import('@/views/ai/AIDesignReview.vue'),
              meta: {
                title: '方案审核',
                roles: [UserRole.ADMIN, UserRole.DESIGNER]
              }
            },
            {
              path: 'model',
              name: 'AiModel',
              component: () => import('@/views/ai/AIModel3D.vue'),
              meta: {
                title: '3D模型库',
                roles: [UserRole.ADMIN, UserRole.DESIGNER]
              }
            }
          ]
        },
        // 系统管理路由
        {
          path: 'system',
          meta: {
            title: '系统管理',
            roles: [UserRole.ADMIN, UserRole.OPERATOR]
          },
          children: [
            {
              path: 'config',
              name: 'SystemConfig',
              component: () => import('@/views/system/SystemConfig.vue'),
              meta: {
                title: '系统配置',
                roles: [UserRole.ADMIN, UserRole.OPERATOR]
              }
            },
            {
              path: 'log',
              name: 'SystemLog',
              component: () => import('@/views/system/SystemLog.vue'),
              meta: {
                title: '操作日志',
                roles: [UserRole.ADMIN, UserRole.OPERATOR]
              }
            }
          ]
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 初始化用户信息
  if (!userStore.user && localStorage.getItem('token')) {
    userStore.initUser()
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth !== false && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 已登录用户访问登录页，重定向到首页
  if (to.path === '/login' && userStore.isLoggedIn) {
    next('/dashboard')
    return
  }
  
  // 检查角色权限
  if (to.meta.roles && userStore.user) {
    const hasPermission = (to.meta.roles as UserRole[]).includes(userStore.user.role)
    if (!hasPermission) {
      // 没有权限，重定向到首页
      next('/dashboard')
      return
    }
  }
  
  next()
})

export default router
