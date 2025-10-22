<template>
  <div class="custom-product-management">
    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索商品名称或描述"
          class="w-64"
          @search="handleSearch"
        />
        <a-select
          v-model="selectedCategory"
          placeholder="选择分类"
          class="w-40"
          @change="handleCategoryChange"
        >
          <a-option value="">全部分类</a-option>
          <a-option value="clothing">服装</a-option>
          <a-option value="accessories">配饰</a-option>
          <a-option value="home">家居</a-option>
        </a-select>
        <a-select
          v-model="selectedStatus"
          placeholder="选择状态"
          class="w-32"
          @change="handleStatusChange"
        >
          <a-option value="">全部状态</a-option>
          <a-option value="active">上架</a-option>
          <a-option value="inactive">下架</a-option>
        </a-select>
        <a-button type="primary" @click="handleAddProduct">
          <template #icon><icon-plus /></template>
          添加商品
        </a-button>
      </div>
    </div>

    <!-- 商品卡片网格 -->
    <div class="product-grid">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="product in paginatedProducts"
          :key="product.id"
          class="product-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          @click="handleCardClick(product)"
        >
          <!-- 商品图片 -->
          <div class="relative">
            <img
              :src="product.image"
              :alt="product.name"
              class="w-full h-48 object-cover rounded-t-lg"
            />
            <div class="absolute top-2 right-2">
              <a-tag
                :color="product.status === 'active' ? 'green' : 'red'"
                class="text-xs"
              >
                {{ product.status === 'active' ? '上架' : '下架' }}
              </a-tag>
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2 truncate">
              {{ product.name }}
            </h3>
            <p class="text-gray-600 text-sm mb-3 line-clamp-2">
              {{ product.description }}
            </p>
            
            <!-- 价格单独一行 -->
            <div class="mb-3">
              <span class="text-xl font-bold text-red-500">
                ¥{{ product.price }}
              </span>
            </div>

            <!-- 按钮区域 - 两行布局 -->
            <div class="space-y-2">
              <!-- 第一行：AI快捷生成、AI高级配置 -->
              <div class="flex gap-2">
                <a-button
                  type="outline"
                  size="small"
                  class="flex-1 text-purple-600 border-purple-300 hover:bg-purple-50"
                  @click.stop="showAIQuickModal(product)"
                >
                  AI快捷生成
                </a-button>
                <a-button
                  type="outline"
                  size="small"
                  class="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                  @click.stop="showAIAdvancedModal(product)"
                >
                  AI高级配置
                </a-button>
              </div>
              
              <!-- 第二行：编辑、删除 -->
              <div class="flex gap-2">
                <a-button
                  type="outline"
                  size="small"
                  class="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                  @click.stop="editProduct(product)"
                >
                  编辑
                </a-button>
                <a-button
                  type="outline"
                  size="small"
                  class="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  @click.stop="deleteProduct(product)"
                >
                  删除
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="flex justify-center mt-8">
      <a-pagination
        v-model:current="currentPage"
        :total="filteredProducts.length"
        :page-size="pageSize"
        show-total
        show-jumper
        show-page-size
        @change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- AI快捷生成弹窗 -->
    <a-modal
      v-model:visible="aiQuickModalVisible"
      title="AI快捷生成"
      width="600px"
      @ok="generateAlbum"
      @cancel="aiQuickModalVisible = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            生成类型
          </label>
          <a-radio-group v-model="aiQuickConfig.type" class="w-full">
            <a-radio value="album">商品相册</a-radio>
            <a-radio value="description">商品描述</a-radio>
            <a-radio value="tags">商品标签</a-radio>
          </a-radio-group>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            生成数量
          </label>
          <a-input-number
            v-model="aiQuickConfig.count"
            :min="1"
            :max="10"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            风格偏好
          </label>
          <a-select v-model="aiQuickConfig.style" class="w-full">
            <a-option value="modern">现代简约</a-option>
            <a-option value="vintage">复古风格</a-option>
            <a-option value="minimalist">极简主义</a-option>
            <a-option value="luxury">奢华风格</a-option>
          </a-select>
        </div>
      </div>
    </a-modal>

    <!-- AI高级配置弹窗 -->
    <a-modal
      v-model:visible="aiAdvancedModalVisible"
      title="AI高级配置"
      width="800px"
      @ok="generateAdvanced"
      @cancel="aiAdvancedModalVisible = false"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              目标受众
            </label>
            <a-select v-model="aiAdvancedConfig.audience" class="w-full">
              <a-option value="young">年轻人群</a-option>
              <a-option value="middle">中年人群</a-option>
              <a-option value="senior">老年人群</a-option>
              <a-option value="all">全年龄段</a-option>
            </a-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              价格区间
            </label>
            <a-select v-model="aiAdvancedConfig.priceRange" class="w-full">
              <a-option value="low">经济型</a-option>
              <a-option value="medium">中档</a-option>
              <a-option value="high">高端</a-option>
              <a-option value="luxury">奢侈品</a-option>
            </a-select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            关键词
          </label>
          <a-textarea
            v-model="aiAdvancedConfig.keywords"
            placeholder="请输入相关关键词，用逗号分隔"
            :rows="3"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            品牌调性
          </label>
          <a-checkbox-group v-model="aiAdvancedConfig.brandTone" class="w-full">
            <a-checkbox value="professional">专业</a-checkbox>
            <a-checkbox value="friendly">友好</a-checkbox>
            <a-checkbox value="innovative">创新</a-checkbox>
            <a-checkbox value="trustworthy">可信赖</a-checkbox>
            <a-checkbox value="trendy">时尚</a-checkbox>
          </a-checkbox-group>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            生成内容
          </label>
          <a-checkbox-group v-model="aiAdvancedConfig.contentTypes" class="w-full">
            <a-checkbox value="images">商品图片</a-checkbox>
            <a-checkbox value="description">详细描述</a-checkbox>
            <a-checkbox value="specifications">规格参数</a-checkbox>
            <a-checkbox value="usage">使用说明</a-checkbox>
            <a-checkbox value="marketing">营销文案</a-checkbox>
          </a-checkbox-group>
        </div>
      </div>
    </a-modal>

    <!-- 商品详情弹窗 -->
    <a-modal
      v-model:visible="productDetailVisible"
      :title="selectedProduct?.name"
      width="900px"
      :footer="false"
    >
      <div v-if="selectedProduct" class="space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <img
              :src="selectedProduct.image"
              :alt="selectedProduct.name"
              class="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div class="space-y-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">
                {{ selectedProduct.name }}
              </h3>
              <p class="text-gray-600 mt-2">
                {{ selectedProduct.description }}
              </p>
            </div>
            <div>
              <span class="text-2xl font-bold text-red-500">
                ¥{{ selectedProduct.price }}
              </span>
            </div>
            <div class="flex gap-2">
              <a-tag
                :color="selectedProduct.status === 'active' ? 'green' : 'red'"
              >
                {{ selectedProduct.status === 'active' ? '上架' : '下架' }}
              </a-tag>
              <a-tag color="blue">
                {{ getCategoryName(selectedProduct.category) }}
              </a-tag>
            </div>
          </div>
        </div>
        
        <!-- 商品规格 -->
        <div>
          <h4 class="text-lg font-medium text-gray-800 mb-3">商品规格</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">材质：</span>
              <span>{{ selectedProduct.material || '暂无' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">尺寸：</span>
              <span>{{ selectedProduct.size || '暂无' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">颜色：</span>
              <span>{{ selectedProduct.color || '暂无' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">重量：</span>
              <span>{{ selectedProduct.weight || '暂无' }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 添加商品弹窗 -->
    <a-modal
      v-model:visible="addProductModalVisible"
      title="添加商品"
      width="700px"
      @ok="handleSaveProduct"
      @cancel="addProductModalVisible = false"
    >
      <a-form :model="newProduct" layout="vertical">
        <div class="grid grid-cols-2 gap-4">
          <a-form-item label="商品名称" required>
            <a-input v-model="newProduct.name" placeholder="请输入商品名称" />
          </a-form-item>
          <a-form-item label="商品价格" required>
            <a-input-number
              v-model="newProduct.price"
              placeholder="请输入价格"
              :min="0"
              :precision="2"
              class="w-full"
            />
          </a-form-item>
        </div>
        <a-form-item label="商品描述">
          <a-textarea
            v-model="newProduct.description"
            placeholder="请输入商品描述"
            :rows="3"
          />
        </a-form-item>
        <div class="grid grid-cols-2 gap-4">
          <a-form-item label="商品分类">
            <a-select v-model="newProduct.category" placeholder="选择分类">
              <a-option value="clothing">服装</a-option>
              <a-option value="accessories">配饰</a-option>
              <a-option value="home">家居</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="商品状态">
            <a-select v-model="newProduct.status" placeholder="选择状态">
              <a-option value="active">上架</a-option>
              <a-option value="inactive">下架</a-option>
            </a-select>
          </a-form-item>
        </div>
        <a-form-item label="商品图片">
          <a-upload
            :file-list="newProduct.imageList"
            :show-file-list="false"
            @change="handleImageUpload"
          >
            <template #upload-button>
              <div class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <icon-plus class="text-2xl text-gray-400 mb-2" />
                <div class="text-gray-600">点击上传图片</div>
              </div>
            </template>
          </a-upload>
          <div v-if="newProduct.imagePreview" class="mt-4">
            <img
              :src="newProduct.imagePreview"
              alt="预览"
              class="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { Modal } from '@arco-design/web-vue'

// 响应式数据
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(12)

// 弹窗状态
const aiQuickModalVisible = ref(false)
const aiAdvancedModalVisible = ref(false)
const productDetailVisible = ref(false)
const addProductModalVisible = ref(false)

// 选中的商品
const selectedProduct = ref(null)

// AI配置
const aiQuickConfig = ref({
  type: 'album',
  count: 5,
  style: 'modern'
})

const aiAdvancedConfig = ref({
  audience: 'all',
  priceRange: 'medium',
  keywords: '',
  brandTone: [],
  contentTypes: []
})

// 新商品数据
const newProduct = ref({
  name: '',
  price: 0,
  description: '',
  category: '',
  status: 'active',
  imageList: [],
  imagePreview: ''
})

// 模拟商品数据
const products = ref([
  {
    id: 1,
    name: '定制T恤衫',
    description: '100%纯棉材质，舒适透气，支持个性化定制印花',
    price: 299.00,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'clothing',
    status: 'active',
    material: '100%纯棉',
    size: 'S/M/L/XL',
    color: '白色/黑色/灰色',
    weight: '200g'
  },
  {
    id: 2,
    name: '个性化帆布包',
    description: '环保帆布材质，大容量设计，可定制专属图案',
    price: 159.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    category: 'accessories',
    status: 'active',
    material: '帆布',
    size: '40x35x10cm',
    color: '原色/黑色',
    weight: '300g'
  },
  {
    id: 3,
    name: '定制马克杯',
    description: '陶瓷材质，保温效果好，支持照片和文字定制',
    price: 89.00,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
    category: 'home',
    status: 'active',
    material: '陶瓷',
    size: '350ml',
    color: '白色/黑色',
    weight: '400g'
  },
  {
    id: 4,
    name: '个性化手机壳',
    description: '硅胶材质，防摔保护，支持多种手机型号定制',
    price: 79.00,
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
    category: 'accessories',
    status: 'inactive',
    material: '硅胶',
    size: '多型号适配',
    color: '透明/黑色/彩色',
    weight: '50g'
  },
  {
    id: 5,
    name: '定制卫衣',
    description: '加厚保暖，柔软舒适，支持刺绣和印花定制',
    price: 399.00,
    image: 'https://images.unsplash.com/photo-1556821840-3a9c6dcb3be8?w=400',
    category: 'clothing',
    status: 'active',
    material: '棉混纺',
    size: 'S/M/L/XL/XXL',
    color: '灰色/黑色/白色',
    weight: '600g'
  },
  {
    id: 6,
    name: '个性化鼠标垫',
    description: '防滑底座，精准定位，支持高清图片定制',
    price: 39.00,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    category: 'accessories',
    status: 'active',
    material: '橡胶+布面',
    size: '25x20cm',
    color: '黑色边框',
    weight: '100g'
  }
])

// 计算属性
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = !searchKeyword.value || 
      product.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      product.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    const matchesCategory = !selectedCategory.value || product.category === selectedCategory.value
    const matchesStatus = !selectedStatus.value || product.status === selectedStatus.value
    
    return matchesSearch && matchesCategory && matchesStatus
  })
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleCategoryChange = () => {
  currentPage.value = 1
}

const handleStatusChange = () => {
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCardClick = (product: any) => {
  selectedProduct.value = product
  productDetailVisible.value = true
}

const showAIQuickModal = (product: any) => {
  selectedProduct.value = product
  aiQuickModalVisible.value = true
}

const showAIAdvancedModal = (product: any) => {
  selectedProduct.value = product
  aiAdvancedModalVisible.value = true
}

const generateAlbum = () => {
  // 模拟AI生成过程
  console.log('生成相册配置:', aiQuickConfig.value)
  // 这里可以调用实际的AI生成API
  aiQuickModalVisible.value = false
  
  // 显示生成结果通知
  generateSampleNotice()
}

const generateAdvanced = () => {
  // 模拟AI高级生成过程
  console.log('高级生成配置:', aiAdvancedConfig.value)
  // 这里可以调用实际的AI生成API
  aiAdvancedModalVisible.value = false
  
  // 显示生成结果通知
  generateSampleNotice()
}

const generateSampleNotice = () => {
  // 这里可以显示生成结果的通知
  console.log('AI生成完成')
}

const handleAddProduct = () => {
  // 重置新商品数据
  newProduct.value = {
    name: '',
    price: 0,
    description: '',
    category: '',
    status: 'active',
    imageList: [],
    imagePreview: ''
  }
  addProductModalVisible.value = true
}

const handleSaveProduct = () => {
  // 验证表单数据
  if (!newProduct.value.name || !newProduct.value.price) {
    console.log('请填写必要信息')
    return
  }
  
  // 添加新商品到列表
  const newId = Math.max(...products.value.map(p => p.id)) + 1
  products.value.unshift({
    ...newProduct.value,
    id: newId,
    image: newProduct.value.imagePreview || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'
  })
  
  addProductModalVisible.value = false
  console.log('商品添加成功')
}

const handleImageUpload = (fileList: any) => {
  if (fileList.length > 0) {
    const file = fileList[0].originFile
    const reader = new FileReader()
    reader.onload = (e) => {
      newProduct.value.imagePreview = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    clothing: '服装',
    accessories: '配饰',
    home: '家居'
  }
  return categoryMap[category] || category
}

// 编辑商品
const editProduct = (product: any) => {
  console.log('编辑商品:', product.name)
  // 这里可以打开编辑弹窗或跳转到编辑页面
  // 示例：显示商品信息
  Modal.info({
    title: '编辑商品',
    content: `正在编辑商品：${product.name}`,
    okText: '确定'
  })
}

// 删除商品
const deleteProduct = (product: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除商品「${product.name}」吗？此操作不可恢复。`,
    okText: '确定删除',
    cancelText: '取消',
    okButtonProps: {
      status: 'danger'
    },
    onOk: () => {
      // 模拟删除操作
      const index = products.value.findIndex(p => p.id === product.id)
      if (index > -1) {
        products.value.splice(index, 1)
        console.log('商品删除成功')
      }
    }
  })
}

onMounted(() => {
  // 组件挂载后的初始化操作
  console.log('定制商品管理页面已加载')
})
</script>

<style scoped>
.custom-product-management {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.search-filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-grid {
  background: transparent;
}

.product-card {
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.upload-area {
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-product-management {
    padding: 16px;
  }
  
  .search-filter-section {
    padding: 16px;
  }
  
  .search-filter-section .flex {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter-section .flex > * {
    width: 100%;
    margin-bottom: 8px;
  }
}

@media (max-width: 640px) {
  .product-grid .grid {
    grid-template-columns: 1fr;
  }
}
</style>