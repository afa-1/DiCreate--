<template>
  <div class="template-management">
    <div class="page-header">
      <h1 class="page-title">模板管理</h1>
      <p class="page-description">管理电子画册模板，当前系统提供通用产品画册模板</p>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="请输入模板名称搜索"
        style="width: 300px"
        @search="handleSearch"
      />
    </div>

    <!-- 模板列表 -->
    <div class="template-list">
      <div v-if="filteredTemplates.length === 0" class="empty-state">
        <a-empty description="未找到匹配的模板，请尝试其他关键词" />
      </div>
      <div v-else class="template-grid">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card"
        >
          <div class="template-thumbnail">
            <img :src="template.thumbnail" :alt="template.name" />
          </div>
          <div class="template-info">
            <h3 class="template-name">{{ template.name }}</h3>
            <div class="template-actions">
              <a-button type="primary" @click="previewTemplate(template)">
                预览模板
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

interface Template {
  id: string
  name: string
  thumbnail: string
  description: string
  createdAt: string
}

const searchKeyword = ref('')
const templates = ref<Template[]>([])

// 预设的通用产品画册模板
const defaultTemplate: Template = {
  id: 'default-template',
  name: '通用产品画册模板',
  thumbnail: '/images/template-thumbnail.jpg',
  description: '适用于各类产品展示的通用画册模板',
  createdAt: '2024-01-01 00:00:00'
}

const filteredTemplates = computed(() => {
  if (!searchKeyword.value.trim()) {
    return templates.value
  }
  return templates.value.filter(template =>
    template.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const previewTemplate = (template: Template) => {
  Message.info(`预览模板：${template.name}`)
  // TODO: 实现模板预览功能
}

onMounted(() => {
  // 初始化模板数据
  templates.value = [defaultTemplate]
})
</script>

<style scoped>
.template-management {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
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

.search-section {
  margin-bottom: 24px;
}

.template-list {
  min-height: 400px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.template-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  overflow: hidden;
  transition: all 0.3s ease;
}

.template-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
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
  padding: 16px;
}

.template-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: #1d2129;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>