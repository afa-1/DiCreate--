<template>
  <a-modal
    :visible="visible"
    title="AI快捷生成"
    width="800px"
    :footer="false"
    :mask-closable="false"
    @cancel="handleCancel"
  >
    <div class="ai-quick-generate-modal">
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

      <!-- 进度条 -->
      <div class="progress-section">
        <a-steps :current="currentStep" :status="stepStatus" size="small">
          <a-step title="生成服装预览图" description="AI生成服装效果图" />
          <a-step title="面料替换" description="智能匹配面料材质" />
          <a-step title="生成商品图" description="生成4张高清商品图" />
          <a-step title="生成视频" description="生成15秒展示视频" />
        </a-steps>
      </div>

      <!-- 生成内容展示区域 -->
      <div class="content-area">
        <!-- 步骤1：服装预览图 -->
        <div v-if="currentStep >= 0" class="step-content">
          <h4 class="step-title">
            <icon-image class="step-icon" />
            服装预览图
            <a-tag v-if="currentStep > 0" color="green" size="small">已完成</a-tag>
            <a-tag v-else-if="currentStep === 0 && isGenerating" color="blue" size="small">生成中...</a-tag>
          </h4>
          <div class="preview-images" v-if="generatedContent.previewImage || currentStep === 0">
            <div class="image-placeholder" v-if="!generatedContent.previewImage && currentStep === 0">
              <a-spin :spinning="isGenerating">
                <div class="placeholder-content">
                  <icon-image size="48" />
                  <p>正在生成服装预览图...</p>
                </div>
              </a-spin>
            </div>
            <img v-else-if="generatedContent.previewImage" :src="generatedContent.previewImage" alt="服装预览图" class="generated-image" />
          </div>
        </div>

        <!-- 步骤2：面料替换 -->
        <div v-if="currentStep >= 1" class="step-content">
          <h4 class="step-title">
            <icon-palette class="step-icon" />
            面料替换
            <a-tag v-if="currentStep > 1" color="green" size="small">已完成</a-tag>
            <a-tag v-else-if="currentStep === 1 && isGenerating" color="blue" size="small">处理中...</a-tag>
          </h4>
          <div class="fabric-options" v-if="generatedContent.fabricOptions || currentStep === 1">
            <div class="fabric-placeholder" v-if="!generatedContent.fabricOptions && currentStep === 1">
              <a-spin :spinning="isGenerating">
                <div class="placeholder-content">
                  <icon-palette size="48" />
                  <p>正在智能匹配面料...</p>
                </div>
              </a-spin>
            </div>
            <div v-else-if="generatedContent.fabricOptions" class="fabric-grid">
              <div v-for="fabric in generatedContent.fabricOptions" :key="fabric.id" class="fabric-item">
                <img :src="fabric.image" :alt="fabric.name" class="fabric-image" />
                <p class="fabric-name">{{ fabric.name }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤3：商品图生成 -->
        <div v-if="currentStep >= 2" class="step-content">
          <h4 class="step-title">
            <icon-camera class="step-icon" />
            商品图片 (4张)
            <a-tag v-if="currentStep > 2" color="green" size="small">已完成</a-tag>
            <a-tag v-else-if="currentStep === 2 && isGenerating" color="blue" size="small">生成中...</a-tag>
          </h4>
          <div class="product-images" v-if="generatedContent.productImages || currentStep === 2">
            <div class="images-placeholder" v-if="!generatedContent.productImages && currentStep === 2">
              <a-spin :spinning="isGenerating">
                <div class="placeholder-content">
                  <icon-camera size="48" />
                  <p>正在生成4张高清商品图...</p>
                </div>
              </a-spin>
            </div>
            <div v-else-if="generatedContent.productImages" class="images-grid">
              <div v-for="(image, index) in generatedContent.productImages" :key="index" class="image-item">
                <img :src="image" :alt="`商品图${index + 1}`" class="product-image-item" />
                <p class="image-label">商品图{{ index + 1 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤4：视频生成 -->
        <div v-if="currentStep >= 3" class="step-content">
          <h4 class="step-title">
            <icon-video-camera class="step-icon" />
            展示视频 (15秒)
            <a-tag v-if="currentStep > 3" color="green" size="small">已完成</a-tag>
            <a-tag v-else-if="currentStep === 3 && isGenerating" color="blue" size="small">生成中...</a-tag>
          </h4>
          <div class="video-content" v-if="generatedContent.video || currentStep === 3">
            <div class="video-placeholder" v-if="!generatedContent.video && currentStep === 3">
              <a-spin :spinning="isGenerating">
                <div class="placeholder-content">
                  <icon-video-camera size="48" />
                  <p>正在生成15秒展示视频...</p>
                </div>
              </a-spin>
            </div>
            <div v-else-if="generatedContent.video" class="video-player">
              <video :src="generatedContent.video" controls class="generated-video">
                您的浏览器不支持视频播放
              </video>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <a-space>
          <a-button @click="handleCancel" :disabled="isGenerating">取消</a-button>
          <a-button 
            v-if="!isGenerating && currentStep < 4" 
            type="primary" 
            @click="startGeneration"
          >
            开始生成
          </a-button>
          <a-button 
            v-if="isGenerating" 
            type="primary" 
            loading
            @click="stopGeneration"
          >
            停止生成
          </a-button>
          <a-button 
            v-if="!isGenerating && currentStep === 4" 
            type="primary" 
            @click="saveResults"
          >
            保存结果
          </a-button>
          <a-button 
            v-if="!isGenerating && currentStep === 4" 
            @click="previewResults"
          >
            预览效果
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconImage,
  IconPalette,
  IconCamera,
  IconVideoCamera
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

interface FabricOption {
  id: number
  name: string
  image: string
}

interface GeneratedContent {
  previewImage?: string
  fabricOptions?: FabricOption[]
  productImages?: string[]
  video?: string
}

const props = defineProps<{
  visible: boolean
  product: Product | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'save': [content: GeneratedContent]
}>()

const currentStep = ref(0)
const stepStatus = ref<'wait' | 'process' | 'finish' | 'error'>('wait')
const isGenerating = ref(false)
const generatedContent = reactive<GeneratedContent>({})

// 模拟生成内容
const mockGeneratedContent = {
  previewImage: 'https://picsum.photos/400/500?random=1',
  fabricOptions: [
    { id: 1, name: '棉质面料', image: 'https://picsum.photos/100/100?random=2' },
    { id: 2, name: '丝绸面料', image: 'https://picsum.photos/100/100?random=3' },
    { id: 3, name: '麻质面料', image: 'https://picsum.photos/100/100?random=4' }
  ],
  productImages: [
    'https://picsum.photos/200/250?random=5',
    'https://picsum.photos/200/250?random=6',
    'https://picsum.photos/200/250?random=7',
    'https://picsum.photos/200/250?random=8'
  ],
  video: 'https://www.w3schools.com/html/mov_bbb.mp4'
}

const startGeneration = async () => {
  isGenerating.value = true
  stepStatus.value = 'process'
  
  try {
    // 步骤1：生成服装预览图
    currentStep.value = 0
    await simulateGeneration(2000)
    generatedContent.previewImage = mockGeneratedContent.previewImage
    
    // 步骤2：面料替换
    currentStep.value = 1
    await simulateGeneration(1500)
    generatedContent.fabricOptions = mockGeneratedContent.fabricOptions
    
    // 步骤3：生成商品图
    currentStep.value = 2
    await simulateGeneration(3000)
    generatedContent.productImages = mockGeneratedContent.productImages
    
    // 步骤4：生成视频
    currentStep.value = 3
    await simulateGeneration(4000)
    generatedContent.video = mockGeneratedContent.video
    
    currentStep.value = 4
    stepStatus.value = 'finish'
    Message.success('AI生成完成！')
  } catch (error) {
    stepStatus.value = 'error'
    Message.error('生成过程中出现错误')
  } finally {
    isGenerating.value = false
  }
}

const simulateGeneration = (delay: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

const stopGeneration = () => {
  isGenerating.value = false
  stepStatus.value = 'error'
  Message.warning('生成已停止')
}

const saveResults = () => {
  emit('save', generatedContent)
  Message.success('结果已保存')
  handleCancel()
}

const previewResults = () => {
  Message.info('预览功能开发中...')
}

const handleCancel = () => {
  emit('update:visible', false)
  // 重置状态
  setTimeout(() => {
    currentStep.value = 0
    stepStatus.value = 'wait'
    isGenerating.value = false
    Object.keys(generatedContent).forEach(key => {
      delete generatedContent[key as keyof GeneratedContent]
    })
  }, 300)
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.product) {
    // 弹窗打开时的初始化逻辑
  }
})
</script>

<style scoped>
.ai-quick-generate-modal {
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
}

.product-details {
  flex: 1;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.product-category,
.product-customer {
  margin: 4px 0;
  color: #86909c;
  font-size: 14px;
}

.progress-section {
  margin-bottom: 32px;
  padding: 0 16px;
}

.content-area {
  max-height: 500px;
  overflow-y: auto;
  padding: 0 16px;
}

.step-content {
  margin-bottom: 32px;
  padding: 20px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.step-icon {
  color: #722ed1;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #86909c;
  text-align: center;
}

.placeholder-content p {
  margin: 12px 0 0 0;
  font-size: 14px;
}

.image-placeholder,
.fabric-placeholder,
.images-placeholder,
.video-placeholder {
  min-height: 200px;
  border: 2px dashed #e5e6eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.generated-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fabric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.fabric-item {
  text-align: center;
}

.fabric-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e5e6eb;
  transition: border-color 0.3s;
}

.fabric-image:hover {
  border-color: #722ed1;
}

.fabric-name {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #1d2129;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.image-item {
  text-align: center;
}

.product-image-item {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-label {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #1d2129;
}

.video-player {
  text-align: center;
}

.generated-video {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-actions {
  margin-top: 24px;
  padding: 16px;
  border-top: 1px solid #e5e6eb;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-card {
    flex-direction: column;
    text-align: center;
  }
  
  .fabric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .images-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-actions {
    text-align: center;
  }
}
</style>