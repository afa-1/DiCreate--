<template>
  <div class="catalog-management">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">画册管理</h1>
        <p class="page-description">管理所有电子画册，支持预览和分享</p>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="createCatalog">
          <template #icon>
            <icon-plus />
          </template>
          新建画册
        </a-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="请输入画册名称搜索"
        style="width: 300px"
        @search="handleSearch"
      />
    </div>

    <!-- 画册列表 -->
    <div class="catalog-table">
      <a-table
        :columns="columns"
        :data="filteredCatalogs"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #catalogName="{ record }">
          <div class="catalog-name-cell">
            <span class="catalog-name">{{ record.name }}</span>
          </div>
        </template>

        <template #template="{ record }">
          <a-tag color="blue">{{ record.templateName }}</a-tag>
        </template>

        <template #createdAt="{ record }">
          <span>{{ formatDate(record.createdAt) }}</span>
        </template>

        <template #actions="{ record }">
          <div class="action-buttons">
            <a-button type="text" size="small" @click="previewCatalog(record)">
              预览
            </a-button>
            <a-button type="text" size="small" @click="copyShareLink(record)">
              复制分享链接
            </a-button>
            <a-button type="text" size="small" @click="editCatalog(record)">
              编辑
            </a-button>
            <a-popconfirm
              content="确定删除该画册吗？删除后不可恢复"
              @ok="deleteCatalog(record)"
            >
              <a-button type="text" size="small" status="danger">
                删除
              </a-button>
            </a-popconfirm>
          </div>
        </template>
      </a-table>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredCatalogs.length === 0 && !loading" class="empty-state">
      <a-empty description="未找到匹配的画册，请尝试其他关键词" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

interface Catalog {
  id: string
  name: string
  templateName: string
  createdAt: string
  shareUrl: string
  status: 'draft' | 'published'
}

const router = useRouter()
const searchKeyword = ref('')
const loading = ref(false)
const catalogs = ref<Catalog[]>([])

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

const columns = [
  {
    title: '画册名称',
    dataIndex: 'name',
    slotName: 'catalogName',
    width: 200
  },
  {
    title: '所用模板',
    dataIndex: 'templateName',
    slotName: 'template',
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    slotName: 'createdAt',
    width: 180,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 250,
    align: 'center'
  }
]

const filteredCatalogs = computed(() => {
  if (!searchKeyword.value.trim()) {
    return catalogs.value
  }
  return catalogs.value.filter(catalog =>
    catalog.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
  pagination.value.current = 1
}

const handlePageChange = (page: number) => {
  pagination.value.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  pagination.value.current = 1
}

const createCatalog = () => {
  router.push('/catalog/create')
}

const previewCatalog = (catalog: Catalog) => {
  // 在新窗口打开预览页面
  window.open(catalog.shareUrl, '_blank')
}

const copyShareLink = async (catalog: Catalog) => {
  try {
    await navigator.clipboard.writeText(catalog.shareUrl)
    Message.success('分享链接已复制到剪贴板，可直接粘贴分享')
  } catch (error) {
    Message.error('复制失败，请手动复制链接')
  }
}

const editCatalog = (catalog: Catalog) => {
  router.push(`/catalog/editor/${catalog.id}`)
}

const deleteCatalog = (catalog: Catalog) => {
  const index = catalogs.value.findIndex(item => item.id === catalog.id)
  if (index > -1) {
    catalogs.value.splice(index, 1)
    pagination.value.total = catalogs.value.length
    Message.success('画册已删除')
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadCatalogs = () => {
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    catalogs.value = [
      {
        id: '1',
        name: '山东大学学位服定制方案',
        templateName: '通用产品画册模板',
        createdAt: '2024-01-15 14:30:00',
        shareUrl: 'https://afa-1.github.io/e-book/',
        status: 'published'
      },
      {
        id: '2',
        name: '企业职业装展示画册',
        templateName: '通用产品画册模板',
        createdAt: '2024-01-14 10:20:00',
        shareUrl: 'https://afa-1.github.io/e-book/',
        status: 'draft'
      }
    ]
    pagination.value.total = catalogs.value.length
    loading.value = false
  }, 1000)
}

onMounted(() => {
  loadCatalogs()
})
</script>

<style scoped>
.catalog-management {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1d2129;
}

.page-description {
  color: #86909c;
  margin: 0;
}

.search-section {
  margin-bottom: 24px;
}

.catalog-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.catalog-name-cell {
  display: flex;
  align-items: center;
}

.catalog-name {
  font-weight: 500;
  color: #1d2129;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #fff;
  border-radius: 8px;
}
</style>