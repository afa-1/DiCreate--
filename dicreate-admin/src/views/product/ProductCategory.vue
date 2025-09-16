<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">商品分类</h1>
        <p class="text-gray-600 mt-1">管理商品分类信息</p>
      </div>
      <a-button type="primary" @click="showAddModal = true">
        <template #icon><icon-plus /></template>
        新增分类
      </a-button>
    </div>

    <!-- 分类树 -->
    <div class="bg-white rounded-lg shadow">
      <a-tree
        :data="categoryTree"
        :show-line="true"
        :default-expand-all="true"
        class="p-4"
      >
        <template #title="{ title, key }">
          <div class="flex items-center justify-between w-full">
            <span>{{ title }}</span>
            <a-space>
              <a-button size="mini" @click.stop="editCategory(key)">
                <template #icon><icon-edit /></template>
              </a-button>
              <a-button size="mini" status="danger" @click.stop="deleteCategory(key)">
                <template #icon><icon-delete /></template>
              </a-button>
            </a-space>
          </div>
        </template>
      </a-tree>
    </div>

    <!-- 新增/编辑分类弹窗 -->
    <a-modal
      v-model:visible="showAddModal"
      :title="editingCategory ? '编辑分类' : '新增分类'"
      @ok="handleSaveCategory"
      @cancel="handleCancelEdit"
    >
      <a-form :model="categoryForm" layout="vertical">
        <a-form-item field="name" label="分类名称">
          <a-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </a-form-item>
        <a-form-item field="parentId" label="上级分类">
          <a-tree-select
            v-model="categoryForm.parentId"
            :data="categoryOptions"
            placeholder="请选择上级分类（可选）"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="sort" label="排序">
          <a-input-number v-model="categoryForm.sort" :min="0" placeholder="排序值" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon'

interface Category {
  key: string
  title: string
  parentId?: string
  sort: number
  children?: Category[]
}

const showAddModal = ref(false)
const editingCategory = ref<Category | null>(null)

const categoryForm = reactive({
  name: '',
  parentId: '',
  sort: 0
})

// 模拟分类数据
const categories = ref<Category[]>([
  {
    key: '1',
    title: '上装',
    sort: 1,
    children: [
      { key: '1-1', title: 'T恤', parentId: '1', sort: 1 },
      { key: '1-2', title: '衬衫', parentId: '1', sort: 2 },
      { key: '1-3', title: '外套', parentId: '1', sort: 3 }
    ]
  },
  {
    key: '2',
    title: '下装',
    sort: 2,
    children: [
      { key: '2-1', title: '牛仔裤', parentId: '2', sort: 1 },
      { key: '2-2', title: '休闲裤', parentId: '2', sort: 2 },
      { key: '2-3', title: '短裤', parentId: '2', sort: 3 }
    ]
  },
  {
    key: '3',
    title: '连衣裙',
    sort: 3,
    children: [
      { key: '3-1', title: '长裙', parentId: '3', sort: 1 },
      { key: '3-2', title: '短裙', parentId: '3', sort: 2 }
    ]
  },
  {
    key: '4',
    title: '配饰',
    sort: 4,
    children: [
      { key: '4-1', title: '帽子', parentId: '4', sort: 1 },
      { key: '4-2', title: '包包', parentId: '4', sort: 2 },
      { key: '4-3', title: '鞋子', parentId: '4', sort: 3 }
    ]
  }
])

const categoryTree = computed(() => categories.value)

const categoryOptions = computed(() => {
  const options: any[] = []
  const addOptions = (items: Category[], level = 0) => {
    items.forEach(item => {
      options.push({
        key: item.key,
        title: item.title,
        value: item.key
      })
      if (item.children) {
        addOptions(item.children, level + 1)
      }
    })
  }
  addOptions(categories.value)
  return options
})

const editCategory = (key: string) => {
  // 查找要编辑的分类
  const findCategory = (items: Category[]): Category | null => {
    for (const item of items) {
      if (item.key === key) return item
      if (item.children) {
        const found = findCategory(item.children)
        if (found) return found
      }
    }
    return null
  }
  
  const category = findCategory(categories.value)
  if (category) {
    editingCategory.value = category
    categoryForm.name = category.title
    categoryForm.parentId = category.parentId || ''
    categoryForm.sort = category.sort
    showAddModal.value = true
  }
}

const deleteCategory = (key: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个分类吗？删除后不可恢复。',
    onOk: () => {
      // 模拟删除操作
      Message.success('分类删除成功')
    }
  })
}

const handleSaveCategory = () => {
  if (!categoryForm.name.trim()) {
    Message.error('请输入分类名称')
    return
  }
  
  // 模拟保存操作
  Message.success(editingCategory.value ? '分类更新成功' : '分类创建成功')
  showAddModal.value = false
  handleCancelEdit()
}

const handleCancelEdit = () => {
  editingCategory.value = null
  categoryForm.name = ''
  categoryForm.parentId = ''
  categoryForm.sort = 0
}
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>