<template>
  <div class="p-6">
    <!-- 页面标题 -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">视频素材</h1>
        <p class="text-gray-600 mt-1">管理AI生成视频、参考视频等视频素材资源</p>
      </div>
      <a-space>
        <a-button @click="router.push('/ai/video-generation')">
          <template #icon><icon-robot /></template>
          AI图生视频
        </a-button>
        <a-button type="primary" @click="showUploadModal = true">
          <template #icon><icon-plus /></template>
          上传视频
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
            <p class="text-sm text-gray-600">总视频数</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <icon-robot class="text-green-600 text-xl" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">AI生成</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.aiGenerated }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <icon-upload class="text-purple-600 text-xl" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">用户上传</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.uploaded }}</p>
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
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <a-row :gutter="16">
        <a-col :span="5">
          <a-input
            v-model="searchForm.keyword"
            placeholder="搜索视频名称"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.source"
            placeholder="视频来源"
            allow-clear
          >
            <a-option value="ai">AI生成</a-option>
            <a-option value="upload">用户上传</a-option>
            <a-option value="reference">参考视频</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.category"
            placeholder="视频分类"
            allow-clear
          >
            <a-option value="fashion">时尚展示</a-option>
            <a-option value="product">产品展示</a-option>
            <a-option value="lifestyle">生活方式</a-option>
            <a-option value="commercial">商业广告</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.status"
            placeholder="处理状态"
            allow-clear
          >
            <a-option value="completed">已完成</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="failed">处理失败</a-option>
          </a-select>
        </a-col>
        <a-col :span="7">
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

    <!-- 视频列表 -->
    <div class="bg-white rounded-lg shadow">
      <a-table
        :columns="columns"
        :data="videos"
        :pagination="pagination"
        :row-selection="{ type: 'checkbox', showCheckedAll: true }"
        v-model:selectedKeys="selectedRowKeys"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #thumbnail="{ record }">
          <div class="relative w-20 h-12 bg-gray-100 rounded overflow-hidden">
            <img 
              :src="record.thumbnail" 
              :alt="record.name"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <icon-play-arrow class="text-white text-lg" />
            </div>
          </div>
        </template>

        <template #name="{ record }">
          <div>
            <div class="font-medium text-gray-900">{{ record.name }}</div>
            <div class="text-sm text-gray-500">{{ record.description }}</div>
          </div>
        </template>

        <template #source="{ record }">
          <a-tag :color="getSourceColor(record.source)">
            {{ getSourceLabel(record.source) }}
          </a-tag>
        </template>

        <template #category="{ record }">
          <a-tag>{{ getCategoryLabel(record.category) }}</a-tag>
        </template>

        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusLabel(record.status) }}
          </a-tag>
        </template>

        <template #duration="{ record }">
          {{ formatDuration(record.duration) }}
        </template>

        <template #size="{ record }">
          {{ formatFileSize(record.size) }}
        </template>

        <template #createdAt="{ record }">
          {{ formatDate(record.createdAt) }}
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="previewVideo(record)">
              <template #icon><icon-eye /></template>
              预览
            </a-button>
            <a-button type="text" size="small" @click="downloadVideo(record)">
              <template #icon><icon-download /></template>
              下载
            </a-button>
            <a-button type="text" size="small" @click="editVideo(record)">
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-popconfirm
              content="确定要删除这个视频吗？"
              @ok="deleteVideo(record.id)"
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

    <!-- 上传弹窗 -->
    <a-modal
      v-model:visible="showUploadModal"
      title="上传视频素材"
      width="600px"
      @ok="handleUpload"
      @cancel="cancelUpload"
    >
      <a-form :model="uploadForm" layout="vertical">
        <a-form-item field="name" label="视频名称">
          <a-input v-model="uploadForm.name" placeholder="请输入视频名称" />
        </a-form-item>
        
        <a-form-item field="category" label="视频分类">
          <a-select v-model="uploadForm.category" placeholder="请选择分类">
            <a-option value="fashion">时尚展示</a-option>
            <a-option value="product">产品展示</a-option>
            <a-option value="lifestyle">生活方式</a-option>
            <a-option value="commercial">商业广告</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item field="description" label="视频描述">
          <a-textarea
            v-model="uploadForm.description"
            placeholder="请输入视频描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item field="video" label="视频文件">
          <a-upload
            :file-list="fileList"
            :auto-upload="false"
            accept="video/*"
            @change="handleFileChange"
          >
            <template #upload-button>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <icon-video-camera class="text-2xl text-gray-400 mb-2" />
                <div class="text-gray-600">点击上传或拖拽视频到此区域</div>
                <div class="text-sm text-gray-400 mt-1">支持 MP4, MOV, AVI 格式，最大 500MB</div>
              </div>
            </template>
          </a-upload>
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
  IconRobot,
  IconUpload,
  IconClockCircle,
  IconPlayArrow,
  IconEye,
  IconDownload,
  IconEdit
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 统计数据
const stats = reactive({
  total: 156,
  aiGenerated: 89,
  uploaded: 52,
  processing: 15
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  source: '',
  category: '',
  status: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 156,
  showTotal: true,
  showPageSize: true
})

