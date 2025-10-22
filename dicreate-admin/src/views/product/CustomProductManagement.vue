<template>
  <div class="custom-product-management">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <!-- 页面标题和操作按钮 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">定制商品管理</h1>
        <div class="flex space-x-3">
          <a-button 
            type="primary" 
            size="large"
            @click="addModalVisible = true"
            class="px-6"
          >
            <icon-plus class="mr-2" />
            新增
          </a-button>
          <a-button 
            size="large"
            :loading="albumGenerating"
            :disabled="selectedProducts.length === 0"
            @click="generateAlbum"
            class="px-6 hover:scale-105 transition-transform duration-200"
          >
            <template #icon>
              <icon-image v-if="!albumGenerating" class="mr-2" />
              <icon-loading v-else class="mr-2" />
            </template>
            {{ albumGenerating ? '生成中...' : '生成画册' }}
          </a-button>
          <a-button 
            size="large"
            :loading="sampleNoticeGenerating"
            :disabled="selectedProducts.length === 0"
            @click="generateSampleNotice"
            class="px-6 hover:scale-105 transition-transform duration-200"
          >
            <template #icon>
              <icon-file-text v-if="!sampleNoticeGenerating" class="mr-2" />
              <icon-loading v-else class="mr-2" />
            </template>
            {{ sampleNoticeGenerating ? '生成中...' : '生成样品通知单' }}
          </a-button>
        </div>
      </div>
      
      <!-- 查询条件区域 -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">所属类别</label>
            <a-select 
              v-model="searchForm.category" 
              placeholder="全部类别" 
              allow-clear
              class="w-full"
            >
              <a-option value="">全部类别</a-option>
              <a-option value="degree-bachelor">学位服 - 本科</a-option>
              <a-option value="degree-master">学位服 - 硕士</a-option>
              <a-option value="degree-doctor">学位服 - 博士</a-option>
              <a-option value="school-uniform">校服</a-option>
            </a-select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">商品名称</label>
            <a-input 
              v-model="searchForm.productName" 
              placeholder="请输入商品名称关键词"
              allow-clear
              :max-length="50"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">所属客户</label>
            <a-input 
              v-model="searchForm.customer" 
              placeholder="请输入客户名称关键词"
              allow-clear
              :max-length="50"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">日期区间</label>
            <a-range-picker 
              v-model="searchForm.dateRange"
              class="w-full"
              :placeholder="['开始日期', '结束日期']"
            />
          </div>
        </div>
        
        <div class="flex justify-end items-center mt-4">
          <div class="flex space-x-3">
            <a-button @click="resetSearch">重置</a-button>
            <a-button type="primary" @click="handleSearch">
              <icon-search class="mr-2" />
              搜索
            </a-button>
          </div>
        </div>
      </div>
      
      <!-- 商品卡片网格展示 -->
      <div class="mb-6">
        <a-spin :loading="loading" class="w-full">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="(product, index) in productList" 
              :key="product.id"
              class="product-card bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer animate-fade-in"
              @click="handleCardClick(product)"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <!-- 复选框 -->
              <div class="absolute top-3 left-3 z-10">
                <a-checkbox 
                  v-model="selectedProducts"
                  :value="product.id"
                  @click.stop
                  class="bg-white bg-opacity-80 rounded"
                />
              </div>
              
              <!-- 商品图片 -->
              <div class="relative h-48 overflow-hidden rounded-t-lg image-container">
                <img 
                  :src="product.image || '/placeholder-product.svg'" 
                  :alt="product.name"
                  class="w-full h-full object-cover product-image"
                  @error="handleImageError"
                  @click.stop="showImagePreview(product.image, product.name)"
                />
                <div class="image-overlay">
                  <div class="preview-icon">
                    <icon-eye class="text-white text-2xl" />
                  </div>
                </div>
              </div>
              
              <!-- 商品信息 -->
              <div class="p-4">
                <div class="text-sm text-gray-500 mb-1 truncate">{{ product.category }}</div>
                <h3 class="text-base font-semibold text-gray-900 mb-1 truncate" :title="product.name">
                  {{ product.name }}
                </h3>
                <div class="text-sm text-gray-500 mb-3 truncate">{{ product.customer }}</div>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-bold text-red-600">¥{{ product.price.toFixed(2) }}</span>
                  <div class="flex space-x-2">
                    <a-button 
                      size="small" 
                      type="outline"
                      class="text-purple-600 border-purple-600 hover:bg-purple-50"
                      @click.stop="showAIQuickModal(product)"
                    >
                      <icon-robot class="mr-1" />
                      AI快捷生成
                    </a-button>
                    <a-button 
                      size="small" 
                      type="text"
                      class="text-purple-600"
                      @click.stop="showAIAdvancedModal(product)"
                    >
                      AI高级配置
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="!loading && productList.length === 0" class="text-center py-16 animate-fade-in">
            <div class="text-gray-400 text-6xl mb-4">📦</div>
            <div class="text-gray-500 text-lg mb-2">暂无定制商品</div>
            <div class="text-gray-400 text-sm">点击"新增"按钮添加您的第一个定制商品</div>
          </div>
        </a-spin>
      </div>
      
      <!-- 分页 -->
      <div class="flex justify-center">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-total="true"
          :show-jumper="true"
          :show-size-changer="true"
          :page-size-options="['10', '20', '50', '100']"
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </div>
    
    <!-- 弹窗组件 -->
    <AddProductModal 
      :visible="addModalVisible" 
      @update:visible="addModalVisible = $event"
      @submit="handleAddProduct" 
    />
    <AIQuickGenerateModal 
      :visible="aiQuickModalVisible" 
      @update:visible="aiQuickModalVisible = $event"
      :product="selectedProduct"
      @save="handleAIQuickSave"
    />
    <AIAdvancedConfigModal 
      :visible="aiAdvancedModalVisible" 
      @update:visible="aiAdvancedModalVisible = $event"
      :product="selectedProduct"
      @save="handleAIAdvancedSave"
      @generate="handleAIAdvancedGenerate"
    />
    
    <!-- 图片预览弹窗 -->
    <a-modal
      :visible="imagePreviewVisible"
      :footer="false"
      :mask-closable="true"
      :closable="true"
      width="auto"
      @cancel="imagePreviewVisible = false"
      :body-style="{ padding: '0', textAlign: 'center', backgroundColor: '#000' }"
      :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }"
    >
      <div class="image-preview-container">
        <img 
          :src="previewImageUrl" 
          :alt="previewImageTitle"
          class="preview-image"
          @wheel="handleImageZoom"
          :style="{ transform: `scale(${zoomLevel})` }"
        />
        <div class="preview-controls">
          <a-button 
            type="text" 
            size="large"
            @click="zoomOut"
            :disabled="zoomLevel <= 0.5"
            class="control-btn"
          >
            <icon-minus class="text-white" />
          </a-button>
          <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
          <a-button 
            type="text" 
            size="large"
            @click="zoomIn"
            :disabled="zoomLevel >= 3"
            class="control-btn"
          >
            <icon-plus class="text-white" />
          </a-button>
          <a-button 
            type="text" 
            size="large"
            @click="resetZoom"
            class="control-btn"
          >
            <icon-refresh class="text-white" />
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import AddProductModal from '../../components/AddProductModal.vue'
import AIQuickGenerateModal from '../../components/AIQuickGenerateModal.vue'
import AIAdvancedConfigModal from '../../components/AIAdvancedConfigModal.vue'

