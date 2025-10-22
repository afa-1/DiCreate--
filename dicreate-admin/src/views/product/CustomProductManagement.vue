<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">定制商品管理</h1>
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <span>共 {{ productList.length }} 个商品</span>
              <span>•</span>
              <span>{{ filteredProducts.length }} 个显示</span>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <a-button type="outline" @click="showAddModal = true">
              <icon-plus class="mr-2" />
              添加商品
            </a-button>
            <a-button type="primary" @click="refreshData">
              <icon-refresh class="mr-2" />
              刷新
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- 筛选和搜索栏 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">商品名称</label>
            <a-input 
              v-model="searchForm.name" 
              placeholder="搜索商品名称"
              allow-clear
              @input="handleSearch"
            >
              <template #prefix>
                <icon-search />
              </template>
            </a-input>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">商品分类</label>
            <a-select 
              v-model="searchForm.category" 
              placeholder="选择分类"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="">全部分类</a-option>
              <a-option value="T恤">T恤</a-option>
              <a-option value="卫衣">卫衣</a-option>
              <a-option value="帽子">帽子</a-option>
              <a-option value="包包">包包</a-option>
            </a-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">价格范围</label>
            <a-select 
              v-model="searchForm.priceRange" 
              placeholder="选择价格范围"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="">全部价格</a-option>
              <a-option value="0-100">¥0-100</a-option>
              <a-option value="100-300">¥100-300</a-option>
              <a-option value="300-500">¥300-500</a-option>
              <a-option value="500+">¥500以上</a-option>
            </a-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <a-select 
              v-model="searchForm.status" 
              placeholder="选择状态"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="">全部状态</a-option>
              <a-option value="active">上架中</a-option>
              <a-option value="inactive">已下架</a-option>
              <a-option value="draft">草稿</a-option>
            </a-select>
          </div>
        </div>
      </div>

      <!-- 商品网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- 加载状态 -->
        <div v-if="loading" class="col-span-full">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="i in 8" :key="i" class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div class="h-48 bg-gray-200"></div>
              <div class="p-4">
                <div class="h-4 bg-gray-200 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品卡片 -->
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer animate-fade-in"
          @click="viewProduct(product)"
        >
          <div class="relative">
            <img 
              :src="product.image" 
              :alt="product.name"
              class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              @error="handleImageError"
            />
            <div class="absolute top-2 right-2">
              <span 
                :class="{
                  'bg-green-100 text-green-800': product.status === 'active',
                  'bg-red-100 text-red-800': product.status === 'inactive',
                  'bg-gray-100 text-gray-800': product.status === 'draft'
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ getStatusText(product.status) }}
              </span>
            </div>
            <div class="absolute top-2 left-2">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {{ product.category }}
              </span>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-1 line-clamp-1">{{ product.name }}</h3>
            <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ product.description }}</p>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">销量</span>
                <span class="text-sm font-medium">{{ product.sales || 0 }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">库存</span>
                <span class="text-sm font-medium">{{ product.stock || 0 }}</span>
              </div>
            </div>
            <div class="mb-3">
              <span class="text-lg font-bold text-red-600">¥{{ product.price.toFixed(2) }}</span>
            </div>
            <div class="space-y-2">
              <div class="flex space-x-2">
                <a-button 
                  size="small" 
                  type="outline"
                  class="text-purple-600 border-purple-600 hover:bg-purple-50 flex-1"
                  @click.stop="showAIQuickModal(product)"
                >
                  <icon-robot class="mr-1" />
                  AI快捷生成
                </a-button>
                <a-button 
                  size="small" 
                  type="text"
                  class="text-purple-600 flex-1"
                  @click.stop="showAIAdvancedModal(product)"
                >
                  AI高级配置
                </a-button>
              </div>
              <div class="flex space-x-2">
                <a-button 
                  size="small" 
                  type="text"
                  class="text-blue-600 hover:bg-blue-50 flex-1"
                  @click.stop="editProduct(product)"
                >
                  <icon-edit class="mr-1" />
                  编辑
                </a-button>
                <a-button 
                  size="small" 
                  type="text"
                  class="text-red-600 hover:bg-red-50 flex-1"
                  @click.stop="deleteProduct(product)"
                >
                  <icon-delete class="mr-1" />
                  删除
                </a-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!loading && productList.length === 0" class="text-center py-16 animate-fade-in">
          <div class="text-gray-400 text-6xl mb-4">📦</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无商品</h3>
          <p class="text-gray-500 mb-4">开始添加您的第一个定制商品</p>
          <a-button type="primary" @click="showAddModal = true">
            <icon-plus class="mr-2" />
            添加商品
          </a-button>
        </div>

        <!-- 搜索无结果 -->
        <div v-if="!loading && productList.length > 0 && filteredProducts.length === 0" class="col-span-full text-center py-16 animate-fade-in">
          <div class="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">未找到匹配的商品</h3>
          <p class="text-gray-500 mb-4">尝试调整搜索条件或筛选器</p>
          <a-button @click="clearSearch">清除筛选</a-button>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="!loading && filteredProducts.length > 0" class="mt-8 flex justify-center">
        <a-pagination 
          :total="filteredProducts.length" 
          :page-size="pageSize" 
          :current="currentPage"
          show-total
          show-jumper
          show-size-changer
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </div>

    <!-- 添加商品模态框 -->
    <a-modal 
      v-model:visible="showAddModal" 
      title="添加定制商品" 
      width="800px"
      @ok="handleAddProduct"
      @cancel="resetAddForm"
    >
      <a-form :model="addForm" layout="vertical">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item label="商品名称" required>
            <a-input v-model="addForm.name" placeholder="请输入商品名称" />
          </a-form-item>
          <a-form-item label="商品分类" required>
            <a-select v-model="addForm.category" placeholder="请选择分类">
              <a-option value="T恤">T恤</a-option>
              <a-option value="卫衣">卫衣</a-option>
              <a-option value="帽子">帽子</a-option>
              <a-option value="包包">包包</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="商品价格" required>
            <a-input-number 
              v-model="addForm.price" 
              :min="0" 
              :precision="2" 
              placeholder="请输入价格"
              class="w-full"
            >
              <template #prefix>¥</template>
            </a-input-number>
          </a-form-item>
          <a-form-item label="库存数量" required>
            <a-input-number 
              v-model="addForm.stock" 
              :min="0" 
              placeholder="请输入库存数量"
              class="w-full"
            />
          </a-form-item>
        </div>
        <a-form-item label="商品描述">
          <a-textarea 
            v-model="addForm.description" 
            placeholder="请输入商品描述"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="商品图片">
          <a-upload
            :file-list="addForm.imageList"
            :show-file-list="false"
            @change="handleImageUpload"
          >
            <div class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
              <div v-if="!addForm.image" class="text-center">
                <icon-plus class="text-2xl text-gray-400 mb-2" />
                <div class="text-sm text-gray-500">上传图片</div>
              </div>
              <img v-else :src="addForm.image" class="w-full h-full object-cover rounded-lg" />
            </div>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- AI快捷生成模态框 -->
    <a-modal 
      v-model:visible="showAIQuickModalVisible" 
      title="AI快捷生成" 
      width="600px"
      @ok="handleAIQuickGenerate"
    >
      <div class="space-y-4">
        <div>
          <h4 class="font-medium mb-2">选择生成类型</h4>
          <a-radio-group v-model="aiQuickForm.type" class="grid grid-cols-2 gap-2">
            <a-radio value="design">设计图案</a-radio>
            <a-radio value="description">商品描述</a-radio>
            <a-radio value="title">商品标题</a-radio>
            <a-radio value="tags">商品标签</a-radio>
          </a-radio-group>
        </div>
        <div>
          <h4 class="font-medium mb-2">描述需求</h4>
          <a-textarea 
            v-model="aiQuickForm.prompt" 
            placeholder="请描述您的需求，例如：为这个T恤设计一个简约的图案"
            :rows="3"
          />
        </div>
        <div v-if="aiQuickForm.type === 'design'">
          <h4 class="font-medium mb-2">设计风格</h4>
          <a-select v-model="aiQuickForm.style" placeholder="选择设计风格" class="w-full">
            <a-option value="minimalist">简约风格</a-option>
            <a-option value="vintage">复古风格</a-option>
            <a-option value="modern">现代风格</a-option>
            <a-option value="cartoon">卡通风格</a-option>
            <a-option value="abstract">抽象风格</a-option>
          </a-select>
        </div>
      </div>
    </a-modal>

    <!-- AI高级配置模态框 -->
    <a-modal 
      v-model:visible="showAIAdvancedModalVisible" 
      title="AI高级配置" 
      width="800px"
      @ok="handleAIAdvancedGenerate"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 class="font-medium mb-2">生成内容</h4>
            <a-checkbox-group v-model="aiAdvancedForm.contentTypes" class="grid grid-cols-2 gap-2">
              <a-checkbox value="design">设计图案</a-checkbox>
              <a-checkbox value="description">商品描述</a-checkbox>
              <a-checkbox value="title">商品标题</a-checkbox>
              <a-checkbox value="tags">商品标签</a-checkbox>
              <a-checkbox value="variants">商品变体</a-checkbox>
              <a-checkbox value="pricing">定价建议</a-checkbox>
            </a-checkbox-group>
          </div>
          <div>
            <h4 class="font-medium mb-2">目标受众</h4>
            <a-select v-model="aiAdvancedForm.targetAudience" placeholder="选择目标受众" class="w-full">
              <a-option value="young">年轻人(18-25岁)</a-option>
              <a-option value="adult">成年人(26-40岁)</a-option>
              <a-option value="middle-aged">中年人(41-55岁)</a-option>
              <a-option value="senior">老年人(55岁以上)</a-option>
              <a-option value="kids">儿童</a-option>
            </a-select>
          </div>
        </div>
        <div>
          <h4 class="font-medium mb-2">设计要求</h4>
          <a-textarea 
            v-model="aiAdvancedForm.designRequirements" 
            placeholder="详细描述您的设计要求，包括颜色、风格、元素等"
            :rows="4"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 class="font-medium mb-2">颜色偏好</h4>
            <a-select v-model="aiAdvancedForm.colorPreference" placeholder="选择颜色" class="w-full">
              <a-option value="warm">暖色调</a-option>
              <a-option value="cool">冷色调</a-option>
              <a-option value="neutral">中性色</a-option>
              <a-option value="bright">鲜艳色彩</a-option>
              <a-option value="pastel">柔和色彩</a-option>
            </a-select>
          </div>
          <div>
            <h4 class="font-medium mb-2">设计复杂度</h4>
            <a-select v-model="aiAdvancedForm.complexity" placeholder="选择复杂度" class="w-full">
              <a-option value="simple">简单</a-option>
              <a-option value="medium">中等</a-option>
              <a-option value="complex">复杂</a-option>
            </a-select>
          </div>
          <div>
            <h4 class="font-medium mb-2">生成数量</h4>
            <a-input-number 
              v-model="aiAdvancedForm.generateCount" 
              :min="1" 
              :max="10" 
              class="w-full"
            />
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 删除确认模态框 -->
    <a-modal 
      v-model:visible="showDeleteModal" 
      title="确认删除" 
      @ok="confirmDelete"
      @cancel="showDeleteModal = false"
    >
      <div class="text-center py-4">
        <div class="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">确认删除商品？</h3>
        <p class="text-gray-600 mb-4">您即将删除商品 "{{ productToDelete?.name }}"</p>
        <p class="text-sm text-red-600">此操作不可撤销，请谨慎操作</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconPlus,
  IconRefresh,
  IconSearch,
  IconRobot,
  IconEdit,
  IconDelete
} from '@arco-design/web-vue/es/icon'

