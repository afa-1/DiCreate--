<template>
  <div class="ai-model-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">3D模型管理</h1>
      <p class="page-description">管理AI生成视频所需的3D模型资源</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="总模型数"
              :value="stats.totalModels"
              :value-style="{ color: '#3f8600' }"
            >
              <template #prefix>
                <Icon icon="mdi:cube-outline" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="可用模型"
              :value="stats.availableModels"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <Icon icon="mdi:check-circle-outline" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="处理中"
              :value="stats.processingModels"
              :value-style="{ color: '#faad14' }"
            >
              <template #prefix>
                <Icon icon="mdi:clock-outline" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="存储空间"
              :value="stats.storageUsed"
              suffix="GB"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <Icon icon="mdi:harddisk" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选搜索区 -->
    <a-card class="filter-card">
      <a-row :gutter="16" align="center">
        <a-col :span="6">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索模型名称、标签..."
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="filterCategory"
            placeholder="模型类别"
            style="width: 100%"
            @change="handleFilter"
          >
            <a-select-option value="">全部类别</a-select-option>
            <a-select-option value="character">角色模型</a-select-option>
            <a-select-option value="clothing">服装模型</a-select-option>
            <a-select-option value="accessory">配饰模型</a-select-option>
            <a-select-option value="scene">场景模型</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="filterStatus"
            placeholder="状态"
            style="width: 100%"
            @change="handleFilter"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="available">可用</a-select-option>
            <a-select-option value="processing">处理中</a-select-option>
            <a-select-option value="error">错误</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="sortBy"
            placeholder="排序方式"
            style="width: 100%"
            @change="handleSort"
          >
            <a-select-option value="createTime">创建时间</a-select-option>
            <a-select-option value="updateTime">更新时间</a-select-option>
            <a-select-option value="name">名称</a-select-option>
            <a-select-option value="size">文件大小</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" @click="showUploadModal = true">
              <Icon icon="mdi:upload" />
              上传模型
            </a-button>
            <a-button @click="handleBatchDelete" :disabled="selectedRowKeys.length === 0">
              <Icon icon="mdi:delete" />
              批量删除
            </a-button>
            <a-button @click="refreshData">
              <Icon icon="mdi:refresh" />
              刷新
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 模型列表 -->
    <a-card class="model-list-card">
      <a-table
        :columns="columns"
        :data-source="filteredModels"
        :row-selection="rowSelection"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'preview'">
            <div class="model-preview">
              <img
                :src="record.thumbnail"
                :alt="record.name"
                class="model-thumbnail"
                @click="previewModel(record)"
              />
            </div>
          </template>
          <template v-else-if="column.key === 'name'">
            <div class="model-info">
              <div class="model-name">{{ record.name }}</div>
              <div class="model-tags">
                <a-tag v-for="tag in record.tags" :key="tag" size="small">
                  {{ tag }}
                </a-tag>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'category'">
            <a-tag :color="getCategoryColor(record.category)">
              {{ getCategoryName(record.category) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge
              :status="getStatusBadge(record.status)"
              :text="getStatusText(record.status)"
            />
          </template>
          <template v-else-if="column.key === 'size'">
            {{ formatFileSize(record.size) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="text" size="small" @click="previewModel(record)">
                预览
              </a-button>
              <a-button type="text" size="small" @click="downloadModel(record)">
                下载
              </a-button>
              <a-button type="text" size="small" @click="editModel(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个模型吗？"
                @confirm="deleteModel(record.id)"
              >
                <a-button type="text" size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 上传模型模态框 -->
    <a-modal
      v-model:open="showUploadModal"
      title="上传3D模型"
      width="800px"
      @ok="handleUpload"
      @cancel="resetUploadForm"
    >
      <a-form :model="uploadForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="模型名称" required>
              <a-input v-model:value="uploadForm.name" placeholder="请输入模型名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="模型类别" required>
              <a-select v-model:value="uploadForm.category" placeholder="选择模型类别">
                <a-select-option value="character">角色模型</a-select-option>
                <a-select-option value="clothing">服装模型</a-select-option>
                <a-select-option value="accessory">配饰模型</a-select-option>
                <a-select-option value="scene">场景模型</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="模型描述">
          <a-textarea
            v-model:value="uploadForm.description"
            placeholder="请输入模型描述"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="标签">
          <a-select
            v-model:value="uploadForm.tags"
            mode="tags"
            placeholder="添加标签"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="模型文件" required>
          <a-upload-dragger
            v-model:file-list="uploadForm.files"
            :multiple="false"
            :before-upload="beforeUpload"
            accept=".obj,.fbx,.gltf,.glb"
          >
            <p class="ant-upload-drag-icon">
              <Icon icon="mdi:cube-outline" style="font-size: 48px" />
            </p>
            <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p class="ant-upload-hint">
              支持 OBJ、FBX、GLTF、GLB 格式，单个文件不超过 100MB
            </p>
          </a-upload-dragger>
        </a-form-item>
        <a-form-item label="缩略图">
          <a-upload
            v-model:file-list="uploadForm.thumbnails"
            list-type="picture-card"
            :before-upload="beforeUploadThumbnail"
            accept="image/*"
          >
            <div v-if="uploadForm.thumbnails.length < 1">
              <Icon icon="mdi:plus" />
              <div style="margin-top: 8px">上传缩略图</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 模型预览模态框 -->
    <a-modal
      v-model:open="showPreviewModal"
      title="模型预览"
      width="1000px"
      :footer="false"
    >
      <div v-if="previewModelData" class="model-preview-container">
        <div class="preview-area">
          <div class="model-viewer">
            <!-- 这里可以集成 Three.js 或其他 3D 查看器 -->
            <div class="viewer-placeholder">
              <Icon icon="mdi:cube-outline" style="font-size: 64px; color: #ccc" />
              <p>3D模型预览区域</p>
            </div>
          </div>
        </div>
        <div class="model-details">
          <h3>{{ previewModelData.name }}</h3>
          <p>{{ previewModelData.description }}</p>
          <a-descriptions :column="2" size="small">
            <a-descriptions-item label="类别">
              {{ getCategoryName(previewModelData.category) }}
            </a-descriptions-item>
            <a-descriptions-item label="文件大小">
              {{ formatFileSize(previewModelData.size) }}
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ previewModelData.format }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ previewModelData.createTime }}
            </a-descriptions-item>
          </a-descriptions>
          <div class="model-tags">
            <a-tag v-for="tag in previewModelData.tags" :key="tag">
              {{ tag }}
            </a-tag>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
// import { Icon } from '@iconify/vue'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const sortBy = ref('createTime')
const selectedRowKeys = ref<string[]>([])
const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const previewModelData = ref<any>(null)

// 统计数据
const stats = reactive({
  totalModels: 156,
  availableModels: 142,
  processingModels: 8,
  storageUsed: 45.6
})

// 上传表单
const uploadForm = reactive({
  name: '',
  category: '',
  description: '',
  tags: [],
  files: [],
  thumbnails: []
})

// 模型数据
const models = ref([
  {
    id: '1',
    name: '女性角色模型_01',
    category: 'character',
    status: 'available',
    size: 25600000,
    format: 'FBX',
    thumbnail: '/api/placeholder/100/100',
    tags: ['女性', '时尚', '年轻'],
    description: '适用于时尚服装展示的女性角色模型',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: '2',
    name: '男性角色模型_01',
    category: 'character',
    status: 'available',
    size: 28800000,
    format: 'OBJ',
    thumbnail: '/api/placeholder/100/100',
    tags: ['男性', '商务', '成熟'],
    description: '适用于商务服装展示的男性角色模型',
    createTime: '2024-01-14 15:20:00',
    updateTime: '2024-01-14 15:20:00'
  },
  {
    id: '3',
    name: '连衣裙模型_春季',
    category: 'clothing',
    status: 'processing',
    size: 15360000,
    format: 'GLTF',
    thumbnail: '/api/placeholder/100/100',
    tags: ['连衣裙', '春季', '清新'],
    description: '春季款连衣裙3D模型',
    createTime: '2024-01-13 09:15:00',
    updateTime: '2024-01-13 09:15:00'
  }
])

// 表格列配置
const columns = [
  {
    title: '预览',
    key: 'preview',
    width: 80,
    align: 'center'
  },
  {
    title: '模型信息',
    key: 'name',
    width: 200
  },
  {
    title: '类别',
    key: 'category',
    width: 100,
    align: 'center'
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center'
  },
  {
    title: '文件大小',
    key: 'size',
    width: 100,
    align: 'center'
  },
  {
    title: '格式',
    dataIndex: 'format',
    width: 80,
    align: 'center'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 150,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    align: 'center'
  }
]

// 行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  }
}

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 计算属性
const filteredModels = computed(() => {
  let result = [...models.value]
  
  if (searchKeyword.value) {
    result = result.filter(model => 
      model.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      model.tags.some(tag => tag.includes(searchKeyword.value))
    )
  }
  
  if (filterCategory.value) {
    result = result.filter(model => model.category === filterCategory.value)
  }
  
  if (filterStatus.value) {
    result = result.filter(model => model.status === filterStatus.value)
  }
  
  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        return b.size - a.size
      case 'updateTime':
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
      default:
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    }
  })
  
  pagination.total = result.length
  return result
})

