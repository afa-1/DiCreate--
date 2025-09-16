<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">订单审核</h1>
      <p class="text-gray-600 mt-1">审核待处理的订单</p>
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
            v-model="searchForm.type"
            placeholder="订单类型"
            allow-clear
          >
            <a-option value="standard">标准订单</a-option>
            <a-option value="custom">定制订单</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-range-picker
            v-model="searchForm.dateRange"
            placeholder="创建时间"
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
        
        <template #type="{ record }">
          <a-tag :color="record.type === 'custom' ? 'orange' : 'blue'">
            {{ record.type === 'custom' ? '定制订单' : '标准订单' }}
          </a-tag>
        </template>
        
        <template #status="{ record }">
          <a-tag color="orange">待审核</a-tag>
        </template>
        
        <template #totalAmount="{ record }">
          ¥{{ record.totalAmount.toFixed(2) }}
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="viewOrderDetail(record.id)">
              查看详情
            </a-button>
            <a-button size="small" type="primary" @click="approveOrder(record.id)">
              通过
            </a-button>
            <a-button size="small" status="danger" @click="rejectOrder(record.id)">
              拒绝
            </a-button>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:visible="showAuditModal"
      :title="auditType === 'approve' ? '审核通过' : '审核拒绝'"
      @ok="handleAudit"
      @cancel="cancelAudit"
    >
      <a-form :model="auditForm" layout="vertical">
        <a-form-item field="reason" label="审核意见">
          <a-textarea
            v-model="auditForm.reason"
            :placeholder="auditType === 'approve' ? '请输入通过原因（可选）' : '请输入拒绝原因'"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon'

const loading = ref(false)
const showAuditModal = ref(false)
const auditType = ref<'approve' | 'reject'>('approve')
const currentOrderId = ref('')

const searchForm = reactive({
  orderNo: '',
  type: '',
  dateRange: []
})

const auditForm = reactive({
  reason: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: true
})

const columns = [
  {
    title: '订单号',
    dataIndex: 'orderNo',
    slotName: 'orderNo'
  },
  {
    title: '订单类型',
    dataIndex: 'type',
    slotName: 'type'
  },
  {
    title: '客户名称',
    dataIndex: 'customerName'
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
    width: 200
  }
]

// 模拟订单数据
const orders = ref([
  {
    id: '1',
    orderNo: 'ORD202401001',
    type: 'standard',
    customerName: '张三',
    totalAmount: 299.00,
    status: 'pending',
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: '2',
    orderNo: 'ORD202401002',
    type: 'custom',
    customerName: '李四',
    totalAmount: 599.00,
    status: 'pending',
    createdAt: '2024-01-15 11:20:00'
  },
  {
    id: '3',
    orderNo: 'ORD202401003',
    type: 'standard',
    customerName: '王五',
    totalAmount: 199.00,
    status: 'pending',
    createdAt: '2024-01-15 14:15:00'
  }
])

const handleSearch = () => {
  pagination.current = 1
  loadOrders()
}

const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    type: '',
    dateRange: []
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

const approveOrder = (orderId: string) => {
  currentOrderId.value = orderId
  auditType.value = 'approve'
  auditForm.reason = ''
  showAuditModal.value = true
}

const rejectOrder = (orderId: string) => {
  currentOrderId.value = orderId
  auditType.value = 'reject'
  auditForm.reason = ''
  showAuditModal.value = true
}

const handleAudit = async () => {
  if (auditType.value === 'reject' && !auditForm.reason.trim()) {
    Message.error('请输入拒绝原因')
    return
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success(`订单${auditType.value === 'approve' ? '审核通过' : '审核拒绝'}成功`)
    showAuditModal.value = false
    loadOrders()
  } catch (error) {
    Message.error('操作失败，请重试')
  }
}

const cancelAudit = () => {
  auditForm.reason = ''
  currentOrderId.value = ''
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>