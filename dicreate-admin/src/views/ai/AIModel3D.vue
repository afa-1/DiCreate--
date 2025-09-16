<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">3D模型管理</h1>
        <p class="text-gray-600 mt-1">管理3D服装模型和展示效果</p>
      </div>
      <a-button type="primary" @click="showUploadModal = true">
        <template #icon><icon-plus /></template>
        上传模型
      </a-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <icon-desktop class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总模型数</p>
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
            <p class="text-sm font-medium text-gray-600">已发布</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.published }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <icon-loading class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">处理中</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.processing }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <icon-star class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">精品模型</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.featured }}</p>
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
            placeholder="模型名称"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.category"
            placeholder="模型分类"
            allow-clear
          >
            <a-option value="dress">连衣裙</a-option>
            <a-option value="shirt">衬衫</a-option>
            <a-option value="pants">裤装</a-option>
            <a-option value="coat">外套</a-option>
            <a-option value="suit">套装</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.status"
            placeholder="状态"
            allow-clear
          >
            <a-option value="processing">处理中</a-option>
            <a-option value="published">已发布</a-option>
            <a-option value="failed">处理失败</a-option>
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

    <!-- 模型网格 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="model in models" 
          :key="model.id"
          class="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <!-- 模型预览 -->
          <div class="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <div v-if="model.status === 'processing'" class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <icon-loading class="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p class="text-sm text-gray-500">处理中...</p>
              </div>
            </div>
            <div v-else-if="model.status === 'failed'" class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <icon-exclamation-circle class="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p class="text-sm text-red-500">处理失败</p>
              </div>
            </div>
            <div v-else class="w-full h-full flex items-center justify-center">
              <div class="text-center">
                <icon-desktop class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p class="text-sm text-gray-500">3D模型</p>
                <p class="text-xs text-gray-400">{{ model.fileSize }}</p>
              </div>
            </div>
            
            <div class="absolute top-2 right-2">
              <a-tag :color="getStatusColor(model.status)" size="small">
                {{ getStatusText(model.status) }}
              </a-tag>
            </div>
            
            <div v-if="model.featured" class="absolute top-2 left-2">
              <a-tag color="red" size="small">
                精品
              </a-tag>
            </div>
            
            <!-- 悬浮操作按钮 -->
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <a-space>
                <a-button 
                  v-if="model.status === 'published'"
                  type="primary" 
                  size="small" 
                  @click="preview3D(model)"
                >
                  <template #icon><icon-eye /></template>
                </a-button>
                <a-button size="small" @click="editModel(model)">
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-button 
                  v-if="model.status === 'published'"
                  size="small" 
                  @click="downloadModel(model)"
                >
                  <template #icon><icon-download /></template>
                </a-button>
                <a-button size="small" status="danger" @click="deleteModel(model.id)">
                  <template #icon><icon-delete /></template>
                </a-button>
              </a-space>
            </div>
          </div>
          
          <!-- 模型信息 -->
          <div class="p-4">
            <h3 class="font-medium text-gray-900 mb-1 truncate">{{ model.name }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ getCategoryText(model.category) }}</p>
            <div class="flex items-center justify-between text-xs text-gray-400">
              <span>{{ model.creator }}</span>
              <span>{{ model.createdAt }}</span>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <div class="flex items-center space-x-1">
                <icon-eye class="w-3 h-3 text-gray-400" />
                <span class="text-xs text-gray-400">{{ model.views }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <icon-download class="w-3 h-3 text-gray-400" />
                <span class="text-xs text-gray-400">{{ model.downloads }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="mt-6 flex justify-center">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="true"
          :show-total="true"
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </div>

    <!-- 上传模型弹窗 -->
    <a-modal
      v-model:visible="showUploadModal"
      title="上传3D模型"
      width="600px"
      @ok="handleUploadModel"
      @cancel="cancelUpload"
    >
      <a-form :model="modelForm" layout="vertical">
        <a-form-item field="name" label="模型名称">
          <a-input v-model="modelForm.name" placeholder="请输入模型名称" />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="category" label="模型分类">
              <a-select v-model="modelForm.category" placeholder="请选择分类">
                <a-option value="dress">连衣裙</a-option>
                <a-option value="shirt">衬衫</a-option>
                <a-option value="pants">裤装</a-option>
                <a-option value="coat">外套</a-option>
                <a-option value="suit">套装</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="creator" label="创建者">
              <a-input v-model="modelForm.creator" placeholder="请输入创建者" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="模型描述">
          <a-textarea
            v-model="modelForm.description"
            placeholder="请输入模型描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item field="tags" label="标签">
          <a-select 
            v-model="modelForm.tags" 
            placeholder="请选择或输入标签"
            multiple
            allow-create
          >
            <a-option value="时尚">时尚</a-option>
            <a-option value="经典">经典</a-option>
            <a-option value="休闲">休闲</a-option>
            <a-option value="正式">正式</a-option>
            <a-option value="创新">创新</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item field="featured" label="设置">
          <a-checkbox v-model="modelForm.featured">设为精品模型</a-checkbox>
        </a-form-item>
        
        <a-form-item field="file" label="模型文件">
          <a-upload
            :custom-request="handleFileUpload"
            :show-file-list="false"
            accept=".obj,.fbx,.gltf,.glb"
          >
            <template #upload-button>
              <div class="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 transition-colors">
                <div class="text-center">
                  <icon-plus class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p class="text-sm text-gray-500">点击上传3D模型文件</p>
                  <p class="text-xs text-gray-400">支持 OBJ, FBX, GLTF, GLB 格式</p>
                </div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 3D预览弹窗 -->
    <a-modal
      v-model:visible="show3DModal"
      :title="current3DModel?.name"
      width="800px"
      :footer="false"
    >
      <div v-if="current3DModel" class="space-y-4">
        <!-- 3D预览区域 -->
        <div class="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div class="text-center">
            <icon-desktop class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-lg font-medium text-gray-600">3D模型预览</p>
            <p class="text-sm text-gray-500">{{ current3DModel.name }}</p>
          </div>
        </div>
        
        <!-- 模型信息 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <h4 class="font-medium text-gray-900">基本信息</h4>
            <div class="text-sm space-y-1">
              <div class="flex justify-between">
                <span class="text-gray-600">分类：</span>
                <span>{{ getCategoryText(current3DModel.category) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">创建者：</span>
                <span>{{ current3DModel.creator }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">文件大小：</span>
                <span>{{ current3DModel.fileSize }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">创建时间：</span>
                <span>{{ current3DModel.createdAt }}</span>
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <h4 class="font-medium text-gray-900">统计信息</h4>
            <div class="text-sm space-y-1">
              <div class="flex justify-between">
                <span class="text-gray-600">浏览次数：</span>
                <span>{{ current3DModel.views }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">下载次数：</span>
                <span>{{ current3DModel.downloads }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">精品模型：</span>
                <span>{{ current3DModel.featured ? '是' : '否' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="current3DModel.description">
          <h4 class="font-medium text-gray-900 mb-2">模型描述</h4>
          <p class="text-sm text-gray-600">{{ current3DModel.description }}</p>
        </div>
        
        <div v-if="current3DModel.tags && current3DModel.tags.length > 0">
          <h4 class="font-medium text-gray-900 mb-2">标签</h4>
          <div class="flex flex-wrap gap-2">
            <a-tag v-for="tag in current3DModel.tags" :key="tag">
              {{ tag }}
            </a-tag>
          </div>
        </div>
      </div>
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
  IconDesktop, 
  IconCheckCircle, 
  IconLoading, 
  IconStar,
  IconEye,
  IconEdit,
  IconDownload,
  IconDelete,
  IconExclamationCircle
} from '@arco-design/web-vue/es/icon'

interface Model3D {
  id: string
  name: string
  category: string
  creator: string
  status: string
  fileSize: string
  description?: string
  tags?: string[]
  featured: boolean
  views: number
  downloads: number
  createdAt: string
}

const loading = ref(false)
const showUploadModal = ref(false)
const show3DModal = ref(false)
const current3DModel = ref<Model3D | null>(null)

const searchForm = reactive({
  name: '',
  category: '',
  status: ''
})

const modelForm = reactive({
  name: '',
  category: '',
  creator: '',
  description: '',
  tags: [],
  featured: false,
  file: null
})

const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0
})

// 统计数据
const stats = reactive({
  total: 89,
  published: 76,
  processing: 8,
  featured: 12
})

// 模拟3D模型数据
const models = ref<Model3D[]>([
  {
    id: '1',
    name: '优雅晚礼服3D模型',
    category: 'dress',
    creator: '张设计师',
    status: 'published',
    fileSize: '15.2 MB',
    description: '高端晚礼服的3D展示模型，细节丰富，材质逼真',
    tags: ['晚礼服', '优雅', '高端'],
    featured: true,
    views: 1245,
    downloads: 89,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: '商务西装3D模型',
    category: 'suit',
    creator: '李设计师',
    status: 'published',
    fileSize: '12.8 MB',
    description: '专业商务西装的3D模型，适合虚拟试衣展示',
    tags: ['西装', '商务', '正式'],
    featured: false,
    views: 892,
    downloads: 67,
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    name: '休闲T恤3D模型',
    category: 'shirt',
    creator: '王设计师',
    status: 'processing',
    fileSize: '8.5 MB',
    description: '日常休闲T恤的3D模型，正在处理中',
    tags: ['T恤', '休闲', '日常'],
    featured: false,
    views: 0,
    downloads: 0,
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    name: '牛仔裤3D模型',
    category: 'pants',
    creator: '陈设计师',
    status: 'failed',
    fileSize: '10.2 MB',
    description: '经典牛仔裤3D模型，处理失败需要重新上传',
    tags: ['牛仔裤', '经典', '休闲'],
    featured: false,
    views: 0,
    downloads: 0,
    createdAt: '2024-01-12'
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
    processing: 'orange',
    published: 'green',
    failed: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    processing: '处理中',
    published: '已发布',
    failed: '处理失败'
  }
  return textMap[status] || '未知'
}

const handleSearch = () => {
  pagination.current = 1
  loadModels()
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    category: '',
    status: ''
  })
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadModels()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadModels()
}

const loadModels = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = models.value.length
  } catch (error) {
    Message.error('加载模型列表失败')
  } finally {
    loading.value = false
  }
}

const preview3D = (model: Model3D) => {
  current3DModel.value = model
  show3DModal.value = true
}

const editModel = (model: Model3D) => {
  Message.info(`编辑模型: ${model.name}`)
}

const downloadModel = (model: Model3D) => {
  Message.info(`下载模型: ${model.name}`)
}

const deleteModel = (modelId: string) => {
  const model = models.value.find(m => m.id === modelId)
  if (!model) return
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除模型"${model.name}"吗？`,
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success('模型删除成功')
        loadModels()
      } catch (error) {
        Message.error('删除失败，请重试')
      }
    }
  })
}

const handleFileUpload = (option: any) => {
  // 模拟文件上传
  setTimeout(() => {
    modelForm.file = option.fileItem.file
    Message.success('文件上传成功')
  }, 1000)
}

const handleUploadModel = async () => {
  if (!modelForm.name.trim()) {
    Message.error('请输入模型名称')
    return
  }
  
  if (!modelForm.file) {
    Message.error('请选择模型文件')
    return
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    Message.success('模型上传成功，正在处理中')
    showUploadModal.value = false
    cancelUpload()
    loadModels()
  } catch (error) {
    Message.error('上传失败，请重试')
  }
}

const cancelUpload = () => {
  Object.assign(modelForm, {
    name: '',
    category: '',
    creator: '',
    description: '',
    tags: [],
    featured: false,
    file: null
  })
}

onMounted(() => {
  loadModels()
})
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>