<template>
  <div class="catalog-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-header">
      <div class="header-left">
        <a-button type="text" @click="goBack">
          <template #icon>
            <icon-arrow-left />
          </template>
          返回
        </a-button>
        <div class="catalog-info">
          <span class="catalog-name">{{ catalogData.name }}</span>
          <a-tag size="small" :color="catalogData.status === 'saved' ? 'green' : 'orange'">
            {{ catalogData.status === 'saved' ? '已保存' : '未保存' }}
          </a-tag>
        </div>
      </div>
      <div class="header-right">
        <a-button @click="previewCatalog">预览</a-button>
        <a-button @click="saveCatalog" :loading="saving">保存</a-button>
        <a-button type="primary" @click="copyShareLink">复制链接</a-button>
      </div>
    </div>

    <!-- 编辑器主体 -->
    <div class="editor-body">
      <!-- 左侧页面导航 -->
      <div class="page-navigation">
        <div class="nav-header">
          <h3>页面导航</h3>
          <p class="nav-tip">点击页面缩略图切换编辑页</p>
        </div>
        <div class="page-list">
          <div
            v-for="(page, index) in pages"
            :key="page.id"
            class="page-item"
            :class="{ active: currentPageId === page.id }"
            @click="switchPage(page.id)"
          >
            <div class="page-thumbnail">
              <div class="page-preview">{{ page.name }}</div>
            </div>
            <span class="page-name">{{ page.name }}</span>
          </div>
        </div>
      </div>

      <!-- 中间画布区域 -->
      <div class="canvas-area">
        <div class="canvas-container">
          <div class="canvas-tip" v-if="!selectedComponent">
            点击组件进行编辑（图片/视频可替换，文本可直接修改）
          </div>
          <div class="canvas-content">
            <!-- 当前页面内容 -->
            <div v-if="currentPage" class="page-content">
              <div
                v-for="component in currentPage.components"
                :key="component.id"
                class="component-item"
                :class="{ selected: selectedComponent?.id === component.id }"
                @click="selectComponent(component)"
              >
                <!-- 文本组件 -->
                <div v-if="component.type === 'text'" class="text-component">
                  <div
                    contenteditable
                    @input="updateComponentContent(component, $event)"
                    @blur="saveComponentContent(component)"
                  >
                    {{ component.content }}
                  </div>
                </div>
                
                <!-- 图片组件 -->
                <div v-else-if="component.type === 'image'" class="image-component">
                  <img
                    v-if="component.content"
                    :src="component.content"
                    :alt="component.name"
                  />
                  <div v-else class="placeholder">
                    <icon-image />
                    <span>点击上传图片</span>
                  </div>
                </div>
                
                <!-- 视频组件 -->
                <div v-else-if="component.type === 'video'" class="video-component">
                  <video
                    v-if="component.content"
                    :src="component.content"
                    controls
                  />
                  <div v-else class="placeholder">
                    <icon-play-circle />
                    <span>点击上传视频</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧工具栏 -->
      <div class="toolbar" v-if="selectedComponent">
        <div class="toolbar-header">
          <h3>组件设置</h3>
          <span class="component-type">{{ getComponentTypeName(selectedComponent.type) }}</span>
        </div>
        
        <!-- 媒体上传设置 -->
        <div v-if="selectedComponent.type === 'image' || selectedComponent.type === 'video'" class="upload-settings">
          <div class="setting-group">
            <h4>上传设置</h4>
            <div class="upload-options">
              <a-button block @click="uploadFromProducts">从定制商品上传</a-button>
              <a-button block @click="uploadFromLocal">从本地上传</a-button>
            </div>
          </div>
        </div>
        
        <!-- 文本格式设置 -->
        <div v-if="selectedComponent.type === 'text'" class="text-settings">
          <div class="setting-group">
            <h4>文本格式</h4>
            <div class="format-controls">
              <a-select v-model="textFormat.fontFamily" placeholder="字体">
                <a-option value="Microsoft YaHei">微软雅黑</a-option>
                <a-option value="SimSun">宋体</a-option>
                <a-option value="SimHei">黑体</a-option>
              </a-select>
              <a-input-number
                v-model="textFormat.fontSize"
                :min="12"
                :max="36"
                suffix="px"
                placeholder="字号"
              />
              <div class="color-picker">
                <span>颜色：</span>
                <input
                  type="color"
                  v-model="textFormat.color"
                  @change="applyTextFormat"
                />
              </div>
              <div class="align-controls">
                <a-button-group>
                  <a-button @click="setTextAlign('left')">左对齐</a-button>
                  <a-button @click="setTextAlign('center')">居中</a-button>
                  <a-button @click="setTextAlign('right')">右对齐</a-button>
                </a-button-group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <a-modal
      v-model:visible="uploadModalVisible"
      title="上传文件"
      @ok="handleUpload"
      @cancel="cancelUpload"
    >
      <a-upload
        ref="uploadRef"
        :file-list="fileList"
        :auto-upload="false"
        :accept="uploadAccept"
        @change="handleFileChange"
      >
        <template #upload-button>
          <div class="upload-area">
            <icon-upload />
            <div class="upload-text">
              <p>点击或拖拽文件到此区域上传</p>
              <p class="upload-tip">{{ uploadTip }}</p>
            </div>
          </div>
        </template>
      </a-upload>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconArrowLeft,
  IconImage,
  IconPlayCircle,
  IconUpload
} from '@arco-design/web-vue/es/icon'

