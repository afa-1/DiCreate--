<template>
  <div class="ai-material-generation responsive-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">AI素材生成</h1>
      <p class="page-description">使用AI技术生成高质量的服装展示素材</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards responsive-grid cols-sm-2 cols-md-4">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">今日生成</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.todayGenerated }}</p>
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
            <p class="text-sm font-medium text-gray-600">成功率</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.successRate }}%</p>
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
            <p class="text-sm font-medium text-gray-600">处理中</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.processing }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">素材库</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.totalMaterials }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能模块选择 -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- 服装细节配置 -->
      <div v-if="activeTab === 'clothing'" class="p-6">
        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">服装细节配置</h3>
            
            <!-- 品类配置 -->
            <CategoryConfig ref="categoryConfigRef" />
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">尺码规格</label>
                <a-checkbox-group v-model:value="clothingConfig.sizes" class="grid grid-cols-3 gap-2">
                  <a-checkbox value="XS">XS</a-checkbox>
                  <a-checkbox value="S">S</a-checkbox>
                  <a-checkbox value="M">M</a-checkbox>
                  <a-checkbox value="L">L</a-checkbox>
                  <a-checkbox value="XL">XL</a-checkbox>
                  <a-checkbox value="XXL">XXL</a-checkbox>
                </a-checkbox-group>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">展示角度</label>
                <a-checkbox-group v-model:value="clothingConfig.angles" class="grid grid-cols-2 gap-2">
                  <a-checkbox value="front">正面</a-checkbox>
                  <a-checkbox value="back">背面</a-checkbox>
                  <a-checkbox value="side">侧面</a-checkbox>
                  <a-checkbox value="detail">细节</a-checkbox>
                </a-checkbox-group>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 场景生成 -->
      <div v-if="activeTab === 'scene'" class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 场景库选择 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">场景库选择</h3>
            <div class="grid grid-cols-1 gap-3">
              <div
                v-for="scene in sceneLibrary"
                :key="scene.id"
                @click="selectScene(scene)"
                :class="[
                  'p-4 border rounded-lg cursor-pointer transition-colors',
                  selectedScene?.id === scene.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <img :src="scene.thumbnail" :alt="scene.name" class="w-full h-24 object-cover rounded mb-2">
                <p class="font-medium text-sm">{{ scene.name }}</p>
                <p class="text-xs text-gray-500">{{ scene.description }}</p>
              </div>
            </div>
          </div>

          <!-- 场景参数设置 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">场景参数设置</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">光照条件</label>
                <a-select v-model:value="sceneConfig.lighting" class="w-full">
                  <a-select-option value="natural">自然光</a-select-option>
                  <a-select-option value="studio">影棚灯光</a-select-option>
                  <a-select-option value="golden">黄金时段</a-select-option>
                  <a-select-option value="soft">柔和光线</a-select-option>
                </a-select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">拍摄角度</label>
                <a-select v-model:value="sceneConfig.angle" class="w-full">
                  <a-select-option value="front">正面</a-select-option>
                  <a-select-option value="side">侧面</a-select-option>
                  <a-select-option value="back">背面</a-select-option>
                  <a-select-option value="three-quarter">四分之三角度</a-select-option>
                </a-select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">景深效果</label>
                <a-slider v-model:value="sceneConfig.depth" :min="0" :max="100" />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>浅景深</span>
                  <span>深景深</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">色调风格</label>
                <a-select v-model:value="sceneConfig.tone" class="w-full">
                  <a-select-option value="warm">暖色调</a-select-option>
                  <a-select-option value="cool">冷色调</a-select-option>
                  <a-select-option value="neutral">中性色调</a-select-option>
                  <a-select-option value="vibrant">鲜艳色调</a-select-option>
                </a-select>
              </div>
            </div>
          </div>

          <!-- 自定义场景上传 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">自定义场景</h3>
            
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <div class="mt-2">
                <label class="cursor-pointer">
                  <span class="text-sm font-medium text-gray-900">上传自定义场景</span>
                  <input type="file" class="sr-only" accept="image/*" @change="handleSceneUpload">
                </label>
                <p class="text-xs text-gray-500 mt-1">支持 PNG, JPG 格式</p>
              </div>
            </div>

            <div v-if="customScene" class="mt-4">
              <img :src="customScene.url" alt="自定义场景" class="w-full h-32 object-cover rounded-lg">
              <button @click="removeCustomScene" class="mt-2 text-sm text-red-600 hover:text-red-800">删除场景</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 模特配置 -->
      <div v-if="activeTab === 'model'" class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- AI模特库 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">AI模特库</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="model in modelLibrary"
                :key="model.id"
                @click="selectModel(model)"
                :class="[
                  'p-3 border rounded-lg cursor-pointer transition-colors',
                  selectedModel?.id === model.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <img :src="model.avatar" :alt="model.name" class="w-full h-32 object-cover rounded mb-2">
                <p class="font-medium text-sm">{{ model.name }}</p>
                <p class="text-xs text-gray-500">{{ model.type }}</p>
              </div>
            </div>

            <!-- 模特参数调整 -->
            <div v-if="selectedModel" class="space-y-4 mt-6">
              <h4 class="font-medium text-gray-900">模特参数调整</h4>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">身高调整</label>
                <a-slider v-model:value="modelConfig.height" :min="150" :max="190" />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>150cm</span>
                  <span>190cm</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">体型调整</label>
                <a-select v-model:value="modelConfig.bodyType" class="w-full">
                  <a-select-option value="slim">纤瘦</a-select-option>
                  <a-select-option value="standard">标准</a-select-option>
                  <a-select-option value="athletic">运动型</a-select-option>
                  <a-select-option value="curvy">丰满</a-select-option>
                </a-select>
              </div>
            </div>
          </div>

          <!-- 动作配置 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">动作配置</h3>
            
            <div class="grid grid-cols-3 gap-3">
              <div
                v-for="pose in poseLibrary"
                :key="pose.id"
                @click="selectPose(pose)"
                :class="[
                  'p-2 border rounded-lg cursor-pointer transition-colors text-center',
                  selectedPose?.id === pose.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <img :src="pose.thumbnail" :alt="pose.name" class="w-full h-20 object-cover rounded mb-1">
                <p class="text-xs font-medium">{{ pose.name }}</p>
              </div>
            </div>

            <!-- 动作参数 -->
            <div v-if="selectedPose" class="space-y-4 mt-6">
              <h4 class="font-medium text-gray-900">动作参数</h4>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">动作强度</label>
                <a-slider v-model:value="poseConfig.intensity" :min="0" :max="100" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">表情设置</label>
                <a-select v-model:value="poseConfig.expression" class="w-full">
                  <a-select-option value="natural">自然</a-select-option>
                  <a-select-option value="smile">微笑</a-select-option>
                  <a-select-option value="confident">自信</a-select-option>
                  <a-select-option value="serious">严肃</a-select-option>
                </a-select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">视线方向</label>
                <a-select v-model:value="poseConfig.gaze" class="w-full">
                  <a-select-option value="camera">看向镜头</a-select-option>
                  <a-select-option value="away">看向远方</a-select-option>
                  <a-select-option value="down">低头</a-select-option>
                  <a-select-option value="side">侧视</a-select-option>
                </a-select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成控制面板 -->
    <a-card class="generation-panel responsive-card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">生成设置</h3>
        <div class="flex space-x-3">
          <a-button @click="previewGeneration" :loading="isPreviewLoading">预览效果</a-button>
          <a-button type="primary" @click="startGeneration" :loading="isGenerating">开始生成</a-button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">生成数量</label>
          <a-input-number v-model:value="generationConfig.count" :min="1" :max="10" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">图片尺寸</label>
          <a-select v-model:value="generationConfig.size" class="w-full">
            <a-select-option value="512x512">512×512</a-select-option>
            <a-select-option value="768x768">768×768</a-select-option>
            <a-select-option value="1024x1024">1024×1024</a-select-option>
          </a-select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">生成质量</label>
          <a-select v-model:value="generationConfig.quality" class="w-full">
            <a-select-option value="draft">草图质量</a-select-option>
            <a-select-option value="standard">标准质量</a-select-option>
            <a-select-option value="high">高质量</a-select-option>
          </a-select>
        </div>
      </div>
    </a-card>

    <!-- 生成历史 -->
    <a-card class="generation-history responsive-card">
      <a-table
        :columns="historyColumns"
        :data-source="generationHistory"
        :pagination="historyPagination"
        :scroll="{ x: 800 }"
        class="responsive-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'preview'">
            <img :src="record.thumbnail" :alt="record.name" class="w-12 h-12 object-cover rounded">
          </template>
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'actions'">
            <div class="space-x-2">
              <a-button size="small" @click="viewGeneration(record)">查看</a-button>
              <a-button size="small" @click="downloadGeneration(record)">下载</a-button>
              <a-button size="small" danger @click="deleteGeneration(record)">删除</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