// 选中的行
const selectedRowKeys = ref([])

// 上传相关
const showUploadModal = ref(false)
const uploadForm = reactive({
  name: '',
  category: '',
  description: '',
  video: ''
})
const fileList = ref([])

// 表格列定义
const columns = [
  {
    title: '缩略图',
    dataIndex: 'thumbnail',
    slotName: 'thumbnail',
    width: 100
  },
  {
    title: '视频信息',
    dataIndex: 'name',
    slotName: 'name',
    width: 250
  },
  {
    title: '来源',
    dataIndex: 'source',
    slotName: 'source',
    width: 100
  },
  {
    title: '分类',
    dataIndex: 'category',
    slotName: 'category',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '时长',
    dataIndex: 'duration',
    slotName: 'duration',
    width: 80
  },
  {
    title: '大小',
    dataIndex: 'size',
    slotName: 'size',
    width: 100
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

// 视频数据
const videos = ref([
  {
    id: 1,
    name: '时尚模特走秀',
    description: 'AI生成的时尚模特走秀视频',
    source: 'ai',
    category: 'fashion',
    status: 'completed',
    duration: 15,
    size: 25600000,
    thumbnail: 'https://via.placeholder.com/160x90?text=Video1',
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '产品展示视频',
    description: '服装产品360度展示',
    source: 'upload',
    category: 'product',
    status: 'completed',
    duration: 30,
    size: 45800000,
    thumbnail: 'https://via.placeholder.com/160x90?text=Video2',
    createdAt: '2024-01-14 15:20:00'
  },
  {
    id: 3,
    name: '生活方式短片',
    description: 'AI生成的生活方式展示',
    source: 'ai',
    category: 'lifestyle',
    status: 'processing',
    duration: 20,
    size: 32400000,
    thumbnail: 'https://via.placeholder.com/160x90?text=Video3',
    createdAt: '2024-01-13 09:15:00'
  }
])

// 获取来源标签和颜色
const getSourceLabel = (source: string) => {
  const sourceMap: Record<string, string> = {
    ai: 'AI生成',
    upload: '用户上传',
    reference: '参考视频'
  }
  return sourceMap[source] || source
}

const getSourceColor = (source: string) => {
  const colorMap: Record<string, string> = {
    ai: 'blue',
    upload: 'green',
    reference: 'orange'
  }
  return colorMap[source] || 'gray'
}

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
    failed: '处理失败'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    completed: 'green',
    processing: 'blue',
    failed: 'red'
  }
  return colorMap[status] || 'gray'
}

// 格式化时长
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
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
    source: '',
    category: '',
    status: ''
  })
}

// 批量删除
const handleBatchDelete = () => {
  Message.success(`删除了 ${selectedRowKeys.value.length} 个视频`)
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

// 视频操作
const previewVideo = (video: any) => {
  Message.info(`预览视频: ${video.name}`)
}

const downloadVideo = (video: any) => {
  Message.info(`下载视频: ${video.name}`)
}

const editVideo = (video: any) => {
  Message.info(`编辑视频: ${video.name}`)
}

const deleteVideo = (id: number) => {
  Message.success('删除成功')
}

// 上传处理
const handleUpload = () => {
  Message.success('上传成功')
  showUploadModal.value = false
  resetUploadForm()
}

const cancelUpload = () => {
  resetUploadForm()
}

const resetUploadForm = () => {
  Object.assign(uploadForm, {
    name: '',
    category: '',
    description: '',
    video: ''
  })
  fileList.value = []
}

const handleFileChange = (files: any) => {
  fileList.value = files
}
</script>