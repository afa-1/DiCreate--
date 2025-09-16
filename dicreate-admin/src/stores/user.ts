import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole, LoginForm } from '@/types'
import { http } from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // 初始化用户信息
  const initUser = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  // 登录
  const login = async (loginForm: LoginForm) => {
    try {
      const response = await http.post<{ user: User; token: string }>('/auth/login', loginForm)
      
      user.value = response.user
      token.value = response.token
      
      // 保存到本地存储
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      
      return response
    } catch (error) {
      throw error
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const userInfo = await http.get<User>('/auth/me')
      user.value = userInfo
      localStorage.setItem('user', JSON.stringify(user.value))
      return userInfo
    } catch (error) {
      logout()
      throw error
    }
  }

  // 检查权限
  const hasRole = (role: UserRole): boolean => {
    return user.value?.role === role
  }

  // 检查是否有任一权限
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user.value ? roles.includes(user.value.role) : false
  }

  return {
    user,
    token,
    isLoggedIn,
    initUser,
    login,
    logout,
    getUserInfo,
    hasRole,
    hasAnyRole
  }
})