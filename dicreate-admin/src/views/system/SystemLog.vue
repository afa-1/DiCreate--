<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">系统日志</h1>
      <p class="text-gray-600 mt-1">查看和管理系统操作日志</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <icon-file class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">今日日志</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.today }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-100 text-red-600">
            <icon-exclamation-circle class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">错误日志</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.errors }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <icon-exclamation class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">警告日志</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.warnings }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <icon-check-circle class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">信息日志</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.info }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-select
            v-model="searchForm.level"
            placeholder="日志级别"
            allow-clear
          >
            <a-option value="info">信息</a-option>
            <a-option value="warning">警告</a-option>
            <a-option value="error">错误</a-option>
            <a-option value="debug">调试</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.module"
            placeholder="模块"
            allow-clear
          >
            <a-option value="auth">用户认证</a-option>
            <a-option value="product">商品管理</a-option>
            <a-option value="order">订单管理</a-option>
            <a-option value="user">用户管理</a-option>
            <a-option value="system">系统管理</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-range-picker
            v-model="searchForm.dateRange"
            style="width: 100%"
            placeholder="选择日期范围"
          />
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
            <a-button @click="handleExport">
              <template #icon><icon-download /></template>
              导出
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="12">
          <a-input
            v-model="searchForm.keyword"
            placeholder="搜索日志内容"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-input
            v-model="searchForm.userId"
            placeholder="用户ID"
            allow-clear
          />
        </a-col>
        <a-col :span="6">
          <a-input
            v-model="searchForm.ip"
            placeholder="IP地址"
            allow-clear
          />
        </a-col>
      </a-row>
    </div>

    <!-- 日志列表 -->
    <div class="bg-white rounded-lg shadow">
      <a-table
        :columns="columns"
        :data="logs"
        :loading="loading"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showTotal: true,
          showSizeChanger: true
        }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #level="{ record }">
          <a-tag :color="getLevelColor(record.level)" size="small">
            {{ getLevelText(record.level) }}
          </a-tag>
        </template>
        
        <template #module="{ record }">
          <a-tag color="blue" size="small">
            {{ getModuleText(record.module) }}
          </a-tag>
        </template>
        
        <template #message="{ record }">
          <div class="max-w-md">
            <p class="truncate" :title="record.message">{{ record.message }}</p>
          </div>
        </template>
        
        <template #user="{ record }">
          <div v-if="record.userId">
            <p class="font-medium">{{ record.userName }}</p>
            <p class="text-xs text-gray-500">ID: {{ record.userId }}</p>
          </div>
          <span v-else class="text-gray-400">系统</span>
        </template>
        
        <template #ip="{ record }">
          <div>
            <p>{{ record.ip }}</p>
            <p v-if="record.location" class="text-xs text-gray-500">{{ record.location }}</p>
          </div>
        </template>
        
        <template #createdAt="{ record }">
          <div>
            <p>{{ formatDate(record.createdAt) }}</p>
            <p class="text-xs text-gray-500">{{ formatTime(record.createdAt) }}</p>
          </div>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="viewLogDetail(record)">
              <template #icon><icon-eye /></template>
            </a-button>
            <a-button 
              v-if="record.level === 'error'"
              size="small" 
              status="danger" 
              @click="deleteLog(record.id)"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 日志详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      :title="`日志详情 - ${currentLog?.level?.toUpperCase()}`"
      width="800px"
      :footer="false"
    >
      <div v-if="currentLog" class="space-y-4">
        <!-- 基本信息 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <h4 class="font-medium text-gray-900">基本信息</h4>
            <div class="text-sm space-y-1">
              <div class="flex justify-between">
                <span class="text-gray-600">日志级别：</span>
                <a-tag :color="getLevelColor(currentLog.level)" size="small">
                  {{ getLevelText(currentLog.level) }}
                </a-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">模块：</span>
                <a-tag color="blue" size="small">
                  {{ getModuleText(currentLog.module) }}
                </a-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">时间：</span>
                <span>{{ formatDateTime(currentLog.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">请求ID：</span>
                <span class="font-mono text-xs">{{ currentLog.requestId }}</span>
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <h4 class="font-medium text-gray-900">用户信息</h4>
            <div class="text-sm space-y-1">
              <div class="flex justify-between">
                <span class="text-gray-600">用户：</span>
                <span>{{ currentLog.userName || '系统' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">用户ID：</span>
                <span>{{ currentLog.userId || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">IP地址：</span>
                <span>{{ currentLog.ip }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">地理位置：</span>
                <span>{{ currentLog.location || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 日志消息 -->
        <div>
          <h4 class="font-medium text-gray-900 mb-2">日志消息</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm">{{ currentLog.message }}</p>
          </div>
        </div>
        
        <!-- 详细信息 -->
        <div v-if="currentLog.details">
          <h4 class="font-medium text-gray-900 mb-2">详细信息</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(currentLog.details, null, 2) }}</pre>
          </div>
        </div>
        
        <!-- 堆栈信息 -->
        <div v-if="currentLog.stack">
          <h4 class="font-medium text-gray-900 mb-2">堆栈信息</h4>
          <div class="bg-red-50 rounded-lg p-4">
            <pre class="text-xs text-red-700 whitespace-pre-wrap">{{ currentLog.stack }}</pre>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconFile,
  IconExclamationCircle,
  IconExclamation,
  IconCheckCircle,
  IconSearch,
  IconRefresh,
  IconDownload,
  IconEye,
  IconDelete
} from '@arco-design/web-vue/es/icon'

interface SystemLog {
  id: string
  level: string
  module: string
  message: string
  userId?: string
  userName?: string
  ip: string
  location?: string
  requestId: string
  details?: any
  stack?: string
  createdAt: string
}

const loading = ref(false)
const showDetailModal = ref(false)
const currentLog = ref<SystemLog | null>(null)

const searchForm = reactive({
  level: '',
  module: '',
  keyword: '',
  userId: '',
  ip: '',
  dateRange: []
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  today: 1247,
  errors: 23,
  warnings: 156,
  info: 1068
})

// 表格列配置
const columns = [
  {
    title: '级别',
    dataIndex: 'level',
    slotName: 'level',
    width: 80
  },
  {
    title: '模块',
    dataIndex: 'module',
    slotName: 'module',
    width: 100
  },
  {
    title: '日志消息',
    dataIndex: 'message',
    slotName: 'message',
    ellipsis: true
  },
  {
    title: '用户',
    dataIndex: 'user',
    slotName: 'user',
    width: 120
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    slotName: 'ip',
    width: 140
  },
  {
    title: '时间',
    dataIndex: 'createdAt',
    slotName: 'createdAt',
    width: 160
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 100,
    align: 'center'
  }
]

// 模拟日志数据
const logs = ref<SystemLog[]>([
  {
    id: '1',
    level: 'info',
    module: 'auth',
    message: '用户登录成功',
    userId: 'user_001',
    userName: '张三',
    ip: '192.168.1.100',
    location: '北京市',
    requestId: 'req_1234567890',
    createdAt: '2024-01-15 14:30:25'
  },
  {
    id: '2',
    level: 'error',
    module: 'product',
    message: '商品信息更新失败：数据库连接超时',
    userId: 'user_002',
    userName: '李四',
    ip: '192.168.1.101',
    location: '上海市',
    requestId: 'req_1234567891',
    details: {
      productId: 'prod_001',
      error: 'Connection timeout',
      duration: '30s'
    },
    stack: 'Error: Connection timeout\n    at Database.connect (db.js:45)\n    at ProductService.update (product.js:123)',
    createdAt: '2024-01-15 14:25:18'
  },
  {
    id: '3',
    level: 'warning',
    module: 'order',
    message: '订单库存不足警告',
    userId: 'user_003',
    userName: '王五',
    ip: '192.168.1.102',
    location: '广州市',
    requestId: 'req_1234567892',
    details: {
      orderId: 'order_001',
      productId: 'prod_002',
      requestedQty: 10,
      availableQty: 5
    },
    createdAt: '2024-01-15 14:20:45'
  },
  {
    id: '4',
    level: 'info',
    module: 'system',
    message: '系统配置更新成功',
    ip: '127.0.0.1',
    requestId: 'req_1234567893',
    createdAt: '2024-01-15 14:15:30'
  }
])

const getLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    info: 'blue',
    warning: 'orange',
    error: 'red',
    debug: 'gray'
  }
  return colorMap[level] || 'gray'
}

const getLevelText = (level: string) => {
  const textMap: Record<string, string> = {
    info: '信息',
    warning: '警告',
    error: '错误',
    debug: '调试'
  }
  return textMap[level] || level
}

const getModuleText = (module: string) => {
  const textMap: Record<string, string> = {
    auth: '用户认证',
    product: '商品管理',
    order: '订单管理',
    user: '用户管理',
    system: '系统管理'
  }
  return textMap[module] || module
}

const formatDate = (dateTime: string) => {
  return dateTime.split(' ')[0]
}

const formatTime = (dateTime: string) => {
  return dateTime.split(' ')[1]
}

const formatDateTime = (dateTime: string) => {
  return dateTime
}

const handleSearch = () => {
  pagination.current = 1
  loadLogs()
}

const handleReset = () => {
  Object.assign(searchForm, {
    level: '',
    module: '',
    keyword: '',
    userId: '',
    ip: '',
    dateRange: []
  })
  handleSearch()
}

const handleExport = () => {
  Message.info('正在导出日志文件...')
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadLogs()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadLogs()
}

const loadLogs = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = logs.value.length
  } catch (error) {
    Message.error('加载日志列表失败')
  } finally {
    loading.value = false
  }
}

const viewLogDetail = (log: SystemLog) => {
  currentLog.value = log
  showDetailModal.value = true
}

const deleteLog = (logId: string) => {
  const log = logs.value.find(l => l.id === logId)
  if (!log) return
  
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条日志记录吗？',
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success('日志删除成功')
        loadLogs()
      } catch (error) {
        Message.error('删除失败，请重试')
      }
    }
  })
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>