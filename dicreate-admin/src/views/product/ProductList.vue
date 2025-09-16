<template>
  <div class="product-list">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">商品列表</h1>
        <a-button type="primary" @click="$router.push('/product/create')">
          <icon-plus class="mr-2" />
          新增商品
        </a-button>
      </div>
      
      <!-- 搜索和筛选 -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a-input placeholder="搜索商品名称" allow-clear>
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
          <a-select placeholder="商品分类" allow-clear>
            <a-option value="clothing">服装</a-option>
            <a-option value="accessories">配饰</a-option>
          </a-select>
          <a-select placeholder="商品状态" allow-clear>
            <a-option value="online">已上架</a-option>
            <a-option value="offline">已下架</a-option>
            <a-option value="draft">草稿</a-option>
          </a-select>
          <a-button type="primary">搜索</a-button>
        </div>
      </div>
      
      <!-- 商品表格 -->
      <a-table
        :columns="columns"
        :data="mockData"
        :pagination="pagination"
        row-key="id"
      >
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button size="small" @click="handleView(record)">查看</a-button>
            <a-dropdown>
              <a-button size="small">
                更多
                <icon-down class="ml-1" />
              </a-button>
              <template #content>
                <a-doption @click="handleToggleStatus(record)">
                  {{ record.status === 'online' ? '下架' : '上架' }}
                </a-doption>
                <a-doption class="text-red-500" @click="handleDelete(record)">
                  删除
                </a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconDown } from '@arco-design/web-vue/es/icon'

// 表格列定义
const columns = [
  {
    title: '商品ID',
    dataIndex: 'id',
    width: 100
  },
  {
    title: '商品名称',
    dataIndex: 'name',
    width: 200
  },
  {
    title: '分类',
    dataIndex: 'category',
    width: 120
  },
  {
    title: '价格',
    dataIndex: 'price',
    width: 100,
    render: ({ record }: any) => `¥${record.price}`
  },
  {
    title: '库存',
    dataIndex: 'stock',
    width: 80
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 150,
    render: ({ record }: any) => new Date(record.createdAt).toLocaleDateString()
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 模拟数据
const mockData = ref([
  {
    id: 'P001',
    name: '经典白衬衫',
    category: '服装',
    price: 299,
    stock: 150,
    status: 'online',
    createdAt: new Date().toISOString()
  },
  {
    id: 'P002',
    name: '商务西装',
    category: '服装',
    price: 1299,
    stock: 50,
    status: 'online',
    createdAt: new Date().toISOString()
  },
  {
    id: 'P003',
    name: '休闲牛仔裤',
    category: '服装',
    price: 399,
    stock: 0,
    status: 'offline',
    createdAt: new Date().toISOString()
  }
])

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 100,
  showTotal: true,
  showPageSize: true
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    online: 'green',
    offline: 'red',
    draft: 'orange'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    online: '已上架',
    offline: '已下架',
    draft: '草稿'
  }
  return textMap[status] || '未知'
}

// 编辑商品
const handleEdit = (record: any) => {
  Message.info(`编辑商品: ${record.name}`)
}

// 查看商品
const handleView = (record: any) => {
  Message.info(`查看商品: ${record.name}`)
}

// 切换状态
const handleToggleStatus = (record: any) => {
  const newStatus = record.status === 'online' ? 'offline' : 'online'
  Message.success(`商品${record.name}已${newStatus === 'online' ? '上架' : '下架'}`)
}

// 删除商品
const handleDelete = (record: any) => {
  Message.warning(`删除商品: ${record.name}`)
}
</script>

<style scoped>
.product-list {
  animation: fadeIn 0.3s ease-in-out;
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
</style>