// 定义产品类型
interface Product {
  id: number
  name: string
  category: string
  customer: string
  price: number  // 改为number类型
  image: string
  createTime: string
  status: string
}

// 响应式数据
const loading = ref(false)
const selectedProduct = ref<Product | null>(null)
const selectedProducts = ref<number[]>([])
const albumGenerating = ref(false)
const sampleNoticeGenerating = ref(false)

// 搜索表单
const searchForm = reactive({
  category: '',
  productName: '',
  customer: '',
  dateRange: [] as [Date, Date] | []
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 商品列表数据
const productList = ref<Product[]>([])

// 模拟数据
const mockProducts: Product[] = [
  {
    id: 1,
    name: '清华大学本科学位服 - 经管学院',
    category: '学位服 - 本科',
    customer: '清华大学',
    price: 299.00,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    createTime: '2024-01-15',
    status: 'active'
  },
  {
    id: 2,
    name: '北京大学硕士学位服 - 法学院',
    category: '学位服 - 硕士',
    customer: '北京大学',
    price: 399.00,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&h=300&fit=crop',
    createTime: '2024-01-14',
    status: 'active'
  },
  {
    id: 3,
    name: '复旦大学博士学位服 - 医学院',
    category: '学位服 - 博士',
    customer: '复旦大学',
    price: 499.00,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
    createTime: '2024-01-13',
    status: 'active'
  },
  {
    id: 4,
    name: '上海中学校服 - 夏季款',
    category: '校服',
    customer: '上海中学',
    price: 199.00,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop',
    createTime: '2024-01-12',
    status: 'active'
  },
  {
    id: 5,
    name: '中山大学本科学位服 - 理学院',
    category: '学位服 - 本科',
    customer: '中山大学',
    price: 289.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
    createTime: '2024-01-11',
    status: 'active'
  },
  {
    id: 6,
    name: '华南理工大学硕士学位服 - 工学院',
    category: '学位服 - 硕士',
    customer: '华南理工大学',
    price: 389.00,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    createTime: '2024-01-10',
    status: 'active'
  },
  {
    id: 7,
    name: '同济大学博士学位服 - 建筑学院',
    category: '学位服 - 博士',
    customer: '同济大学',
    price: 519.00,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
    createTime: '2024-01-09',
    status: 'active'
  },
  {
    id: 8,
    name: '华东师范大学校服 - 春秋款',
    category: '校服',
    customer: '华东师范大学',
    price: 229.00,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    createTime: '2024-01-08',
    status: 'active'
  },
  {
    id: 9,
    name: '南京大学本科学位服 - 文学院',
    category: '学位服 - 本科',
    customer: '南京大学',
    price: 309.00,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    createTime: '2024-01-07',
    status: 'active'
  },
  {
    id: 10,
    name: '浙江大学硕士学位服 - 计算机学院',
    category: '学位服 - 硕士',
    customer: '浙江大学',
    price: 419.00,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    createTime: '2024-01-06',
    status: 'active'
  },
  {
    id: 11,
    name: '西安交通大学博士学位服 - 机械学院',
    category: '学位服 - 博士',
    customer: '西安交通大学',
    price: 539.00,
    image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=300&h=300&fit=crop',
    createTime: '2024-01-05',
    status: 'active'
  },
  {
    id: 12,
    name: '深圳实验学校校服 - 冬季款',
    category: '校服',
    customer: '深圳实验学校',
    price: 259.00,
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=300&h=300&fit=crop',
    createTime: '2024-01-04',
    status: 'active'
  },
  {
    id: 13,
    name: '四川大学本科学位服 - 商学院',
    category: '学位服 - 本科',
    customer: '四川大学',
    price: 279.00,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
    createTime: '2024-01-03',
    status: 'active'
  },
  {
    id: 14,
    name: '华中科技大学硕士学位服 - 电信学院',
    category: '学位服 - 硕士',
    customer: '华中科技大学',
    price: 409.00,
    image: 'https://images.unsplash.com/photo-1609592806596-4d3b0c3b7b1b?w=300&h=300&fit=crop',
    createTime: '2024-01-02',
    status: 'active'
  },
  {
    id: 15,
    name: '天津大学博士学位服 - 化工学院',
    category: '学位服 - 博士',
    customer: '天津大学',
    price: 529.00,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    createTime: '2024-01-01',
    status: 'active'
  },
  {
    id: 16,
    name: '广州市第一中学校服 - 运动款',
    category: '校服',
    customer: '广州市第一中学',
    price: 189.00,
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=300&h=300&fit=crop',
    createTime: '2023-12-31',
    status: 'active'
  },
  {
    id: 17,
    name: '东南大学本科学位服 - 土木学院',
    category: '学位服 - 本科',
    customer: '东南大学',
    price: 319.00,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    createTime: '2023-12-30',
    status: 'active'
  },
  {
    id: 18,
    name: '大连理工大学硕士学位服 - 材料学院',
    category: '学位服 - 硕士',
    customer: '大连理工大学',
    price: 429.00,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&h=300&fit=crop',
    createTime: '2023-12-29',
    status: 'active'
  },
  {
    id: 19,
    name: '哈尔滨工业大学博士学位服 - 航天学院',
    category: '学位服 - 博士',
    customer: '哈尔滨工业大学',
    price: 559.00,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
    createTime: '2023-12-28',
    status: 'active'
  },
  {
    id: 20,
    name: '成都七中校服 - 礼仪款',
    category: '校服',
    customer: '成都七中',
    price: 269.00,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop',
    createTime: '2023-12-27',
    status: 'active'
  }
]

// 计算属性
const filteredProducts = computed(() => {
  let filtered = [...mockProducts]
  
  if (searchForm.category) {
    filtered = filtered.filter(product => product.category === searchForm.category)
  }
  
  if (searchForm.productName) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchForm.productName.toLowerCase())
    )
  }
  
  if (searchForm.customer) {
    filtered = filtered.filter(product => 
      product.customer.toLowerCase().includes(searchForm.customer.toLowerCase())
    )
  }
  
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.dateRange as [Date, Date]
    filtered = filtered.filter(product => {
      const productDate = new Date(product.createTime)
      return productDate >= startDate && productDate <= endDate
    })
  }
  
  return filtered
})

