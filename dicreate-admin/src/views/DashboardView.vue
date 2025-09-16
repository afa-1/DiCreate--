<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            欢迎回来，{{ userStore.user?.username }}！
          </h1>
          <p class="text-gray-600">
            今天是 {{ currentDate }}，{{ getRoleText(userStore.user?.role) }}
          </p>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500">当前时间</div>
          <div class="text-lg font-semibold text-gray-900">{{ currentTime }}</div>
        </div>
      </div>
    </div>
    
    <!-- 数据统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div
        v-for="stat in statistics"
        :key="stat.key"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">{{ stat.title }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-xs text-gray-500 mt-1">
              <span :class="stat.trend === 'up' ? 'text-green-500' : 'text-red-500'">
                {{ stat.trend === 'up' ? '↗' : '↘' }} {{ stat.change }}
              </span>
              vs 昨日
            </p>
          </div>
          <div :class="`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor}`">
            <component :is="stat.icon" :class="stat.iconColor" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 最近订单 -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">最近订单</h2>
            <a-link @click="$router.push('/order/list')">查看全部</a-link>
          </div>
        </div>
        <div class="p-6">
          <div v-if="recentOrders.length === 0" class="text-center py-8 text-gray-500">
            暂无订单数据
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-medium text-gray-900">{{ order.orderNo }}</span>
                  <a-tag :color="getOrderStatusColor(order.status)">{{ getOrderStatusText(order.status) }}</a-tag>
                </div>
                <div class="text-sm text-gray-600 mt-1">
                  客户：{{ order.customerName }} | 金额：¥{{ order.totalAmount }}
                </div>
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(order.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 待处理事项 -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">待处理事项</h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="task in pendingTasks"
              :key="task.id"
              class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ task.title }}</div>
                <div class="text-sm text-gray-600 mt-1">{{ task.description }}</div>
              </div>
              <div class="flex items-center space-x-2">
                <a-tag color="orange">{{ task.priority }}</a-tag>
                <a-button size="small" type="primary" @click="handleTask(task)">
                  处理
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快捷操作 -->
    <div class="bg-white rounded-lg shadow-sm mt-6">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">快捷操作</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="action in quickActions"
            :key="action.key"
            class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            @click="handleQuickAction(action)"
          >
            <component :is="action.icon" class="w-8 h-8 text-blue-500 mb-2" />
            <span class="text-sm text-gray-700 text-center">{{ action.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IconFile,
  IconUser,
  IconApps,
  IconPlus,
  IconSearch,
  IconSettings,
  IconDownload
} from '@arco-design/web-vue/es/icon'
import { useUserStore } from '@/stores/user'
import { UserRole, OrderStatus } from '@/types'

const router = useRouter()
const userStore = useUserStore()

// 当前时间
const currentTime = ref('')
const currentDate = ref('')

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN')
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 定时器
let timer: number

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// 统计数据
const statistics = computed(() => {
  const baseStats = [
    {
      key: 'orders',
      title: '今日订单',
      value: '128',
      change: '+12%',
      trend: 'up',
      icon: IconApps,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-500'
    },
    {
      key: 'products',
      title: '商品总数',
      value: '1,234',
      change: '+5%',
      trend: 'up',
      icon: IconApps,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-500'
    }
  ]
  
  // 根据用户角色显示不同统计
  if (userStore.user?.role === UserRole.OPERATOR) {
    baseStats.push(
      {
        key: 'users',
        title: '用户总数',
        value: '5,678',
        change: '+8%',
        trend: 'up',
        icon: IconUser,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-500'
      },
      {
        key: 'revenue',
        title: '今日营收',
        value: '¥89,234',
        change: '+15%',
        trend: 'up',
        icon: IconFile,
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-500'
      }
    )
  }
  
  return baseStats
})

// 最近订单（模拟数据）
const recentOrders = ref([
  {
    id: '1',
    orderNo: 'DC202401001',
    status: OrderStatus.PENDING,
    customerName: '张三',
    totalAmount: 1299,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    orderNo: 'DC202401002',
    status: OrderStatus.CONFIRMED,
    customerName: '李四',
    totalAmount: 2599,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
])

// 待处理事项
const pendingTasks = computed(() => {
  const tasks = []
  
  if (userStore.user?.role === UserRole.OPERATOR) {
    tasks.push(
      {
        id: '1',
        title: '订单审核',
        description: '有3个订单待审核',
        priority: '高',
        action: () => router.push('/order/audit')
      },
      {
        id: '2',
        title: '商品上架',
        description: '有5个商品待上架',
        priority: '中',
        action: () => router.push('/product/list')
      }
    )
  }
  
  return tasks
})

// 快捷操作
const quickActions = computed(() => {
  const actions = []
  
  if (userStore.user?.role === UserRole.OPERATOR) {
    actions.push(
      { key: 'add-product', title: '新增商品', icon: IconPlus, path: '/product/create' },
      { key: 'order-audit', title: '订单审核', icon: IconFile, path: '/order/audit' },
      { key: 'user-manage', title: '用户管理', icon: IconUser, path: '/user/channel' },
      { key: 'system-config', title: '系统配置', icon: IconSettings, path: '/system/config' }
    )
  } else if (userStore.user?.role === UserRole.DESIGNER) {
    actions.push(
      { key: 'ai-template', title: 'AI模板', icon: IconApps, path: '/ai-design/template' },
      { key: 'design-scheme', title: '设计方案', icon: IconFile, path: '/ai-design/scheme' },
      { key: 'fabric-lib', title: '面料库', icon: IconSearch, path: '/resource/fabric' }
    )
  } else if (userStore.user?.role === UserRole.SALES) {
    actions.push(
      { key: 'order-list', title: '订单管理', icon: IconApps, path: '/order/list' },
      { key: 'custom-order', title: '定制订单', icon: IconFile, path: '/order/custom' },
      { key: 'export-data', title: '数据导出', icon: IconDownload, path: '/order/export' }
    )
  }
  
  return actions
})

// 获取角色文本
const getRoleText = (role?: UserRole) => {
  const roleMap = {
    [UserRole.ADMIN]: '超级管理员',
    [UserRole.OPERATOR]: '运营人员',
    [UserRole.DESIGNER]: '服装设计师',
    [UserRole.SALES]: '销售'
  }
  return role ? roleMap[role] : ''
}

// 获取订单状态颜色
const getOrderStatusColor = (status: OrderStatus) => {
  const colorMap = {
    [OrderStatus.PENDING]: 'orange',
    [OrderStatus.CONFIRMED]: 'blue',
    [OrderStatus.PRODUCTION]: 'purple',
    [OrderStatus.SHIPPED]: 'green',
    [OrderStatus.DELIVERED]: 'green',
    [OrderStatus.CANCELLED]: 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取订单状态文本
const getOrderStatusText = (status: OrderStatus) => {
  const textMap = {
    [OrderStatus.PENDING]: '待处理',
    [OrderStatus.CONFIRMED]: '已确认',
    [OrderStatus.PRODUCTION]: '生产中',
    [OrderStatus.SHIPPED]: '已发货',
    [OrderStatus.DELIVERED]: '已送达',
    [OrderStatus.CANCELLED]: '已取消'
  }
  return textMap[status] || '未知'
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 处理任务
const handleTask = (task: any) => {
  if (task.action) {
    task.action()
  }
}

// 处理快捷操作
const handleQuickAction = (action: any) => {
  if (action.path) {
    router.push(action.path)
  }
}
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>