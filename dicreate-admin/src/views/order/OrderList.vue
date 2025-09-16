<template>
  <div class="order-list">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">订单管理</h1>
        <a-space>
          <a-button @click="handleExport">
            <icon-download class="mr-2" />
            导出订单
          </a-button>
          <a-button type="primary" @click="handleRefresh">
            <icon-refresh class="mr-2" />
            刷新
          </a-button>
        </a-space>
      </div>
      
      <!-- 搜索和筛选 -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <a-input placeholder="搜索订单号/用户" allow-clear>
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
          <a-select placeholder="订单状态" allow-clear>
            <a-option value="pending">待处理</a-option>
            <a-option value="confirmed">已确认</a-option>
            <a-option value="producing">生产中</a-option>
            <a-option value="shipped">已发货</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="cancelled">已取消</a-option>
          </a-select>
          <a-select placeholder="订单类型" allow-clear>
            <a-option value="standard">标品订单</a-option>
            <a-option value="custom">定制订单</a-option>
          </a-select>
          <a-range-picker placeholder="选择日期范围" />
          <a-button type="primary">搜索</a-button>
        </div>
      </div>
      
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-blue-600 text-sm font-medium">待处理订单</div>
          <div class="text-2xl font-bold text-blue-700 mt-1">{{ stats.pending }}</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-green-600 text-sm font-medium">今日完成</div>
          <div class="text-2xl font-bold text-green-700 mt-1">{{ stats.completed }}</div>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg">
          <div class="text-orange-600 text-sm font-medium">生产中</div>
          <div class="text-2xl font-bold text-orange-700 mt-1">{{ stats.producing }}</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-purple-600 text-sm font-medium">总销售额</div>
          <div class="text-2xl font-bold text-purple-700 mt-1">¥{{ stats.totalAmount }}</div>
        </div>
      </div>
      
      <!-- 订单表格 -->
      <a-table
        :columns="columns"
        :data="mockData"
        :pagination="pagination"
        row-key="id"
      >
        <template #orderType="{ record }">
          <a-tag :color="record.type === 'custom' ? 'purple' : 'blue'">
            {{ record.type === 'custom' ? '定制订单' : '标品订单' }}
          </a-tag>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #amount="{ record }">
          <span class="font-medium text-gray-900">¥{{ record.amount }}</span>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="handleView(record)">查看</a-button>
            <a-button size="small" @click="handleEdit(record)" v-if="canEdit(record.status)">处理</a-button>
            <a-dropdown>
              <a-button size="small">
                更多
                <icon-down class="ml-1" />
              </a-button>
              <template #content>
                <a-doption @click="handlePrint(record)">打印订单</a-doption>
                <a-doption @click="handleTrack(record)" v-if="record.status === 'shipped'">
                  物流跟踪
                </a-doption>
                <a-doption class="text-red-500" @click="handleCancel(record)" v-if="canCancel(record.status)">
                  取消订单
                </a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconDownload, IconRefresh, IconSearch, IconDown } from '@arco-design/web-vue/es/icon'

// 统计数据
const stats = ref({
  pending: 23,
  completed: 156,
  producing: 45,
  totalAmount: '128,500'
})

// 表格列定义
const columns = [
  {
    title: '订单号',
    dataIndex: 'orderNo',
    width: 150
  },
  {
    title: '客户信息',
    dataIndex: 'customer',
    width: 150
  },
  {
    title: '订单类型',
    dataIndex: 'type',
    slotName: 'orderType',
    width: 100
  },
  {
    title: '商品数量',
    dataIndex: 'quantity',
    width: 100
  },
  {
    title: '订单金额',
    dataIndex: 'amount',
    slotName: 'amount',
    width: 120
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '下单时间',
    dataIndex: 'createdAt',
    width: 150,
    render: ({ record }: any) => new Date(record.createdAt).toLocaleDateString()
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 模拟数据
const mockData = ref([
  {
    id: 'O001',
    orderNo: 'DC2024010001',
    customer: '张三',
    type: 'standard',
    quantity: 2,
    amount: 598,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'O002',
    orderNo: 'DC2024010002',
    customer: '李四',
    type: 'custom',
    quantity: 1,
    amount: 1299,
    status: 'producing',
    createdAt: new Date().toISOString()
  },
  {
    id: 'O003',
    orderNo: 'DC2024010003',
    customer: '王五',
    type: 'standard',
    quantity: 3,
    amount: 897,
    status: 'shipped',
    createdAt: new Date().toISOString()
  }
])

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 100,
  showTotal: true,
  showPageSize: true
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    confirmed: 'blue',
    producing: 'purple',
    shipped: 'cyan',
    completed: 'green',
    cancelled: 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    confirmed: '已确认',
    producing: '生产中',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

// 判断是否可以编辑
const canEdit = (status: string) => {
  return ['pending', 'confirmed'].includes(status)
}

// 判断是否可以取消
const canCancel = (status: string) => {
  return ['pending', 'confirmed'].includes(status)
}

// 查看订单
const handleView = (record: any) => {
  Message.info(`查看订单: ${record.orderNo}`)
}

// 编辑订单
const handleEdit = (record: any) => {
  Message.info(`处理订单: ${record.orderNo}`)
}

// 打印订单
const handlePrint = (record: any) => {
  Message.info(`打印订单: ${record.orderNo}`)
}

// 物流跟踪
const handleTrack = (record: any) => {
  Message.info(`跟踪订单: ${record.orderNo}`)
}

// 取消订单
const handleCancel = (record: any) => {
  Message.warning(`取消订单: ${record.orderNo}`)
}

// 导出订单
const handleExport = () => {
  Message.info('导出订单数据')
}

// 刷新数据
const handleRefresh = () => {
  Message.success('数据已刷新')
}
</script>

<style scoped>
.order-list {
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