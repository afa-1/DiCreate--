<template>
  <div class="product-component-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2>服装部件管理</h2>
        <p class="page-description">管理服装定制部件信息，包括校徽、袖口、印花等部件的基础信息维护</p>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="showCreateModal">
          <template #icon>
            <icon-plus />
          </template>
          新增部件
        </a-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <a-card>
        <a-form :model="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="部件名称">
            <a-input
              v-model="searchForm.name"
              placeholder="请输入部件名称"
              allow-clear
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item label="部件类型">
            <a-select
              v-model="searchForm.type"
              placeholder="请选择部件类型"
              allow-clear
              style="width: 150px"
            >
              <a-option value="badge">校徽</a-option>
              <a-option value="cuff">袖口</a-option>
              <a-option value="print">印花</a-option>
              <a-option value="fabric">面料</a-option>
              <a-option value="color">颜色</a-option>
              <a-option value="font">字体</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="所属服装">
            <a-select
              v-model="searchForm.productId"
              placeholder="请选择服装"
              allow-clear
              style="width: 200px"
            >
              <a-option
                v-for="product in productList"
                :key="product.id"
                :value="product.id"
              >
                {{ product.name }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              allow-clear
              style="width: 120px"
            >
              <a-option value="active">启用</a-option>
              <a-option value="inactive">禁用</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">
              <template #icon>
                <icon-search />
              </template>
              搜索
            </a-button>
            <a-button @click="handleReset" style="margin-left: 8px">
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-card>
        <a-table
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :pagination="pagination"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #image="{ record }">
            <a-image
              v-if="record.image"
              :src="record.image"
              :width="60"
              :height="60"
              fit="cover"
              :preview="true"
            />
            <span v-else class="no-image">暂无图片</span>
          </template>

          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>

          <template #price="{ record }">
            <span class="price-text">¥{{ record.price }}</span>
          </template>

          <template #status="{ record }">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '启用' : '禁用' }}
            </a-tag>
          </template>

          <template #actions="{ record }">
            <a-button type="text" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-button type="text" size="small" @click="handleView(record)">
              查看
            </a-button>
            <a-popconfirm
              content="确定要删除这个部件吗？"
              @ok="handleDelete(record.id)"
            >
              <a-button type="text" size="small" status="danger">
                删除
              </a-button>
            </a-popconfirm>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="800px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="部件名称" field="name">
              <a-input v-model="formData.name" placeholder="请输入部件名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="部件类型" field="type">
              <a-select v-model="formData.type" placeholder="请选择部件类型">
                <a-option value="badge">校徽</a-option>
                <a-option value="cuff">袖口</a-option>
                <a-option value="print">印花</a-option>
                <a-option value="fabric">面料</a-option>
                <a-option value="color">颜色</a-option>
                <a-option value="font">字体</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所属服装" field="productId">
              <a-select v-model="formData.productId" placeholder="请选择服装">
                <a-option
                  v-for="product in productList"
                  :key="product.id"
                  :value="product.id"
                >
                  {{ product.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="价格" field="price">
              <a-input-number
                v-model="formData.price"
                placeholder="请输入价格"
                :min="0"
                :precision="2"
                style="width: 100%"
              >
                <template #suffix>元</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="部件图片" field="image">
          <a-upload
            :custom-request="handleUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <template #upload-button>
              <div class="upload-area">
                <div v-if="formData.image" class="image-preview">
                  <a-image
                    :src="formData.image"
                    :width="120"
                    :height="120"
                    fit="cover"
                  />
                  <div class="image-overlay">
                    <icon-edit class="edit-icon" />
                  </div>
                </div>
                <div v-else class="upload-placeholder">
                  <icon-plus class="upload-icon" />
                  <div class="upload-text">点击上传图片</div>
                </div>
              </div>
            </template>
          </a-upload>
        </a-form-item>

        <a-form-item label="规格说明">
          <a-textarea
            v-model="formData.specification"
            placeholder="请输入规格说明"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea
            v-model="formData.remark"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </a-form-item>

        <a-form-item label="状态">
          <a-radio-group v-model="formData.status">
            <a-radio value="active">启用</a-radio>
            <a-radio value="inactive">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:visible="viewModalVisible"
      title="部件详情"
      width="600px"
      :footer="false"
    >
      <div v-if="viewData" class="detail-content">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="部件名称">
            {{ viewData.name }}
          </a-descriptions-item>
          <a-descriptions-item label="部件类型">
            <a-tag :color="getTypeColor(viewData.type)">
              {{ getTypeText(viewData.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="所属服装">
            {{ viewData.productName }}
          </a-descriptions-item>
          <a-descriptions-item label="价格">
            <span class="price-text">¥{{ viewData.price }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="viewData.status === 'active' ? 'green' : 'red'">
              {{ viewData.status === 'active' ? '启用' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ viewData.createTime }}
          </a-descriptions-item>
          <a-descriptions-item label="部件图片" :span="2">
            <a-image
              v-if="viewData.image"
              :src="viewData.image"
              :width="200"
              :height="200"
              fit="cover"
            />
            <span v-else>暂无图片</span>
          </a-descriptions-item>
          <a-descriptions-item label="规格说明" :span="2">
            {{ viewData.specification || '暂无' }}
          </a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">
            {{ viewData.remark || '暂无' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconSearch,
  IconEdit
} from '@arco-design/web-vue/es/icon'

// 接口类型定义
interface ProductComponent {
  id: string
  name: string
  type: string
  productId: string
  productName: string
  price: number
  image: string
  specification: string
  remark: string
  status: 'active' | 'inactive'
  createTime: string
}

interface Product {
  id: string
  name: string
}

// 响应式数据
const loading = ref(false)
const modalVisible = ref(false)
const viewModalVisible = ref(false)
const modalTitle = ref('新增部件')
const isEdit = ref(false)
const currentId = ref('')

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  productId: '',
  status: ''
})

// 表单数据
const formData = reactive({
  name: '',
  type: '',
  productId: '',
  price: 0,
  image: '',
  specification: '',
  remark: '',
  status: 'active' as 'active' | 'inactive'
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入部件名称' }],
  type: [{ required: true, message: '请选择部件类型' }],
  productId: [{ required: true, message: '请选择所属服装' }],
  price: [{ required: true, message: '请输入价格' }]
}

// 查看详情数据
const viewData = ref<ProductComponent | null>(null)

// 产品列表
const productList = ref<Product[]>([])

// 表格数据
const tableData = ref<ProductComponent[]>([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 表格列配置
const columns = [
  {
    title: '部件名称',
    dataIndex: 'name',
    width: 150
  },
  {
    title: '部件类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 120
  },
  {
    title: '所属服装',
    dataIndex: 'productName',
    width: 180
  },
  {
    title: '部件图片',
    dataIndex: 'image',
    slotName: 'image',
    width: 100
  },
  {
    title: '价格',
    dataIndex: 'price',
    slotName: 'price',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 80
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 获取部件类型文本
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    badge: '校徽',
    cuff: '袖口',
    print: '印花',
    fabric: '面料',
    color: '颜色',
    font: '字体'
  }
  return typeMap[type] || type
}

// 获取部件类型颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    badge: 'blue',
    cuff: 'green',
    print: 'orange',
    fabric: 'purple',
    color: 'red',
    font: 'cyan'
  }
  return colorMap[type] || 'gray'
}

// 获取产品列表
const fetchProductList = async () => {
  try {
    // 模拟API调用
    productList.value = [
      { id: '1', name: 'T恤衫' },
      { id: '2', name: '卫衣' },
      { id: '3', name: '衬衫' },
      { id: '4', name: '夹克' }
    ]
  } catch (error) {
    Message.error('获取产品列表失败')
  }
}

// 获取部件列表
const fetchComponentList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    const mockData: ProductComponent[] = [
      {
        id: '1',
        name: '学校校徽',
        type: 'badge',
        productId: '1',
        productName: 'T恤衫',
        price: 15.00,
        image: 'https://via.placeholder.com/120x120?text=校徽',
        specification: '尺寸：5cm x 5cm，材质：刺绣',
        remark: '适用于胸前位置',
        status: 'active',
        createTime: '2024-01-15 10:30:00'
      },
      {
        id: '2',
        name: '条纹袖口',
        type: 'cuff',
        productId: '2',
        productName: '卫衣',
        price: 8.50,
        image: 'https://via.placeholder.com/120x120?text=袖口',
        specification: '宽度：3cm，材质：针织',
        remark: '黑白条纹设计',
        status: 'active',
        createTime: '2024-01-14 14:20:00'
      },
      {
        id: '3',
        name: '花朵印花',
        type: 'print',
        productId: '1',
        productName: 'T恤衫',
        price: 12.00,
        image: 'https://via.placeholder.com/120x120?text=印花',
        specification: '尺寸：10cm x 8cm，工艺：数码印花',
        remark: '春季主题设计',
        status: 'active',
        createTime: '2024-01-13 09:15:00'
      }
    ]
    
    tableData.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    Message.error('获取部件列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  fetchComponentList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    productId: '',
    status: ''
  })
  fetchComponentList()
}

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page
  fetchComponentList()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchComponentList()
}

// 显示新增弹窗
const showCreateModal = () => {
  modalTitle.value = '新增部件'
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: ProductComponent) => {
  modalTitle.value = '编辑部件'
  isEdit.value = true
  currentId.value = record.id
  Object.assign(formData, {
    name: record.name,
    type: record.type,
    productId: record.productId,
    price: record.price,
    image: record.image,
    specification: record.specification,
    remark: record.remark,
    status: record.status
  })
  modalVisible.value = true
}

// 查看详情
const handleView = (record: ProductComponent) => {
  viewData.value = record
  viewModalVisible.value = true
}

// 删除
const handleDelete = async (id: string) => {
  try {
    // 模拟API调用
    Message.success('删除成功')
    fetchComponentList()
  } catch (error) {
    Message.error('删除失败')
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    type: '',
    productId: '',
    price: 0,
    image: '',
    specification: '',
    remark: '',
    status: 'active'
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 模拟API调用
    if (isEdit.value) {
      Message.success('更新成功')
    } else {
      Message.success('创建成功')
    }
    modalVisible.value = false
    fetchComponentList()
  } catch (error) {
    Message.error(isEdit.value ? '更新失败' : '创建失败')
  }
}

// 取消
const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 文件上传
const handleUpload = (option: any) => {
  // 模拟文件上传
  const file = option.fileItem.file
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.image = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return Promise.resolve()
}

// 组件挂载
onMounted(() => {
  fetchProductList()
  fetchComponentList()
})
</script>

<style scoped>
.product-component-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: var(--color-text-2);
  font-size: 14px;
}

.search-section {
  margin-bottom: 20px;
}

.table-section {
  margin-bottom: 20px;
}

.no-image {
  color: var(--color-text-3);
  font-size: 12px;
}

.price-text {
  color: var(--color-danger-6);
  font-weight: 500;
}

.upload-area {
  position: relative;
  display: inline-block;
}

.image-preview {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
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
  transition: opacity 0.3s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.edit-icon {
  color: white;
  font-size: 20px;
}

.upload-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed var(--color-border-2);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: var(--color-primary-6);
}

.upload-icon {
  font-size: 24px;
  color: var(--color-text-3);
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
  color: var(--color-text-3);
}

.detail-content {
  padding: 16px 0;
}
</style>