<template>
  <div class="ai-material-library">
    <!-- 页面标题 -->
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">素材库管理</h1>
          <p class="text-gray-600 mt-2">统一管理AI生成的各类素材，支持分类、搜索、预览和批量操作</p>
        </div>
        <div class="flex space-x-3">
          <a-button @click="uploadMaterial">
            <template #icon>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </template>
            上传素材
          </a-button>
          <a-button type="primary" @click="batchOperation">批量操作</a-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总素材</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">图片素材</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.images }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">视频素材</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.videos }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">模特素材</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.models }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-indigo-100 text-indigo-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">场景素材</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.scenes }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- 分类导航栏 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-medium text-gray-900">素材分类</h3>
          </div>
          
          <div class="p-4">
            <div class="space-y-2">
              <div
                v-for="category in categories"
                :key="category.key"
                @click="selectCategory(category.key)"
                :class="[
                  'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                  selectedCategory === category.key
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50'
                ]"
              >
                <div class="flex items-center space-x-3">
                  <div :class="[
                    'p-2 rounded-lg',
                    selectedCategory === category.key ? 'bg-blue-100' : 'bg-gray-100'
                  ]">
                    <component :is="category.icon" class="w-4 h-4" />
                  </div>
                  <span class="font-medium">{{ category.label }}</span>
                </div>
                <span class="text-sm text-gray-500">{{ category.count }}</span>
              </div>
            </div>

            <!-- 标签筛选 -->
            <div class="mt-6">
              <h4 class="font-medium text-gray-900 mb-3">标签筛选</h4>
              <div class="space-y-2">
                <div
                  v-for="tag in tags"
                  :key="tag.name"
                  @click="toggleTag(tag.name)"
                  :class="[
                    'flex items-center justify-between p-2 rounded cursor-pointer text-sm',
                    selectedTags.includes(tag.name)
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  ]"
                >
                  <span>{{ tag.name }}</span>
                  <span class="text-xs text-gray-500">{{ tag.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="lg:col-span-4">
        <!-- 筛选搜索区 -->
        <div class="bg-white rounded-lg shadow mb-6 p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div class="flex-1 max-w-md">
              <a-input-search
                v-model:value="searchKeyword"
                placeholder="搜索素材名称、标签或描述"
                @search="handleSearch"
                enter-button
              />
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">排序:</span>
                <a-select v-model:value="sortBy" class="w-32" size="small">
                  <a-select-option value="created_desc">最新创建</a-select-option>
                  <a-select-option value="created_asc">最早创建</a-select-option>
                  <a-select-option value="name_asc">名称A-Z</a-select-option>
                  <a-select-option value="name_desc">名称Z-A</a-select-option>
                  <a-select-option value="size_desc">文件大小</a-select-option>
                </a-select>
              </div>
              
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">视图:</span>
                <div class="flex border rounded">
                  <button
                    @click="viewMode = 'grid'"
                    :class="[
                      'p-2 border-r',
                      viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    ]"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                    </svg>
                  </button>
                  <button
                    @click="viewMode = 'list'"
                    :class="[
                      'p-2',
                      viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    ]"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 素材展示区 -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h3 class="font-medium text-gray-900">
                {{ getCategoryLabel(selectedCategory) }}
                <span class="text-sm text-gray-500 ml-2">({{ filteredMaterials.length }} 个素材)</span>
              </h3>
              <div v-if="selectedMaterials.length > 0" class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">已选择 {{ selectedMaterials.length }} 个</span>
                <a-button size="small" @click="clearSelection">清除选择</a-button>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <a-checkbox
                :indeterminate="selectedMaterials.length > 0 && selectedMaterials.length < filteredMaterials.length"
                :checked="selectedMaterials.length === filteredMaterials.length && filteredMaterials.length > 0"
                @change="toggleSelectAll"
              >
                全选
              </a-checkbox>
            </div>
          </div>
          
          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div
                v-for="material in paginatedMaterials"
                :key="material.id"
                :class="[
                  'relative group border rounded-lg overflow-hidden cursor-pointer transition-all',
                  selectedMaterials.includes(material.id)
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                ]"
                @click="toggleMaterialSelection(material.id)"
              >
                <!-- 选择框 -->
                <div class="absolute top-2 left-2 z-10">
                  <a-checkbox
                    :checked="selectedMaterials.includes(material.id)"
                    @click.stop="toggleMaterialSelection(material.id)"
                  />
                </div>
                
                <!-- 操作按钮 -->
                <div class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="flex space-x-1">
                    <button
                      @click.stop="showPreview(material)"
                      class="p-1 bg-white rounded shadow hover:bg-gray-50"
                    >
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button
                      @click.stop="downloadMaterial(material)"
                      class="p-1 bg-white rounded shadow hover:bg-gray-50"
                    >
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m-6 4h8"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- 素材预览 -->
                <div class="aspect-square bg-gray-100">
                  <img
                    v-if="material.type === 'image'"
                    :src="material.thumbnail"
                    :alt="material.name"
                    class="w-full h-full object-cover"
                  >
                  <div v-else-if="material.type === 'video'" class="relative w-full h-full">
                    <img :src="material.thumbnail" :alt="material.name" class="w-full h-full object-cover">
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="bg-black bg-opacity-50 rounded-full p-2">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- 素材信息 -->
                <div class="p-3">
                  <h4 class="font-medium text-sm text-gray-900 truncate">{{ material.name }}</h4>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-xs text-gray-500">{{ formatFileSize(material.size) }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(material.createdAt) }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1 mt-2">
                    <span
                      v-for="tag in material.tags.slice(0, 2)"
                      :key="tag"
                      class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {{ tag }}
                    </span>
                    <span v-if="material.tags.length > 2" class="text-xs text-gray-400">
                      +{{ material.tags.length - 2 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 列表视图 -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <a-checkbox
                      :indeterminate="selectedMaterials.length > 0 && selectedMaterials.length < filteredMaterials.length"
                      :checked="selectedMaterials.length === filteredMaterials.length && filteredMaterials.length > 0"
                      @change="toggleSelectAll"
                    />
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预览</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">大小</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标签</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="material in paginatedMaterials"
                  :key="material.id"
                  :class="[
                    'hover:bg-gray-50',
                    selectedMaterials.includes(material.id) ? 'bg-blue-50' : ''
                  ]"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <a-checkbox
                      :checked="selectedMaterials.includes(material.id)"
                      @change="toggleMaterialSelection(material.id)"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <img :src="material.thumbnail" :alt="material.name" class="w-12 h-12 object-cover rounded">
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ material.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {{ material.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatFileSize(material.size) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="tag in material.tags.slice(0, 3)"
                        :key="tag"
                        class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(material.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button @click="showPreview(material)" class="text-blue-600 hover:text-blue-900">预览</button>
                      <button @click="editMaterial(material)" class="text-green-600 hover:text-green-900">编辑</button>
                      <button @click="downloadMaterial(material)" class="text-gray-600 hover:text-gray-900">下载</button>
                      <button @click="deleteMaterial(material)" class="text-red-600 hover:text-red-900">删除</button>
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
              :total="filteredMaterials.length"
              :show-size-changer="true"
              :show-quick-jumper="true"
              :show-total="(total: number, range: number[]) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 预览模态框 -->
    <a-modal
      v-model:open="previewModalVisible"
      :title="previewMaterial?.name"
      width="800px"
      :footer="false"
    >
      <div v-if="previewMaterial" class="space-y-4">
        <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img
            v-if="previewMaterial.type === 'image'"
            :src="previewMaterial.url"
            :alt="previewMaterial.name"
            class="w-full h-full object-contain"
          >
          <video
            v-else-if="previewMaterial.type === 'video'"
            :src="previewMaterial.url"
            class="w-full h-full object-contain"
            controls
          ></video>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-700">文件大小:</span>
            <span class="ml-2 text-gray-600">{{ formatFileSize(previewMaterial.size) }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">创建时间:</span>
            <span class="ml-2 text-gray-600">{{ formatDate(previewMaterial.createdAt) }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">分辨率:</span>
            <span class="ml-2 text-gray-600">{{ previewMaterial.resolution }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">格式:</span>
            <span class="ml-2 text-gray-600">{{ previewMaterial.format }}</span>
          </div>
        </div>
        
        <div>
          <span class="font-medium text-gray-700">标签:</span>
          <div class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="tag in previewMaterial.tags"
              :key="tag"
              class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div v-if="previewMaterial.description">
          <span class="font-medium text-gray-700">描述:</span>
          <p class="mt-2 text-gray-600">{{ previewMaterial.description }}</p>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// 统计数据
const stats = reactive({
  total: 2340,
  images: 1456,
  videos: 234,
  models: 456,
  scenes: 194
})

// 分类数据
const categories = ref([
  { key: 'all', label: '全部素材', count: 2340, icon: 'FolderIcon' },
  { key: 'images', label: '图片素材', count: 1456, icon: 'PhotoIcon' },
  { key: 'videos', label: '视频素材', count: 234, icon: 'VideoCameraIcon' },
  { key: 'models', label: '模特素材', count: 456, icon: 'UserIcon' },
  { key: 'scenes', label: '场景素材', count: 194, icon: 'BuildingOfficeIcon' }
])

const tags = ref([
  { name: '运动服', count: 456 },
  { name: '休闲服', count: 234 },
  { name: '正装', count: 123 },
  { name: '夏季', count: 345 },
  { name: '冬季', count: 234 },
  { name: '户外', count: 167 },
  { name: '室内', count: 289 }
])

// 状态
const selectedCategory = ref('all')
const selectedTags = ref<string[]>([])
const searchKeyword = ref('')
const sortBy = ref('created_desc')
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedMaterials = ref<number[]>([])
const previewModalVisible = ref(false)
const previewMaterial = ref<any>(null)

// 模拟素材数据
const materials = ref([
  {
    id: 1,
    name: '运动服展示-001',
    type: 'image',
    category: 'images',
    size: 2048576,
    format: 'PNG',
    resolution: '1920x1080',
    thumbnail: '/api/placeholder/300/300',
    url: '/api/placeholder/1920/1080',
    tags: ['运动服', '夏季', '户外'],
    description: 'AI生成的运动服展示图片',
    createdAt: '2024-01-15 14:30:00'
  },
  {
    id: 2,
    name: '模特展示视频-001',
    type: 'video',
    category: 'videos',
    size: 15728640,
    format: 'MP4',
    resolution: '1920x1080',
    thumbnail: '/api/placeholder/300/300',
    url: '/api/placeholder/video.mp4',
    tags: ['模特', '时尚', '室内'],
    description: 'AI生成的模特展示视频',
    createdAt: '2024-01-15 14:25:00'
  },
  {
    id: 3,
    name: '场景背景-现代办公室',
    type: 'image',
    category: 'scenes',
    size: 3145728,
    format: 'JPG',
    resolution: '2560x1440',
    thumbnail: '/api/placeholder/300/300',
    url: '/api/placeholder/2560/1440',
    tags: ['办公室', '现代', '室内'],
    description: '现代办公室场景背景',
    createdAt: '2024-01-15 14:20:00'
  }
])

// 计算属性
const filteredMaterials = computed(() => {
  let filtered = materials.value

  // 分类筛选
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(material => material.category === selectedCategory.value)
  }

  // 标签筛选
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(material =>
      selectedTags.value.some(tag => material.tags.includes(tag))
    )
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(material =>
      material.name.toLowerCase().includes(keyword) ||
      material.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
      (material.description && material.description.toLowerCase().includes(keyword))
    )
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'created_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'created_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'size_desc':
        return b.size - a.size
      default:
        return 0
    }
  })

  return filtered
})

const paginatedMaterials = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMaterials.value.slice(start, end)
})

// 方法
const selectCategory = (category: string) => {
  selectedCategory.value = category
  currentPage.value = 1
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const toggleMaterialSelection = (id: number) => {
  const index = selectedMaterials.value.indexOf(id)
  if (index > -1) {
    selectedMaterials.value.splice(index, 1)
  } else {
    selectedMaterials.value.push(id)
  }
}

const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedMaterials.value = filteredMaterials.value.map(m => m.id)
  } else {
    selectedMaterials.value = []
  }
}

