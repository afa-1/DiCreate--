<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">新增商品</h1>
      <p class="text-gray-600 mt-1">创建新的商品信息</p>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <a-form
        :model="form"
        :rules="rules"
        layout="vertical"
        @submit="handleSubmit"
      >
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item field="name" label="商品名称">
              <a-input v-model="form.name" placeholder="请输入商品名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="category" label="商品分类">
              <a-select v-model="form.category" placeholder="请选择商品分类">
                <a-option value="tops">上装</a-option>
                <a-option value="bottoms">下装</a-option>
                <a-option value="dresses">连衣裙</a-option>
                <a-option value="accessories">配饰</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="description" label="商品描述">
          <a-textarea
            v-model="form.description"
            placeholder="请输入商品描述"
            :rows="4"
          />
        </a-form-item>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item field="price" label="商品价格">
              <a-input-number
                v-model="form.price"
                placeholder="请输入价格"
                :min="0"
                :precision="2"
              >
                <template #suffix>元</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="status" label="商品状态">
              <a-select v-model="form.status" placeholder="请选择状态">
                <a-option value="draft">草稿</a-option>
                <a-option value="pending">待审核</a-option>
                <a-option value="approved">已审核</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="loading">
              保存商品
            </a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="$router.go(-1)">返回</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  name: '',
  category: '',
  description: '',
  price: 0,
  status: 'draft'
})

const rules = {
  name: [
    { required: true, message: '请输入商品名称' }
  ],
  category: [
    { required: true, message: '请选择商品分类' }
  ],
  price: [
    { required: true, message: '请输入商品价格' }
  ]
}

const handleSubmit = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('商品创建成功')
    router.push('/product/list')
  } catch (error) {
    Message.error('创建失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  Object.assign(form, {
    name: '',
    category: '',
    description: '',
    price: 0,
    status: 'draft'
  })
}
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>