// 方法
const loadProducts = () => {
  loading.value = true
  
  setTimeout(() => {
    const filtered = filteredProducts.value
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    
    productList.value = filtered.slice(start, end)
    pagination.total = filtered.length
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  pagination.current = 1
  loadProducts()
}

const resetSearch = () => {
  searchForm.category = ''
  searchForm.productName = ''
  searchForm.customer = ''
  searchForm.dateRange = []
  pagination.current = 1
  loadProducts()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadProducts()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadProducts()
}

const handleCardClick = (product: Product) => {
  console.log('查看商品详情:', product)
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/placeholder-product.svg'
}

const showAIQuickModal = (product: Product) => {
  selectedProduct.value = product
  aiQuickModalVisible.value = true
}

const showAIAdvancedModal = (product: Product) => {
  selectedProduct.value = product
  aiAdvancedModalVisible.value = true
}

const generateAlbum = async () => {
  if (selectedProducts.value.length === 0) {
    Message.warning('请先选择商品')
    return
  }
  
  // 显示加载状态
  const loadingMessage = Message.loading('正在生成画册，请稍候...')
  
  try {
    // 获取选中的商品信息
    const selectedProductsData = productList.value.filter(product => 
      selectedProducts.value.includes(product.id)
    )
    
    // 模拟生成画册的过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 生成画册数据
    const albumData = {
      title: `定制商品画册_${new Date().toLocaleDateString()}`,
      products: selectedProductsData,
      generateTime: new Date().toLocaleString(),
      totalProducts: selectedProductsData.length
    }
    
    // 模拟下载画册PDF
    console.log('生成的画册数据:', albumData)
    
    loadingMessage.close()
    Message.success({
      content: `画册生成成功！包含 ${selectedProducts.value.length} 个商品`,
      duration: 3000
    })
    
    // 清空选择
    selectedProducts.value = []
    
  } catch (error) {
    loadingMessage.close()
    Message.error('画册生成失败，请重试')
    console.error('画册生成错误:', error)
  }
}

const generateSampleNotice = async () => {
  if (selectedProducts.value.length === 0) {
    Message.warning('请先选择商品')
    return
  }
  
  // 显示加载状态
  const loadingMessage = Message.loading('正在生成样品通知单，请稍候...')
  
  try {
    // 获取选中的商品信息
    const selectedProductsData = productList.value.filter(product => 
      selectedProducts.value.includes(product.id)
    )
    
    // 模拟生成Excel的过程
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 生成Excel数据结构
    const excelData = {
      title: '样品通知单',
      generateTime: new Date().toLocaleString(),
      products: selectedProductsData.map((product, index) => ({
        序号: index + 1,
        商品名称: product.name,
        所属类别: product.category,
        客户名称: product.customer,
        单价: `¥${product.price.toFixed(2)}`,
        创建时间: product.createTime,
        状态: product.status === 'active' ? '正常' : '停用',
        备注: ''
      }))
    }
    
    // 模拟Excel文件下载
    console.log('生成的样品通知单数据:', excelData)
    
    // 创建虚拟下载链接（实际项目中会使用真实的Excel导出库）
    const fileName = `样品通知单_${new Date().toLocaleDateString().replace(/\//g, '')}.xlsx`
    
    loadingMessage.close()
    Message.success({
      content: `样品通知单生成成功！包含 ${selectedProducts.value.length} 个商品，文件名：${fileName}`,
      duration: 4000
    })
    
    // 清空选择
    selectedProducts.value = []
    
  } catch (error) {
    loadingMessage.close()
    Message.error('样品通知单生成失败，请重试')
    console.error('样品通知单生成错误:', error)
  }
}

// 弹窗状态
const addModalVisible = ref(false)
const aiQuickModalVisible = ref(false)
const aiAdvancedModalVisible = ref(false)

// 图片预览相关状态
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')
const previewImageTitle = ref('')
const zoomLevel = ref(1)

const handleAddProduct = (product: any) => {
  // 处理新增商品逻辑
  console.log('新增商品:', product)
  Message.success('商品新增成功！')
  // 刷新商品列表
  loadProducts()
}

// 新增商品
const handleAddClick = () => {
  addModalVisible.value = true
}

// AI快捷生成
const handleAIQuickSave = (content: any) => {
  console.log('AI快捷生成结果:', content)
  Message.success('AI生成内容已保存！')
}

// AI高级配置
const handleAIAdvancedSave = (config: any) => {
  console.log('AI高级配置已保存:', config)
  Message.success('AI配置已保存！')
}

const handleAIAdvancedGenerate = (config: any) => {
  console.log('AI高级生成:', config)
  Message.success('AI高级生成完成！')
}

const handleAddSuccess = () => {
  Message.success('商品添加成功')
  loadProducts()
}

const handleAIGenerateSuccess = () => {
  Message.success('AI素材生成成功')
}

const handleAIConfigSuccess = () => {
  Message.success('AI高级配置保存成功')
}

// 图片预览功能
const showImagePreview = (imageUrl: string, title: string) => {
  previewImageUrl.value = imageUrl
  previewImageTitle.value = title
  zoomLevel.value = 1
  imagePreviewVisible.value = true
}

const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value = Math.min(zoomLevel.value + 0.2, 3)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(zoomLevel.value - 0.2, 0.5)
  }
}

