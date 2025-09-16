<template>
  <div class="user-list">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">用户管理</h1>
        <a-button type="primary" @click="handleCreate">
          <icon-plus class="mr-2" />
          新增用户
        </a-button>
      </div>
      
      <!-- 搜索和筛选 -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a-input placeholder="搜索用户名/手机号" allow-clear>
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
          <a-select placeholder="用户角色" allow-clear>
            <a-option value="admin">运营人员</a-option>
            <a-option value="designer">服装设计师</a-option>
            <a-option value="sales">销售</a-option>
          </a-select>
          <a-select placeholder="用户状态" allow-clear>
            <a-option value="active">正常</a-option>
            <a-option value="inactive">禁用</a-option>
          </a-select>
          <a-button type="primary">搜索</a-button>
        </div>
      </div>
      
      <!-- 用户统计 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-blue-600 text-sm font-medium">总用户数</div>
          <div class="text-2xl font-bold text-blue-700 mt-1">{{ stats.total }}</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-green-600 text-sm font-medium">活跃用户</div>
          <div class="text-2xl font-bold text-green-700 mt-1">{{ stats.active }}</div>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg">
          <div class="text-orange-600 text-sm font-medium">今日新增</div>
          <div class="text-2xl font-bold text-orange-700 mt-1">{{ stats.newToday }}</div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <div class="text-red-600 text-sm font-medium">禁用用户</div>
          <div class="text-2xl font-bold text-red-700 mt-1">{{ stats.inactive }}</div>
        </div>
      </div>
      
      <!-- 用户表格 -->
      <a-table
        :columns="columns"
        :data="mockData"
        :pagination="pagination"
        row-key="id"
      >
        <template #avatar="{ record }">
          <a-avatar :size="32">
            <img v-if="record.avatar" :src="record.avatar" alt="avatar" />
            <span v-else>{{ record.username.charAt(0).toUpperCase() }}</span>
          </a-avatar>
        </template>
        
        <template #role="{ record }">
          <a-tag :color="getRoleColor(record.role)">
            {{ getRoleText(record.role) }}
          </a-tag>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="record.status === 'active' ? 'green' : 'red'">
            {{ record.status === 'active' ? '正常' : '禁用' }}
          </a-tag>
        </template>
        
        <template #lastLogin="{ record }">
          <span v-if="record.lastLogin">
            {{ formatDate(record.lastLogin) }}
          </span>
          <span v-else class="text-gray-400">从未登录</span>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button size="small" @click="handleResetPassword(record)">重置密码</a-button>
            <a-dropdown>
              <a-button size="small">
                更多
                <icon-down class="ml-1" />
              </a-button>
              <template #content>
                <a-doption @click="handleToggleStatus(record)">
                  {{ record.status === 'active' ? '禁用' : '启用' }}
                </a-doption>
                <a-doption @click="handleViewLogs(record)">
                  查看日志
                </a-doption>
                <a-doption class="text-red-500" @click="handleDelete(record)">
                  删除
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
import { IconPlus, IconSearch, IconDown } from '@arco-design/web-vue/es/icon'

// 统计数据
const stats = ref({
  total: 156,
  active: 142,
  newToday: 8,
  inactive: 14
})

// 表格列定义
const columns = [
  {
    title: '头像',
    dataIndex: 'avatar',
    slotName: 'avatar',
    width: 80
  },
  {
    title: '用户名',
    dataIndex: 'username',
    width: 120
  },
  {
    title: '真实姓名',
    dataIndex: 'realName',
    width: 120
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    width: 130
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: 180
  },
  {
    title: '角色',
    dataIndex: 'role',
    slotName: 'role',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 80
  },
  {
    title: '最后登录',
    dataIndex: 'lastLogin',
    slotName: 'lastLogin',
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 150,
    render: ({ record }: any) => formatDate(record.createdAt)
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 模拟数据
const mockData = ref([
  {
    id: 'U001',
    username: 'admin',
    realName: '管理员',
    phone: '13800138000',
    email: 'admin@dicreate.com',
    role: 'admin',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    avatar: ''
  },
  {
    id: 'U002',
    username: 'designer01',
    realName: '李设计',
    phone: '13800138001',
    email: 'designer@dicreate.com',
    role: 'designer',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    avatar: ''
  },
  {
    id: 'U003',
    username: 'sales01',
    realName: '王销售',
    phone: '13800138002',
    email: 'sales@dicreate.com',
    role: 'sales',
    status: 'inactive',
    lastLogin: null,
    createdAt: new Date().toISOString(),
    avatar: ''
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

// 获取角色颜色
const getRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    admin: 'red',
    designer: 'purple',
    sales: 'blue'
  }
  return colorMap[role] || 'gray'
}

// 获取角色文本
const getRoleText = (role: string) => {
  const textMap: Record<string, string> = {
    admin: '运营人员',
    designer: '服装设计师',
    sales: '销售'
  }
  return textMap[role] || '未知'
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// 新增用户
const handleCreate = () => {
  Message.info('新增用户功能')
}

// 编辑用户
const handleEdit = (record: any) => {
  Message.info(`编辑用户: ${record.username}`)
}

// 重置密码
const handleResetPassword = (record: any) => {
  Message.info(`重置密码: ${record.username}`)
}

// 切换状态
const handleToggleStatus = (record: any) => {
  const newStatus = record.status === 'active' ? 'inactive' : 'active'
  Message.success(`用户${record.username}已${newStatus === 'active' ? '启用' : '禁用'}`)
}

// 查看日志
const handleViewLogs = (record: any) => {
  Message.info(`查看用户日志: ${record.username}`)
}

// 删除用户
const handleDelete = (record: any) => {
  Message.warning(`删除用户: ${record.username}`)
}
</script>

<style scoped>
.user-list {
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