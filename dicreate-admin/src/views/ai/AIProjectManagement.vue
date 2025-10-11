<template>
  <div class="ai-project-management">
    <!-- 页面标题 -->
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">项目管理</h1>
          <p class="text-gray-600 mt-2">管理AI图生视频项目，跟踪项目进度和状态</p>
        </div>
        <div class="flex space-x-3">
          <a-button @click="exportProjects">
            <template #icon>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m-6 4h8"></path>
              </svg>
            </template>
            导出项目
          </a-button>
          <a-button type="primary" @click="createProject">
            <template #icon>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </template>
            新建项目
          </a-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总项目</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">已完成</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.completed }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">进行中</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.inProgress }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-100 text-red-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">异常</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选搜索区 -->
    <div class="bg-white rounded-lg shadow mb-6 p-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div class="flex-1 max-w-md">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索项目名称或描述"
            @search="handleSearch"
            enter-button
          />
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">状态:</span>
            <a-select v-model:value="statusFilter" class="w-32" size="small" allow-clear placeholder="全部状态">
              <a-select-option value="draft">草稿</a-select-option>
              <a-select-option value="processing">处理中</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
              <a-select-option value="error">异常</a-select-option>
            </a-select>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">品类:</span>
            <a-select v-model:value="categoryFilter" class="w-32" size="small" allow-clear placeholder="全部品类">
              <a-select-option value="sportswear">运动服</a-select-option>
              <a-select-option value="casual">休闲服</a-select-option>
              <a-select-option value="formal">正装</a-select-option>
              <a-select-option value="accessories">配饰</a-select-option>
            </a-select>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">排序:</span>
            <a-select v-model:value="sortBy" class="w-32" size="small">
              <a-select-option value="created_desc">最新创建</a-select-option>
              <a-select-option value="created_asc">最早创建</a-select-option>
              <a-select-option value="updated_desc">最近更新</a-select-option>
              <a-select-option value="name_asc">名称A-Z</a-select-option>
            </a-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目列表 -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-4 py-3 border-b border-gray-200">
        <h3 class="font-medium text-gray-900">
          项目列表
          <span class="text-sm text-gray-500 ml-2">({{ filteredProjects.length }} 个项目)</span>
        </h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">项目信息</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品类</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">进度</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">更新时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="project in paginatedProjects"
              :key="project.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12">
                    <img :src="project.thumbnail" :alt="project.name" class="h-12 w-12 rounded-lg object-cover">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ project.name }}</div>
                    <div class="text-sm text-gray-500">{{ project.description }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ getCategoryLabel(project.category) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(project.status)">
                  {{ getStatusLabel(project.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    :class="getProgressClass(project.status)"
                    :style="{ width: project.progress + '%' }"
                    class="h-2 rounded-full"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">{{ project.progress }}%</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(project.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(project.updatedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewProject(project)" class="text-blue-600 hover:text-blue-900">查看</button>
                  <button @click="editProject(project)" class="text-green-600 hover:text-green-900">编辑</button>
                  <button @click="duplicateProject(project)" class="text-purple-600 hover:text-purple-900">复制</button>
                  <button @click="deleteProject(project)" class="text-red-600 hover:text-red-900">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div class="px-6 py-4 border-t border-gray-200">
        <a-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="filteredProjects.length"
          :show-size-changer="true"
          :show-quick-jumper="true"
          :show-total="(total: number, range: number[]) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
        />
      </div>
    </div>

    <!-- 新建/编辑项目模态框 -->
    <a-modal
      v-model:open="projectModalVisible"
      :title="editingProject ? '编辑项目' : '新建项目'"
      width="800px"
      @ok="saveProject"
      @cancel="cancelProject"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">项目名称</label>
            <a-input v-model:value="projectForm.name" placeholder="请输入项目名称" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">服装品类</label>
            <a-select v-model:value="projectForm.category" class="w-full" placeholder="请选择服装品类">
              <a-select-option value="sportswear">运动服</a-select-option>
              <a-select-option value="casual">休闲服</a-select-option>
              <a-select-option value="formal">正装</a-select-option>
              <a-select-option value="accessories">配饰</a-select-option>
            </a-select>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">项目描述</label>
          <a-textarea v-model:value="projectForm.description" :rows="3" placeholder="请输入项目描述" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">视频分辨率</label>
            <a-select v-model:value="projectForm.resolution" class="w-full" placeholder="选择分辨率">
              <a-select-option value="1920x1080">1920x1080 (1080p)</a-select-option>
              <a-select-option value="1280x720">1280x720 (720p)</a-select-option>
              <a-select-option value="3840x2160">3840x2160 (4K)</a-select-option>
            </a-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">帧率</label>
            <a-select v-model:value="projectForm.frameRate" class="w-full" placeholder="选择帧率">
              <a-select-option value="24">24 fps</a-select-option>
              <a-select-option value="30">30 fps</a-select-option>
              <a-select-option value="60">60 fps</a-select-option>
            </a-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">视频时长(秒)</label>
            <a-input-number v-model:value="projectForm.duration" :min="1" :max="300" class="w-full" placeholder="视频时长" />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">项目标签</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="tag in projectForm.tags"
              :key="tag"
              class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center"
            >
              {{ tag }}
              <button @click="removeTag(tag)" class="ml-2 text-blue-500 hover:text-blue-700">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </span>
          </div>
          <div class="flex space-x-2">
            <a-input v-model:value="newTag" placeholder="添加标签" @press-enter="addTag" />
            <a-button @click="addTag">添加</a-button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">项目缩略图</label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div v-if="projectForm.thumbnail" class="mb-4">
              <img :src="projectForm.thumbnail" alt="缩略图" class="mx-auto h-32 w-32 object-cover rounded-lg">
            </div>
            <div class="text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="mt-2">点击上传或拖拽图片到此处</p>
              <p class="text-xs text-gray-400">支持 JPG、PNG 格式，建议尺寸 400x300</p>
            </div>
            <input type="file" class="hidden" accept="image/*" @change="handleThumbnailUpload">
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// 统计数据
const stats = reactive({
  total: 156,
  completed: 89,
  inProgress: 45,
  error: 22
})

// 状态
const searchKeyword = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const sortBy = ref('created_desc')
const currentPage = ref(1)
const pageSize = ref(10)
const projectModalVisible = ref(false)
const editingProject = ref<any>(null)
const newTag = ref('')

// 表单数据
const projectForm = reactive({
  name: '',
  category: '',
  description: '',
  resolution: '1920x1080',
  frameRate: '30',
  duration: 30,
  tags: [] as string[],
  thumbnail: ''
})

// 模拟项目数据
const projects = ref([
  {
    id: 1,
    name: '夏季运动服展示',
    description: 'AI生成的夏季运动服装展示视频项目',
    category: 'sportswear',
    status: 'completed',
    progress: 100,
    thumbnail: '/api/placeholder/100/100',
    createdAt: '2024-01-15 14:30:00',
    updatedAt: '2024-01-15 16:45:00'
  },
  {
    id: 2,
    name: '商务正装系列',
    description: '商务正装的AI视频制作项目',
    category: 'formal',
    status: 'processing',
    progress: 65,
    thumbnail: '/api/placeholder/100/100',
    createdAt: '2024-01-15 10:20:00',
    updatedAt: '2024-01-15 15:30:00'
  },
  {
    id: 3,
    name: '休闲服装搭配',
    description: '休闲服装的多场景展示项目',
    category: 'casual',
    status: 'draft',
    progress: 25,
    thumbnail: '/api/placeholder/100/100',
    createdAt: '2024-01-14 16:15:00',
    updatedAt: '2024-01-15 09:20:00'
  }
])

// 计算属性
const filteredProjects = computed(() => {
  let filtered = projects.value

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(project => project.status === statusFilter.value)
  }

  // 品类筛选
  if (categoryFilter.value) {
    filtered = filtered.filter(project => project.category === categoryFilter.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(project =>
      project.name.toLowerCase().includes(keyword) ||
      project.description.toLowerCase().includes(keyword)
    )
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'created_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'created_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'updated_desc':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'name_asc':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return filtered
})

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProjects.value.slice(start, end)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const createProject = () => {
  editingProject.value = null
  resetProjectForm()
  projectModalVisible.value = true
}

const editProject = (project: any) => {
  editingProject.value = project
  Object.assign(projectForm, {
    name: project.name,
    category: project.category,
    description: project.description,
    resolution: project.resolution || '1920x1080',
    frameRate: project.frameRate || '30',
    duration: project.duration || 30,
    tags: project.tags || [],
    thumbnail: project.thumbnail
  })
  projectModalVisible.value = true
}

const saveProject = () => {
  if (editingProject.value) {
    // 更新项目
    const index = projects.value.findIndex(p => p.id === editingProject.value.id)
    if (index > -1) {
      projects.value[index] = {
        ...projects.value[index],
        ...projectForm,
        updatedAt: new Date().toLocaleString('zh-CN')
      }
    }
  } else {
    // 新建项目
    const newProject = {
      id: Date.now(),
      ...projectForm,
      status: 'draft',
      progress: 0,
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN')
    }
    projects.value.unshift(newProject)
  }
  
  projectModalVisible.value = false
  resetProjectForm()
}

const cancelProject = () => {
  projectModalVisible.value = false
  resetProjectForm()
}

const resetProjectForm = () => {
  Object.assign(projectForm, {
    name: '',
    category: '',
    description: '',
    resolution: '1920x1080',
    frameRate: '30',
    duration: 30,
    tags: [],
    thumbnail: ''
  })
}

const addTag = () => {
  if (newTag.value && !projectForm.tags.includes(newTag.value)) {
    projectForm.tags.push(newTag.value)
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  const index = projectForm.tags.indexOf(tag)
  if (index > -1) {
    projectForm.tags.splice(index, 1)
  }
}

const handleThumbnailUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      projectForm.thumbnail = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const viewProject = (project: any) => {
  console.log('查看项目:', project)
}

const duplicateProject = (project: any) => {
  const duplicated = {
    ...project,
    id: Date.now(),
    name: project.name + ' (副本)',
    status: 'draft',
    progress: 0,
    createdAt: new Date().toLocaleString('zh-CN'),
    updatedAt: new Date().toLocaleString('zh-CN')
  }
  projects.value.unshift(duplicated)
}

const deleteProject = (project: any) => {
  const index = projects.value.findIndex(p => p.id === project.id)
  if (index > -1) {
    projects.value.splice(index, 1)
  }
}

const exportProjects = () => {
  console.log('导出项目')
}

const getCategoryLabel = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    sportswear: '运动服',
    casual: '休闲服',
    formal: '正装',
    accessories: '配饰'
  }
  return categoryMap[category] || category
}

const getStatusLabel = (status: string) => {
  const statusMap: { [key: string]: string } = {
    draft: '草稿',
    processing: '处理中',
    completed: '已完成',
    error: '异常'
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  const classMap: { [key: string]: string } = {
    draft: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800',
    processing: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800',
    completed: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800',
    error: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'
  }
  return classMap[status] || classMap.draft
}

const getProgressClass = (status: string) => {
  const classMap: { [key: string]: string } = {
    draft: 'bg-gray-400',
    processing: 'bg-yellow-400',
    completed: 'bg-green-400',
    error: 'bg-red-400'
  }
  return classMap[status] || classMap.draft
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.ai-project-management {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  
  .md\:flex-row {
    flex-direction: row;
  }
  
  .md\:items-center {
    align-items: center;
  }
  
  .md\:justify-between {
    justify-content: space-between;
  }
  
  .md\:space-y-0 > * + * {
    margin-top: 0;
  }
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.flex-col {
  flex-direction: column;
}

.overflow-x-auto {
  overflow-x: auto;
}

.min-w-full {
  min-width: 100%;
}

.divide-y > * + * {
  border-top-width: 1px;
}

.divide-gray-200 > * + * {
  border-color: #e5e7eb;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.max-w-md {
  max-width: 28rem;
}

.flex-shrink-0 {
  flex-shrink: 0;
}
</style>