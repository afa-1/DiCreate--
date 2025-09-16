<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">角色权限</h1>
        <p class="text-gray-600 mt-1">管理系统角色和权限配置</p>
      </div>
      <a-button type="primary" @click="showAddModal = true">
        <template #icon><icon-plus /></template>
        新增角色
      </a-button>
    </div>

    <!-- 角色列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <div 
        v-for="role in roles" 
        :key="role.id"
        class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <div :class="`p-3 rounded-full ${getRoleIconBg(role.key)}`">
              <component :is="getRoleIcon(role.key)" class="w-6 h-6" />
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-semibold text-gray-900">{{ role.name }}</h3>
              <p class="text-sm text-gray-500">{{ role.description }}</p>
            </div>
          </div>
          <a-dropdown>
            <a-button type="text" size="small">
              <template #icon><icon-more /></template>
            </a-button>
            <template #content>
              <a-doption @click="editRole(role)">
                <template #icon><icon-edit /></template>
                编辑
              </a-doption>
              <a-doption @click="managePermissions(role)">
                <template #icon><icon-settings /></template>
                权限管理
              </a-doption>
              <a-doption 
                v-if="!role.isSystem" 
                @click="deleteRole(role.id)"
                class="text-red-500"
              >
                <template #icon><icon-delete /></template>
                删除
              </a-doption>
            </template>
          </a-dropdown>
        </div>
        
        <div class="mb-4">
          <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>用户数量</span>
            <span class="font-medium">{{ role.userCount }}</span>
          </div>
          <div class="flex items-center justify-between text-sm text-gray-600">
            <span>权限数量</span>
            <span class="font-medium">{{ role.permissions.length }}</span>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-1">
          <a-tag 
            v-for="permission in role.permissions.slice(0, 3)" 
            :key="permission"
            size="small"
          >
            {{ getPermissionName(permission) }}
          </a-tag>
          <a-tag 
            v-if="role.permissions.length > 3"
            size="small"
            color="gray"
          >
            +{{ role.permissions.length - 3 }}
          </a-tag>
        </div>
      </div>
    </div>

    <!-- 权限管理弹窗 -->
    <a-modal
      v-model:visible="showPermissionModal"
      :title="`${currentRole?.name} - 权限管理`"
      width="800px"
      @ok="handleSavePermissions"
      @cancel="cancelPermissionEdit"
    >
      <div class="space-y-4">
        <div v-for="module in permissionModules" :key="module.key" class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium text-gray-900">{{ module.name }}</h4>
            <a-checkbox 
              :model-value="isModuleAllSelected(module.key)"
              :indeterminate="isModuleIndeterminate(module.key)"
              @change="toggleModulePermissions(module.key, $event)"
            >
              全选
            </a-checkbox>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <a-checkbox
              v-for="permission in module.permissions"
              :key="permission.key"
              v-model="selectedPermissions"
              :value="permission.key"
            >
              {{ permission.name }}
            </a-checkbox>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 新增/编辑角色弹窗 -->
    <a-modal
      v-model:visible="showAddModal"
      :title="editingRole ? '编辑角色' : '新增角色'"
      @ok="handleSaveRole"
      @cancel="handleCancelEdit"
    >
      <a-form :model="roleForm" layout="vertical">
        <a-form-item field="name" label="角色名称">
          <a-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item field="key" label="角色标识">
          <a-input 
            v-model="roleForm.key" 
            placeholder="请输入角色标识（英文）"
            :disabled="!!editingRole"
          />
        </a-form-item>
        <a-form-item field="description" label="角色描述">
          <a-textarea
            v-model="roleForm.description"
            placeholder="请输入角色描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconMore, 
  IconEdit, 
  IconSettings, 
  IconDelete,
  IconUser,
  IconUserGroup,
  IconCrown
} from '@arco-design/web-vue/es/icon'

interface Role {
  id: string
  name: string
  key: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
}

interface Permission {
  key: string
  name: string
}

interface PermissionModule {
  key: string
  name: string
  permissions: Permission[]
}

const showAddModal = ref(false)
const showPermissionModal = ref(false)
const editingRole = ref<Role | null>(null)
const currentRole = ref<Role | null>(null)
const selectedPermissions = ref<string[]>([])

const roleForm = reactive({
  name: '',
  key: '',
  description: ''
})

// 模拟角色数据
const roles = ref<Role[]>([
  {
    id: '1',
    name: '运营人员',
    key: 'operator',
    description: '负责平台运营管理，拥有大部分权限',
    permissions: ['user.view', 'user.edit', 'product.view', 'product.edit', 'order.view', 'order.edit'],
    userCount: 12,
    isSystem: true
  },
  {
    id: '2',
    name: '服装设计师',
    key: 'designer',
    description: '负责服装设计和AI模型管理',
    permissions: ['product.view', 'ai.view', 'ai.edit', 'resource.view', 'resource.edit'],
    userCount: 8,
    isSystem: true
  },
  {
    id: '3',
    name: '销售人员',
    key: 'sales',
    description: '负责销售和客户管理',
    permissions: ['order.view', 'order.edit', 'user.view'],
    userCount: 15,
    isSystem: true
  },
  {
    id: '4',
    name: '客服专员',
    key: 'service',
    description: '负责客户服务和售后处理',
    permissions: ['order.view', 'user.view'],
    userCount: 6,
    isSystem: false
  }
])

