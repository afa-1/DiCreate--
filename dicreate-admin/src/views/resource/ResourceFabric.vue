<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">面料库</h1>
        <p class="text-gray-600 mt-1">管理面料资源和属性信息</p>
      </div>
      <a-button type="primary" @click="showUploadModal = true">
        <template #icon><icon-plus /></template>
        上传面料
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
            <p class="text-sm font-medium text-gray-600">总面料数</p>
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
            <p class="text-sm font-medium text-gray-600">已审核</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <icon-clock-circle class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">待审核</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <icon-star class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">热门面料</p>
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
            placeholder="面料名称"
            allow-clear
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.category"
            placeholder="面料分类"
            allow-clear
          >
            <a-option value="cotton">棉质</a-option>
            <a-option value="silk">丝绸</a-option>
            <a-option value="wool">羊毛</a-option>
            <a-option value="synthetic">合成纤维</a-option>
            <a-option value="linen">亚麻</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchForm.status"
            placeholder="审核状态"
            allow-clear
          >
            <a-option value="pending">待审核</a-option>
            <a-option value="approved">已审核</a-option>
            <a-option value="rejected">已拒绝</a-option>
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

    <!-- 面料网格 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="fabric in fabrics" 
          :key="fabric.id"
          class="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <!-- 面料图片 -->
          <div class="aspect-square relative overflow-hidden">
            <img 
              :src="fabric.image" 
              :alt="fabric.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute top-2 right-2">
              <a-tag :color="getStatusColor(fabric.status)" size="small">
                {{ getStatusText(fabric.status) }}
              </a-tag>
            </div>
            <!-- 悬浮操作按钮 -->
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <a-space>
                <a-button type="primary" size="small" @click="viewFabric(fabric)">
                  <template #icon><icon-eye /></template>
                </a-button>
                <a-button size="small" @click="editFabric(fabric)">
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-button size="small" status="danger" @click="deleteFabric(fabric.id)">
                  <template #icon><icon-delete /></template>
                </a-button>
              </a-space>
            </div>
          </div>
          
          <!-- 面料信息 -->
          <div class="p-4">
            <h3 class="font-medium text-gray-900 mb-1 truncate">{{ fabric.name }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ getCategoryText(fabric.category) }}</p>
            <div class="flex items-center justify-between text-xs text-gray-400">
              <span>{{ fabric.supplier }}</span>
              <span>{{ fabric.createdAt }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              <a-tag v-for="attr in fabric.attributes.slice(0, 2)" :key="attr" size="small">
                {{ attr }}
              </a-tag>
              <a-tag v-if="fabric.attributes.length > 2" size="small" color="gray">
                +{{ fabric.attributes.length - 2 }}
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

    <!-- 上传面料弹窗 -->
    <a-modal
      v-model:visible="showUploadModal"
      title="上传面料"
      width="600px"
      @ok="handleUploadFabric"
      @cancel="cancelUpload"
    >
      <a-form :model="fabricForm" layout="vertical">
        <a-form-item field="name" label="面料名称">
          <a-input v-model="fabricForm.name" placeholder="请输入面料名称" />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="category" label="面料分类">
              <a-select v-model="fabricForm.category" placeholder="请选择分类">
                <a-option value="cotton">棉质</a-option>
                <a-option value="silk">丝绸</a-option>
                <a-option value="wool">羊毛</a-option>
                <a-option value="synthetic">合成纤维</a-option>
                <a-option value="linen">亚麻</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="supplier" label="供应商">
              <a-input v-model="fabricForm.supplier" placeholder="请输入供应商" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="attributes" label="面料属性">
          <a-select 
            v-model="fabricForm.attributes" 
            placeholder="请选择面料属性"
            multiple
            allow-create
          >
            <a-option value="透气">透气</a-option>
            <a-option value="防水">防水</a-option>
            <a-option value="弹性">弹性</a-option>
            <a-option value="抗皱">抗皱</a-option>
            <a-option value="保暖">保暖</a-option>
            <a-option value="轻薄">轻薄</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item field="description" label="面料描述">
          <a-textarea
            v-model="fabricForm.description"
            placeholder="请输入面料描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item field="image" label="面料图片">
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

    <!-- 面料详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      :title="currentFabric?.name"
      width="800px"
      :footer="false"
    >
      <div v-if="currentFabric" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img 
              :src="currentFabric.image" 
              :alt="currentFabric.name"
              class="w-full rounded-lg"
            />
          </div>
          <div class="space-y-4">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">基本信息</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">面料分类：</span>
                  <span>{{ getCategoryText(currentFabric.category) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">供应商：</span>
                  <span>{{ currentFabric.supplier }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">状态：</span>
                  <a-tag :color="getStatusColor(currentFabric.status)" size="small">
                    {{ getStatusText(currentFabric.status) }}
                  </a-tag>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">上传时间：</span>
                  <span>{{ currentFabric.createdAt }}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">面料属性</h4>
              <div class="flex flex-wrap gap-2">
                <a-tag v-for="attr in currentFabric.attributes" :key="attr">
                  {{ attr }}
                </a-tag>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">面料描述</h4>
              <p class="text-sm text-gray-600">{{ currentFabric.description }}</p>
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
  IconCheckCircle, 
  IconClockCircle, 
  IconStar,
  IconEye,
  IconEdit,
  IconDelete
} from '@arco-design/web-vue/es/icon'

interface Fabric {
  id: string
  name: string
  category: string
  supplier: string
  status: string
  image: string
  attributes: string[]
  description: string
  createdAt: string
}

const loading = ref(false)
const showUploadModal = ref(false)
const showDetailModal = ref(false)
const currentFabric = ref<Fabric | null>(null)

const searchForm = reactive({
  name: '',
  category: '',
  status: ''
})

const fabricForm = reactive({
  name: '',
  category: '',
  supplier: '',
  attributes: [],
  description: '',
  image: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0
})

// 统计数据
const stats = reactive({
  total: 1248,
  approved: 1156,
  pending: 68,
  popular: 24
})

// 模拟面料数据
const fabrics = ref<Fabric[]>([
  {
    id: '1',
    name: '高档真丝面料',
    category: 'silk',
    supplier: '江南丝绸厂',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop',
    attributes: ['光泽', '柔软', '透气'],
    description: '采用优质桑蚕丝制作，手感柔滑，光泽自然',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: '纯棉帆布',
    category: 'cotton',
    supplier: '华纺集团',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    attributes: ['耐磨', '透气', '环保'],
    description: '100%纯棉制作，结实耐用，适合制作休闲服装',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    name: '羊毛呢料',
    category: 'wool',
    supplier: '北方毛纺',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=300&h=300&fit=crop',
    attributes: ['保暖', '抗皱', '高档'],
    description: '精选澳洲羊毛，质地厚实，保暖性能优异',
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    name: '功能性运动面料',
    category: 'synthetic',
    supplier: '科技纺织',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop',
    attributes: ['吸湿', '速干', '弹性'],
    description: '采用先进纤维技术，具有优异的运动性能',
    createdAt: '2024-01-12'
  }
])

const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    cotton: '棉质',
    silk: '丝绸',
    wool: '羊毛',
    synthetic: '合成纤维',
    linen: '亚麻'
  }
  return categoryMap[category] || category
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待审核',
    approved: '已审核',
    rejected: '已拒绝'
  }
  return textMap[status] || '未知'
}

