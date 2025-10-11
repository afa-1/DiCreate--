<template>
  <div class="p-6">
    <!-- 页面标题 -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">AI图生视频</h1>
        <p class="text-gray-600 mt-1">通过AI技术将静态图片转换为动态视频</p>
      </div>
      <a-space>
        <a-button @click="router.push('/resource/video')">
          <template #icon><icon-video-camera /></template>
          视频素材库
        </a-button>
        <a-button type="primary" @click="showCreateModal = true">
          <template #icon><icon-plus /></template>
          新建项目
        </a-button>
      </a-space>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <icon-video-camera class="text-blue-600 text-xl" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">总项目数</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <icon-check-circle class="text-green-600 text-xl" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">已完成</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.completed }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-2 bg-orange-100 rounded-lg">
            <icon-clock-circle class="text-orange-600 text-xl" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">处理中</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.processing }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <icon-close-circle class="text-red-600 text-xl" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">失败</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.failed }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model="searchForm.keyword"
            placeholder="搜索项目名称"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.status"
            placeholder="项目状态"
            allow-clear
          >
            <a-option value="completed">已完成</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="failed">失败</a-option>
            <a-option value="draft">草稿</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.category"
            placeholder="项目分类"
            allow-clear
          >
            <a-option value="fashion">时尚展示</a-option>
            <a-option value="product">产品展示</a-option>
            <a-option value="lifestyle">生活方式</a-option>
            <a-option value="commercial">商业广告</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-range-picker
            v-model="searchForm.dateRange"
            placeholder="创建时间"
            style="width: 100%"
          />
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
            <a-button @click="handleBatchDelete" :disabled="selectedRowKeys.length === 0">
              <template #icon><icon-delete /></template>
              批量删除
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 项目列表 -->
    <div class="bg-white rounded-lg shadow">
      <a-table
        :columns="columns"
        :data="projects"
        :pagination="pagination"
        :row-selection="{ type: 'checkbox', showCheckedAll: true }"
        v-model:selectedKeys="selectedRowKeys"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #thumbnail="{ record }">
          <div class="flex space-x-2">
            <div class="w-16 h-12 bg-gray-100 rounded overflow-hidden">
              <img 
                :src="record.sourceImage" 
                :alt="record.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="w-16 h-12 bg-gray-100 rounded overflow-hidden relative">
              <img 
                v-if="record.resultVideo"
                :src="record.resultThumbnail" 
                :alt="record.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <icon-loading v-if="record.status === 'processing'" class="text-gray-400 animate-spin" />
                <icon-close v-else-if="record.status === 'failed'" class="text-red-400" />
                <icon-image v-else class="text-gray-400" />
              </div>
              <div v-if="record.resultVideo" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <icon-play-arrow class="text-white text-sm" />
              </div>
            </div>
          </div>
        </template>

        <template #name="{ record }">
          <div>
            <div class="font-medium text-gray-900">{{ record.name }}</div>
            <div class="text-sm text-gray-500">{{ record.description }}</div>
          </div>
        </template>

        <template #category="{ record }">
          <a-tag>{{ getCategoryLabel(record.category) }}</a-tag>
        </template>

        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusLabel(record.status) }}
          </a-tag>
        </template>

        <template #progress="{ record }">
          <div v-if="record.status === 'processing'" class="w-full">
            <a-progress :percent="record.progress" size="small" />
            <div class="text-xs text-gray-500 mt-1">{{ record.progressText }}</div>
          </div>
          <span v-else-if="record.status === 'completed'" class="text-green-600 text-sm">
            <icon-check class="mr-1" />完成
          </span>
          <span v-else-if="record.status === 'failed'" class="text-red-600 text-sm">
            <icon-close class="mr-1" />失败
          </span>
          <span v-else class="text-gray-500 text-sm">-</span>
        </template>

        <template #duration="{ record }">
          {{ record.duration ? formatDuration(record.duration) : '-' }}
        </template>

        <template #createdAt="{ record }">
          {{ formatDate(record.createdAt) }}
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button 
              type="text" 
              size="small" 
              @click="editProject(record)"
              :disabled="record.status === 'processing'"
            >
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-button 
              v-if="record.status === 'completed'" 
              type="text" 
              size="small" 
              @click="previewVideo(record)"
            >
              <template #icon><icon-eye /></template>
              预览
            </a-button>
            <a-button 
              v-if="record.status === 'completed'" 
              type="text" 
              size="small" 
              @click="downloadVideo(record)"
            >
              <template #icon><icon-download /></template>
              下载
            </a-button>
            <a-button 
              v-if="record.status === 'failed'" 
              type="text" 
              size="small" 
              @click="retryGeneration(record)"
            >
              <template #icon><icon-refresh /></template>
              重试
            </a-button>
            <a-popconfirm
              content="确定要删除这个项目吗？"
              @ok="deleteProject(record.id)"
            >
              <a-button type="text" size="small" status="danger">
                <template #icon><icon-delete /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 新建项目弹窗 -->
    <a-modal
      v-model:visible="showCreateModal"
      title="新建AI图生视频项目"
      width="800px"
      @ok="handleCreateProject"
      @cancel="cancelCreate"
    >
      <a-form :model="createForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" label="项目名称">
              <a-input v-model="createForm.name" placeholder="请输入项目名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="category" label="项目分类">
              <a-select v-model="createForm.category" placeholder="请选择分类">
                <a-option value="fashion">时尚展示</a-option>
                <a-option value="product">产品展示</a-option>
                <a-option value="lifestyle">生活方式</a-option>
                <a-option value="commercial">商业广告</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="项目描述">
          <a-textarea
            v-model="createForm.description"
            placeholder="请输入项目描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item field="sourceImage" label="源图片">
          <a-upload
            :file-list="sourceFileList"
            :auto-upload="false"
            accept="image/*"
            :limit="1"
            @change="handleSourceFileChange"
          >
            <template #upload-button>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <icon-image class="text-2xl text-gray-400 mb-2" />
                <div class="text-gray-600">点击上传或拖拽图片到此区域</div>
                <div class="text-sm text-gray-400 mt-1">支持 JPG, PNG 格式，建议尺寸 1024x1024</div>
              </div>
            </template>
          </a-upload>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="duration" label="视频时长（秒）">
              <a-input-number 
                v-model="createForm.duration" 
                :min="5" 
                :max="30" 
                placeholder="5-30秒"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="fps" label="帧率">
              <a-select v-model="createForm.fps" placeholder="选择帧率">
                <a-option :value="24">24 FPS</a-option>
                <a-option :value="30">30 FPS</a-option>
                <a-option :value="60">60 FPS</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="prompt" label="生成提示词">
          <a-textarea
            v-model="createForm.prompt"
            placeholder="描述您希望生成的视频效果，例如：模特缓慢转身展示服装细节"
            :rows="4"
          />
        </a-form-item>

        <a-form-item field="style" label="视频风格">
          <a-select v-model="createForm.style" placeholder="选择视频风格">
            <a-option value="natural">自然真实</a-option>
            <a-option value="cinematic">电影质感</a-option>
            <a-option value="fashion">时尚大片</a-option>
            <a-option value="commercial">商业广告</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconSearch, 
  IconRefresh, 
  IconDelete,
  IconVideoCamera,
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle,
  IconPlayArrow,
  IconEye,
  IconDownload,
  IconEdit,
  IconImage,
  IconLoading,
  IconClose,
  IconCheck
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 统计数据
const stats = reactive({
  total: 45,
  completed: 28,
  processing: 12,
  failed: 5
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  category: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 45,
  showTotal: true,
  showPageSize: true
})

