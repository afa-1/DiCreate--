<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">案例库</h1>
        <p class="text-gray-600 mt-1">管理设计案例和参考资料</p>
      </div>
      <a-button type="primary" @click="showUploadModal = true">
        <template #icon><icon-plus /></template>
        上传案例
      </a-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <icon-image class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总案例数</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <icon-heart class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">热门案例</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.popular }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <icon-star class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">精选案例</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.featured }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-orange-100 text-orange-600">
            <icon-tag class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">分类数量</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.categories }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-input
            v-model="searchForm.title"
            placeholder="案例标题"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.category"
            placeholder="案例分类"
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
            v-model="searchForm.style"
            placeholder="风格类型"
            allow-clear
          >
            <a-option value="casual">休闲</a-option>
            <a-option value="formal">正式</a-option>
            <a-option value="vintage">复古</a-option>
            <a-option value="modern">现代</a-option>
            <a-option value="bohemian">波西米亚</a-option>
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

    <!-- 案例网格 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="caseItem in cases" 
          :key="caseItem.id"
          class="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <!-- 案例图片 -->
          <div class="aspect-[3/4] relative overflow-hidden">
            <img 
              :src="caseItem.image" 
              :alt="caseItem.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute top-2 left-2">
              <a-tag v-if="caseItem.featured" color="red" size="small">
                精选
              </a-tag>
            </div>
            <div class="absolute top-2 right-2">
              <div class="flex items-center space-x-1 bg-black bg-opacity-50 rounded px-2 py-1">
                <icon-heart class="w-3 h-3 text-white" />
                <span class="text-xs text-white">{{ caseItem.likes }}</span>
              </div>
            </div>
            <!-- 悬浮操作按钮 -->
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <a-space>
                <a-button type="primary" size="small" @click="viewCase(caseItem)">
                  <template #icon><icon-eye /></template>
                </a-button>
                <a-button size="small" @click="editCase(caseItem)">
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-button size="small" status="danger" @click="deleteCase(caseItem.id)">
                  <template #icon><icon-delete /></template>
                </a-button>
              </a-space>
            </div>
          </div>
          
          <!-- 案例信息 -->
          <div class="p-4">
            <h3 class="font-medium text-gray-900 mb-1 truncate">{{ caseItem.title }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ getCategoryText(caseItem.category) }} · {{ getStyleText(caseItem.style) }}</p>
            <div class="flex items-center justify-between text-xs text-gray-400">
              <span>{{ caseItem.designer }}</span>
              <span>{{ caseItem.createdAt }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              <a-tag v-for="tag in caseItem.tags.slice(0, 2)" :key="tag" size="mini">
                {{ tag }}
              </a-tag>
              <a-tag v-if="caseItem.tags.length > 2" size="mini" color="gray">
                +{{ caseItem.tags.length - 2 }}
              </a-tag>
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

    <!-- 上传案例弹窗 -->
    <a-modal
      v-model:visible="showUploadModal"
      title="上传案例"
      width="600px"
      @ok="handleUploadCase"
      @cancel="cancelUpload"
    >
      <a-form :model="caseForm" layout="vertical">
        <a-form-item field="title" label="案例标题">
          <a-input v-model="caseForm.title" placeholder="请输入案例标题" />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="category" label="案例分类">
              <a-select v-model="caseForm.category" placeholder="请选择分类">
                <a-option value="dress">连衣裙</a-option>
                <a-option value="shirt">衬衫</a-option>
                <a-option value="pants">裤装</a-option>
                <a-option value="coat">外套</a-option>
                <a-option value="suit">套装</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="style" label="风格类型">
              <a-select v-model="caseForm.style" placeholder="请选择风格">
                <a-option value="casual">休闲</a-option>
                <a-option value="formal">正式</a-option>
                <a-option value="vintage">复古</a-option>
                <a-option value="modern">现代</a-option>
                <a-option value="bohemian">波西米亚</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="designer" label="设计师">
          <a-input v-model="caseForm.designer" placeholder="请输入设计师姓名" />
        </a-form-item>
        
        <a-form-item field="tags" label="标签">
          <a-select 
            v-model="caseForm.tags" 
            placeholder="请选择或输入标签"
            multiple
            allow-create
          >
            <a-option value="时尚">时尚</a-option>
            <a-option value="优雅">优雅</a-option>
            <a-option value="简约">简约</a-option>
            <a-option value="个性">个性</a-option>
            <a-option value="经典">经典</a-option>
            <a-option value="创新">创新</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item field="description" label="案例描述">
          <a-textarea
            v-model="caseForm.description"
            placeholder="请输入案例描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item field="featured" label="设置">
          <a-checkbox v-model="caseForm.featured">设为精选案例</a-checkbox>
        </a-form-item>
        
        <a-form-item field="image" label="案例图片">
          <a-upload
            :custom-request="handleImageUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <template #upload-button>
              <div class="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 transition-colors">
                <div class="text-center">
                  <icon-plus class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p class="text-sm text-gray-500">点击上传图片</p>
                </div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 案例详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      :title="currentCase?.title"
      width="800px"
      :footer="false"
    >
      <div v-if="currentCase" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img 
              :src="currentCase.image" 
              :alt="currentCase.title"
              class="w-full rounded-lg"
            />
          </div>
          <div class="space-y-4">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">基本信息</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">案例分类：</span>
                  <span>{{ getCategoryText(currentCase.category) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">风格类型：</span>
                  <span>{{ getStyleText(currentCase.style) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">设计师：</span>
                  <span>{{ currentCase.designer }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">喜欢数：</span>
                  <span>{{ currentCase.likes }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">上传时间：</span>
                  <span>{{ currentCase.createdAt }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">精选案例：</span>
                  <a-tag v-if="currentCase.featured" color="red" size="small">是</a-tag>
                  <span v-else class="text-gray-400">否</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">标签</h4>
              <div class="flex flex-wrap gap-2">
                <a-tag v-for="tag in currentCase.tags" :key="tag">
                  {{ tag }}
                </a-tag>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">案例描述</h4>
              <p class="text-sm text-gray-600">{{ currentCase.description }}</p>
            </div>
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
  IconImage, 
  IconHeart, 
  IconStar,
  IconTag,
  IconEye,
  IconEdit,
  IconDelete
} from '@arco-design/web-vue/es/icon'

interface Case {
  id: string
  title: string
  category: string
  style: string
  designer: string
  image: string
  tags: string[]
  description: string
  likes: number
  featured: boolean
  createdAt: string
}

const loading = ref(false)
const showUploadModal = ref(false)
const showDetailModal = ref(false)
const currentCase = ref<Case | null>(null)

const searchForm = reactive({
  title: '',
  category: '',
  style: ''
})

const caseForm = reactive({
  title: '',
  category: '',
  style: '',
  designer: '',
  tags: [],
  description: '',
  featured: false,
  image: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0
})

// 统计数据
const stats = reactive({
  total: 856,
  popular: 124,
  featured: 45,
  categories: 8
})

// 模拟案例数据
const cases = ref<Case[]>([
  {
    id: '1',
    title: '优雅职场连衣裙',
    category: 'dress',
    style: 'formal',
    designer: '张设计师',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    tags: ['职场', '优雅', '简约'],
    description: '适合职场女性的优雅连衣裙设计，简约而不失时尚感',
    likes: 245,
    featured: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: '休闲牛仔外套',
    category: 'coat',
    style: 'casual',
    designer: '李设计师',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop',
    tags: ['休闲', '牛仔', '百搭'],
    description: '经典牛仔外套设计，适合日常休闲穿搭',
    likes: 189,
    featured: false,
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    title: '复古风衬衫',
    category: 'shirt',
    style: 'vintage',
    designer: '王设计师',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop',
    tags: ['复古', '文艺', '个性'],
    description: '融合复古元素的现代衬衫设计，展现独特个性',
    likes: 156,
    featured: true,
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    title: '现代简约套装',
    category: 'suit',
    style: 'modern',
    designer: '陈设计师',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    tags: ['现代', '简约', '商务'],
    description: '现代简约风格的商务套装，线条流畅，剪裁精良',
    likes: 203,
    featured: false,
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

const getStyleText = (style: string) => {
  const styleMap: Record<string, string> = {
    casual: '休闲',
    formal: '正式',
    vintage: '复古',
    modern: '现代',
    bohemian: '波西米亚'
  }
  return styleMap[style] || style
}

const handleSearch = () => {
  pagination.current = 1
  loadCases()
}

const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    category: '',
    style: ''
  })
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadCases()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadCases()
}

const loadCases = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = cases.value.length
  } catch (error) {
    Message.error('加载案例列表失败')
  } finally {
    loading.value = false
  }
}

const viewCase = (caseItem: Case) => {
  currentCase.value = caseItem
  showDetailModal.value = true
}

const editCase = (caseItem: Case) => {
  Message.info(`编辑案例: ${caseItem.title}`)
}

const deleteCase = (caseId: string) => {
  const caseItem = cases.value.find(c => c.id === caseId)
  if (!caseItem) return
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除案例"${caseItem.title}"吗？`,
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success('案例删除成功')
        loadCases()
      } catch (error) {
        Message.error('删除失败，请重试')
      }
    }
  })
}

const handleImageUpload = (option: any) => {
  // 模拟图片上传
  setTimeout(() => {
    caseForm.image = 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop'
    Message.success('图片上传成功')
  }, 1000)
}

const handleUploadCase = async () => {
  if (!caseForm.title.trim()) {
    Message.error('请输入案例标题')
    return
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('案例上传成功')
    showUploadModal.value = false
    cancelUpload()
    loadCases()
  } catch (error) {
    Message.error('上传失败，请重试')
  }
}

const cancelUpload = () => {
  Object.assign(caseForm, {
    title: '',
    category: '',
    style: '',
    designer: '',
    tags: [],
    description: '',
    featured: false,
    image: ''
  })
}

onMounted(() => {
  loadCases()
})
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>