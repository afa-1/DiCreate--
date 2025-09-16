<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">方案审核</h1>
        <p class="text-gray-600 mt-1">审核AI生成的设计方案</p>
      </div>
      <a-space>
        <a-button @click="batchApprove" :disabled="selectedIds.length === 0">
          <template #icon><icon-check /></template>
          批量通过
        </a-button>
        <a-button status="danger" @click="batchReject" :disabled="selectedIds.length === 0">
          <template #icon><icon-close /></template>
          批量拒绝
        </a-button>
      </a-space>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <icon-clock-circle class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">待审核</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <icon-check-circle class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">已通过</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-100 text-red-600">
            <icon-close-circle class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">已拒绝</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <icon-file class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总方案数</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-input
            v-model="searchForm.title"
            placeholder="方案标题"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.status"
            placeholder="审核状态"
            allow-clear
          >
            <a-option value="pending">待审核</a-option>
            <a-option value="approved">已通过</a-option>
            <a-option value="rejected">已拒绝</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.category"
            placeholder="设计分类"
            allow-clear
          >
            <a-option value="dress">连衣裙</a-option>
            <a-option value="shirt">衬衫</a-option>
            <a-option value="pants">裤装</a-option>
            <a-option value="coat">外套</a-option>
          </a-select>
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

    <!-- 方案列表 -->
    <div class="bg-white rounded-lg shadow">
      <a-table
        :columns="columns"
        :data="designs"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ type: 'checkbox', selectedRowKeys: selectedIds, onSelect: handleSelect, onSelectAll: handleSelectAll }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #design="{ record }">
          <div class="flex items-center space-x-3">
            <img 
              :src="record.preview" 
              :alt="record.title"
              class="w-16 h-16 rounded object-cover cursor-pointer"
              @click="viewDesign(record)"
            />
            <div>
              <p class="font-medium text-gray-900">{{ record.title }}</p>
              <p class="text-sm text-gray-500">{{ getCategoryText(record.category) }}</p>
              <p class="text-xs text-gray-400">设计师: {{ record.designer }}</p>
            </div>
          </div>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #score="{ record }">
          <div class="text-center">
            <a-rate :model-value="record.aiScore / 2" readonly allow-half size="small" />
            <p class="text-xs text-gray-500 mt-1">AI评分: {{ record.aiScore }}/10</p>
          </div>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="viewDesign(record)">
              <template #icon><icon-eye /></template>
            </a-button>
            <a-button 
              v-if="record.status === 'pending'"
              size="small" 
              type="primary"
              @click="approveDesign(record.id)"
            >
              <template #icon><icon-check /></template>
            </a-button>
            <a-button 
              v-if="record.status === 'pending'"
              size="small" 
              status="danger"
              @click="rejectDesign(record.id)"
            >
              <template #icon><icon-close /></template>
            </a-button>
            <a-button size="small" @click="downloadDesign(record)">
              <template #icon><icon-download /></template>
            </a-button>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 设计详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      :title="currentDesign?.title"
      width="1000px"
      :footer="false"
    >
      <div v-if="currentDesign" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img 
              :src="currentDesign.preview" 
              :alt="currentDesign.title"
              class="w-full rounded-lg"
            />
          </div>
          <div class="space-y-4">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">基本信息</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">设计分类：</span>
                  <span>{{ getCategoryText(currentDesign.category) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">设计师：</span>
                  <span>{{ currentDesign.designer }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">AI评分：</span>
                  <div class="flex items-center space-x-2">
                    <a-rate :model-value="currentDesign.aiScore / 2" readonly allow-half size="small" />
                    <span>{{ currentDesign.aiScore }}/10</span>
                  </div>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">状态：</span>
                  <a-tag :color="getStatusColor(currentDesign.status)">
                    {{ getStatusText(currentDesign.status) }}
                  </a-tag>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">创建时间：</span>
                  <span>{{ currentDesign.createdAt }}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">设计描述</h4>
              <p class="text-sm text-gray-600">{{ currentDesign.description }}</p>
            </div>
            
            <div v-if="currentDesign.status === 'pending'">
              <h4 class="font-medium text-gray-900 mb-2">审核操作</h4>
              <a-space>
                <a-button type="primary" @click="approveDesign(currentDesign.id)">
                  <template #icon><icon-check /></template>
                  通过
                </a-button>
                <a-button status="danger" @click="showRejectModal = true">
                  <template #icon><icon-close /></template>
                  拒绝
                </a-button>
              </a-space>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-900 mb-3">设计参数</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="(value, key) in currentDesign.parameters" 
              :key="key"
              class="bg-gray-50 rounded-lg p-4"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium text-gray-900">{{ key }}</span>
                <span class="text-sm text-gray-600">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="currentDesign.feedback">
          <h4 class="font-medium text-gray-900 mb-2">审核反馈</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">{{ currentDesign.feedback }}</p>
            <p class="text-xs text-gray-400 mt-2">反馈时间: {{ currentDesign.reviewedAt }}</p>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 拒绝原因弹窗 -->
    <a-modal
      v-model:visible="showRejectModal"
      title="拒绝原因"
      width="500px"
      @ok="handleRejectWithReason"
      @cancel="rejectReason = ''"
    >
      <a-form layout="vertical">
        <a-form-item label="请输入拒绝原因">
          <a-textarea
            v-model="rejectReason"
            placeholder="请详细说明拒绝的原因..."
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  IconCheck, 
  IconClose, 
  IconSearch, 
  IconRefresh, 
  IconClockCircle, 
  IconCheckCircle, 
  IconCloseCircle, 
  IconFile,
  IconEye,
  IconDownload
} from '@arco-design/web-vue/es/icon'

interface Design {
  id: string
  title: string
  category: string
  designer: string
  status: string
  preview: string
  description: string
  aiScore: number
  parameters: Record<string, any>
  feedback?: string
  createdAt: string
  reviewedAt?: string
}

const loading = ref(false)
const showDetailModal = ref(false)
const showRejectModal = ref(false)
const currentDesign = ref<Design | null>(null)
const selectedIds = ref<string[]>([])
const rejectReason = ref('')

const searchForm = reactive({
  title: '',
  status: '',
  category: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showSizeChanger: true
})

// 统计数据
const stats = reactive({
  pending: 45,
  approved: 234,
  rejected: 28,
  total: 307
})

// 表格列配置
const columns = [
  {
    title: '设计方案',
    slotName: 'design',
    width: 300
  },
  {
    title: '状态',
    slotName: 'status',
    width: 100
  },
  {
    title: 'AI评分',
    slotName: 'score',
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 120
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 模拟设计数据
const designs = ref<Design[]>([
  {
    id: '1',
    title: '春季清新连衣裙',
    category: 'dress',
    designer: '张设计师',
    status: 'pending',
    preview: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    description: '以春季花卉为灵感的清新连衣裙设计，采用轻盈面料，适合日常穿搭',
    aiScore: 8.5,
    parameters: {
      '裙长': '膝盖长度',
      '袖型': '短袖',
      '颜色': '淡粉色',
      '图案': '小碎花',
      '面料': '雪纺'
    },
    createdAt: '2024-01-20'
  },
  {
    id: '2',
    title: '商务正装衬衫',
    category: 'shirt',
    designer: '李设计师',
    status: 'approved',
    preview: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop',
    description: '专业商务场合的正装衬衫，简约大方的设计风格',
    aiScore: 9.2,
    parameters: {
      '领型': '尖领',
      '袖长': '长袖',
      '版型': '修身',
      '颜色': '白色',
      '面料': '纯棉'
    },
    feedback: '设计方案符合商务需求，通过审核',
    createdAt: '2024-01-19',
    reviewedAt: '2024-01-20'
  },
  {
    id: '3',
    title: '休闲牛仔外套',
    category: 'coat',
    designer: '王设计师',
    status: 'rejected',
    preview: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop',
    description: '经典牛仔外套设计，适合休闲场合穿搭',
    aiScore: 6.8,
    parameters: {
      '长度': '中长款',
      '版型': '宽松',
      '颜色': '深蓝色',
      '口袋': '4个',
      '面料': '牛仔布'
    },
    feedback: '设计缺乏创新元素，建议重新设计',
    createdAt: '2024-01-18',
    reviewedAt: '2024-01-19'
  }
])

const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    dress: '连衣裙',
    shirt: '衬衫',
    pants: '裤装',
    coat: '外套',
    suit: '套装'
  }
  return categoryMap[category] || category
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || '未知'
}

const handleSearch = () => {
  pagination.current = 1
  loadDesigns()
}

const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    status: '',
    category: ''
  })
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadDesigns()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadDesigns()
}

