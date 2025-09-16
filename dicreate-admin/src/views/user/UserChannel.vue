<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">渠道商管理</h1>
        <p class="text-gray-600 mt-1">管理渠道商账户和权限</p>
      </div>
      <a-button type="primary" @click="showAddModal = true">
        <template #icon><icon-plus /></template>
        新增渠道商
      </a-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <icon-user-group class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总渠道商</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <icon-check-circle class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">活跃渠道商</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
          </div>
        </div>
      </div>
      
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
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <icon-gift class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">本月新增</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.newThisMonth }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-input
            v-model="searchForm.name"
            placeholder="渠道商名称"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.status"
            placeholder="状态"
            allow-clear
          >
            <a-option value="active">活跃</a-option>
            <a-option value="inactive">停用</a-option>
            <a-option value="pending">待审核</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.level"
            placeholder="等级"
            allow-clear
          >
            <a-option value="gold">金牌</a-option>
            <a-option value="silver">银牌</a-option>
            <a-option value="bronze">铜牌</a-option>
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

    <!-- 渠道商列表 -->
    <div class="bg-white rounded-lg shadow">
      <a-table
        :columns="columns"
        :data="channels"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #avatar="{ record }">
          <a-avatar :size="40">
            <img v-if="record.avatar" :src="record.avatar" alt="avatar" />
            <span v-else>{{ record.name.charAt(0) }}</span>
          </a-avatar>
        </template>
        
        <template #level="{ record }">
          <a-tag :color="getLevelColor(record.level)">
            {{ getLevelText(record.level) }}
          </a-tag>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="viewChannel(record.id)">
              查看详情
            </a-button>
            <a-button size="small" @click="editChannel(record)">
              编辑
            </a-button>
            <a-button 
              size="small" 
              :status="record.status === 'active' ? 'warning' : 'success'"
              @click="toggleStatus(record)"
            >
              {{ record.status === 'active' ? '停用' : '启用' }}
            </a-button>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑渠道商弹窗 -->
    <a-modal
      v-model:visible="showAddModal"
      :title="editingChannel ? '编辑渠道商' : '新增渠道商'"
      width="600px"
      @ok="handleSaveChannel"
      @cancel="handleCancelEdit"
    >
      <a-form :model="channelForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" label="渠道商名称">
              <a-input v-model="channelForm.name" placeholder="请输入渠道商名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="contact" label="联系人">
              <a-input v-model="channelForm.contact" placeholder="请输入联系人" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="phone" label="联系电话">
              <a-input v-model="channelForm.phone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="email" label="邮箱">
              <a-input v-model="channelForm.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="level" label="渠道商等级">
              <a-select v-model="channelForm.level" placeholder="请选择等级">
                <a-option value="gold">金牌</a-option>
                <a-option value="silver">银牌</a-option>
                <a-option value="bronze">铜牌</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="commission" label="佣金比例(%)">
              <a-input-number
                v-model="channelForm.commission"
                :min="0"
                :max="100"
                :precision="2"
                placeholder="佣金比例"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="address" label="地址">
          <a-textarea
            v-model="channelForm.address"
            placeholder="请输入详细地址"
            :rows="3"
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
  IconPlus, 
  IconSearch, 
  IconRefresh, 
  IconUserGroup, 
  IconCheckCircle, 
  IconClockCircle, 
  IconGift 
} from '@arco-design/web-vue/es/icon'

interface Channel {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  level: string
  status: string
  commission: number
  address: string
  avatar?: string
  createdAt: string
}

const loading = ref(false)
const showAddModal = ref(false)
const editingChannel = ref<Channel | null>(null)

const searchForm = reactive({
  name: '',
  status: '',
  level: ''
})

const channelForm = reactive({
  name: '',
  contact: '',
  phone: '',
  email: '',
  level: '',
  commission: 0,
  address: ''
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
  total: 156,
  active: 142,
  pending: 8,
  newThisMonth: 12
})