const handleSearch = () => {
  pagination.current = 1
  loadFabrics()
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
  loadFabrics()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadFabrics()
}

const loadFabrics = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = fabrics.value.length
  } catch (error) {
    Message.error('加载面料列表失败')
  } finally {
    loading.value = false
  }
}

const viewFabric = (fabric: Fabric) => {
  currentFabric.value = fabric
  showDetailModal.value = true
}

const editFabric = (fabric: Fabric) => {
  Message.info(`编辑面料: ${fabric.name}`)
}

const deleteFabric = (fabricId: string) => {
  const fabric = fabrics.value.find(f => f.id === fabricId)
  if (!fabric) return
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除面料"${fabric.name}"吗？`,
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success('面料删除成功')
        loadFabrics()
      } catch (error) {
        Message.error('删除失败，请重试')
      }
    }
  })
}

const handleImageUpload = (option: any) => {
  // 模拟图片上传
  setTimeout(() => {
    fabricForm.image = 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop'
    Message.success('图片上传成功')
  }, 1000)
}

const handleUploadFabric = async () => {
  if (!fabricForm.name.trim()) {
    Message.error('请输入面料名称')
    return
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('面料上传成功')
    showUploadModal.value = false
    cancelUpload()
    loadFabrics()
  } catch (error) {
    Message.error('上传失败，请重试')
  }
}

const cancelUpload = () => {
  Object.assign(fabricForm, {
    name: '',
    category: '',
    supplier: '',
    attributes: [],
    description: '',
    image: ''
  })
}

onMounted(() => {
  loadFabrics()
})
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>