const handleSelect = (rowKeys: string[], rowKey: string, record: Design) => {
  if (rowKeys.includes(rowKey)) {
    selectedIds.value.push(rowKey)
  } else {
    const index = selectedIds.value.indexOf(rowKey)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    }
  }
}

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedIds.value = designs.value.map(d => d.id)
  } else {
    selectedIds.value = []
  }
}

const loadDesigns = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = designs.value.length
  } catch (error) {
    Message.error('加载设计列表失败')
  } finally {
    loading.value = false
  }
}

const viewDesign = (design: Design) => {
  currentDesign.value = design
  showDetailModal.value = true
}

const approveDesign = async (designId: string) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('设计方案已通过审核')
    loadDesigns()
    showDetailModal.value = false
  } catch (error) {
    Message.error('审核失败，请重试')
  }
}

const rejectDesign = (designId: string) => {
  currentDesign.value = designs.value.find(d => d.id === designId) || null
  showRejectModal.value = true
}

const handleRejectWithReason = async () => {
  if (!rejectReason.value.trim()) {
    Message.error('请输入拒绝原因')
    return
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('设计方案已拒绝')
    showRejectModal.value = false
    showDetailModal.value = false
    rejectReason.value = ''
    loadDesigns()
  } catch (error) {
    Message.error('操作失败，请重试')
  }
}

const batchApprove = async () => {
  if (selectedIds.value.length === 0) return
  
  Modal.confirm({
    title: '批量通过',
    content: `确定要通过选中的 ${selectedIds.value.length} 个设计方案吗？`,
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success(`已通过 ${selectedIds.value.length} 个设计方案`)
        selectedIds.value = []
        loadDesigns()
      } catch (error) {
        Message.error('批量操作失败，请重试')
      }
    }
  })
}

const batchReject = async () => {
  if (selectedIds.value.length === 0) return
  
  Modal.confirm({
    title: '批量拒绝',
    content: `确定要拒绝选中的 ${selectedIds.value.length} 个设计方案吗？`,
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success(`已拒绝 ${selectedIds.value.length} 个设计方案`)
        selectedIds.value = []
        loadDesigns()
      } catch (error) {
        Message.error('批量操作失败，请重试')
      }
    }
  })
}

const downloadDesign = (design: Design) => {
  Message.info(`下载设计方案: ${design.title}`)
}

onMounted(() => {
  loadDesigns()
})
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>