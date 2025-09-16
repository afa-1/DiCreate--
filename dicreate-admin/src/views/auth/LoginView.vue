<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo和标题 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
          <span class="text-white font-bold text-2xl">DC</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">DiCreate.AI</h1>
        <p class="text-gray-600">运营端后台管理系统</p>
      </div>
      
      <!-- 登录表单 -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">登录</h2>
        
        <a-form
          :model="loginForm"
          :rules="rules"
          @submit="handleLogin"
          layout="vertical"
          class="space-y-4"
        >
          <a-form-item field="username" label="用户名" class="mb-4">
            <a-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              class="h-12"
            >
              <template #prefix>
                <icon-user class="text-gray-400" />
              </template>
            </a-input>
          </a-form-item>
          
          <a-form-item field="password" label="密码" class="mb-6">
            <a-input-password
              v-model="loginForm.password"
              placeholder="请输入密码"
              size="large"
              class="h-12"
            >
              <template #prefix>
                <icon-lock class="text-gray-400" />
              </template>
            </a-input-password>
          </a-form-item>
          
          <a-form-item class="mb-6">
            <div class="flex items-center justify-between">
              <a-checkbox v-model="rememberMe">
                记住我
              </a-checkbox>
              <a-link class="text-sm">忘记密码？</a-link>
            </div>
          </a-form-item>
          
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="loading"
              class="w-full h-12 text-base font-medium"
            >
              登录
            </a-button>
          </a-form-item>
        </a-form>
        
        <!-- 角色说明 -->
        <div class="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-sm font-medium text-gray-700 mb-2">系统角色说明：</h3>
          <div class="space-y-1 text-xs text-gray-600">
            <div>• <span class="font-medium">运营人员</span>：商品管理、订单审核、用户管理等</div>
            <div>• <span class="font-medium">服装设计师</span>：AI设计管理、商品设计、资源库管理</div>
            <div>• <span class="font-medium">销售</span>：订单管理、客户服务等</div>
          </div>
        </div>
        
        <!-- 演示账号 -->
        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 class="text-sm font-medium text-blue-700 mb-2">演示账号：</h3>
          <div class="space-y-1 text-xs text-blue-600">
            <div class="flex justify-between">
              <span>超级管理员：admin / 123456</span>
              <a-button size="mini" @click="fillDemo('admin')">填入</a-button>
            </div>
            <div class="flex justify-between">
              <span>运营人员：operator / 123456</span>
              <a-button size="mini" @click="fillDemo('operator')">填入</a-button>
            </div>
            <div class="flex justify-between">
              <span>设计师：designer / 123456</span>
              <a-button size="mini" @click="fillDemo('designer')">填入</a-button>
            </div>
            <div class="flex justify-between">
              <span>销售：sales / 123456</span>
              <a-button size="mini" @click="fillDemo('sales')">填入</a-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 版权信息 -->
      <div class="text-center mt-8 text-sm text-gray-500">
        © 2024 DiCreate.AI. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon'
import { useUserStore } from '@/stores/user'
import type { LoginForm } from '@/types'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const loginForm = reactive<LoginForm>({
  username: '',
  password: ''
})

// 记住我
const rememberMe = ref(false)

// 加载状态
const loading = ref(false)

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { minLength: 3, message: '用户名至少3个字符' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { minLength: 6, message: '密码至少6个字符' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    Message.warning('请填写完整的登录信息')
    return
  }
  
  loading.value = true
  
  try {
    // 模拟登录API调用
    await mockLogin(loginForm)
    
    Message.success('登录成功')
    
    // 跳转到首页
    router.push('/dashboard')
  } catch (error: any) {
    Message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 模拟登录API（实际项目中应该调用真实API）
const mockLogin = async (form: LoginForm) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟用户数据
      const users = {
        admin: {
          id: '0',
          username: 'admin',
          email: 'admin@dicreate.ai',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        operator: {
          id: '1',
          username: 'operator',
          email: 'operator@dicreate.ai',
          role: 'operator',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        designer: {
          id: '2',
          username: 'designer',
          email: 'designer@dicreate.ai',
          role: 'designer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        sales: {
          id: '3',
          username: 'sales',
          email: 'sales@dicreate.ai',
          role: 'sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
      
      const user = users[form.username as keyof typeof users]
      
      if (user && form.password === '123456') {
        // 保存用户信息到store
        userStore.user = user
        userStore.token = 'mock-token-' + Date.now()
        
        // 保存到本地存储
        localStorage.setItem('token', userStore.token)
        localStorage.setItem('user', JSON.stringify(user))
        
        resolve({ user, token: userStore.token })
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 1000)
  })
}

// 填入演示账号
const fillDemo = (type: string) => {
  loginForm.username = type
  loginForm.password = '123456'
}
</script>

<style scoped>
.arco-input {
  border-radius: 8px;
}

.arco-btn-primary {
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.arco-btn-primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}
</style>