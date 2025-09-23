<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">渠道商管理</h1>
        <p class="text-gray-600 mt-1">管理渠道商信息和用户账号分发</p>
      </div>
      <div class="flex gap-3">
        <a-button @click="showBatchModal = true">
          <template #icon><icon-upload /></template>
          批量导入
        </a-button>
        <a-button type="primary" @click="showAddChannelModal = true">
          <template #icon><icon-plus /></template>
          新增渠道商
        </a-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model="searchForm.keyword"
            placeholder="搜索渠道商名称/代码"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.status"
            placeholder="状态"
            allow-clear
          >
            <a-option value="active">激活</a-option>
            <a-option value="inactive">停用</a-option>
            <a-option value="pending">待审核</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-range-picker
            v-model="searchForm.dateRange"
            placeholder="创建时间"
          />
        </a-col>
        <a-col :span="8">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 渠道商列表 -->
    <div class="bg-white rounded-lg shadow">
      <a-table
        :columns="columns"
        :data="channelList"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #status="{ record }">
          <a-tag
            :color="getStatusColor(record.status)"
          >
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #userCount="{ record }">
          <a-button
            type="text"
            @click="showUserList(record)"
          >
            {{ record.userCount }}人
          </a-button>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button
              type="text"
              size="small"
              @click="viewChannel(record)"
            >
              查看
            </a-button>
            <a-button
              type="text"
              size="small"
              @click="editChannel(record)"
            >
              编辑
            </a-button>
            <a-button
              type="text"
              size="small"
              @click="manageUsers(record)"
            >
              用户管理
            </a-button>
            <a-dropdown>
              <a-button type="text" size="small">
                更多
                <template #icon><icon-down /></template>
              </a-button>
              <template #content>
                <a-doption @click="resetPassword(record)">
                  重置密码
                </a-doption>
                <a-doption @click="toggleStatus(record)">
                  {{ record.status === 'active' ? '停用' : '启用' }}
                </a-doption>
                <a-doption
                  @click="deleteChannel(record)"
                  class="text-red-500"
                >
                  删除
                </a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑渠道商弹窗 -->
    <a-modal
      v-model:visible="showAddChannelModal"
      :title="editingChannel ? '编辑渠道商' : '新增渠道商'"
      width="600px"
      @ok="handleSaveChannel"
      @cancel="handleCancelEdit"
    >
      <a-form :model="channelForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" label="渠道商名称" required>
              <a-input v-model="channelForm.name" placeholder="请输入渠道商名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="code" label="渠道商代码" required>
              <a-input 
                v-model="channelForm.code" 
                placeholder="请输入渠道商代码"
                :disabled="!!editingChannel"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="contactPerson" label="联系人" required>
              <a-input v-model="channelForm.contactPerson" placeholder="请输入联系人" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="contactPhone" label="联系电话" required>
              <a-input v-model="channelForm.contactPhone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="contactEmail" label="联系邮箱" required>
          <a-input v-model="channelForm.contactEmail" placeholder="请输入联系邮箱" />
        </a-form-item>
        
        <a-form-item field="address" label="地址">
          <a-textarea
            v-model="channelForm.address"
            placeholder="请输入地址"
            :rows="2"
          />
        </a-form-item>
        
        <a-form-item field="businessLicense" label="营业执照">
          <a-input v-model="channelForm.businessLicense" placeholder="请输入营业执照号" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 用户管理弹窗 -->
    <a-modal
      v-model:visible="showUserModal"
      :title="`${currentChannel?.name} - 用户管理`"
      width="1000px"
      :footer="false"
    >
      <div class="mb-4 flex justify-between items-center">
        <a-input
          v-model="userSearchKeyword"
          placeholder="搜索用户名/邮箱"
          style="width: 300px"
          allow-clear
        >
          <template #prefix><icon-search /></template>
        </a-input>
        <a-button type="primary" @click="showAddUserModal = true">
          <template #icon><icon-plus /></template>
          分发账号
        </a-button>
      </div>
      
      <a-table
        :columns="userColumns"
        :data="filteredUsers"
        :pagination="false"
        size="small"
      >
        <template #status="{ record }">
          <a-tag
            :color="record.status === 'active' ? 'green' : 'red'"
          >
            {{ record.status === 'active' ? '激活' : '停用' }}
          </a-tag>
        </template>
        
        <template #role="{ record }">
          <a-tag>{{ getRoleName(record.roles[0]) }}</a-tag>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="editUser(record)">
              编辑
            </a-button>
            <a-button type="text" size="small" @click="resetUserPassword(record)">
              重置密码
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="toggleUserStatus(record)"
            >
              {{ record.status === 'active' ? '停用' : '启用' }}
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-modal>

    <!-- 分发账号弹窗 -->
    <a-modal
      v-model:visible="showAddUserModal"
      title="分发账号"
      @ok="handleCreateUser"
      @cancel="handleCancelUserEdit"
    >
      <a-form :model="userForm" layout="vertical">
        <a-form-item field="username" label="用户名" required>
          <a-input v-model="userForm.username" placeholder="请输入用户名" />
        </a-form-item>
        
        <a-form-item field="email" label="邮箱" required>
          <a-input v-model="userForm.email" placeholder="请输入邮箱" />
        </a-form-item>
        
        <a-form-item field="realName" label="真实姓名" required>
          <a-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </a-form-item>
        
        <a-form-item field="phone" label="手机号">
          <a-input v-model="userForm.phone" placeholder="请输入手机号" />
        </a-form-item>
        
        <a-form-item field="role" label="角色" required>
          <a-select v-model="userForm.role" placeholder="请选择角色">
            <a-option value="channel_admin">渠道商管理员</a-option>
            <a-option value="channel_user">渠道商用户</a-option>
            <a-option value="channel_viewer">渠道商查看者</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item field="password" label="初始密码" required>
          <a-input-password v-model="userForm.password" placeholder="请输入初始密码" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量导入弹窗 -->
    <a-modal
      v-model:visible="showBatchModal"
      title="批量导入渠道商"
      @ok="handleBatchImport"
    >
      <div class="space-y-4">
        <div>
          <a-button @click="downloadTemplate">
            <template #icon><icon-download /></template>
            下载模板
          </a-button>
        </div>
        
        <a-upload
          :file-list="fileList"
          :auto-upload="false"
          accept=".xlsx,.xls"
          @change="handleFileChange"
        >
          <template #upload-button>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <icon-upload class="text-2xl text-gray-400 mb-2" />
              <div class="text-gray-600">点击上传或拖拽文件到此区域</div>
              <div class="text-sm text-gray-400 mt-1">支持 .xlsx, .xls 格式</div>
            </div>
          </template>
        </a-upload>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconSearch, 
  IconDown, 
  IconUpload,
  IconDownload
} from '@arco-design/web-vue/es/icon'
import type { Channel, RbacUser, ChannelRole } from '@/types/rbac'

