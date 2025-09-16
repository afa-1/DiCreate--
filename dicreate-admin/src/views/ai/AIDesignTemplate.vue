<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">设计模板</h1>
        <p class="text-gray-600 mt-1">管理AI设计模板和参数配置</p>
      </div>
      <a-button type="primary" @click="showCreateModal = true">
        <template #icon><icon-plus /></template>
        创建模板
      </a-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <icon-file class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总模板数</p>
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
            <icon-edit class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">草稿</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.draft }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <icon-star class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">热门模板</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.popular }}</p>
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
            placeholder="模板名称"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.category"
            placeholder="模板分类"
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
            <a-option value="draft">草稿</a-option>
            <a-option value="published">已发布</a-option>
            <a-option value="archived">已归档</a-option>
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

    <!-- 模板列表 -->
    <div class="bg-white rounded-lg shadow">
      <a-table
        :columns="columns"
        :data="templates"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #preview="{ record }">
          <div class="flex items-center space-x-3">
            <img 
              :src="record.preview" 
              :alt="record.name"
              class="w-12 h-12 rounded object-cover"
            />
            <div>
              <p class="font-medium text-gray-900">{{ record.name }}</p>
              <p class="text-sm text-gray-500">{{ getCategoryText(record.category) }}</p>
            </div>
          </div>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #usage="{ record }">
          <div class="text-center">
            <p class="font-medium text-gray-900">{{ record.usage }}</p>
            <p class="text-xs text-gray-500">次使用</p>
          </div>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="viewTemplate(record)">
              <template #icon><icon-eye /></template>
            </a-button>
            <a-button size="small" @click="editTemplate(record)">
              <template #icon><icon-edit /></template>
            </a-button>
            <a-button size="small" @click="copyTemplate(record)">
              <template #icon><icon-copy /></template>
            </a-button>
            <a-button 
              size="small" 
              status="danger" 
              @click="deleteTemplate(record.id)"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 创建模板弹窗 -->
    <a-modal
      v-model:visible="showCreateModal"
      title="创建设计模板"
      width="800px"
      @ok="handleCreateTemplate"
      @cancel="cancelCreate"
    >
      <a-form :model="templateForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" label="模板名称">
              <a-input v-model="templateForm.name" placeholder="请输入模板名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="category" label="模板分类">
              <a-select v-model="templateForm.category" placeholder="请选择分类">
                <a-option value="dress">连衣裙</a-option>
                <a-option value="shirt">衬衫</a-option>
                <a-option value="pants">裤装</a-option>
                <a-option value="coat">外套</a-option>
                <a-option value="suit">套装</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="模板描述">
          <a-textarea
            v-model="templateForm.description"
            placeholder="请输入模板描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item field="parameters" label="设计参数">
          <div class="space-y-4">
            <div v-for="(param, index) in templateForm.parameters" :key="index" class="flex items-center space-x-2">
              <a-input 
                v-model="param.name" 
                placeholder="参数名称" 
                class="flex-1"
              />
              <a-select 
                v-model="param.type" 
                placeholder="参数类型"
                class="w-32"
              >
                <a-option value="text">文本</a-option>
                <a-option value="number">数字</a-option>
                <a-option value="select">选择</a-option>
                <a-option value="color">颜色</a-option>
              </a-select>
              <a-input 
                v-model="param.defaultValue" 
                placeholder="默认值" 
                class="flex-1"
              />
              <a-button 
                size="small" 
                status="danger" 
                @click="removeParameter(index)"
              >
                <template #icon><icon-delete /></template>
              </a-button>
            </div>
            <a-button @click="addParameter" class="w-full" type="dashed">
              <template #icon><icon-plus /></template>
              添加参数
            </a-button>
          </div>
        </a-form-item>
        
        <a-form-item field="preview" label="预览图片">
          <a-upload
            :custom-request="handleImageUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <template #upload-button>
              <div class="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 transition-colors">
                <div class="text-center">
                  <icon-plus class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p class="text-sm text-gray-500">点击上传预览图</p>
                </div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 模板详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      :title="currentTemplate?.name"
      width="900px"
      :footer="false"
    >
      <div v-if="currentTemplate" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img 
              :src="currentTemplate.preview" 
              :alt="currentTemplate.name"
              class="w-full rounded-lg"
            />
          </div>
          <div class="space-y-4">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">基本信息</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">模板分类：</span>
                  <span>{{ getCategoryText(currentTemplate.category) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">状态：</span>
                  <a-tag :color="getStatusColor(currentTemplate.status)">
                    {{ getStatusText(currentTemplate.status) }}
                  </a-tag>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">使用次数：</span>
                  <span>{{ currentTemplate.usage }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">创建时间：</span>
                  <span>{{ currentTemplate.createdAt }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">更新时间：</span>
                  <span>{{ currentTemplate.updatedAt }}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">模板描述</h4>
              <p class="text-sm text-gray-600">{{ currentTemplate.description }}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-900 mb-3">设计参数</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="param in currentTemplate.parameters" 
              :key="param.name"
              class="bg-gray-50 rounded-lg p-4"
            >
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium text-gray-900">{{ param.name }}</span>
                <a-tag size="small">{{ param.type }}</a-tag>
              </div>
              <p class="text-sm text-gray-600">默认值: {{ param.defaultValue }}</p>
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
  IconFile, 
  IconCheckCircle, 
  IconEdit, 
  IconStar,
  IconEye,
  IconCopy,
  IconDelete
} from '@arco-design/web-vue/es/icon'

interface TemplateParameter {
  name: string
  type: string
  defaultValue: string
}

interface Template {
  id: string
  name: string
  category: string
  description: string
  status: string
  preview: string
  usage: number
  parameters: TemplateParameter[]
  createdAt: string
  updatedAt: string
}

const loading = ref(false)
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const currentTemplate = ref<Template | null>(null)

const searchForm = reactive({
  name: '',
  category: '',
  status: ''
})

const templateForm = reactive({
  name: '',
  category: '',
  description: '',
  parameters: [{ name: '', type: 'text', defaultValue: '' }],
  preview: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showSizeChanger: true
})

// 统计数据
const stats = reactive({
  total: 156,
  published: 128,
  draft: 24,
  popular: 18
})

// 表格列配置
const columns = [
  {
    title: '模板信息',
    slotName: 'preview',
    width: 250
  },
  {
    title: '状态',
    slotName: 'status',
    width: 100
  },
  {
    title: '使用次数',
    slotName: 'usage',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 120
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 120
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 模拟模板数据
const templates = ref<Template[]>([
  {
    id: '1',
    name: '经典连衣裙模板',
    category: 'dress',
    description: '适合各种场合的经典连衣裙设计模板',
    status: 'published',
    preview: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop',
    usage: 245,
    parameters: [
      { name: '裙长', type: 'select', defaultValue: '膝盖长度' },
      { name: '袖型', type: 'select', defaultValue: '短袖' },
      { name: '颜色', type: 'color', defaultValue: '#000000' }
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    name: '商务衬衫模板',
    category: 'shirt',
    description: '专业商务场合的衬衫设计模板',
    status: 'published',
    preview: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop',
    usage: 189,
    parameters: [
      { name: '领型', type: 'select', defaultValue: '尖领' },
      { name: '袖长', type: 'select', defaultValue: '长袖' },
      { name: '版型', type: 'select', defaultValue: '修身' }
    ],
    createdAt: '2024-01-14',
    updatedAt: '2024-01-19'
  },
  {
    id: '3',
    name: '休闲外套模板',
    category: 'coat',
    description: '日常休闲穿搭的外套设计模板',
    status: 'draft',
    preview: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop',
    usage: 67,
    parameters: [
      { name: '长度', type: 'select', defaultValue: '中长款' },
      { name: '材质', type: 'select', defaultValue: '棉质' },
      { name: '口袋', type: 'number', defaultValue: '2' }
    ],
    createdAt: '2024-01-13',
    updatedAt: '2024-01-18'
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
    draft: 'orange',
    published: 'green',
    archived: 'gray'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return textMap[status] || '未知'
}

const handleSearch = () => {
  pagination.current = 1
  loadTemplates()
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
  loadTemplates()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadTemplates()
}

const loadTemplates = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = templates.value.length
  } catch (error) {
    Message.error('加载模板列表失败')
  } finally {
    loading.value = false
  }
}

const viewTemplate = (template: Template) => {
  currentTemplate.value = template
  showDetailModal.value = true
}

const editTemplate = (template: Template) => {
  Message.info(`编辑模板: ${template.name}`)
}

const copyTemplate = (template: Template) => {
  Message.info(`复制模板: ${template.name}`)
}

const deleteTemplate = (templateId: string) => {
  const template = templates.value.find(t => t.id === templateId)
  if (!template) return
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除模板"${template.name}"吗？`,
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success('模板删除成功')
        loadTemplates()
      } catch (error) {
        Message.error('删除失败，请重试')
      }
    }
  })
}

const addParameter = () => {
  templateForm.parameters.push({ name: '', type: 'text', defaultValue: '' })
}

const removeParameter = (index: number) => {
  templateForm.parameters.splice(index, 1)
}

const handleImageUpload = (option: any) => {
  // 模拟图片上传
  setTimeout(() => {
    templateForm.preview = 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop'
    Message.success('图片上传成功')
  }, 1000)
}

const handleCreateTemplate = async () => {
  if (!templateForm.name.trim()) {
    Message.error('请输入模板名称')
    return
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('模板创建成功')
    showCreateModal.value = false
    cancelCreate()
    loadTemplates()
  } catch (error) {
    Message.error('创建失败，请重试')
  }
}

const cancelCreate = () => {
  Object.assign(templateForm, {
    name: '',
    category: '',
    description: '',
    parameters: [{ name: '', type: 'text', defaultValue: '' }],
    preview: ''
  })
}

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>