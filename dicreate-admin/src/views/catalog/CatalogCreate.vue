<template>
  <div class="catalog-create">
    <div class="page-header">
      <h1 class="page-title">创建画册</h1>
      <p class="page-description">选择模板并填写基本信息来创建新的电子画册</p>
    </div>

    <div class="create-steps">
      <a-steps :current="currentStep" size="small">
        <a-step title="选择模板" />
        <a-step title="填写信息" />
        <a-step title="完成创建" />
      </a-steps>
    </div>

    <!-- 步骤1: 选择模板 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="step-title">选择画册模板</div>
      <div class="template-selection">
        <div
          class="template-card"
          :class="{ selected: selectedTemplate?.id === defaultTemplate.id }"
          @click="selectTemplate(defaultTemplate)"
        >
          <div class="template-thumbnail">
            <img :src="defaultTemplate.thumbnail" :alt="defaultTemplate.name" />
          </div>
          <div class="template-info">
            <h3 class="template-name">{{ defaultTemplate.name }}</h3>
            <p class="template-description">{{ defaultTemplate.description }}</p>
            <a-button
              type="primary"
              :disabled="selectedTemplate?.id !== defaultTemplate.id"
              @click.stop="nextStep"
            >
              选择此模板
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤2: 填写基本信息 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="step-title">填写基本信息</div>
      <div class="form-container">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
          @submit="handleSubmit"
        >
          <a-form-item field="name" label="画册名称" required>
            <a-input
              v-model="formData.name"
              placeholder="请输入画册名称（如：山东大学学位服定制方案）"
              :max-length="50"
              show-word-limit
            />
          </a-form-item>

          <a-form-item field="productType" label="关联商品类型" required>
            <a-select
              v-model="formData.productType"
              placeholder="请选择关联商品类型"
            >
              <a-option value="degree-clothing">学位服</a-option>
              <a-option value="school-uniform">校服</a-option>
              <a-option value="professional-wear">职业装</a-option>
              <a-option value="custom-gifts">定制礼品</a-option>
            </a-select>
          </a-form-item>

          <a-form-item field="remark" label="备注">
            <a-textarea
              v-model="formData.remark"
              placeholder="请输入备注信息（如：给 XX 客户的专属方案，需突出刺绣工艺）"
              :max-length="200"
              :auto-size="{ minRows: 3, maxRows: 6 }"
              show-word-limit
            />
          </a-form-item>

          <div class="form-actions">
            <a-button @click="prevStep">上一步</a-button>
            <a-button type="primary" html-type="submit" :loading="creating">
              创建画册
            </a-button>
          </div>
        </a-form>
      </div>
    </div>

    <!-- 步骤3: 创建成功 -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="success-content">
        <div class="success-icon">
          <icon-check-circle-fill />
        </div>
        <h2 class="success-title">画册创建成功！</h2>
        <p class="success-description">
          您的画册"{{ formData.name }}"已创建完成，现在可以开始编辑内容了。
        </p>
        <div class="success-actions">
          <a-button @click="backToList">返回列表</a-button>
          <a-button type="primary" @click="startEditing">
            开始编辑
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconCheckCircleFill } from '@arco-design/web-vue/es/icon'

interface Template {
  id: string
  name: string
  thumbnail: string
  description: string
}

interface FormData {
  name: string
  productType: string
  remark: string
}

const router = useRouter()
const currentStep = ref(0)
const selectedTemplate = ref<Template | null>(null)
const creating = ref(false)
const createdCatalogId = ref('')

const defaultTemplate: Template = {
  id: 'default-template',
  name: '通用产品画册模板',
  thumbnail: '/images/template-thumbnail.jpg',
  description: '适用于各类产品展示的通用画册模板，包含封面页、视频页、图文详情页和封底页'
}

const formData = reactive<FormData>({
  name: '',
  productType: '',
  remark: ''
})

const formRules = {
  name: [
    { required: true, message: '画册名称为必填项，请补充' },
    { minLength: 2, message: '画册名称至少需要2个字符' },
    { maxLength: 50, message: '画册名称不能超过50个字符' }
  ],
  productType: [
    { required: true, message: '请选择关联商品类型' }
  ]
}

const selectTemplate = (template: Template) => {
  selectedTemplate.value = template
}

const nextStep = () => {
  if (!selectedTemplate.value) {
    Message.warning('请先选择画册模板')
    return
  }
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const handleSubmit = async ({ errors }: any) => {
  if (errors) return

  creating.value = true
  try {
    // 模拟创建画册API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 生成模拟的画册ID
    createdCatalogId.value = `catalog_${Date.now()}`
    
    currentStep.value = 2
    Message.success('画册创建成功')
  } catch (error) {
    Message.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

const backToList = () => {
  router.push('/catalog/management')
}

const startEditing = () => {
  router.push(`/catalog/editor/${createdCatalogId.value}`)
}
</script>

<style scoped>
.catalog-create {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
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

.create-steps {
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
}

.step-content {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  min-height: 400px;
}

.step-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1d2129;
}

.template-selection {
  display: flex;
  justify-content: center;
}

.template-card {
  width: 320px;
  background: #fff;
  border: 2px solid #e5e6eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-card:hover {
  border-color: #165dff;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
}

.template-card.selected {
  border-color: #165dff;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
}

.template-thumbnail {
  width: 100%;
  height: 200px;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.template-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-info {
  padding: 20px;
  text-align: center;
}

.template-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #1d2129;
}

.template-description {
  color: #86909c;
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.5;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
}

.success-content {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  font-size: 64px;
  color: #00b42a;
  margin-bottom: 24px;
}

.success-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1d2129;
}

.success-description {
  color: #86909c;
  margin: 0 0 32px 0;
  font-size: 14px;
}

.success-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>