// 响应式数据
const loading = ref(false)
const showAddModal = ref(false)
const showAIQuickModalVisible = ref(false)
const showAIAdvancedModalVisible = ref(false)
const showDeleteModal = ref(false)
const productToDelete = ref(null)
const currentPage = ref(1)
const pageSize = ref(12)

// 搜索表单
const searchForm = reactive({
  name: '',
  category: '',
  priceRange: '',
  status: ''
})

// 添加商品表单
const addForm = reactive({
  name: '',
  category: '',
  price: 0,
  stock: 0,
  description: '',
  image: '',
  imageList: []
})

// AI快捷生成表单
const aiQuickForm = reactive({
  type: 'design',
  prompt: '',
  style: ''
})

// AI高级配置表单
const aiAdvancedForm = reactive({
  contentTypes: ['design'],
  targetAudience: '',
  designRequirements: '',
  colorPreference: '',
  complexity: 'medium',
  generateCount: 3
})

// 商品列表数据
const productList = ref([
  {
    id: 1,
    name: '经典白色T恤',
    description: '100%纯棉材质，舒适透气，适合日常穿着',
    category: 'T恤',
    price: 89.00,
    image: '/placeholder-product.svg',
    status: 'active',
    sales: 156,
    stock: 89
  },
  {
    id: 2,
    name: '潮流印花卫衣',
    description: '时尚印花设计，保暖舒适，展现个性风格',
    category: '卫衣',
    price: 199.00,
    image: '/placeholder-product.svg',
    status: 'active',
    sales: 89,
    stock: 45
  },
  {
    id: 3,
    name: '简约棒球帽',
    description: '经典棒球帽设计，可调节帽围，四季百搭',
    category: '帽子',
    price: 59.00,
    image: '/placeholder-product.svg',
    status: 'inactive',
    sales: 234,
    stock: 0
  },
  {
    id: 4,
    name: '个性帆布包',
    description: '环保帆布材质，大容量设计，实用又时尚',
    category: '包包',
    price: 79.00,
    image: '/placeholder-product.svg',
    status: 'draft',
    sales: 0,
    stock: 120
  },
  {
    id: 5,
    name: '复古牛仔夹克',
    description: '经典牛仔面料，复古水洗工艺，永不过时',
    category: '外套',
    price: 299.00,
    image: '/placeholder-product.svg',
    status: 'active',
    sales: 67,
    stock: 23
  },
  {
    id: 6,
    name: '运动休闲裤',
    description: '弹性面料，舒适修身，运动休闲两相宜',
    category: '裤子',
    price: 129.00,
    image: '/placeholder-product.svg',
    status: 'active',
    sales: 145,
    stock: 78
  }
])

