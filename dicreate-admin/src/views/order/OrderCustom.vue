<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">定制订单</h1>
      <p class="text-gray-600 mt-1">管理个性化定制订单</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <icon-file-text class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">待设计</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <icon-edit class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">设计中</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.designing }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <icon-check-circle class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">已完成</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.completed }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <icon-gift class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">本月收入</p>
            <p class="text-2xl font-bold text-gray-900">¥{{ stats.monthlyRevenue.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-input
            v-model="searchForm.orderNo"
            placeholder="订单号"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.status"
            placeholder="订单状态"
            allow-clear
          >
            <a-option value="pending">待设计</a-option>
            <a-option value="designing">设计中</a-option>
            <a-option value="reviewing">待审核</a-option>
            <a-option value="production">生产中</a-option>
            <a-option value="completed">已完成</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input
            v-model="searchForm.customerName"
            placeholder="客户名称"
            allow-clear
          >
            <template #prefix><icon-user /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 订单列表 -->
    <div class="bg-white rounded-lg shadow">
      <a-table
        :columns="columns"
        :data="orders"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #orderNo="{ record }">
          <a-link @click="viewOrderDetail(record.id)">{{ record.orderNo }}</a-link>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #customRequirements="{ record }">
          <a-tooltip :content="record.customRequirements">
            <span class="truncate max-w-xs block">
              {{ record.customRequirements }}
            </span>
          </a-tooltip>
        </template>
        
        <template #totalAmount="{ record }">
          ¥{{ record.totalAmount.toFixed(2) }}
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="viewOrderDetail(record.id)">
              查看详情
            </a-button>
            <a-button 
              v-if="record.status === 'pending'"
              size="small" 
              type="primary" 
              @click="startDesign(record.id)"
            >
              开始设计
            </a-button>
            <a-button 
              v-if="record.status === 'designing'"
              size="small" 
              status="success" 
              @click="submitDesign(record.id)"
            >
              提交设计
            </a-button>
          </a-space>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconSearch, 
  IconRefresh, 
  IconUser, 
  IconFileText, 
  IconEdit, 
  IconCheckCircle, 
  IconGift 
} from '@arco-design/web-vue/es/icon'

const loading = ref(false)

const searchForm = reactive({
  orderNo: '',
  status: '',
  customerName: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: true
})

// 统计数据
const stats = reactive({
  pending: 12,
  designing: 8,
  completed: 45,
  monthlyRevenue: 89600
})

const columns = [
  {
    title: '订单号',
    dataIndex: 'orderNo',
    slotName: 'orderNo'
  },
  {
    title: '客户名称',
    dataIndex: 'customerName'
  },
  {
    title: '定制需求',
    dataIndex: 'customRequirements',
    slotName: 'customRequirements',
    width: 200
  },
  {
    title: '订单金额',
    dataIndex: 'totalAmount',
    slotName: 'totalAmount'
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status'
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt'
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 180
  }
]

// 模拟定制订单数据
const orders = ref([
  {
    id: '1',
    orderNo: 'CUSTOM202401001',
    customerName: '张小姐',
    customRequirements: '需要一件红色连衣裙，腰部收腰设计，长度到膝盖',
    totalAmount: 899.00,
    status: 'pending',
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: '2',
    orderNo: 'CUSTOM202401002',
    customerName: '李先生',
    customRequirements: '定制西装，深蓝色，修身版型，需要刺绣名字',
    totalAmount: 1299.00,
    status: 'designing',
    createdAt: '2024-01-14 14:20:00'
  },
  {
    id: '3',
    orderNo: 'CUSTOM202401003',
    customerName: '王女士',
    customRequirements: '婚纱定制，白色蕾丝，拖尾设计，胸前珠片装饰',
    totalAmount: 2999.00,
    status: 'reviewing',
    createdAt: '2024-01-13 09:15:00'
  },
  {
    id: '4',
    orderNo: 'CUSTOM202401004',
    customerName: '陈先生',
    customRequirements: '运动服套装，透气面料，加入反光条设计',
    totalAmount: 599.00,
    status: 'production',
    createdAt: '2024-01-12 16:45:00'
  }
])

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    designing: 'blue',
    reviewing: 'purple',
    production: 'cyan',
    completed: 'green'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待设计',
    designing: '设计中',
    reviewing: '待审核',
    production: '生产中',
    completed: '已完成'
  }
  return textMap[status] || '未知状态'
}

const handleSearch = () => {
  pagination.current = 1
  loadOrders()
}

const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    status: '',
    customerName: ''
  })
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadOrders()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadOrders()
}

const loadOrders = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = orders.value.length
  } catch (error) {
    Message.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

const viewOrderDetail = (orderId: string) => {
  Message.info(`查看订单详情: ${orderId}`)
}

const startDesign = async (orderId: string) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('已开始设计，订单状态已更新')
    loadOrders()
  } catch (error) {
    Message.error('操作失败，请重试')
  }
}

const submitDesign = async (orderId: string) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('设计方案已提交，等待客户审核')
    loadOrders()
  } catch (error) {
    Message.error('提交失败，请重试')
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>