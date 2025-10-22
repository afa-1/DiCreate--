<template>
  <a-modal
    :visible="visible"
    title="AI高级配置"
    width="800px"
    :footer="false"
    @cancel="handleCancel"
  >
    <div class="ai-advanced-config-modal">
      <!-- 商品信息展示 -->
      <div class="product-info" v-if="product">
        <div class="product-card">
          <img :src="product.image" :alt="product.name" class="product-image" />
          <div class="product-details">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-category">{{ product.category }}</p>
            <p class="product-customer">客户：{{ product.customer }}</p>
          </div>
        </div>
      </div>

      <!-- 配置表单 -->
      <a-form :model="configForm" layout="vertical" class="config-form">
        <!-- 图片上传配置 -->
        <div class="config-section">
          <h4 class="section-title">
            <icon-image class="section-icon" />
            图片上传配置
            <a-tag size="small" color="blue">支持JPG、PNG、WEBP格式，单张不超过10MB</a-tag>
          </h4>
          <a-upload
            ref="imageUploadRef"
            :file-list="imageFileList"
            :custom-request="handleImageUpload"
            :on-before-upload="beforeImageUpload"
            :on-remove="handleImageRemove"
            list-type="picture-card"
            :limit="10"
            multiple
            class="image-upload"
          >
            <template #upload-button>
              <div class="upload-button">
                <icon-plus />
                <div class="upload-text">上传图片</div>
              </div>
            </template>
          </a-upload>
          <div class="upload-tips">
            <p>• 最多可上传10张图片</p>
            <p>• 支持格式：JPG、PNG、WEBP</p>
            <p>• 单张图片大小不超过10MB</p>
            <p>• 建议尺寸：1080x1080像素以上</p>
          </div>
        </div>

        <!-- 视频上传配置 -->
        <div class="config-section">
          <h4 class="section-title">
            <icon-video-camera class="section-icon" />
            视频上传配置
            <a-tag size="small" color="orange">支持MP4、MOV格式，不超过100MB</a-tag>
          </h4>
          <a-upload
            ref="videoUploadRef"
            :file-list="videoFileList"
            :custom-request="handleVideoUpload"
            :on-before-upload="beforeVideoUpload"
            :on-remove="handleVideoRemove"
            list-type="picture-card"
            :limit="3"
            multiple
            class="video-upload"
          >
            <template #upload-button>
              <div class="upload-button">
                <icon-video-camera />
                <div class="upload-text">上传视频</div>
              </div>
            </template>
            <template #file="{ file }">
              <div class="video-file-item">
                <div class="video-preview">
                  <icon-video-camera size="32" />
                  <p class="video-name">{{ file.name }}</p>
                  <p class="video-size">{{ formatFileSize(file.size || 0) }}</p>
                </div>
                <div class="file-actions">
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="previewVideo(file)"
                  >
                    <icon-eye />
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    status="danger"
                    @click="handleVideoRemove(file)"
                  >
                    <icon-delete />
                  </a-button>
                </div>
              </div>
            </template>
          </a-upload>
          <div class="upload-tips">
            <p>• 最多可上传3个视频</p>
            <p>• 支持格式：MP4、MOV</p>
            <p>• 单个视频大小不超过100MB</p>
            <p>• 建议时长：15-60秒</p>
            <p>• 建议分辨率：1080P以上</p>
          </div>
        </div>
      </a-form>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="saveConfig">保存配置</a-button>
        </a-space>
      </div>
    </div>

    <!-- 视频预览弹窗 -->
    <a-modal
      :visible="videoPreviewVisible"
      title="视频预览"
      width="600px"
      :footer="false"
      @cancel="videoPreviewVisible = false"
    >
      <div class="video-preview-content" v-if="previewVideoUrl">
        <video :src="previewVideoUrl" controls class="preview-video">
          您的浏览器不支持视频播放
        </video>
      </div>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { FileItem } from '@arco-design/web-vue'
import {
  IconImage,
  IconVideoCamera,
  IconPlus,
  IconEye,
  IconDelete
} from '@arco-design/web-vue/es/icon'

interface Product {
  id: number
  name: string
  category: string
  customer: string
  price: number
  image: string
  createTime: string
  status: string
}

interface ConfigForm {
  // 简化后只保留基本配置
  imageCount: number
  videoCount: number
}

const props = defineProps<{
  visible: boolean
  product: Product | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'save': [config: ConfigForm]
  'generate': [config: ConfigForm]
}>()

const configForm = reactive<ConfigForm>({
  imageCount: 4,
  videoCount: 1
})

const imageFileList = ref<FileItem[]>([])
const videoFileList = ref<FileItem[]>([])
const isGenerating = ref(false)
const videoPreviewVisible = ref(false)
const previewVideoUrl = ref('')