// 方法
const handleSearch = () => {
  // 搜索逻辑
}

const handleFilter = () => {
  // 筛选逻辑
}

const handleSort = () => {
  // 排序逻辑
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const previewModel = (model: any) => {
  previewModelData.value = model
  showPreviewModal.value = true
}

const downloadModel = (model: any) => {
  // 下载模型逻辑
  console.log('下载模型:', model.name)
}

const editModel = (model: any) => {
  // 编辑模型逻辑
  console.log('编辑模型:', model.name)
}

const deleteModel = (id: string) => {
  // 删除模型逻辑
  console.log('删除模型:', id)
}

const handleBatchDelete = () => {
  // 批量删除逻辑
  console.log('批量删除:', selectedRowKeys.value)
}

const handleUpload = () => {
  // 上传模型逻辑
  console.log('上传模型:', uploadForm)
  showUploadModal.value = false
  resetUploadForm()
}

const resetUploadForm = () => {
  Object.assign(uploadForm, {
    name: '',
    category: '',
    description: '',
    tags: [],
    files: [],
    thumbnails: []
  })
}

const beforeUpload = (file: any) => {
  const isValidFormat = ['obj', 'fbx', 'gltf', 'glb'].includes(
    file.name.split('.').pop()?.toLowerCase()
  )
  if (!isValidFormat) {
    console.error('只支持 OBJ、FBX、GLTF、GLB 格式')
    return false
  }
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    console.error('文件大小不能超过 100MB')
    return false
  }
  return false // 阻止自动上传
}

