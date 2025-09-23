<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">平台用户管理</h1>
        <p class="text-gray-600 mt-1">管理后台系统用户和角色权限</p>
      </div>
      <div class="flex gap-3">
        <a-button @click="showBatchModal = true">
          <template #icon><icon-upload /></template>
          批量导入
        </a-button>
        <a-button type="primary" @click="showAddUserModal = true">
          <template #icon><icon-plus /></template>
          新增用户
        </a-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名/邮箱/姓名"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.role"
            placeholder="角色"
            allow-clear
          >
            <a-option value="super_admin">超级管理员</a-option>
            <a-option value="admin">管理员</a-option>
            <a-option value="operator">运营人员</a-option>
            <a-option value="designer">服装设计师</a-option>
            <a-option value="sales">销售人员</a-option>
            <a-option value="service">客服专员</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.status"
            placeholder="状态"
            allow-clear
          >
            <a-option value="active">激活</a-option>
            <a-option value="inactive">停用</a-option>
            <a-option value="locked">锁定</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.department"
            placeholder="部门"
            allow-clear
          >
            <a-option value="tech">技术部</a-option>
            <a-option value="operation">运营部</a-option>
            <a-option value="design">设计部</a-option>
            <a-option value="sales">销售部</a-option>
            <a-option value="service">客服部</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
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

    <!-- 用户列表 -->
    <div class="bg-white rounded-lg shadow">
      <a-table
        :columns="columns"
        :data="userList"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #avatar="{ record }">
          <a-avatar :size="32">
            <img v-if="record.avatar" :src="record.avatar" />
            <span v-else>{{ record.realName?.charAt(0) || record.username.charAt(0) }}</span>
          </a-avatar>
        </template>
        
        <template #roles="{ record }">
          <a-space>
            <a-tag
              v-for="roleId in record.roles"
              :key="roleId"
              :color="getRoleColor(roleId)"
            >
              {{ getRoleName(roleId) }}
            </a-tag>
          </a-space>
        </template>
        
        <template #status="{ record }">
          <a-tag
            :color="getStatusColor(record.status)"
          >
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #lastLoginAt="{ record }">
          <span v-if="record.lastLoginAt">{{ record.lastLoginAt }}</span>
          <span v-else class="text-gray-400">从未登录</span>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button
              type="text"
              size="small"
              @click="viewUser(record)"
            >
              查看
            </a-button>
            <a-button
              type="text"
              size="small"
              @click="editUser(record)"
            >
              编辑
            </a-button>
            <a-button
              type="text"
              size="small"
              @click="manageRoles(record)"
            >
              角色管理
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
                <a-doption @click="viewPermissions(record)">
                  查看权限
                </a-doption>
                <a-doption
                  @click="deleteUser(record)"
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

    <!-- 新增/编辑用户弹窗 -->
    <a-modal
      v-model:visible="showAddUserModal"
      :title="editingUser ? '编辑用户' : '新增用户'"
      width="600px"
      @ok="handleSaveUser"
      @cancel="handleCancelEdit"
    >
      <a-form :model="userForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="username" label="用户名" required>
              <a-input 
                v-model="userForm.username" 
                placeholder="请输入用户名"
                :disabled="!!editingUser"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="email" label="邮箱" required>
              <a-input v-model="userForm.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="realName" label="真实姓名" required>
              <a-input v-model="userForm.realName" placeholder="请输入真实姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="phone" label="手机号">
              <a-input v-model="userForm.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="department" label="部门">
              <a-select v-model="userForm.department" placeholder="请选择部门">
                <a-option value="tech">技术部</a-option>
                <a-option value="operation">运营部</a-option>
                <a-option value="design">设计部</a-option>
                <a-option value="sales">销售部</a-option>
                <a-option value="service">客服部</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="position" label="职位">
              <a-input v-model="userForm.position" placeholder="请输入职位" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="roles" label="角色" required>
          <a-select
            v-model="userForm.roles"
            placeholder="请选择角色"
            multiple
            allow-clear
          >
            <a-option value="super_admin">超级管理员</a-option>
            <a-option value="admin">管理员</a-option>
            <a-option value="operator">运营人员</a-option>
            <a-option value="designer">服装设计师</a-option>
            <a-option value="sales">销售人员</a-option>
            <a-option value="service">客服专员</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item v-if="!editingUser" field="password" label="初始密码" required>
          <a-input-password v-model="userForm.password" placeholder="请输入初始密码" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 角色管理弹窗 -->
    <a-modal
      v-model:visible="showRoleModal"
      :title="`${currentUser?.realName || currentUser?.username} - 角色管理`"
      @ok="handleSaveRoles"
      @cancel="cancelRoleEdit"
    >
      <div class="space-y-4">
        <div class="text-sm text-gray-600 mb-4">
          当前用户：{{ currentUser?.username }} ({{ currentUser?.email }})
        </div>
        
        <a-checkbox-group v-model="selectedRoles" direction="vertical">
          <div v-for="role in availableRoles" :key="role.code" class="mb-3">
            <a-checkbox :value="role.code">
              <div class="flex items-center">
                <div class="ml-2">
                  <div class="font-medium">{{ role.name }}</div>
                  <div class="text-sm text-gray-500">{{ role.description }}</div>
                </div>
              </div>
            </a-checkbox>
          </div>
        </a-checkbox-group>
      </div>
    </a-modal>

    <!-- 权限查看弹窗 -->
    <a-modal
      v-model:visible="showPermissionModal"
      :title="`${currentUser?.realName || currentUser?.username} - 权限详情`"
      :footer="false"
      width="800px"
    >
      <div class="space-y-4">
        <div class="text-sm text-gray-600 mb-4">
          用户通过角色获得的权限列表
        </div>
        
        <div v-for="module in userPermissionModules" :key="module.key" class="border rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3">{{ module.name }}</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div
              v-for="permission in module.permissions"
              :key="permission.code"
              class="flex items-center p-2 bg-gray-50 rounded"
            >
              <icon-check class="text-green-500 mr-2" />
              <span class="text-sm">{{ permission.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 批量导入弹窗 -->
    <a-modal
      v-model:visible="showBatchModal"
      title="批量导入用户"
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
  IconDownload,
  IconCheck
} from '@arco-design/web-vue/es/icon'
import type { RbacUser, Role, Permission, PermissionModule } from '@/types/rbac'

// 响应式数据
const loading = ref(false)
const showAddUserModal = ref(false)
const showRoleModal = ref(false)
const showPermissionModal = ref(false)
const showBatchModal = ref(false)
const editingUser = ref<RbacUser | null>(null)
const currentUser = ref<RbacUser | null>(null)
const selectedRoles = ref<string[]>([])
const fileList = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  role: '',
  status: '',
  department: ''
})