// 选中的行
const selectedRowKeys = ref([])

// 新建项目相关
const showCreateModal = ref(false)
const createForm = reactive({
  name: '',
  category: '',
  description: '',
  sourceImage: '',
  duration: 15,
  fps: 30,
  prompt: '',
  style: 'natural'
})
const sourceFileList = ref([])

// 表格列定义
const columns = [
  {
    title: '预览',
    dataIndex: 'thumbnail',
    slotName: 'thumbnail',
    width: 150
  },
  {
    title: '项目信息',
    dataIndex: 'name',
    slotName: 'name',
    width: 200
  },
  {
    title: '分类',
    dataIndex: 'category',
    slotName: 'category',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '进度',
    dataIndex: 'progress',
    slotName: 'progress',
    width: 150
  },
  {
    title: '时长',
    dataIndex: 'duration',
    slotName: 'duration',
    width: 80
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    slotName: 'createdAt',
    width: 150
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 项目数据
const projects = ref([
  {
    id: 1,
    name: '春季新品展示',
    description: '春季服装新品的动态展示视频',
    category: 'fashion',
    status: 'completed',
    progress: 100,
    progressText: '生成完成',
    duration: 15,
    sourceImage: 'https://via.placeholder.com/400x400?text=Source',
    resultVideo: 'https://via.placeholder.com/400x300?text=Video',
    resultThumbnail: 'https://via.placeholder.com/400x300?text=Result',
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '产品360度展示',
    description: '产品多角度动态展示',
    category: 'product',
    status: 'processing',
    progress: 65,
    progressText: '正在生成视频...',
    duration: 20,
    sourceImage: 'https://via.placeholder.com/400x400?text=Source2',
    resultVideo: null,
    resultThumbnail: null,
    createdAt: '2024-01-14 15:20:00'
  },
  {
    id: 3,
    name: '生活方式短片',
    description: '展示生活方式的短视频',
    category: 'lifestyle',
    status: 'failed',
    progress: 0,
    progressText: '生成失败',
    duration: 10,
    sourceImage: 'https://via.placeholder.com/400x400?text=Source3',
    resultVideo: null,
    resultThumbnail: null,
    createdAt: '2024-01-13 09:15:00'
  }
])

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    fashion: '时尚展示',
    product: '产品展示',
    lifestyle: '生活方式',
    commercial: '商业广告'
  }
  return categoryMap[category] || category
}