const beforeUploadThumbnail = (file: any) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    console.error('只能上传图片文件')
    return false
  }
  return false // 阻止自动上传
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    character: 'blue',
    clothing: 'green',
    accessory: 'orange',
    scene: 'purple'
  }
  return colors[category] || 'default'
}

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    character: '角色模型',
    clothing: '服装模型',
    accessory: '配饰模型',
    scene: '场景模型'
  }
  return names[category] || category
}

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    available: 'success',
    processing: 'processing',
    error: 'error'
  }
  return badges[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    available: '可用',
    processing: '处理中',
    error: '错误'
  }
  return texts[status] || status
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.ai-model-management {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #262626;
}

.page-description {
  color: #8c8c8c;
  margin: 0;
}

.stats-cards {
  margin-bottom: 24px;
}

.filter-card {
  margin-bottom: 24px;
}

.model-list-card {
  background: #fff;
}

.model-preview {
  display: flex;
  justify-content: center;
  align-items: center;
}

.model-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.model-thumbnail:hover {
  transform: scale(1.1);
}

.model-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.model-name {
  font-weight: 500;
  color: #262626;
}

.model-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.model-preview-container {
  display: flex;
  gap: 24px;
  height: 500px;
}

.preview-area {
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.model-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.viewer-placeholder {
  text-align: center;
  color: #8c8c8c;
}

.model-details {
  width: 300px;
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
}

.model-details h3 {
  margin: 0 0 16px 0;
  color: #262626;
}

.model-details p {
  color: #595959;
  margin-bottom: 16px;
}

.model-details .model-tags {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .ai-model-management {
    padding: 16px;
  }
  
  .stats-cards .ant-col {
    margin-bottom: 16px;
  }
  
  .filter-card .ant-row .ant-col {
    margin-bottom: 8px;
  }
  
  .model-preview-container {
    flex-direction: column;
    height: auto;
  }
  
  .model-details {
    width: 100%;
  }
}
</style>