// 用户表单
const userForm = reactive({
  username: '',
  email: '',
  realName: '',
  phone: '',
  department: '',
  position: '',
  roles: [] as string[],
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

// 模拟用户数据
const userList = ref<RbacUser[]>([
  {
    id: '1',
    username: 'admin',
    email: 'admin@dicreate.com',
    realName: '系统管理员',
    phone: '13800138000',
    avatar: '',
    type: 'platform' as any,
    roles: ['super_admin'],
    permissions: [],
    status: 'active',
    department: 'tech',
    position: '技术总监',
    lastLoginAt: '2024-07-30 09:15:00',
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-07-30 09:15:00'
  },
  {
    id: '2',
    username: 'operator001',
    email: 'operator@dicreate.com',
    realName: '张运营',
    phone: '13800138001',
    type: 'platform' as any,
    roles: ['operator'],
    permissions: [],
    status: 'active',
    department: 'operation',
    position: '运营专员',
    lastLoginAt: '2024-07-29 16:30:00',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-07-29 16:30:00'
  },
  {
    id: '3',
    username: 'designer001',
    email: 'designer@dicreate.com',
    realName: '李设计师',
    phone: '13800138002',
    type: 'platform' as any,
    roles: ['designer'],
    permissions: [],
    status: 'active',
    department: 'design',
    position: '高级设计师',
    lastLoginAt: '2024-07-28 14:20:00',
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-07-28 14:20:00'
  }
])

// 可用角色
const availableRoles = ref([
  {
    code: 'super_admin',
    name: '超级管理员',
    description: '拥有系统所有权限，可管理所有功能'
  },
  {
    code: 'admin',
    name: '管理员',
    description: '拥有大部分管理权限，不能管理超级管理员'
  },
  {
    code: 'operator',
    name: '运营人员',
    description: '负责平台运营管理，拥有运营相关权限'
  },
  {
    code: 'designer',
    name: '服装设计师',
    description: '负责服装设计和AI模型管理'
  },
  {
    code: 'sales',
    name: '销售人员',
    description: '负责销售和客户管理'
  },
  {
    code: 'service',
    name: '客服专员',
    description: '负责客户服务和售后处理'
  }
])

// 用户权限模块（模拟数据）
const userPermissionModules = ref<PermissionModule[]>([
  {
    key: 'user',
    name: '用户管理',
    permissions: [
      { id: '1', code: 'user:view', name: '查看用户', type: 'menu' as any, module: 'user', sort: 1, status: 'active', createdAt: '', updatedAt: '' },
      { id: '2', code: 'user:edit', name: '编辑用户', type: 'button' as any, module: 'user', sort: 2, status: 'active', createdAt: '', updatedAt: '' }
    ]
  },
  {
    key: 'product',
    name: '商品管理',
    permissions: [
      { id: '3', code: 'product:view', name: '查看商品', type: 'menu' as any, module: 'product', sort: 1, status: 'active', createdAt: '', updatedAt: '' },
      { id: '4', code: 'product:edit', name: '编辑商品', type: 'button' as any, module: 'product', sort: 2, status: 'active', createdAt: '', updatedAt: '' }
    ]
  }
])

// 表格列配置
const columns = [
  { title: '头像', slotName: 'avatar', width: 60 },
  { title: '用户名', dataIndex: 'username', width: 120 },
  { title: '真实姓名', dataIndex: 'realName', width: 100 },
  { title: '邮箱', dataIndex: 'email', width: 180 },
  { title: '手机号', dataIndex: 'phone', width: 130 },
  { title: '部门', dataIndex: 'department', width: 100 },
  { title: '职位', dataIndex: 'position', width: 120 },
  { title: '角色', slotName: 'roles', width: 150 },
  { title: '状态', slotName: 'status', width: 80 },
  { title: '最后登录', slotName: 'lastLoginAt', width: 150 },
  { title: '操作', slotName: 'actions', width: 200, fixed: 'right' }
]

// 方法
const getRoleColor = (roleCode: string) => {
  const colorMap: Record<string, string> = {
    super_admin: 'red',
    admin: 'purple',
    operator: 'blue',
    designer: 'green',
    sales: 'orange',
    service: 'cyan'
  }
  return colorMap[roleCode] || 'gray'
}

const getRoleName = (roleCode: string) => {
  const role = availableRoles.value.find(r => r.code === roleCode)
  return role?.name || roleCode
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'red',
    locked: 'orange'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '激活',
    inactive: '停用',
    locked: '锁定'
  }
  return textMap[status] || status
}

const handleSearch = () => {
  Message.info('搜索功能')
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    role: '',
    status: '',
    department: ''
  })
}