// 计算属性
const filteredProducts = computed(() => {
  let filtered = [...productList.value]
  
  // 按名称搜索
  if (searchForm.name) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchForm.name.toLowerCase())
    )
  }
  
  // 按分类筛选
  if (searchForm.category) {
    filtered = filtered.filter(product => product.category === searchForm.category)
  }
  
  // 按价格范围筛选
  if (searchForm.priceRange) {
    const [min, max] = searchForm.priceRange.split('-').map(Number)
    if (max) {
      filtered = filtered.filter(product => product.price >= min && product.price <= max)
    } else {
      filtered = filtered.filter(product => product.price >= min)
    }
  }
  
  // 按状态筛选
  if (searchForm.status) {
    filtered = filtered.filter(product => product.status === searchForm.status)
  }
  
  return filtered
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  Object.assign(searchForm, {
    name: '',
    category: '',
    priceRange: '',
    status: ''
  })
}

const refreshData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('数据刷新成功')
  } catch (error) {
    Message.error('刷新失败，请重试')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const getStatusText = (status: string) => {
  const statusMap = {
    active: '上架中',
    inactive: '已下架',
    draft: '草稿'
  }
  return statusMap[status] || status
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/placeholder-product.svg'
}

const viewProduct = (product: any) => {
  console.log('查看商品详情:', product)
  Message.info(`查看商品: ${product.name}`)
}

const editProduct = (product: any) => {
  console.log('编辑商品:', product)
  Message.info(`编辑商品: ${product.name}`)
}

const deleteProduct = (product: any) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!productToDelete.value) return
  
  try {
    // 模拟删除API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 从列表中移除商品
    const index = productList.value.findIndex(p => p.id === productToDelete.value.id)
    if (index > -1) {
      productList.value.splice(index, 1)
    }
    
    Message.success(`商品 "${productToDelete.value.name}" 删除成功`)
    showDeleteModal.value = false
    productToDelete.value = null
  } catch (error) {
    Message.error('删除失败，请重试')
  }
}

