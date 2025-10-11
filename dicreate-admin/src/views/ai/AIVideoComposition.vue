<template>
  <div class="ai-video-composition responsive-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">视频合成</h1>
      <p class="page-description">智能合成高质量的服装展示视频</p>
    </div>

    <!-- 项目信息设置 -->
    <a-card class="project-info-card responsive-card" title="项目信息">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">项目名称</label>
          <a-input v-model:value="projectInfo.name" placeholder="输入项目名称" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">视频尺寸</label>
          <a-select v-model:value="projectInfo.resolution" class="w-full">
            <a-select-option value="1920x1080">1920×1080 (Full HD)</a-select-option>
            <a-select-option value="1280x720">1280×720 (HD)</a-select-option>
            <a-select-option value="3840x2160">3840×2160 (4K)</a-select-option>
          </a-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">帧率</label>
          <a-select v-model:value="projectInfo.frameRate" class="w-full">
            <a-select-option value="24">24 FPS</a-select-option>
            <a-select-option value="30">30 FPS</a-select-option>
            <a-select-option value="60">60 FPS</a-select-option>
          </a-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">总时长</label>
          <a-input v-model:value="projectInfo.duration" placeholder="00:00:30" readonly />
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 mt-6">
        <a-button @click="saveProject" :loading="isSaving">保存项目</a-button>
        <a-button type="primary" @click="exportVideo" :loading="isExporting">导出视频</a-button>
      </div>
    </a-card>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 片段管理区 -->
      <div class="lg:col-span-1">
        <a-card class="segment-management-card responsive-card" title="片段管理">
          <template #extra>
            <a-button size="small" type="primary" @click="addSegment">
              添加片段
            </a-button>
          </template>
          
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div
              v-for="(segment, index) in segments"
              :key="segment.id"
              @click="selectSegment(segment)"
              :class="[
                'p-3 border rounded-lg cursor-pointer transition-colors',
                selectedSegment?.id === segment.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-sm">{{ segment.name }}</span>
                <div class="flex space-x-1">
                  <a-button size="small" type="text" @click.stop="editSegment(segment)">
                    编辑
                  </a-button>
                  <a-button size="small" type="text" danger @click.stop="deleteSegment(index)">
                    删除
                  </a-button>
                </div>
              </div>
              <div class="text-xs text-gray-500">
                <p>时长: {{ segment.duration }}s</p>
                <p>类型: {{ getSegmentTypeText(segment.type) }}</p>
              </div>
              <div v-if="segment.thumbnail" class="mt-2">
                <img :src="segment.thumbnail" :alt="segment.name" class="w-full h-16 object-cover rounded">
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 合成编辑区 -->
      <div class="lg:col-span-2">
        <a-card class="composition-editor-card responsive-card" title="合成编辑">
          <!-- 时间轴 -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">时间轴</span>
              <div class="flex items-center space-x-2">
                <a-button size="small" @click="zoomOut">缩小</a-button>
                <a-button size="small" @click="zoomIn">放大</a-button>
              </div>
            </div>
            
            <div class="timeline-container bg-gray-50 rounded-lg p-4 min-h-32">
              <div class="timeline-track relative">
                <div
                  v-for="segment in segments"
                  :key="segment.id"
                  :style="{ 
                    left: segment.startTime * timelineScale + 'px',
                    width: segment.duration * timelineScale + 'px'
                  }"
                  :class="[
                    'absolute top-0 h-8 rounded border-2 cursor-pointer flex items-center px-2',
                    selectedSegment?.id === segment.id
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 bg-white'
                  ]"
                  @click="selectSegment(segment)"
                >
                  <span class="text-xs font-medium truncate">{{ segment.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 播放控制 -->
          <div class="flex items-center justify-center space-x-4 mb-6">
             <a-button @click="playPause" :type="isPlaying ? 'text' : 'primary'">
               {{ isPlaying ? '暂停' : '播放' }}
             </a-button>
             <a-button @click="stop">停止</a-button>
             <span class="text-sm text-gray-600">{{ currentTime }} / {{ totalDuration }}</span>
           </div>

          <!-- 片段属性编辑 -->
          <div v-if="selectedSegment" class="border-t pt-4">
            <h4 class="font-medium text-gray-900 mb-3">片段属性</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <a-input v-model:value="selectedSegment.name" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">时长 (秒)</label>
                <a-input-number v-model:value="selectedSegment.duration" :min="0.1" :step="0.1" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">开始时间 (秒)</label>
                <a-input-number v-model:value="selectedSegment.startTime" :min="0" :step="0.1" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">透明度</label>
                <a-slider v-model:value="selectedSegment.opacity" :min="0" :max="100" />
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 预览导出区 -->
      <div class="lg:col-span-1">
        <a-card class="preview-export-card responsive-card" title="预览导出">
          <!-- 预览窗口 -->
          <div class="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
            <div v-if="!previewUrl" class="text-white text-center">
              <div class="text-4xl mb-2">🎬</div>
              <div class="text-sm">预览窗口</div>
            </div>
            <video v-else :src="previewUrl" controls class="w-full h-full rounded-lg"></video>
          </div>

          <!-- 导出设置 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">导出格式</label>
              <a-select v-model:value="exportSettings.format" class="w-full">
                <a-select-option value="mp4">MP4</a-select-option>
                <a-select-option value="mov">MOV</a-select-option>
                <a-select-option value="avi">AVI</a-select-option>
              </a-select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">质量</label>
              <a-select v-model:value="exportSettings.quality" class="w-full">
                <a-select-option value="high">高质量</a-select-option>
                <a-select-option value="medium">中等质量</a-select-option>
                <a-select-option value="low">低质量</a-select-option>
              </a-select>
            </div>

            <div class="space-y-2">
              <a-button type="primary" block @click="generatePreview" :loading="isGeneratingPreview">
                生成预览
              </a-button>
              <a-button block @click="exportVideo" :loading="isExporting">
                导出视频
              </a-button>
            </div>

            <!-- 导出进度 -->
            <div v-if="exportProgress > 0" class="mt-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>导出进度</span>
                <span>{{ exportProgress }}%</span>
              </div>
              <a-progress :percent="exportProgress" />
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <!-- 添加片段模态框 -->
    <a-modal
      v-model:open="showSegmentModal"
      title="添加片段"
      @ok="handleAddSegment"
      @cancel="cancelAddSegment"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">片段名称</label>
          <a-input v-model:value="newSegment.name" placeholder="输入片段名称" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">片段类型</label>
          <a-select v-model:value="newSegment.type" class="w-full">
            <a-select-option value="video">视频</a-select-option>
            <a-select-option value="image">图片</a-select-option>
            <a-select-option value="text">文字</a-select-option>
            <a-select-option value="transition">转场</a-select-option>
          </a-select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">时长 (秒)</label>
          <a-input-number v-model:value="newSegment.duration" :min="0.1" :step="0.1" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">素材文件</label>
          <a-upload
            v-model:file-list="newSegment.fileList"
            :before-upload="beforeUpload"
            accept="video/*,image/*"
          >
            <a-button>选择文件</a-button>
          </a-upload>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// 项目信息
const projectInfo = reactive({
  name: '服装展示视频项目',
  resolution: '1920x1080',
  frameRate: '30',
  duration: '00:00:30'
})

// 片段数据
const segments = ref([
  {
    id: 1,
    name: '开场片段',
    type: 'video',
    duration: 5,
    startTime: 0,
    opacity: 100,
    materialUrl: '',
    thumbnail: ''
  },
  {
    id: 2,
    name: '产品展示',
    type: 'video',
    duration: 10,
    startTime: 5,
    opacity: 100,
    materialUrl: '',
    thumbnail: ''
  }
])

// 选中的片段
const selectedSegment = ref(segments.value[0])

// 时间轴相关
const timelineScale = ref(20) // 像素/秒
const isPlaying = ref(false)
const currentTime = ref('00:00:00')
const totalDuration = computed(() => {
  const total = segments.value.reduce((sum, segment) => sum + segment.duration, 0)
  return formatTime(total)
})

// 预览相关
const previewUrl = ref('')
const isGeneratingPreview = ref(false)

// 导出相关
const exportSettings = reactive({
  format: 'mp4',
  quality: 'high'
})
const isExporting = ref(false)
const exportProgress = ref(0)
const isSaving = ref(false)

// 新片段模态框
const showSegmentModal = ref(false)
const newSegment = reactive({
  name: '',
  type: 'video',
  duration: 5,
  fileList: []
})

// 方法
const selectSegment = (segment: any) => {
  selectedSegment.value = segment
}

const addSegment = () => {
  showSegmentModal.value = true
}

const handleAddSegment = () => {
  const segment = {
    id: Date.now(),
    name: newSegment.name,
    type: newSegment.type,
    duration: newSegment.duration,
    startTime: segments.value.length > 0 ? Math.max(...segments.value.map(s => s.startTime + s.duration)) : 0,
    opacity: 100,
    materialUrl: '',
    thumbnail: ''
  }
  segments.value.push(segment)
  showSegmentModal.value = false
  resetNewSegment()
}

const cancelAddSegment = () => {
  showSegmentModal.value = false
  resetNewSegment()
}

const resetNewSegment = () => {
  newSegment.name = ''
  newSegment.type = 'video'
  newSegment.duration = 5
  newSegment.fileList = []
}

const editSegment = (segment: any) => {
  selectedSegment.value = segment
}

const deleteSegment = (index: number) => {
  segments.value.splice(index, 1)
  if (selectedSegment.value && !segments.value.find(s => s.id === selectedSegment.value?.id)) {
    selectedSegment.value = segments.value[0] || null
  }
}

const getSegmentTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    video: '视频',
    image: '图片',
    text: '文字',
    transition: '转场'
  }
  return typeMap[type] || type
}