const handlePageChange = (page: number) => {
  pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
}

const viewUser = (user: RbacUser) => {
  Message.info(`查看用户: ${user.username}`)
}

const editUser = (user: RbacUser) => {
  editingUser.value = user
  Object.assign(userForm, {
    username: user.username,
    email: user.email,
    realName: user.realName,
    phone: user.phone,
    department: user.department,
    position: user.position,
    roles: [...user.roles],
    password: ''
  })
  showAddUserModal.value = true
}

const manageRoles = (user: RbacUser) => {
  currentUser.value = user
  selectedRoles.value = [...user.roles]
  showRoleModal.value = true
}

const viewPermissions = (user: RbacUser) => {
  currentUser.value = user
  showPermissionModal.value = true
}

const resetPassword = (user: RbacUser) => {
  Modal.confirm({
    title: '确认重置',
    content: `确定要重置用户"${user.username}"的密码吗？`,
    onOk: () => {
      Message.success('密码重置成功')
    }
  })
}

const toggleStatus = (user: RbacUser) => {
  const action = user.status === 'active' ? '停用' : '启用'
  Modal.confirm({
    title: `确认${action}`,
    content: `确定要${action}用户"${user.username}"吗？`,
    onOk: () => {
      Message.success(`${action}成功`)
    }
  })
}

const deleteUser = (user: RbacUser) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户"${user.username}"吗？删除后不可恢复。`,
    onOk: () => {
      Message.success('删除成功')
    }
  })
}

const handleSaveUser = () => {
  if (!userForm.username.trim()) {
    Message.error('请输入用户名')
    return
  }
  
  if (!userForm.email.trim()) {
    Message.error('请输入邮箱')
    return
  }
  
  if (!userForm.roles.length) {
    Message.error('请选择角色')
    return
  }
  
  Message.success(editingUser.value ? '编辑成功' : '新增成功')
  showAddUserModal.value = false
  handleCancelEdit()
}

const handleCancelEdit = () => {
  editingUser.value = null
  Object.assign(userForm, {
    username: '',
    email: '',
    realName: '',
    phone: '',
    department: '',
    position: '',
    roles: [],
    password: ''
  })
}

const handleSaveRoles = () => {
  if (currentUser.value) {
    currentUser.value.roles = [...selectedRoles.value]
    Message.success('角色分配成功')
    showRoleModal.value = false
  }
}

const cancelRoleEdit = () => {
  selectedRoles.value = []
  currentUser.value = null
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