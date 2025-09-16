<template>
  <a-layout class="min-h-screen">
    <!-- 左侧导航栏 -->
    <a-layout-sider
      :width="240"
      :collapsed="collapsed"
      :collapsible="true"
      @collapse="onCollapse"
      class="bg-white shadow-sm"
    >
      <!-- Logo区域 -->
      <div class="h-16 flex items-center justify-center border-b border-gray-200">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <span class="text-white font-bold text-sm">DC</span>
          </div>
          <span v-if="!collapsed" class="text-lg font-semibold text-gray-800">
            DiCreate.AI
          </span>
        </div>
      </div>
      
      <!-- 导航菜单 -->
      <a-menu
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        mode="inline"
        class="border-none"
        @menu-item-click="onMenuClick"
        @sub-menu-click="onSubMenuClick"
      >
        <template v-for="menu in userMenus" :key="menu.key">
          <!-- 有子菜单的项 -->
          <a-sub-menu v-if="menu.children && menu.children.length > 0" :key="menu.key">
            <template #icon>
              <component :is="menu.icon" v-if="menu.icon" />
            </template>
            <template #title>{{ menu.title }}</template>
            <a-menu-item
              v-for="child in menu.children"
              :key="child.key"
              @click="() => navigateTo(child.path)"
            >
              {{ child.title }}
            </a-menu-item>
          </a-sub-menu>
          
          <!-- 无子菜单的项 -->
          <a-menu-item v-else :key="menu.key" @click="() => navigateTo(menu.path)">
            <template #icon>
              <component :is="menu.icon" v-if="menu.icon" />
            </template>
            {{ menu.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>
    
    <a-layout>
      <!-- 顶部标题栏 -->
      <a-layout-header class="bg-white shadow-sm px-6 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- 面包屑导航 -->
          <a-breadcrumb>
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
              <span v-else>{{ item.title }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- 用户信息 -->
          <a-dropdown>
            <div class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded">
              <a-avatar :size="32">
                <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" alt="avatar" />
                <span v-else>{{ userStore.user?.username?.charAt(0).toUpperCase() }}</span>
              </a-avatar>
              <div class="flex flex-col">
                <span class="text-sm font-medium">{{ userStore.user?.username }}</span>
                <span class="text-xs text-gray-500">{{ getRoleText(userStore.user?.role) }}</span>
              </div>
              <icon-down class="text-gray-400" />
            </div>
            
            <template #content>
              <a-doption @click="handleProfile">
                <icon-user class="mr-2" />
                个人资料
              </a-doption>
              <a-doption @click="handleSettings">
                <icon-settings class="mr-2" />
                系统设置
              </a-doption>
              <a-doption class="text-red-500" @click="handleLogout">
                <icon-poweroff class="mr-2" />
                退出登录
              </a-doption>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      
      <!-- 主内容区域 -->
      <a-layout-content class="p-6 bg-gray-50">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal } from '@arco-design/web-vue'
import {
  IconDown,
  IconUser,
  IconSettings,
  IconPoweroff
} from '@arco-design/web-vue/es/icon'
import { useUserStore } from '@/stores/user'
import { getUserMenus } from '@/utils/menu'
import { UserRole } from '@/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 侧边栏折叠状态
const collapsed = ref(false)

// 菜单状态
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

// 用户菜单
const userMenus = computed(() => {
  if (!userStore.user?.role) return []
  return getUserMenus(userStore.user.role)
})

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    title: item.meta?.title as string,
    path: item.path
  }))
})

// 更新菜单状态
const updateMenuState = (path: string) => {
  // 查找当前路径对应的菜单项
  const findMenuKey = (menus: any[], targetPath: string): { key: string; parentKey?: string } | null => {
    for (const menu of menus) {
      if (menu.path === targetPath) {
        return { key: menu.key }
      }
      if (menu.children) {
        for (const child of menu.children) {
          if (child.path === targetPath) {
            return { key: child.key, parentKey: menu.key }
          }
        }
      }
    }
    return null
  }
  
  const result = findMenuKey(userMenus.value, path)
  if (result) {
    selectedKeys.value = [result.key]
    if (result.parentKey && !openKeys.value.includes(result.parentKey)) {
      openKeys.value = [...openKeys.value, result.parentKey]
    }
  }
}

// 监听路由变化更新菜单状态
watch(
  () => route.path,
  (newPath) => {
    updateMenuState(newPath)
  },
  { immediate: true }
)

// 侧边栏折叠事件
const onCollapse = (collapsed: boolean) => {
  // 折叠时关闭所有子菜单
  if (collapsed) {
    openKeys.value = []
  }
}

// 菜单点击事件
const onMenuClick = (key: string) => {
  selectedKeys.value = [key]
}

// 子菜单点击事件
const onSubMenuClick = (key: string, openKeys: string[]) => {
  // 更新展开的子菜单
}

// 导航到指定路径
const navigateTo = (path?: string) => {
  if (path) {
    router.push(path)
  }
}

// 获取角色文本
const getRoleText = (role?: UserRole) => {
  const roleMap = {
    [UserRole.OPERATOR]: '运营人员',
    [UserRole.DESIGNER]: '服装设计师',
    [UserRole.SALES]: '销售'
  }
  return role ? roleMap[role] : ''
}

// 个人资料
const handleProfile = () => {
  router.push('/profile')
}

// 系统设置
const handleSettings = () => {
  router.push('/settings')
}

// 退出登录
const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    onOk: () => {
      userStore.logout()
      router.push('/login')
    }
  })
}
</script>

<style scoped>
.arco-layout-sider {
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
}

.arco-menu {
  border-right: none;
}

.arco-menu-item:hover {
  background-color: #f2f3f5;
}

.arco-menu-item-selected {
  background-color: #e8f4ff;
  color: #1890ff;
}
</style>