// import { message } from 'ant-design-vue'
import CategoryConfig from '@/components/CategoryConfig.vue'

// 统计数据
const stats = reactive({
  todayGenerated: 156,
  successRate: 94,
  processing: 8,
  totalMaterials: 2340
})

// 标签页
const activeTab = ref('clothing')
const tabs = [
  { key: 'clothing', label: '服装细节配置' },
  { key: 'scene', label: '场景生成' },
  { key: 'model', label: '模特配置' }
]

// 服装配置
const clothingImages = ref<Array<{ url: string; name: string }>>([])
const categoryConfigRef = ref<any>(null)
const clothingConfig = reactive({
  category: '',
  style: '',
  colors: [] as string[],
  material: '',
  details: '',
  sizes: [] as string[],
  angles: [] as string[]
})

const colorOptions = [
  { value: 'red', label: '红色' },
  { value: 'blue', label: '蓝色' },
  { value: 'green', label: '绿色' },
  { value: 'yellow', label: '黄色' },
  { value: 'black', label: '黑色' },
  { value: 'white', label: '白色' },
  { value: 'gray', label: '灰色' },
  { value: 'brown', label: '棕色' }
]

// 场景配置
const selectedScene = ref<any>(null)
const customScene = ref<any>(null)
const sceneConfig = reactive({
  lighting: 'natural',
  angle: 'front',
  depth: 50,
  tone: 'neutral'
})