interface Component {
  id: string
  type: 'text' | 'image' | 'video'
  name: string
  content: string
  style: Record<string, any>
}

interface Page {
  id: string
  name: string
  components: Component[]
}

interface CatalogData {
  id: string
  name: string
  status: 'saved' | 'unsaved'
  shareUrl: string
}

const router = useRouter()
const route = useRoute()

const catalogData = ref<CatalogData>({
  id: route.params.id as string,
  name: '山东大学学位服定制方案',
  status: 'saved',
  shareUrl: `https://afa-1.github.io/e-book/`
})

const saving = ref(false)
const currentPageId = ref('cover')
const selectedComponent = ref<Component | null>(null)
const uploadModalVisible = ref(false)
const fileList = ref([])

const textFormat = reactive({
  fontFamily: 'Microsoft YaHei',
  fontSize: 16,
  color: '#000000',
  textAlign: 'left'
})

// 页面数据
const pages = ref<Page[]>([
  {
    id: 'cover',
    name: '封面页',
    components: [
      {
        id: 'cover-title',
        type: 'text',
        name: '标题',
        content: '山东大学学位服定制方案',
        style: {}
      },
      {
        id: 'cover-bg',
        type: 'image',
        name: '背景图片',
        content: '',
        style: {}
      }
    ]
  },
  {
    id: 'video',
    name: '视频页',
    components: [
      {
        id: 'main-video',
        type: 'video',
        name: '主视频',
        content: '',
        style: {}
      }
    ]
  },
  {
    id: 'detail',
    name: '图文详情页',
    components: [
      {
        id: 'detail-image',
        type: 'image',
        name: '详情图片',
        content: '',
        style: {}
      },
      {
        id: 'detail-text',
        type: 'text',
        name: '详情描述',
        content: '这里是产品详情描述...',
        style: {}
      }
    ]
  },
  {
    id: 'footer',
    name: '封底页',
    components: [
      {
        id: 'contact-text',
        type: 'text',
        name: '联系方式',
        content: '联系电话：400-123-4567',
        style: {}
      },
      {
        id: 'brand-logo',
        type: 'image',
        name: '品牌Logo',
        content: '',
        style: {}
      }
    ]
  }
])

const currentPage = computed(() => {
  return pages.value.find(page => page.id === currentPageId.value)
})

const uploadAccept = computed(() => {
  if (!selectedComponent.value) return ''
  return selectedComponent.value.type === 'image' 
    ? '.jpg,.jpeg,.png,.webp'
    : '.mp4,.mov,.webm'
})

const uploadTip = computed(() => {
  if (!selectedComponent.value) return ''
  return selectedComponent.value.type === 'image'
    ? '支持 JPG、PNG、WEBP 格式，大小不超过 10MB'
    : '支持 MP4、MOV、WebM 格式，大小不超过 200MB，时长不超过 500 秒'
})

const switchPage = (pageId: string) => {
  currentPageId.value = pageId
  selectedComponent.value = null
}

const selectComponent = (component: Component) => {
  selectedComponent.value = component
  if (component.type === 'text') {
    // 加载文本格式
    textFormat.fontFamily = component.style.fontFamily || 'Microsoft YaHei'
    textFormat.fontSize = component.style.fontSize || 16
    textFormat.color = component.style.color || '#000000'
  }
}

const updateComponentContent = (component: Component, event: Event) => {
  const target = event.target as HTMLElement
  component.content = target.textContent || ''
  catalogData.value.status = 'unsaved'
}