// 权限模块定义
const permissionModules: PermissionModule[] = [
  {
    key: 'user',
    name: '用户管理',
    permissions: [
      { key: 'user.view', name: '查看用户' },
      { key: 'user.edit', name: '编辑用户' },
      { key: 'user.delete', name: '删除用户' },
      { key: 'user.role', name: '角色管理' }
    ]
  },
  {
    key: 'product',
    name: '商品管理',
    permissions: [
      { key: 'product.view', name: '查看商品' },
      { key: 'product.edit', name: '编辑商品' },
      { key: 'product.delete', name: '删除商品' },
      { key: 'product.category', name: '分类管理' }
    ]
  },
  {
    key: 'order',
    name: '订单管理',
    permissions: [
      { key: 'order.view', name: '查看订单' },
      { key: 'order.edit', name: '编辑订单' },
      { key: 'order.audit', name: '订单审核' },
      { key: 'order.export', name: '导出订单' }
    ]
  },
  {
    key: 'ai',
    name: 'AI设计',
    permissions: [
      { key: 'ai.view', name: '查看模型' },
      { key: 'ai.edit', name: '编辑模型' },
      { key: 'ai.template', name: '模板管理' },
      { key: 'ai.scheme', name: '方案审核' }
    ]
  },
  {
    key: 'resource',
    name: '资源库',
    permissions: [
      { key: 'resource.view', name: '查看资源' },
      { key: 'resource.edit', name: '编辑资源' },
      { key: 'resource.upload', name: '上传资源' },
      { key: 'resource.delete', name: '删除资源' }
    ]
  },
  {
    key: 'system',
    name: '系统管理',
    permissions: [
      { key: 'system.config', name: '系统配置' },
      { key: 'system.log', name: '操作日志' },
      { key: 'system.backup', name: '数据备份' },
      { key: 'system.monitor', name: '系统监控' }
    ]
  }
]

const getRoleIcon = (roleKey: string) => {
  const iconMap: Record<string, any> = {
    operator: IconCrown,
    designer: IconEdit,
    sales: IconUserGroup,
    service: IconUser
  }
  return iconMap[roleKey] || IconUser
}

const getRoleIconBg = (roleKey: string) => {
  const bgMap: Record<string, string> = {
    operator: 'bg-purple-100 text-purple-600',
    designer: 'bg-blue-100 text-blue-600',
    sales: 'bg-green-100 text-green-600',
    service: 'bg-orange-100 text-orange-600'
  }
  return bgMap[roleKey] || 'bg-gray-100 text-gray-600'
}

const getPermissionName = (permissionKey: string) => {
  for (const module of permissionModules) {
    const permission = module.permissions.find(p => p.key === permissionKey)
    if (permission) return permission.name
  }
  return permissionKey
}

const isModuleAllSelected = (moduleKey: string) => {
  const module = permissionModules.find(m => m.key === moduleKey)
  if (!module) return false
  return module.permissions.every(p => selectedPermissions.value.includes(p.key))
}

const isModuleIndeterminate = (moduleKey: string) => {
  const module = permissionModules.find(m => m.key === moduleKey)
  if (!module) return false
  const selectedCount = module.permissions.filter(p => selectedPermissions.value.includes(p.key)).length
  return selectedCount > 0 && selectedCount < module.permissions.length
}

const toggleModulePermissions = (moduleKey: string, checked: boolean) => {
  const module = permissionModules.find(m => m.key === moduleKey)
  if (!module) return
  
  if (checked) {
    // 添加该模块的所有权限
    module.permissions.forEach(p => {
      if (!selectedPermissions.value.includes(p.key)) {
        selectedPermissions.value.push(p.key)
      }
    })
  } else {
    // 移除该模块的所有权限
    selectedPermissions.value = selectedPermissions.value.filter(key => 
      !module.permissions.some(p => p.key === key)
    )
  }
}

const editRole = (role: Role) => {
  editingRole.value = role
  Object.assign(roleForm, {
    name: role.name,
    key: role.key,
    description: role.description
  })
  showAddModal.value = true
}

const managePermissions = (role: Role) => {
  currentRole.value = role
  selectedPermissions.value = [...role.permissions]
  showPermissionModal.value = true
}

const deleteRole = (roleId: string) => {
  const role = roles.value.find(r => r.id === roleId)
  if (!role) return
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除角色"${role.name}"吗？删除后不可恢复。`,
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success('角色删除成功')
        // 这里应该重新加载数据
      } catch (error) {
        Message.error('删除失败，请重试')
      }
    }
  })
}

const handleSaveRole = async () => {
  if (!roleForm.name.trim()) {
    Message.error('请输入角色名称')
    return
  }
  
  if (!roleForm.key.trim()) {
    Message.error('请输入角色标识')
    return
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success(editingRole.value ? '角色更新成功' : '角色创建成功')
    showAddModal.value = false
    handleCancelEdit()
  } catch (error) {
    Message.error('操作失败，请重试')
  }
}

const handleCancelEdit = () => {
  editingRole.value = null
  Object.assign(roleForm, {
    name: '',
    key: '',
    description: ''
  })
}

const handleSavePermissions = async () => {
  if (!currentRole.value) return
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('权限更新成功')
    
    // 更新本地数据
    currentRole.value.permissions = [...selectedPermissions.value]
    
    showPermissionModal.value = false
    cancelPermissionEdit()
  } catch (error) {
    Message.error('权限更新失败，请重试')
  }
}

const cancelPermissionEdit = () => {
  currentRole.value = null
  selectedPermissions.value = []
}
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>