const sceneLibrary = ref([
  { id: 1, name: '现代工作室', description: '简约现代风格', thumbnail: '/api/placeholder/200/150' },
  { id: 2, name: '户外街景', description: '城市街头风格', thumbnail: '/api/placeholder/200/150' },
  { id: 3, name: '自然风光', description: '自然户外场景', thumbnail: '/api/placeholder/200/150' },
  { id: 4, name: '时尚T台', description: '专业T台背景', thumbnail: '/api/placeholder/200/150' }
])

// 模特配置
const selectedModel = ref<any>(null)
const selectedPose = ref<any>(null)
const modelConfig = reactive({
  height: 170,
  bodyType: 'standard'
})

const poseConfig = reactive({
  intensity: 50,
  expression: 'natural',
  gaze: 'camera'
})

const modelLibrary = ref([
  { id: 1, name: '艾米', type: '欧美模特', avatar: '/api/placeholder/150/200' },
  { id: 2, name: '小雅', type: '亚洲模特', avatar: '/api/placeholder/150/200' },
  { id: 3, name: '索菲亚', type: '拉丁模特', avatar: '/api/placeholder/150/200' },
  { id: 4, name: '玛丽', type: '非洲模特', avatar: '/api/placeholder/150/200' }
])

const poseLibrary = ref([
  { id: 1, name: '站立', thumbnail: '/api/placeholder/100/120' },
  { id: 2, name: '走路', thumbnail: '/api/placeholder/100/120' },
  { id: 3, name: '坐姿', thumbnail: '/api/placeholder/100/120' },
  { id: 4, name: '跳跃', thumbnail: '/api/placeholder/100/120' },
  { id: 5, name: '转身', thumbnail: '/api/placeholder/100/120' },
  { id: 6, name: '手叉腰', thumbnail: '/api/placeholder/100/120' }
])