// 获取状态标签和颜色
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: '已完成',
    processing: '处理中',
    failed: '失败',
    draft: '草稿'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    completed: 'green',
    processing: 'blue',
    failed: 'red',
    draft: 'gray'
  }
  return colorMap[status] || 'gray'
}

// 格式化时长
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 搜索
const handleSearch = () => {
  Message.info('搜索功能开发中...')
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: '',
    category: '',
    dateRange: []
  })
}

// 批量删除
const handleBatchDelete = () => {
  Message.success(`删除了 ${selectedRowKeys.value.length} 个项目`)
  selectedRowKeys.value = []
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
}

// 项目操作
const editProject = (project: any) => {
  Message.info(`编辑项目: ${project.name}`)
}

const previewVideo = (project: any) => {
  Message.info(`预览视频: ${project.name}`)
}

const downloadVideo = (project: any) => {
  Message.info(`下载视频: ${project.name}`)
}

const retryGeneration = (project: any) => {
  Message.info(`重新生成: ${project.name}`)
}

const deleteProject = (id: number) => {
  Message.success('删除成功')
}

// 新建项目处理
const handleCreateProject = () => {
  Message.success('项目创建成功，开始生成视频...')
  showCreateModal.value = false
  resetCreateForm()
}

const cancelCreate = () => {
  resetCreateForm()
}

const resetCreateForm = () => {
  Object.assign(createForm, {
    name: '',
    category: '',
    description: '',
    sourceImage: '',
    duration: 15,
    fps: 30,
    prompt: '',
    style: 'natural'
  })
  sourceFileList.value = []
}

const handleSourceFileChange = (files: any) => {
  sourceFileList.value = files
}
</script>