const resetZoom = () => {
  zoomLevel.value = 1
}

const handleImageZoom = (event: WheelEvent) => {
  event.preventDefault()
  if (event.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// 生命周期
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.custom-product-management {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24px;
}

.product-card {
  position: relative;
  transition: all 0.2s ease-in-out;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.product-card img {
  transition: transform 0.2s ease-in-out;
}

.product-card:hover img {
  transform: scale(1.05);
}

/* 紫色主题样式 */
.text-purple-600 {
  color: #7c3aed;
}

.border-purple-600 {
  border-color: #7c3aed;
}

.hover\:bg-purple-50:hover {
  background-color: #faf5ff;
}

/* 响应式设计优化 */
@media (max-width: 640px) {
  .custom-product-management {
    padding: 12px;
  }
  
  /* 移动端标题和按钮布局 */
  .flex.items-center.justify-between.mb-6 {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .flex.space-x-3 {
    flex-direction: column;
    gap: 8px;
  }
  
  .flex.space-x-3 .a-button {
    width: 100%;
    justify-content: center;
  }
  
  /* 移动端查询条件优化 */
  .grid.grid-cols-1.md\\:grid-cols-4.gap-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 12px;
  }
  
  /* 移动端商品卡片 - 1列布局 */
  .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 16px;
  }
  
  /* 移动端卡片内容优化 */
  .product-card .p-4 {
    padding: 16px;
  }
  
  .product-card .flex.space-x-2 {
    flex-direction: column;
    gap: 8px;
  }
  
  .product-card .flex.space-x-2 .a-button {
    width: 100%;
    justify-content: center;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .custom-product-management {
    padding: 20px;
  }
  
  /* 平板端商品卡片 - 2列布局 */
  .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  
  /* 平板端查询条件 - 2列布局 */
  .grid.grid-cols-1.md\\:grid-cols-4.gap-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1025px) {
  /* 桌面端商品卡片 - 3列布局 */
  .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-4 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
  }
  
  /* 桌面端查询条件 - 4列布局 */
  .grid.grid-cols-1.md\\:grid-cols-4.gap-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* 图片预览相关样式 */
.image-container {
  position: relative;
  cursor: pointer;
}

.product-image {
  transition: transform 0.3s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.preview-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 12px;
  backdrop-filter: blur(4px);
}

.image-preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  transition: transform 0.2s ease;
  cursor: grab;
}

.preview-image:active {
  cursor: grabbing;
}

.preview-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 24px;
  backdrop-filter: blur(8px);
}

.control-btn {
  color: white !important;
  border: none !important;
  background: transparent !important;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.zoom-level {
  color: white;
  font-size: 14px;
  font-weight: 500;
  min-width: 50px;
  text-align: center;
}

/* 动画效果 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
  opacity: 0;
}

/* 加载动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 按钮悬停效果 */
.hover\\:scale-105:hover {
  transform: scale(1.05);
}

/* 卡片悬停效果增强 */
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* 加载骨架屏 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 进度条动画 */
.progress-bar {
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}</style>