// 响应式数据
const loading = ref(false)
const showAddChannelModal = ref(false)
const showUserModal = ref(false)
const showAddUserModal = ref(false)
const showBatchModal = ref(false)
const editingChannel = ref<Channel | null>(null)
const currentChannel = ref<Channel | null>(null)
const userSearchKeyword = ref('')
const fileList = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  dateRange: []
})

// 渠道商表单
const channelForm = reactive({
  name: '',
  code: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  businessLicense: ''
})

// 用户表单
const userForm = reactive({
  username: '',
  email: '',
  realName: '',
  phone: '',
  role: '',
  password: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 模拟渠道商数据
const channelList = ref<Channel[]>([
  {
    id: '1',
    name: '时尚前线服饰',
    code: 'SXQX001',
    contactPerson: '张经理',
    contactPhone: '13800138001',
    contactEmail: 'zhang@sxqx.com',
    address: '上海市浦东新区时尚大道123号',
    businessLicense: '91310115MA1K53E15X',
    status: 'active',
    userCount: 5,
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-07-30 09:15:00'
  },
  {
    id: '2',
    name: '潮流服装集团',
    code: 'CLFZ002',
    contactPerson: '李总监',
    contactPhone: '13900139002',
    contactEmail: 'li@clfz.com',
    address: '北京市朝阳区潮流街456号',
    businessLicense: '91110105MA01234567',
    status: 'active',
    userCount: 8,
    createdAt: '2024-02-20 14:20:00',
    updatedAt: '2024-07-29 16:45:00'
  },
  {
    id: '3',
    name: '优雅女装',
    code: 'YGNZ003',
    contactPerson: '王主管',
    contactPhone: '13700137003',
    contactEmail: 'wang@ygnz.com',
    address: '广州市天河区优雅路789号',
    businessLicense: '91440106MA2K53E15Y',
    status: 'pending',
    userCount: 0,
    createdAt: '2024-07-25 11:10:00',
    updatedAt: '2024-07-25 11:10:00'
  }
])

// 模拟用户数据
const userList = ref<RbacUser[]>([
  {
    id: '1',
    username: 'sxqx_admin',
    email: 'admin@sxqx.com',
    realName: '张管理员',
    phone: '13800138001',
    type: 'channel' as any,
    roles: ['channel_admin'],
    permissions: [],
    status: 'active',
    channelId: '1',
    channelName: '时尚前线服饰',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-07-30 09:15:00'
  },
  {
    id: '2',
    username: 'sxqx_user1',
    email: 'user1@sxqx.com',
    realName: '李用户',
    phone: '13800138002',
    type: 'channel' as any,
    roles: ['channel_user'],
    permissions: [],
    status: 'active',
    channelId: '1',
    channelName: '时尚前线服饰',
    createdAt: '2024-01-16 09:20:00',
    updatedAt: '2024-07-29 14:30:00'
  }
])

// 表格列配置
const columns = [
  { title: '渠道商名称', dataIndex: 'name', width: 150 },
  { title: '渠道商代码', dataIndex: 'code', width: 120 },
  { title: '联系人', dataIndex: 'contactPerson', width: 100 },
  { title: '联系电话', dataIndex: 'contactPhone', width: 130 },
  { title: '联系邮箱', dataIndex: 'contactEmail', width: 180 },
  { title: '状态', slotName: 'status', width: 80 },
  { title: '用户数', slotName: 'userCount', width: 80 },
  { title: '创建时间', dataIndex: 'createdAt', width: 150 },
  { title: '操作', slotName: 'actions', width: 200, fixed: 'right' }
]

// 用户表格列配置
const userColumns = [
  { title: '用户名', dataIndex: 'username', width: 120 },
  { title: '邮箱', dataIndex: 'email', width: 180 },
  { title: '真实姓名', dataIndex: 'realName', width: 100 },
  { title: '手机号', dataIndex: 'phone', width: 130 },
  { title: '角色', slotName: 'role', width: 100 },
  { title: '状态', slotName: 'status', width: 80 },
  { title: '最后登录', dataIndex: 'lastLoginAt', width: 150 },
  { title: '操作', slotName: 'actions', width: 200 }
]

// 计算属性
const filteredUsers = computed(() => {
  if (!currentChannel.value) return []
  
  let users = userList.value.filter(user => user.channelId === currentChannel.value?.id)
  
  if (userSearchKeyword.value) {
    const keyword = userSearchKeyword.value.toLowerCase()
    users = users.filter(user => 
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      (user.realName && user.realName.toLowerCase().includes(keyword))
    )
  }
  
  return users
})

// 方法
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
    active: '激活',
    inactive: '停用',
    pending: '待审核'
  }
  return textMap[status] || status
}

