<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
    <div class="text-center">
      <!-- 404图标 -->
      <div class="mb-8">
        <div class="text-9xl font-bold text-gray-300 mb-4">404</div>
        <div class="w-24 h-1 bg-blue-500 mx-auto rounded"></div>
      </div>
      
      <!-- 错误信息 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">页面未找到</h1>
        <p class="text-gray-600 text-lg mb-2">抱歉，您访问的页面不存在或已被移除。</p>
        <p class="text-gray-500">请检查URL是否正确，或返回首页继续浏览。</p>
      </div>
      
      <!-- 操作按钮 -->
      <div class="space-x-4">
        <a-button type="primary" size="large" @click="goHome">
          <icon-home class="mr-2" />
          返回首页
        </a-button>
        <a-button size="large" @click="goBack">
          <icon-left class="mr-2" />
          返回上页
        </a-button>
      </div>
      
      <!-- 建议链接 -->
      <div class="mt-12">
        <p class="text-gray-500 mb-4">您可能想要访问：</p>
        <div class="flex flex-wrap justify-center gap-4">
          <a-link @click="$router.push('/dashboard')" class="text-blue-500 hover:text-blue-600">
            工作台
          </a-link>
          <a-link @click="$router.push('/product/list')" class="text-blue-500 hover:text-blue-600">
            商品管理
          </a-link>
          <a-link @click="$router.push('/order/list')" class="text-blue-500 hover:text-blue-600">
            订单管理
          </a-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { IconHome, IconLeft } from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/dashboard')
}

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>