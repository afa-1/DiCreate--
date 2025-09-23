<template>
  <div class="role-permission-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>角色权限管理</h2>
      <p>管理系统角色和权限分配</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <a-button type="primary" @click="showCreateModal">
        <PlusOutlined />
        新增角色
      </a-button>
      <a-button @click="refreshData">
        <ReloadOutlined />
        刷新
      </a-button>
    </div>

    <!-- 角色列表 -->
    <a-table
      :columns="columns"
      :data-source="roleList"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <a-tag :color="record.type === UserType.PLATFORM ? 'blue' : 'green'">
            {{ record.type === UserType.PLATFORM ? '平台角色' : '渠道商角色' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 'active' ? 'green' : 'red'">
            {{ record.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'isSystem'">
          <a-tag :color="record.isSystem ? 'orange' : 'default'">
            {{ record.isSystem ? '系统角色' : '自定义角色' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="text" size="small" @click="editRole(record)">
              编辑
            </a-button>
            <a-button type="text" size="small" @click="assignPermissions(record)">
              分配权限
            </a-button>
            <a-button type="text" size="small" @click="viewUsers(record)">
              查看用户
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              danger 
              @click="deleteRole(record)"
              :disabled="record.isSystem"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑角色弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
      >
        <a-form-item label="角色名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色编码" name="code">
          <a-input v-model:value="formData.code" placeholder="请输入角色编码" />
        </a-form-item>
        <a-form-item label="角色类型" name="type">
           <a-select v-model:value="formData.type" placeholder="请选择角色类型">
             <a-select-option :value="UserType.PLATFORM">平台角色</a-select-option>
             <a-select-option :value="UserType.CHANNEL">渠道商角色</a-select-option>
           </a-select>
         </a-form-item>
        <a-form-item label="角色描述" name="description">
          <a-textarea 
            v-model:value="formData.description" 
            placeholder="请输入角色描述"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio value="active">启用</a-radio>
            <a-radio value="inactive">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限分配弹窗 -->
    <a-modal
      v-model:open="permissionModalVisible"
      title="权限分配"
      width="800px"
      @ok="savePermissions"
      @cancel="cancelPermissions"
    >
      <div class="permission-management">
        <a-alert
          message="权限分配"
          type="info"
          show-icon
          style="margin-bottom: 16px"
        />
        
        <a-tabs v-model:activeKey="activePermissionTab">
          <a-tab-pane key="menu" tab="菜单权限">
            <a-tree
              v-model:checkedKeys="tempPermissions.menu"
              :tree-data="menuPermissionTree"
              checkable
              :default-expand-all="true"
              :check-strictly="false"
            />
          </a-tab-pane>
          <a-tab-pane key="operation" tab="操作权限">
            <a-tree
              v-model:checkedKeys="tempPermissions.operation"
              :tree-data="operationPermissionTree"
              checkable
              :default-expand-all="true"
              :check-strictly="false"
            />
          </a-tab-pane>
          <a-tab-pane key="data" tab="数据权限">
            <a-tree
              v-model:checkedKeys="tempPermissions.data"
              :tree-data="dataPermissionTree"
              checkable
              :default-expand-all="true"
              :check-strictly="false"
            />
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>

    <!-- 查看用户弹窗 -->
    <a-modal
      v-model:open="userModalVisible"
      title="角色用户列表"
      width="800px"
      :footer="null"
    >
      <a-table
        :columns="userColumns"
        :data-source="roleUsers"
        :pagination="false"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '正常' : '禁用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'lastLogin'">
            {{ record.lastLogin ? formatDate(record.lastLogin) : '从未登录' }}
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import type { Role, Permission, RbacUser } from '@/types/rbac'
import { UserType } from '@/types/rbac'

// 响应式数据
const loading = ref(false)
const modalVisible = ref(false)
const permissionModalVisible = ref(false)
const userModalVisible = ref(false)
const isEdit = ref(false)
const currentRole = ref<Role | null>(null)
const activePermissionTab = ref('menu')

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  code: '',
  type: UserType.PLATFORM,
  description: '',
  status: 'active' as const
})

// 临时权限数据
const tempPermissions = reactive({
  menu: [] as string[],
  operation: [] as string[],
  data: [] as string[]
})

// 角色列表
const roleList = ref<Role[]>([])

// 角色用户列表
const roleUsers = ref<RbacUser[]>([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 表格列配置
const columns = [
  {
    title: '角色名称',
    dataIndex: 'name',
    key: 'name',
    width: 120
  },
  {
    title: '角色编码',
    dataIndex: 'code',
    key: 'code',
    width: 120
  },
  {
    title: '角色类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '用户数量',
    dataIndex: 'userCount',
    key: 'userCount',
    width: 80
  },
  {
    title: '系统角色',
    dataIndex: 'isSystem',
    key: 'isSystem',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right' as const
  }
]

// 用户列表列配置
const userColumns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '姓名',
    dataIndex: 'realName',
    key: 'realName'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '最后登录',
    dataIndex: 'lastLogin',
    key: 'lastLogin'
  }
]

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ]
}

// 权限树数据
const menuPermissionTree = ref([
  {
    title: '系统管理',
    key: 'system',
    children: [
      { title: '用户管理', key: 'system-user' },
      { title: '角色管理', key: 'system-role' },
      { title: '菜单管理', key: 'system-menu' }
    ]
  },
  {
    title: '业务管理',
    key: 'business',
    children: [
      { title: '商品管理', key: 'business-product' },
      { title: '订单管理', key: 'business-order' }
    ]
  }
])

const operationPermissionTree = ref([
  {
    title: '基础操作',
    key: 'basic',
    children: [
      { title: '查看', key: 'basic-view' },
      { title: '新增', key: 'basic-create' },
      { title: '编辑', key: 'basic-edit' },
      { title: '删除', key: 'basic-delete' }
    ]
  }
])

const dataPermissionTree = ref([
  {
    title: '数据范围',
    key: 'data-scope',
    children: [
      { title: '全部数据', key: 'data-all' },
      { title: '本部门数据', key: 'data-dept' },
      { title: '本人数据', key: 'data-self' }
    ]
  }
])

// 方法
const showCreateModal = () => {
  isEdit.value = false
  modalVisible.value = true
  resetForm()
}

const editRole = (record: Role) => {
  isEdit.value = true
  currentRole.value = record
  modalVisible.value = true
  Object.assign(formData, record)
}

const deleteRole = (record: Role) => {
  // 删除角色逻辑
  message.success('删除成功')
  refreshData()
}

const assignPermissions = (record: Role) => {
  currentRole.value = record
  permissionModalVisible.value = true
  // 加载当前角色的权限
  tempPermissions.menu = []
  tempPermissions.operation = []
  tempPermissions.data = []
}

const viewUsers = (record: Role) => {
  currentRole.value = record
  userModalVisible.value = true
  // 加载角色用户列表
  roleUsers.value = []
}

const handleSubmit = () => {
  // 提交表单逻辑
  message.success(isEdit.value ? '更新成功' : '创建成功')
  modalVisible.value = false
  refreshData()
}

const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

const savePermissions = () => {
  // 保存权限逻辑
  message.success('权限分配成功')
  permissionModalVisible.value = false
}

const cancelPermissions = () => {
  permissionModalVisible.value = false
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  refreshData()
}

const resetForm = () => {
    Object.assign(formData, {
      id: '',
      name: '',
      code: '',
      type: UserType.PLATFORM,
      description: '',
      status: 'active' as const
    })
  }

  const refreshData = () => {
    loading.value = true
    // 模拟数据加载
    setTimeout(() => {
      roleList.value = [
        {
          id: '1',
          name: '超级管理员',
          code: 'SUPER_ADMIN',
          type: UserType.PLATFORM,
          description: '系统超级管理员，拥有所有权限',
          status: 'active',
          userCount: 1,
          isSystem: true,
          permissions: [],
          createdAt: '2024-01-01 10:00:00',
          updatedAt: '2024-01-01 10:00:00'
        },
        {
          id: '2',
          name: '普通管理员',
          code: 'ADMIN',
          type: UserType.PLATFORM,
          description: '普通管理员',
          status: 'active',
          userCount: 5,
          isSystem: false,
          permissions: [],
          createdAt: '2024-01-02 10:00:00',
          updatedAt: '2024-01-02 10:00:00'
        }
      ]
      pagination.total = roleList.value.length
      loading.value = false
    }, 1000)
  }

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.role-permission-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
}

.action-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.permission-management {
  max-height: 400px;
  overflow-y: auto;
}
</style>