// 生成配置
const generationConfig = reactive({
  count: 4,
  size: '1024x1024',
  quality: 'standard'
})

const isPreviewLoading = ref(false)
const isGenerating = ref(false)

// 生成历史
const generationHistory = ref([
  {
    id: 1,
    name: '运动服展示-001',
    type: '服装展示',
    status: 'completed',
    thumbnail: '/api/placeholder/100/100',
    createdAt: '2024-01-15 14:30:00',
    duration: '2分30秒'
  },
  {
    id: 2,
    name: '休闲装搭配-002',
    type: '搭配展示',
    status: 'processing',
    thumbnail: '/api/placeholder/100/100',
    createdAt: '2024-01-15 14:25:00',
    duration: '处理中'
  }
])

// 分页配置
const historyPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

const historyColumns = [
  {
    title: '预览',
    dataIndex: 'preview',
    width: 80
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 200
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 160
  },
  {
    title: '操作',
    dataIndex: 'actions',
    width: 200
  }
]

// 方法
const handleClothingUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file)
      clothingImages.value.push({ url, name: file.name })
    })
  }
}

const removeClothingImage = (index: number) => {
  clothingImages.value.splice(index, 1)
}

const toggleColor = (color: string) => {
  const index = clothingConfig.colors.indexOf(color)
  if (index > -1) {
    clothingConfig.colors.splice(index, 1)
  } else {
    clothingConfig.colors.push(color)
  }
}

const selectScene = (scene: any) => {
  selectedScene.value = scene
}

const handleSceneUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const url = URL.createObjectURL(file)
    customScene.value = { url, name: file.name }
  }
}

const removeCustomScene = () => {
  customScene.value = null
}

const selectModel = (model: any) => {
  selectedModel.value = model
}

const selectPose = (pose: any) => {
  selectedPose.value = pose
}

const previewGeneration = async () => {
  isPreviewLoading.value = true
  try {
    // 模拟预览生成
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('预览生成完成')
  } catch (error) {
    console.log('预览生成失败')
  } finally {
    isPreviewLoading.value = false
  }
}

const startGeneration = async () => {
  isGenerating.value = true
  try {
    // 模拟素材生成
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('素材生成任务已提交')
    
    // 添加到历史记录
    generationHistory.value.unshift({
      id: Date.now(),
      name: `AI生成-${Date.now()}`,
      type: '智能生成',
      status: 'processing',
      thumbnail: '/api/placeholder/100/100',
      createdAt: new Date().toLocaleString(),
      duration: '处理中'
    })
  } catch (error) {
    console.log('生成失败')
  } finally {
    isGenerating.value = false
  }
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'green',
    processing: 'blue',
    failed: 'red',
    pending: 'orange'
  }
  return colors[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    completed: '已完成',
    processing: '处理中',
    failed: '失败',
    pending: '等待中'
  }
  return texts[status] || status
}

const viewGeneration = (record: any) => {
  console.log(`查看生成记录: ${record.name}`)
}

const downloadGeneration = (record: any) => {
  console.log(`下载开始: ${record.name}`)
}

const deleteGeneration = (record: any) => {
  const index = generationHistory.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    generationHistory.value.splice(index, 1)
    console.log('删除成功')
  }
}
</script>

<style scoped>
.ai-material-generation {
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

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.gap-8 {
  gap: 2rem;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-8 > * + * {
  margin-left: 2rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}
</style>