// 图片上传处理
const beforeImageUpload = (file: File) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB

  if (!isValidType) {
    Message.error('只支持JPG、PNG、WEBP格式的图片')
    return false
  }
  if (!isValidSize) {
    Message.error('图片大小不能超过10MB')
    return false
  }
  return true
}

const handleImageUpload = (option: any) => {
  const { file } = option
  // 模拟上传
  setTimeout(() => {
    const fileItem: FileItem = {
      uid: Date.now().toString(),
      name: file.name,
      status: 'done',
      url: URL.createObjectURL(file)
    }
    imageFileList.value.push(fileItem)
    Message.success('图片上传成功')
  }, 1000)
}

const handleImageRemove = (file: FileItem) => {
  const index = imageFileList.value.findIndex((item: FileItem) => item.uid === file.uid)
  if (index > -1) {
    imageFileList.value.splice(index, 1)
  }
}

// 视频上传处理
const beforeVideoUpload = (file: File) => {
  const isValidType = ['video/mp4', 'video/quicktime'].includes(file.type)
  const isValidSize = file.size <= 100 * 1024 * 1024 // 100MB

  if (!isValidType) {
    Message.error('只支持MP4、MOV格式的视频')
    return false
  }
  if (!isValidSize) {
    Message.error('视频大小不能超过100MB')
    return false
  }
  return true
}

const handleVideoUpload = (option: any) => {
  const { file } = option
  // 模拟上传
  setTimeout(() => {
    const fileItem: FileItem = {
      uid: Date.now().toString(),
      name: file.name,
      status: 'done',
      url: URL.createObjectURL(file)
    }
    videoFileList.value.push(fileItem)
    Message.success('视频上传成功')
  }, 1500)
}

const handleVideoRemove = (file: FileItem) => {
  const index = videoFileList.value.findIndex((item: FileItem) => item.uid === file.uid)
  if (index > -1) {
    videoFileList.value.splice(index, 1)
  }
}

// 视频预览
const previewVideo = (file: FileItem) => {
  previewVideoUrl.value = file.url || ''
  videoPreviewVisible.value = true
}

// 文件大小格式化
const formatFileSize = (size: number): string => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

// 保存配置
const saveConfig = () => {
  const config = {
    ...configForm,
    imageCount: imageFileList.value.length,
    videoCount: videoFileList.value.length
  }
  emit('save', config)
  Message.success('配置已保存')
}

// 开始生成
const startAdvancedGeneration = () => {
  if (imageFileList.value.length === 0 && videoFileList.value.length === 0) {
    Message.warning('请至少上传一张图片或一个视频')
    return
  }

  isGenerating.value = true
  
  const config = {
    ...configForm,
    imageCount: imageFileList.value.length,
    videoCount: videoFileList.value.length
  }
  
  emit('generate', config)
  
  // 模拟生成过程
  setTimeout(() => {
    isGenerating.value = false
    Message.success('AI生成完成！')
    handleCancel()
  }, 3000)
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
  // 重置表单
  setTimeout(() => {
    imageFileList.value = []
    videoFileList.value = []
    configForm.imageCount = 4
    configForm.videoCount = 1
    isGenerating.value = false
    videoPreviewVisible.value = false
    previewVideoUrl.value = ''
  }, 300)
}
</script>

<style scoped>
.ai-advanced-config-modal {
  padding: 16px 0;
}

.product-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.product-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.product-details {
  flex: 1;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.product-category {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #86909c;
}

.product-customer {
  margin: 0;
  font-size: 14px;
  color: #86909c;
}

.config-form {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.config-section {
  margin-bottom: 32px;
  padding: 20px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.section-icon {
  color: #722ed1;
}

.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #86909c;
}

.upload-text {
  font-size: 14px;
}

.upload-tips {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.upload-tips p {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #86909c;
}

.upload-tips p:last-child {
  margin-bottom: 0;
}

.video-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #fff;
}

.video-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.video-name {
  margin: 0;
  font-size: 12px;
  color: #1d2129;
  text-align: center;
  word-break: break-all;
}

.video-size {
  margin: 0;
  font-size: 10px;
  color: #86909c;
}

.file-actions {
  display: flex;
  gap: 4px;
}

.modal-actions {
  margin-top: 24px;
  padding: 16px;
  border-top: 1px solid #e5e6eb;
  text-align: right;
}

.video-preview-content {
  text-align: center;
}

.preview-video {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-card {
    flex-direction: column;
    text-align: center;
  }
  
  .config-form {
    max-height: 400px;
  }
  
  .modal-actions {
    text-align: center;
  }
}
</style>