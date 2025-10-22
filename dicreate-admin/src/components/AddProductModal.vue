<template>
  <a-modal
    :visible="visible"
    title="商品新增窗口"
    width="600px"
    :footer="false"
    @cancel="handleCancel"
    :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
    :body-style="{ height: '400px', padding: '24px' }"
  >
    <div class="add-product-modal">
      <a-form 
        ref="formRef"
        :model="productForm" 
        :rules="formRules"
        layout="vertical" 
        class="product-form"
        style="height: 100%; display: flex; flex-direction: column;"
      >
        <!-- 定制商品名称 -->
        <a-form-item 
          label="定制商品名称" 
          field="name" 
          required
          :label-style="{ fontSize: '14px', color: '#333' }"
        >
          <a-input 
            v-model="productForm.name" 
            placeholder="请输入定制商品名称"
            :max-length="50"
            show-word-limit
            allow-clear
          />
        </a-form-item>

        <!-- 模板选择 -->
        <a-form-item 
          label="模板选择" 
          field="template" 
          required
          :label-style="{ fontSize: '14px', color: '#333' }"
        >
          <a-select 
            v-model="productForm.template" 
            placeholder="请选择商品模板"
            allow-clear
          >
            <a-option value="basic-degree-template">基础款学位服模板</a-option>
            <a-option value="custom-uniform-template">定制款校服模板</a-option>
            <a-option value="work-uniform-template">工作服模板</a-option>
            <a-option value="sports-uniform-template">运动服模板</a-option>
          </a-select>
        </a-form-item>

        <!-- 客户信息 -->
        <a-form-item 
          label="客户信息" 
          field="customerInfo" 
          required
          :label-style="{ fontSize: '14px', color: '#333' }"
        >
          <a-input 
            v-model="productForm.customerInfo" 
            placeholder="请输入客户信息"
            :max-length="50"
            show-word-limit
            allow-clear
          />
        </a-form-item>

        <!-- 底部按钮区域 -->
        <div style="flex: 1; display: flex; align-items: flex-end; justify-content: flex-end;">
          <a-button 
            type="outline"
            @click="handle2DCustomization"
            style="
              width: 140px; 
              height: 40px; 
              border-radius: 4px; 
              border-color: #1890FF; 
              color: #1890FF;
              background-color: white;
            "
          >
            2D 定制
          </a-button>
        </div>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

// Props
const props = defineProps<{
  visible: boolean
}>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

// 表单引用
const formRef = ref()

// 表单数据
const productForm = reactive({
  name: '',
  template: '',
  customerInfo: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入定制商品名称' },
    { min: 1, max: 50, message: '商品名称长度为1-50个字符' }
  ],
  template: [
    { required: true, message: '请选择商品模板' }
  ],
  customerInfo: [
    { required: true, message: '请输入客户信息' },
    { min: 1, max: 50, message: '客户信息长度为1-50个字符' }
  ]
}

// 处理取消
const handleCancel = () => {
  emit('update:visible', false)
  // 重置表单
  setTimeout(() => {
    productForm.name = ''
    productForm.template = ''
    productForm.customerInfo = ''
    formRef.value?.resetFields()
  }, 300)
}

// 处理2D定制
const handle2DCustomization = async () => {
  try {
    // 验证表单
    const valid = await formRef.value?.validate()
    if (!valid) {
      return
    }

    // 显示确认提示
    const confirmed = window.confirm('是否前往 2D 定制平台？')
    if (confirmed) {
      // 跳转到外部2D定制平台（新标签页打开）
      window.open('https://2d-customization-platform.com', '_blank')
      
      // 关闭弹窗
      handleCancel()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.add-product-modal {
  height: 100%;
}

.product-form {
  height: 100%;
}

:deep(.arco-form-item-label) {
  font-size: 14px !important;
  color: #333 !important;
}

:deep(.arco-modal-header) {
  border-bottom: 1px solid #e5e7eb;
}

:deep(.arco-modal-body) {
  padding: 24px !important;
}
</style>