const saveComponentContent = (component: Component) => {
  // 保存组件内容
  Message.success('内容已更新')
}

const getComponentTypeName = (type: string) => {
  const typeMap = {
    text: '文本组件',
    image: '图片组件',
    video: '视频组件'
  }
  return typeMap[type as keyof typeof typeMap] || type
}

const uploadFromProducts = () => {
  Message.info('从定制商品上传功能开发中...')
}

const uploadFromLocal = () => {
  uploadModalVisible.value = true
}

const handleFileChange = (fileList: any) => {
  // 处理文件选择
}

const handleUpload = () => {
  // 处理文件上传
  uploadModalVisible.value = false
  Message.success('文件上传成功，已替换当前组件')
}

const cancelUpload = () => {
  uploadModalVisible.value = false
  fileList.value = []
}

const applyTextFormat = () => {
  if (selectedComponent.value && selectedComponent.value.type === 'text') {
    selectedComponent.value.style = {
      ...selectedComponent.value.style,
      fontFamily: textFormat.fontFamily,
      fontSize: textFormat.fontSize,
      color: textFormat.color
    }
    catalogData.value.status = 'unsaved'
  }
}

const setTextAlign = (align: string) => {
  textFormat.textAlign = align
  applyTextFormat()
}

const goBack = () => {
  if (catalogData.value.status === 'unsaved') {
    // 提示保存
    Message.warning('当前画册有未保存的修改，是否确认离开？')
    return
  }
  router.push('/catalog/management')
}

const previewCatalog = () => {
  window.open(catalogData.value.shareUrl, '_blank')
}

const saveCatalog = async () => {
  saving.value = true
  try {
    // 模拟保存API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    catalogData.value.status = 'saved'
    Message.success('画册已保存成功')
  } catch (error) {
    Message.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(catalogData.value.shareUrl)
    Message.success('分享链接已复制到剪贴板，可直接粘贴分享')
  } catch (error) {
    Message.error('复制失败，请手动复制链接')
  }
}

onMounted(() => {
  // 初始化编辑器
})
</script>

<style scoped>
.catalog-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

.editor-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.catalog-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.catalog-name {
  font-weight: 500;
  color: #1d2129;
}

.header-right {
  display: flex;
  gap: 12px;
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.page-navigation {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e5e6eb;
  padding: 16px;
}

.nav-header h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.nav-tip {
  margin: 0 0 16px 0;
  font-size: 12px;
  color: #86909c;
}

.page-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-item {
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-item:hover {
  border-color: #165dff;
}

.page-item.active {
  border-color: #165dff;
  background: #f2f5ff;
}

.page-thumbnail {
  width: 100%;
  height: 80px;
  background: #f7f8fa;
  border-radius: 4px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-preview {
  font-size: 12px;
  color: #86909c;
}

.page-name {
  font-size: 12px;
  color: #1d2129;
}

.canvas-area {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.canvas-container {
  background: #fff;
  border-radius: 8px;
  min-height: 600px;
  position: relative;
}

.canvas-tip {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
}

.canvas-content {
  padding: 40px;
}

.component-item {
  margin-bottom: 20px;
  padding: 16px;
  border: 2px dashed transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.component-item:hover {
  border-color: #165dff;
  background: #f2f5ff;
}

.component-item.selected {
  border-color: #165dff;
  background: #f2f5ff;
}

.text-component {
  min-height: 40px;
}

.text-component div {
  outline: none;
  min-height: 20px;
}

.image-component,
.video-component {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-component img,
.video-component video {
  max-width: 100%;
  max-height: 300px;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #86909c;
  font-size: 14px;
}

.placeholder .arco-icon {
  font-size: 32px;
}

.toolbar {
  width: 280px;
  background: #fff;
  border-left: 1px solid #e5e6eb;
  padding: 16px;
}

.toolbar-header {
  margin-bottom: 20px;
}

.toolbar-header h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.component-type {
  font-size: 12px;
  color: #86909c;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
}

.upload-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.format-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.color-picker input[type="color"] {
  width: 32px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.align-controls {
  display: flex;
  gap: 4px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  border: 2px dashed #e5e6eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #165dff;
  background: #f2f5ff;
}

.upload-text p {
  margin: 8px 0 0 0;
  color: #1d2129;
}

.upload-tip {
  font-size: 12px;
  color: #86909c !important;
}
</style>