const getRoleName = (roleCode: string) => {
  const roleMap: Record<string, string> = {
    channel_admin: '渠道商管理员',
    channel_user: '渠道商用户',
    channel_viewer: '渠道商查看者'
  }
  return roleMap[roleCode] || roleCode
}

const handleSearch = () => {
  // 实现搜索逻辑
  Message.info('搜索功能')
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: '',
    dateRange: []
  })
}

const handlePageChange = (page: number) => {
  pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
}

const viewChannel = (channel: Channel) => {
  Message.info(`查看渠道商: ${channel.name}`)
}

const editChannel = (channel: Channel) => {
  editingChannel.value = channel
  Object.assign(channelForm, channel)
  showAddChannelModal.value = true
}

const manageUsers = (channel: Channel) => {
  currentChannel.value = channel
  showUserModal.value = true
}

const showUserList = (channel: Channel) => {
  manageUsers(channel)
}

const resetPassword = (channel: Channel) => {
  Modal.confirm({
    title: '确认重置',
    content: `确定要重置渠道商"${channel.name}"管理员密码吗？`,
    onOk: () => {
      Message.success('密码重置成功，新密码已发送至联系邮箱')
    }
  })
}

const toggleStatus = (channel: Channel) => {
  const action = channel.status === 'active' ? '停用' : '启用'
  Modal.confirm({
    title: `确认${action}`,
    content: `确定要${action}渠道商"${channel.name}"吗？`,
    onOk: () => {
      Message.success(`${action}成功`)
    }
  })
}

const deleteChannel = (channel: Channel) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除渠道商"${channel.name}"吗？删除后不可恢复。`,
    onOk: () => {
      Message.success('删除成功')
    }
  })
}

const handleSaveChannel = () => {
  if (!channelForm.name.trim()) {
    Message.error('请输入渠道商名称')
    return
  }
  
  Message.success(editingChannel.value ? '编辑成功' : '新增成功')
  showAddChannelModal.value = false
  handleCancelEdit()
}

const handleCancelEdit = () => {
  editingChannel.value = null
  Object.assign(channelForm, {
    name: '',
    code: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    businessLicense: ''
  })
}

const editUser = (user: RbacUser) => {
  Object.assign(userForm, {
    username: user.username,
    email: user.email,
    realName: user.realName,
    phone: user.phone,
    role: user.roles[0],
    password: ''
  })
  showAddUserModal.value = true
}

const resetUserPassword = (user: RbacUser) => {
  Modal.confirm({
    title: '确认重置',
    content: `确定要重置用户"${user.username}"的密码吗？`,
    onOk: () => {
      Message.success('密码重置成功')
    }
  })
}

const toggleUserStatus = (user: RbacUser) => {
  const action = user.status === 'active' ? '停用' : '启用'
  Modal.confirm({
    title: `确认${action}`,
    content: `确定要${action}用户"${user.username}"吗？`,
    onOk: () => {
      Message.success(`${action}成功`)
    }
  })
}

const handleCreateUser = () => {
  if (!userForm.username.trim()) {
    Message.error('请输入用户名')
    return
  }
  
  Message.success('账号分发成功')
  showAddUserModal.value = false
  handleCancelUserEdit()
}

const handleCancelUserEdit = () => {
  Object.assign(userForm, {
    username: '',
    email: '',
    realName: '',
    phone: '',
    role: '',
    password: ''
  })
}

const downloadTemplate = () => {
  Message.info('模板下载功能')
}

const handleFileChange = (fileList: any) => {
  // 处理文件上传
}

const handleBatchImport = () => {
  Message.success('批量导入成功')
  showBatchModal.value = false
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.p-6 {
  padding: 24px;
}
</style>