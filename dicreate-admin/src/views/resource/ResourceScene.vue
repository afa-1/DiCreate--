<template>
  <div class="p-6">
    <!-- 页面标题 -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">场景素材</h1>
        <p class="text-gray-600 mt-1">管理背景场景、拍摄环境等场景素材资源</p>
      </div>
      <a-button type="primary" @click="showUploadModal = true">
        <template #icon><icon-plus /></template>
        上传场景
      </a-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model="searchForm.keyword"
            placeholder="搜索场景名称"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.category"
            placeholder="场景分类"
            allow-clear
          >
            <a-option value="indoor">室内场景</a-option>
            <a-option value="outdoor">室外场景</a-option>
            <a-option value="studio">摄影棚</a-option>
            <a-option value="street">街景</a-option>
            <a-option value="nature">自然风光</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.style"
            placeholder="风格类型"
            allow-clear
          >
            <a-option value="modern">现代</a-option>
            <a-option value="vintage">复古</a-option>
            <a-option value="minimalist">简约</a-option>
            <a-option value="luxury">奢华</a-option>
            <a-option value="casual">休闲</a-option>
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

    <!-- 场景网格 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="scene in scenes" 
          :key="scene.id"
          class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewScene(scene)"
        >
          <div class="aspect-video bg-gray-100 relative">
            <img 
              :src="scene.image" 
              :alt="scene.name"
              class="w-full h-full object-cover"
            />
            <div class="absolute top-2 right-2">
              <a-tag :color="getCategoryColor(scene.category)">
                {{ getCategoryLabel(scene.category) }}
              </a-tag>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-medium text-gray-900 mb-2">{{ scene.name }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ scene.description }}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <a-tag size="small">{{ getStyleLabel(scene.style) }}</a-tag>
                <span class="text-xs text-gray-400">{{ scene.resolution }}</span>
              </div>
              <a-dropdown>
                <a-button type="text" size="small">
                  <template #icon><icon-more /></template>
                </a-button>
                <template #content>
                  <a-doption @click="editScene(scene)">编辑</a-doption>
                  <a-doption @click="downloadScene(scene)">下载</a-doption>
                  <a-doption @click="deleteScene(scene.id)" class="text-red-500">删除</a-doption>
                </template>
              </a-dropdown>
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
          show-size-changer
          show-quick-jumper
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </div>

    <!-- 上传弹窗 -->
    <a-modal
      v-model:visible="showUploadModal"
      title="上传场景素材"
      width="600px"
      @ok="handleUpload"
      @cancel="cancelUpload"
    >
      <a-form :model="uploadForm" layout="vertical">
        <a-form-item field="name" label="场景名称">
          <a-input v-model="uploadForm.name" placeholder="请输入场景名称" />
        </a-form-item>
        
        <a-form-item field="category" label="场景分类">
          <a-select v-model="uploadForm.category" placeholder="请选择分类">
            <a-option value="indoor">室内场景</a-option>
            <a-option value="outdoor">室外场景</a-option>
            <a-option value="studio">摄影棚</a-option>
            <a-option value="street">街景</a-option>
            <a-option value="nature">自然风光</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item field="style" label="风格类型">
          <a-select v-model="uploadForm.style" placeholder="请选择风格">
            <a-option value="modern">现代</a-option>
            <a-option value="vintage">复古</a-option>
            <a-option value="minimalist">简约</a-option>
            <a-option value="luxury">奢华</a-option>
            <a-option value="casual">休闲</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item field="description" label="场景描述">
          <a-textarea
            v-model="uploadForm.description"
            placeholder="请输入场景描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item field="image" label="场景图片">
          <a-upload
            :file-list="fileList"
            :auto-upload="false"
            accept="image/*"
            @change="handleFileChange"
          >
            <template #upload-button>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <icon-image class="text-2xl text-gray-400 mb-2" />
                <div class="text-gray-600">点击上传或拖拽图片到此区域</div>
                <div class="text-sm text-gray-400 mt-1">支持 JPG, PNG 格式，建议尺寸 1920x1080</div>
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
import { Message } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconSearch, 
  IconRefresh, 
  IconMore,
  IconImage
} from '@arco-design/web-vue/es/icon'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  style: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 48
})

// 上传相关
const showUploadModal = ref(false)
const uploadForm = reactive({
  name: '',
  category: '',
  style: '',
  description: '',
  image: ''
})
const fileList = ref([])

// 场景数据
const scenes = ref([
  {
    id: 1,
    name: '现代办公室',
    category: 'indoor',
    style: 'modern',
    description: '简约现代的办公环境，适合商务服装拍摄',
    image: 'https://via.placeholder.com/400x300?text=现代办公室',
    resolution: '1920x1080',
    tags: ['办公', '现代', '简约']
  },
  {
    id: 2,
    name: '复古咖啡厅',
    category: 'indoor',
    style: 'vintage',
    description: '温馨复古的咖啡厅环境，适合休闲服装展示',
    image: 'https://via.placeholder.com/400x300?text=复古咖啡厅',
    resolution: '1920x1080',
    tags: ['咖啡厅', '复古', '温馨']
  },
  {
    id: 3,
    name: '城市街景',
    category: 'outdoor',
    style: 'modern',
    description: '繁华的城市街道，适合街头时尚拍摄',
    image: 'https://via.placeholder.com/400x300?text=城市街景',
    resolution: '1920x1080',
    tags: ['街景', '城市', '时尚']
  },
  {
    id: 4,
    name: '专业摄影棚',
    category: 'studio',
    style: 'minimalist',
    description: '专业的摄影棚环境，纯色背景',
    image: 'https://via.placeholder.com/400x300?text=摄影棚',
    resolution: '1920x1080',
    tags: ['摄影棚', '专业', '纯色']
  }
])

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    indoor: '室内',
    outdoor: '室外',
    studio: '摄影棚',
    street: '街景',
    nature: '自然'
  }
  return categoryMap[category] || category
}

// 获取分类颜色
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    indoor: 'blue',
    outdoor: 'green',
    studio: 'purple',
    street: 'orange',
    nature: 'cyan'
  }
  return colorMap[category] || 'gray'
}

// 获取风格标签
const getStyleLabel = (style: string) => {
  const styleMap: Record<string, string> = {
    modern: '现代',
    vintage: '复古',
    minimalist: '简约',
    luxury: '奢华',
    casual: '休闲'
  }
  return styleMap[style] || style
}

// 搜索
const handleSearch = () => {
  Message.info('搜索功能开发中...')
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    category: '',
    style: ''
  })
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
}

// 查看场景
const viewScene = (scene: any) => {
  Message.info(`查看场景: ${scene.name}`)
}

// 编辑场景
const editScene = (scene: any) => {
  Message.info(`编辑场景: ${scene.name}`)
}

// 下载场景
const downloadScene = (scene: any) => {
  Message.info(`下载场景: ${scene.name}`)
}

// 删除场景
const deleteScene = (id: number) => {
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
    style: '',
    description: '',
    image: ''
  })
  fileList.value = []
}

const handleFileChange = (files: any) => {
  fileList.value = files
}
</script>