const zoomIn = () => {
  timelineScale.value = Math.min(timelineScale.value * 1.2, 100)
}

const zoomOut = () => {
  timelineScale.value = Math.max(timelineScale.value / 1.2, 5)
}

const playPause = () => {
  isPlaying.value = !isPlaying.value
}

const stop = () => {
  isPlaying.value = false
  currentTime.value = '00:00:00'
}

const generatePreview = () => {
  isGeneratingPreview.value = true
  // 模拟预览生成
  setTimeout(() => {
    previewUrl.value = 'https://example.com/preview.mp4'
    isGeneratingPreview.value = false
  }, 2000)
}

const exportVideo = () => {
  isExporting.value = true
  exportProgress.value = 0
  
  // 模拟导出进度
  const interval = setInterval(() => {
    exportProgress.value += 10
    if (exportProgress.value >= 100) {
      clearInterval(interval)
      isExporting.value = false
      exportProgress.value = 0
    }
  }, 500)
}

const saveProject = () => {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
  }, 1000)
}

const beforeUpload = () => {
  return false // 阻止自动上传
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.ai-video-composition {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.page-description {
  color: #6b7280;
  margin: 0 0 24px 0;
}

.timeline-container {
  position: relative;
  overflow-x: auto;
}

.timeline-track {
  height: 40px;
  position: relative;
  min-width: 600px;
}

.responsive-card {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .ai-video-composition {
    padding: 16px;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
  
  .lg\\:col-span-1,
  .lg\\:col-span-2 {
    grid-column: span 1;
  }
}
</style>