const clearSelection = () => {
  selectedMaterials.value = []
}

const showPreview = (material: any) => {
  previewMaterial.value = material
  previewModalVisible.value = true
}

const editMaterial = (material: any) => {
  console.log('编辑素材:', material)
}

const downloadMaterial = (material: any) => {
  console.log('下载素材:', material)
}

const deleteMaterial = (material: any) => {
  const index = materials.value.findIndex(m => m.id === material.id)
  if (index > -1) {
    materials.value.splice(index, 1)
  }
}

const uploadMaterial = () => {
  console.log('上传素材')
}

const batchOperation = () => {
  console.log('批量操作')
}

const getCategoryLabel = (key: string) => {
  const category = categories.value.find(c => c.key === key)
  return category ? category.label : '全部素材'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
.ai-material-library {
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

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  .md\:grid-cols-5 {
    grid-template-columns: repeat(5, minmax(0, 1fr));
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

@media (min-width: 1024px) {
  .lg\:col-span-1 {
    grid-column: span 1 / span 1;
  }
  
  .lg\:col-span-4 {
    grid-column: span 4 / span 4;
  }
  
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  
  .lg\:grid-cols-5 {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .xl\:grid-cols-5 {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.gap-1 {
  gap: 0.25rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.space-x-1 > * + * {
  margin-left: 0.25rem;
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

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.flex-col {
  flex-direction: column;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
</style>