const showAIQuickModal = (product: any) => {
  console.log('AI快捷生成:', product)
  showAIQuickModalVisible.value = true
}

const showAIAdvancedModal = (product: any) => {
  console.log('AI高级配置:', product)
  showAIAdvancedModalVisible.value = true
}

const handleAIQuickGenerate = async () => {
  try {
    // 模拟AI生成
    await new Promise(resolve => setTimeout(resolve, 2000))
    Message.success('AI生成完成')
    showAIQuickModalVisible.value = false
  } catch (error) {
    Message.error('生成失败，请重试')
  }
}

const handleAIAdvancedGenerate = async () => {
  try {
    // 模拟AI生成
    await new Promise(resolve => setTimeout(resolve, 3000))
    Message.success('AI高级生成完成')
    showAIAdvancedModalVisible.value = false
  } catch (error) {
    Message.error('生成失败，请重试')
  }
}

const handleAddProduct = async () => {
  try {
    // 验证表单
    if (!addForm.name || !addForm.category || !addForm.price) {
      Message.error('请填写必填字段')
      return
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 添加到列表
    const newProduct = {
      id: Date.now(),
      ...addForm,
      status: 'draft',
      sales: 0,
      image: addForm.image || '/placeholder-product.svg'
    }
    
    productList.value.unshift(newProduct)
    Message.success('商品添加成功')
    showAddModal.value = false
    resetAddForm()
  } catch (error) {
    Message.error('添加失败，请重试')
  }
}

const resetAddForm = () => {
  Object.assign(addForm, {
    name: '',
    category: '',
    price: 0,
    stock: 0,
    description: '',
    image: '',
    imageList: []
  })
}

const handleImageUpload = (fileList: any) => {
  if (fileList.length > 0) {
    const file = fileList[0]
    // 这里应该上传到服务器，现在只是模拟
    addForm.image = URL.createObjectURL(file.originFile)
  }
  addForm.imageList = fileList
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>