const columns = [
  {
    title: '头像',
    dataIndex: 'avatar',
    slotName: 'avatar',
    width: 80
  },
  {
    title: '渠道商名称',
    dataIndex: 'name'
  },
  {
    title: '联系人',
    dataIndex: 'contact'
  },
  {
    title: '联系电话',
    dataIndex: 'phone'
  },
  {
    title: '等级',
    dataIndex: 'level',
    slotName: 'level'
  },
  {
    title: '佣金比例',
    dataIndex: 'commission',
    render: ({ record }: { record: Channel }) => `${record.commission}%`
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

// 模拟渠道商数据
const channels = ref<Channel[]>([
  {
    id: '1',
    name: '时尚前线服饰',
    contact: '张经理',
    phone: '13800138001',
    email: 'zhang@fashion.com',
    level: 'gold',
    status: 'active',
    commission: 15.5,
    address: '上海市黄浦区南京东路123号',
    createdAt: '2024-01-10 10:30:00'
  },
  {
    id: '2',
    name: '优雅女装店',
    contact: '李小姐',
    phone: '13800138002',
    email: 'li@elegant.com',
    level: 'silver',
    status: 'active',
    commission: 12.0,
    address: '北京市朝阳区三里屯456号',
    createdAt: '2024-01-08 14:20:00'
  },
  {
    id: '3',
    name: '潮流服装馆',
    contact: '王先生',
    phone: '13800138003',
    email: 'wang@trend.com',
    level: 'bronze',
    status: 'pending',
    commission: 8.5,
    address: '广州市天河区体育西路789号',
    createdAt: '2024-01-15 09:15:00'
  }
])

const getLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    gold: 'gold',
    silver: 'gray',
    bronze: 'orange'
  }
  return colorMap[level] || 'blue'
}

const getLevelText = (level: string) => {
  const textMap: Record<string, string> = {
    gold: '金牌',
    silver: '银牌',
    bronze: '铜牌'
  }
  return textMap[level] || '未知'
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'red',
    pending: 'orange'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '活跃',
    inactive: '停用',
    pending: '待审核'
  }
  return textMap[status] || '未知'
}

const handleSearch = () => {
  pagination.current = 1
  loadChannels()
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    status: '',
    level: ''
  })
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadChannels()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadChannels()
}

const loadChannels = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = channels.value.length
  } catch (error) {
    Message.error('加载渠道商列表失败')
  } finally {
    loading.value = false
  }
}

const viewChannel = (channelId: string) => {
  Message.info(`查看渠道商详情: ${channelId}`)
}

const editChannel = (channel: Channel) => {
  editingChannel.value = channel
  Object.assign(channelForm, {
    name: channel.name,
    contact: channel.contact,
    phone: channel.phone,
    email: channel.email,
    level: channel.level,
    commission: channel.commission,
    address: channel.address
  })
  showAddModal.value = true
}

const toggleStatus = (channel: Channel) => {
  const action = channel.status === 'active' ? '停用' : '启用'
  Modal.confirm({
    title: `确认${action}`,
    content: `确定要${action}渠道商"${channel.name}"吗？`,
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success(`${action}成功`)
        loadChannels()
      } catch (error) {
        Message.error(`${action}失败，请重试`)
      }
    }
  })
}

const handleSaveChannel = async () => {
  if (!channelForm.name.trim()) {
    Message.error('请输入渠道商名称')
    return
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success(editingChannel.value ? '渠道商更新成功' : '渠道商创建成功')
    showAddModal.value = false
    handleCancelEdit()
    loadChannels()
  } catch (error) {
    Message.error('操作失败，请重试')
  }
}

const handleCancelEdit = () => {
  editingChannel.value = null
  Object.assign(channelForm, {
    name: '',
    contact: '',
    phone: '',
    email: '',
    level: '',
    commission: 0,
    address: ''
  })
}

onMounted(() => {
  loadChannels()
})
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>