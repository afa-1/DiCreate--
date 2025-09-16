<template>
  <div class="resource-list">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">资源库管理</h1>
        <a-space>
          <a-button @click="handleImport">
            <icon-import class="mr-2" />
            批量导入
          </a-button>
          <a-button type="primary" @click="handleCreate">
            <icon-plus class="mr-2" />
            新增资源
          </a-button>
        </a-space>
      </div>
      
      <!-- 资源分类标签 -->
      <div class="mb-6">
        <a-tabs v-model:active-key="activeTab" @change="handleTabChange">
          <a-tab-pane key="all" title="全部资源" />
          <a-tab-pane key="fabric" title="面料库" />
          <a-tab-pane key="case" title="案例库" />
          <a-tab-pane key="pattern" title="图案库" />
          <a-tab-pane key="color" title="色彩库" />
        </a-tabs>
      </div>
      
      <!-- 搜索和筛选 -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <a-input placeholder="搜索资源名称" allow-clear>
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
          <a-select placeholder="资源类型" allow-clear>
            <a-option value="fabric">面料</a-option>
            <a-option value="case">案例</a-option>
            <a-option value="pattern">图案</a-option>
            <a-option value="color">色彩</a-option>
          </a-select>
          <a-select placeholder="资源状态" allow-clear>
            <a-option value="active">可用</a-option>
            <a-option value="inactive">不可用</a-option>
          </a-select>
          <a-select placeholder="创建时间" allow-clear>
            <a-option value="today">今天</a-option>
            <a-option value="week">本周</a-option>
            <a-option value="month">本月</a-option>
          </a-select>
          <a-button type="primary">搜索</a-button>
        </div>
      </div>
      
      <!-- 资源统计 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-blue-600 text-sm font-medium">面料资源</div>
          <div class="text-2xl font-bold text-blue-700 mt-1">{{ stats.fabric }}</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-green-600 text-sm font-medium">案例资源</div>
          <div class="text-2xl font-bold text-green-700 mt-1">{{ stats.case }}</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-purple-600 text-sm font-medium">图案资源</div>
          <div class="text-2xl font-bold text-purple-700 mt-1">{{ stats.pattern }}</div>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg">
          <div class="text-orange-600 text-sm font-medium">色彩资源</div>
          <div class="text-2xl font-bold text-orange-700 mt-1">{{ stats.color }}</div>
        </div>
      </div>
      
      <!-- 资源网格展示 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="resource in filteredResources" :key="resource.id" class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <!-- 资源预览 -->
          <div class="aspect-square bg-gray-100 flex items-center justify-center relative">
            <div v-if="resource.preview" class="w-full h-full">
              <img :src="resource.preview" :alt="resource.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="text-gray-400">
              <icon-image class="text-4xl mb-2" />
              <div class="text-sm">暂无预览</div>
            </div>
            
            <!-- 资源类型标签 -->
            <div class="absolute top-2 left-2">
              <a-tag :color="getTypeColor(resource.type)" size="small">
                {{ getTypeText(resource.type) }}
              </a-tag>
            </div>
            
            <!-- 状态标签 -->
            <div class="absolute top-2 right-2">
              <a-tag :color="resource.status === 'active' ? 'green' : 'red'" size="small">
                {{ resource.status === 'active' ? '可用' : '不可用' }}
              </a-tag>
            </div>
          </div>
          
          <!-- 资源信息 -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-2 truncate">{{ resource.name }}</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>编号:</span>
                <span>{{ resource.code }}</span>
              </div>
              <div class="flex justify-between" v-if="resource.type === 'fabric'">
                <span>材质:</span>
                <span>{{ resource.material }}</span>
              </div>
              <div class="flex justify-between" v-if="resource.type === 'fabric'">
                <span>克重:</span>
                <span>{{ resource.weight }}g/m²</span>
              </div>
              <div class="flex justify-between">
                <span>创建时间:</span>
                <span>{{ formatDate(resource.createdAt) }}</span>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="mt-4 flex space-x-2">
              <a-button size="small" @click="handleView(resource)" class="flex-1">
                <icon-eye class="mr-1" />
                查看
              </a-button>
              <a-button size="small" @click="handleUse(resource)" class="flex-1">
                <icon-link class="mr-1" />
                使用
              </a-button>
              <a-dropdown>
                <a-button size="small">
                  <icon-more class="" />
                </a-button>
                <template #content>
                  <a-doption @click="handleEdit(resource)">编辑</a-doption>
                  <a-doption @click="handleCopy(resource)">复制</a-doption>
                  <a-doption @click="handleDownload(resource)">下载</a-doption>
                  <a-doption class="text-red-500" @click="handleDelete(resource)">删除</a-doption>
                </template>
              </a-dropdown>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="mt-8 flex justify-center">
        <a-pagination
          :current="pagination.current"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          show-total
          show-page-size
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconImport, IconPlus, IconSearch, IconImage, IconEye, IconLink, IconMore } from '@arco-design/web-vue/es/icon'

// 当前活跃标签
const activeTab = ref('all')

// 统计数据
const stats = ref({
  fabric: 156,
  case: 89,
  pattern: 234,
  color: 67
})

// 模拟数据
const mockResources = ref([
  {
    id: 'R001',
    name: '高档真丝面料',
    code: 'F001',
    type: 'fabric',
    material: '真丝',
    weight: 120,
    status: 'active',
    preview: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'R002',
    name: '春季连衣裙案例',
    code: 'C001',
    type: 'case',
    status: 'active',
    preview: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'R003',
    name: '花卉印花图案',
    code: 'P001',
    type: 'pattern',
    status: 'active',
    preview: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'R004',
    name: '2024流行色彩',
    code: 'CL001',
    type: 'color',
    status: 'active',
    preview: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'R005',
    name: '纯棉帆布面料',
    code: 'F002',
    type: 'fabric',
    material: '纯棉',
    weight: 280,
    status: 'inactive',
    preview: '',
    createdAt: new Date().toISOString()
  }
])

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 12,
  total: 60
})

// 过滤后的资源
const filteredResources = computed(() => {
  if (activeTab.value === 'all') {
    return mockResources.value
  }
  return mockResources.value.filter(resource => resource.type === activeTab.value)
})

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    fabric: 'blue',
    case: 'green',
    pattern: 'purple',
    color: 'orange'
  }
  return colorMap[type] || 'gray'
}

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    fabric: '面料',
    case: '案例',
    pattern: '图案',
    color: '色彩'
  }
  return textMap[type] || '未知'
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// 标签切换
const handleTabChange = (key: string) => {
  activeTab.value = key
  Message.info(`切换到${getTypeText(key)}资源`)
}

// 批量导入
const handleImport = () => {
  Message.info('批量导入资源功能')
}

// 新增资源
const handleCreate = () => {
  Message.info('新增资源功能')
}

// 查看资源
const handleView = (resource: any) => {
  Message.info(`查看资源: ${resource.name}`)
}

// 使用资源
const handleUse = (resource: any) => {
  Message.info(`使用资源: ${resource.name}`)
}

// 编辑资源
const handleEdit = (resource: any) => {
  Message.info(`编辑资源: ${resource.name}`)
}

// 复制资源
const handleCopy = (resource: any) => {
  Message.info(`复制资源: ${resource.name}`)
}

// 下载资源
const handleDownload = (resource: any) => {
  Message.info(`下载资源: ${resource.name}`)
}

// 删除资源
const handleDelete = (resource: any) => {
  Message.warning(`删除资源: ${resource.name}`)
}
</script>

<style scoped>
.resource-list {
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