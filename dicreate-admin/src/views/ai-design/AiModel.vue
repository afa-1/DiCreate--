<template>
  <div class="ai-model">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">AI设计模型管理</h1>
        <a-button type="primary" @click="handleUpload">
          <icon-plus class="mr-2" />
          上传模型
        </a-button>
      </div>
      
      <!-- 搜索和筛选 -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a-input placeholder="搜索模型名称" allow-clear>
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
          <a-select placeholder="模型类型" allow-clear>
            <a-option value="3d">3D模型</a-option>
            <a-option value="texture">材质贴图</a-option>
            <a-option value="pattern">图案设计</a-option>
          </a-select>
          <a-select placeholder="模型状态" allow-clear>
            <a-option value="active">可用</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="inactive">不可用</a-option>
          </a-select>
          <a-button type="primary">搜索</a-button>
        </div>
      </div>
      
      <!-- 模型网格展示 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="model in mockModels" :key="model.id" class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <!-- 模型预览 -->
          <div class="aspect-square bg-gray-100 flex items-center justify-center">
            <div v-if="model.preview" class="w-full h-full">
              <img :src="model.preview" :alt="model.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="text-gray-400">
              <icon-image class="text-4xl mb-2" />
              <div class="text-sm">暂无预览</div>
            </div>
          </div>
          
          <!-- 模型信息 -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-2 truncate">{{ model.name }}</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>类型:</span>
                <a-tag :color="getTypeColor(model.type)" size="small">
                  {{ getTypeText(model.type) }}
                </a-tag>
              </div>
              <div class="flex justify-between">
                <span>大小:</span>
                <span>{{ model.size }}</span>
              </div>
              <div class="flex justify-between">
                <span>状态:</span>
                <a-tag :color="getStatusColor(model.status)" size="small">
                  {{ getStatusText(model.status) }}
                </a-tag>
              </div>
              <div class="flex justify-between">
                <span>创建时间:</span>
                <span>{{ formatDate(model.createdAt) }}</span>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="mt-4 flex space-x-2">
              <a-button size="small" @click="handlePreview(model)" class="flex-1">
                <icon-eye class="mr-1" />
                预览
              </a-button>
              <a-button size="small" @click="handleDownload(model)" class="flex-1">
                <icon-download class="mr-1" />
                下载
              </a-button>
              <a-dropdown>
                <a-button size="small">
                  <icon-more class="" />
                </a-button>
                <template #content>
                  <a-doption @click="handleEdit(model)">编辑</a-doption>
                  <a-doption @click="handleCopy(model)">复制</a-doption>
                  <a-doption class="text-red-500" @click="handleDelete(model)">删除</a-doption>
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
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconImage, IconEye, IconDownload, IconMore } from '@arco-design/web-vue/es/icon'

// 模拟数据
const mockModels = ref([
  {
    id: 'M001',
    name: '经典西装3D模型',
    type: '3d',
    size: '15.2MB',
    status: 'active',
    preview: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'M002',
    name: '丝绸材质贴图',
    type: 'texture',
    size: '8.5MB',
    status: 'active',
    preview: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'M003',
    name: '花卉图案设计',
    type: 'pattern',
    size: '3.2MB',
    status: 'processing',
    preview: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'M004',
    name: '休闲T恤3D模型',
    type: '3d',
    size: '12.8MB',
    status: 'active',
    preview: '',
    createdAt: new Date().toISOString()
  }
])

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 12,
  total: 48
})

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '3d': 'blue',
    'texture': 'green',
    'pattern': 'purple'
  }
  return colorMap[type] || 'gray'
}

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    '3d': '3D模型',
    'texture': '材质贴图',
    'pattern': '图案设计'
  }
  return textMap[type] || '未知'
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'green',
    processing: 'orange',
    inactive: 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '可用',
    processing: '处理中',
    inactive: '不可用'
  }
  return textMap[status] || '未知'
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// 上传模型
const handleUpload = () => {
  Message.info('上传模型功能')
}

// 预览模型
const handlePreview = (model: any) => {
  Message.info(`预览模型: ${model.name}`)
}

// 下载模型
const handleDownload = (model: any) => {
  Message.info(`下载模型: ${model.name}`)
}

// 编辑模型
const handleEdit = (model: any) => {
  Message.info(`编辑模型: ${model.name}`)
}

// 复制模型
const handleCopy = (model: any) => {
  Message.info(`复制模型: ${model.name}`)
}

// 删除模型
const handleDelete = (model: any) => {
  Message.warning(`删除模型: ${model.name}`)
}
</script>

<style scoped>
.ai-model {
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