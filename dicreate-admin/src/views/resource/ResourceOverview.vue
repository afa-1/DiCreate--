<template>
  <div class="p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">素材总览</h1>
      <p class="text-gray-600 mt-1">统一管理平台所有素材资源，包括官网内容素材和AI设计素材</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <icon-image class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总素材数</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <icon-file class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">面料素材</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.fabric }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <icon-user class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">模特素材</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.model }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-orange-100 text-orange-600">
            <icon-video-camera class="w-6 h-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">视频素材</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.video }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速导航 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">快速导航</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <router-link 
          v-for="nav in quickNavs" 
          :key="nav.key"
          :to="nav.path"
          class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
        >
          <component :is="nav.icon" class="w-8 h-8 text-gray-600 mb-2" />
          <span class="text-sm font-medium text-gray-900">{{ nav.title }}</span>
          <span class="text-xs text-gray-500">{{ nav.count }} 项</span>
        </router-link>
      </div>
    </div>

    <!-- 最近上传 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">最近上传</h3>
        <a-button type="text" @click="viewAllRecent">查看全部</a-button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="item in recentUploads" 
          :key="item.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
            <img 
              v-if="item.thumbnail" 
              :src="item.thumbnail" 
              :alt="item.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <icon-file class="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h4 class="font-medium text-gray-900 truncate">{{ item.name }}</h4>
          <p class="text-sm text-gray-500">{{ item.type }}</p>
          <p class="text-xs text-gray-400">{{ item.uploadTime }}</p>
        </div>
      </div>
    </div>

    <!-- 素材分类统计 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">素材分类统计</h3>
      <div class="space-y-4">
        <div v-for="category in categoryStats" :key="category.type" class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-4 h-4 rounded" :style="{ backgroundColor: category.color }"></div>
            <span class="ml-3 text-sm font-medium text-gray-900">{{ category.name }}</span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">{{ category.count }} 项</span>
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full" 
                :style="{ 
                  backgroundColor: category.color, 
                  width: `${(category.count / stats.total) * 100}%` 
                }"
              ></div>
            </div>
            <span class="text-sm text-gray-500 w-12 text-right">
              {{ Math.round((category.count / stats.total) * 100) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconImage, 
  IconFile, 
  IconUser, 
  IconVideoCamera,
  IconPalette,
  IconCamera,
  IconDesktop
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 统计数据
const stats = reactive({
  total: 1248,
  fabric: 356,
  model: 189,
  video: 67
})

// 快速导航
const quickNavs = ref([
  {
    key: 'fabric',
    title: '面料素材',
    path: '/resource/fabric',
    icon: 'IconPalette',
    count: 356
  },
  {
    key: 'case',
    title: '案例素材',
    path: '/resource/case',
    icon: 'IconImage',
    count: 234
  },
  {
    key: 'model',
    title: '模特素材',
    path: '/resource/model',
    icon: 'IconUser',
    count: 189
  },
  {
    key: 'trend',
    title: '趋势资讯',
    path: '/resource/trend',
    icon: 'IconDesktop',
    count: 145
  },
  {
    key: 'scene',
    title: '场景素材',
    path: '/resource/scene',
    icon: 'IconCamera',
    count: 89
  },
  {
    key: 'video',
    title: '视频素材',
    path: '/resource/video',
    icon: 'IconVideoCamera',
    count: 67
  }
])

// 最近上传
const recentUploads = ref([
  {
    id: 1,
    name: '春季新款面料',
    type: '面料素材',
    thumbnail: 'https://via.placeholder.com/200x200?text=面料',
    uploadTime: '2小时前'
  },
  {
    id: 2,
    name: '时尚模特照片',
    type: '模特素材',
    thumbnail: 'https://via.placeholder.com/200x200?text=模特',
    uploadTime: '4小时前'
  },
  {
    id: 3,
    name: '产品展示视频',
    type: '视频素材',
    thumbnail: null,
    uploadTime: '6小时前'
  },
  {
    id: 4,
    name: '设计案例图',
    type: '案例素材',
    thumbnail: 'https://via.placeholder.com/200x200?text=案例',
    uploadTime: '1天前'
  }
])

// 分类统计
const categoryStats = ref([
  {
    type: 'fabric',
    name: '面料素材',
    count: 356,
    color: '#3b82f6'
  },
  {
    type: 'case',
    name: '案例素材',
    count: 234,
    color: '#10b981'
  },
  {
    type: 'model',
    name: '模特素材',
    count: 189,
    color: '#8b5cf6'
  },
  {
    type: 'trend',
    name: '趋势资讯',
    count: 145,
    color: '#f59e0b'
  },
  {
    type: 'scene',
    name: '场景素材',
    count: 89,
    color: '#ef4444'
  },
  {
    type: 'video',
    name: '视频素材',
    count: 67,
    color: '#06b6d4'
  }
])

// 查看全部最近上传
const viewAllRecent = () => {
  Message.info('跳转到最近上传页面')
}
</script>