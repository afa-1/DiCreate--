<template>
  <div class="ai-video-template responsive-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">视频模板管理</h1>
      <p class="page-description">管理AI生成视频的模板和结构配置</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards responsive-grid cols-sm-2 cols-md-4">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card>
            <a-statistic title="模板总数" :value="stats.total" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="运动服模板" :value="stats.sports" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="休闲服模板" :value="stats.casual" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="正装模板" :value="stats.formal" />
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-filters">
      <a-card class="filter-card responsive-card">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input-search
              v-model="searchForm.keyword"
              placeholder="搜索模板名称"
              allow-clear
              @search="handleSearch"
            />
          </a-col>
          <a-col :span="4">
            <a-select
              v-model="searchForm.category"
              placeholder="服装品类"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="sports">运动服</a-option>
              <a-option value="casual">休闲服</a-option>
              <a-option value="formal">正装</a-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-select
              v-model="searchForm.status"
              placeholder="模板状态"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="active">启用</a-option>
              <a-option value="inactive">禁用</a-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-select
              v-model="searchForm.duration"
              placeholder="视频时长"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="short">短视频(≤30s)</a-option>
              <a-option value="medium">中等(30s-60s)</a-option>
              <a-option value="long">长视频(>60s)</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-space>
              <a-button @click="handleReset">重置</a-button>
              <a-button type="primary" @click="handleSearch">搜索</a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 模板列表 -->
    <div class="template-list">
      <a-card class="template-list-card responsive-card">
        <a-table
          :columns="columns"
          :data-source="filteredTemplates"
          :row-selection="rowSelection"
          :pagination="pagination"
          :loading="loading"
          :scroll="{ x: 1200 }"
          row-key="id"
          class="responsive-table"
        >
          <template #preview="{ record }">
            <div class="template-preview">
              <img :src="record.preview" :alt="record.name" class="preview-image" />
              <div class="preview-overlay">
                <a-button size="small" @click="previewTemplate(record)">
                  <template #icon>
                    <icon-eye />
                  </template>
                </a-button>
              </div>
            </div>
          </template>

          <template #category="{ record }">
            <a-tag :color="getCategoryColor(record.category)">
              {{ getCategoryText(record.category) }}
            </a-tag>
          </template>

          <template #structure="{ record }">
            <div class="structure-info">
              <div>片段数: {{ record.structure.segments }}</div>
              <div>转场: {{ record.structure.transitions }}</div>
              <div>特效: {{ record.structure.effects }}</div>
            </div>
          </template>

          <template #status="{ record }">
            <a-switch
              v-model="record.status"
              :checked-value="'active'"
              :unchecked-value="'inactive'"
              @change="handleStatusChange(record)"
            />
          </template>

          <template #actions="{ record }">
            <a-space>
              <a-button size="small" @click="editTemplate(record)">
                <template #icon>
                  <icon-edit />
                </template>
              </a-button>
              <a-button size="small" @click="copyTemplate(record)">
                <template #icon>
                  <icon-copy />
                </template>
              </a-button>
              <a-button size="small" @click="configTemplate(record)">
                <template #icon>
                  <icon-settings />
                </template>
              </a-button>
              <a-popconfirm
                content="确定要删除这个模板吗？"
                @ok="deleteTemplate(record)"
              >
                <a-button size="small" status="danger">
                  <template #icon>
                    <icon-delete />
                  </template>
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 新建/编辑模板模态框 -->
    <a-modal
      v-model:visible="showCreateModal"
      :title="editingTemplate ? '编辑模板' : '新建模板'"
      width="1200px"
      @ok="handleCreateTemplate"
      @cancel="handleCancelCreate"
    >
      <a-form :model="templateForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="模板名称" required>
              <a-input v-model="templateForm.name" placeholder="请输入模板名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="服装品类" required>
              <a-select v-model="templateForm.category" placeholder="选择服装品类" @change="handleCategoryChange">
                <a-option value="sports">运动服</a-option>
                <a-option value="casual">休闲服</a-option>
                <a-option value="formal">正装</a-option>
                <a-option value="accessories">配饰</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="模板描述">
          <a-textarea
            v-model="templateForm.description"
            placeholder="请输入模板描述"
            :rows="3"
          />
        </a-form-item>
        
        <!-- 品类配置 -->
        <div v-if="templateForm.category" class="mb-6">
          <CategoryConfig ref="categoryConfigRef" />
        </div>

        <a-form-item label="视频结构配置">
          <a-card>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="视频时长(秒)">
                  <a-input-number
                    v-model="templateForm.duration"
                    :min="5"
                    :max="300"
                    placeholder="视频时长"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="片段数量">
                  <a-input-number
                    v-model="templateForm.segments"
                    :min="1"
                    :max="20"
                    placeholder="片段数量"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="帧率(FPS)">
                  <a-select v-model="templateForm.fps" placeholder="选择帧率">
                    <a-option :value="24">24 FPS</a-option>
                    <a-option :value="30">30 FPS</a-option>
                    <a-option :value="60">60 FPS</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>
        </a-form-item>

        <a-form-item label="转场效果">
          <a-checkbox-group v-model="templateForm.transitions">
            <a-checkbox value="fade">淡入淡出</a-checkbox>
            <a-checkbox value="slide">滑动</a-checkbox>
            <a-checkbox value="zoom">缩放</a-checkbox>
            <a-checkbox value="rotate">旋转</a-checkbox>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item label="特效配置">
          <a-checkbox-group v-model="templateForm.effects">
            <a-checkbox value="blur">模糊</a-checkbox>
            <a-checkbox value="glow">发光</a-checkbox>
            <a-checkbox value="shadow">阴影</a-checkbox>
            <a-checkbox value="particle">粒子</a-checkbox>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item label="预览图">
          <a-upload
            :custom-request="handleUploadPreview"
            :show-file-list="false"
            accept="image/*"
          >
            <template #upload-button>
              <div class="upload-preview">
                <img
                  v-if="templateForm.preview"
                  :src="templateForm.preview"
                  alt="预览图"
                  class="preview-img"
                />
                <div v-else class="upload-placeholder">
                  <icon-plus />
                  <div>上传预览图</div>
                </div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 模板配置模态框 -->
    <a-modal
      v-model:visible="showConfigModal"
      title="模板配置"
      width="1000px"
      @ok="handleSaveConfig"
      @cancel="showConfigModal = false"
    >
      <div class="template-config">
        <a-tabs>
          <a-tab-pane key="basic" title="基础配置">
            <a-form layout="vertical">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="分辨率">
                    <a-select v-model="configForm.resolution" placeholder="选择分辨率">
                      <a-option value="1080p">1920x1080</a-option>
                      <a-option value="720p">1280x720</a-option>
                      <a-option value="4k">3840x2160</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="宽高比">
                    <a-select v-model="configForm.aspectRatio" placeholder="选择宽高比">
                      <a-option value="16:9">16:9</a-option>
                      <a-option value="9:16">9:16</a-option>
                      <a-option value="1:1">1:1</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-tab-pane>

          <a-tab-pane key="segments" title="片段配置">
            <div class="segments-config">
              <div v-for="(segment, index) in configForm.segments" :key="index" class="segment-item">
                <a-card :title="`片段 ${index + 1}`">
                  <a-row :gutter="16">
                    <a-col :span="8">
                      <a-form-item label="持续时间(秒)">
                        <a-input-number v-model="segment.duration" :min="1" :max="30" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="8">
                      <a-form-item label="镜头类型">
                        <a-select v-model="segment.shotType" placeholder="选择镜头类型">
                          <a-option value="close">特写</a-option>
                          <a-option value="medium">中景</a-option>
                          <a-option value="wide">全景</a-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :span="8">
                      <a-form-item label="运动类型">
                        <a-select v-model="segment.motion" placeholder="选择运动类型">
                          <a-option value="static">静态</a-option>
                          <a-option value="pan">平移</a-option>
                          <a-option value="zoom">缩放</a-option>
                          <a-option value="rotate">旋转</a-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-card>
              </div>
              <a-button @click="addSegment" class="add-segment-btn">
                <template #icon>
                  <icon-plus />
                </template>
                添加片段
              </a-button>
            </div>
          </a-tab-pane>

          <a-tab-pane key="style" title="风格配置">
            <a-form layout="vertical">
              <a-form-item label="视频风格">
                <a-radio-group v-model="configForm.style">
                  <a-radio value="modern">现代简约</a-radio>
                  <a-radio value="fashion">时尚潮流</a-radio>
                  <a-radio value="elegant">优雅经典</a-radio>
                  <a-radio value="dynamic">动感活力</a-radio>
                </a-radio-group>
              </a-form-item>

              <a-form-item label="色彩方案">
                <a-select v-model="configForm.colorScheme" placeholder="选择色彩方案">
                  <a-option value="warm">暖色调</a-option>
                  <a-option value="cool">冷色调</a-option>
                  <a-option value="neutral">中性色</a-option>
                  <a-option value="vibrant">鲜艳色</a-option>
                </a-select>
              </a-form-item>

              <a-form-item label="音乐类型">
                <a-select v-model="configForm.musicType" placeholder="选择音乐类型">
                  <a-option value="electronic">电子音乐</a-option>
                  <a-option value="pop">流行音乐</a-option>
                  <a-option value="classical">古典音乐</a-option>
                  <a-option value="ambient">环境音乐</a-option>
                </a-select>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconEye,
  IconEdit,
  IconCopy,
  IconSettings,
  IconDelete
} from '@arco-design/web-vue/es/icon'
import CategoryConfig from '@/components/CategoryConfig.vue'

// 响应式数据
const loading = ref(false)
const showCreateModal = ref(false)
const showConfigModal = ref(false)
const editingTemplate = ref(null)
const categoryConfigRef = ref<any>(null)

// 统计数据
const stats = reactive({
  total: 24,
  sports: 8,
  casual: 10,
  formal: 6
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  status: '',
  duration: ''
})

// 模板表单
const templateForm = reactive({
  name: '',
  category: '',
  description: '',
  duration: 30,
  segments: 3,
  fps: 30,
  transitions: [],
  effects: [],
  preview: ''
})

// 配置表单
const configForm = reactive({
  resolution: '1080p',
  aspectRatio: '16:9',
  segments: [
    { duration: 10, shotType: 'wide', motion: 'static' },
    { duration: 15, shotType: 'medium', motion: 'pan' },
    { duration: 5, shotType: 'close', motion: 'zoom' }
  ],
  style: 'modern',
  colorScheme: 'neutral',
  musicType: 'electronic'
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 100,
  showTotal: true,
  showPageSize: true
})

// 表格列配置
// 添加缺失的计算属性和变量
const filteredTemplates = computed(() => {
  return templateList.value.filter(template => {
    if (searchForm.keyword && !template.name.includes(searchForm.keyword)) {
      return false
    }
    if (searchForm.category && template.category !== searchForm.category) {
      return false
    }
    if (searchForm.status && template.status !== searchForm.status) {
      return false
    }
    return true
  })
})

const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onSelect: (rowKeys: string[], rowKey: string, record: any) => {
    console.log('选择行:', rowKeys, rowKey, record)
  },
  onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
    console.log('全选:', selected, selectedRows, changeRows)
  }
})

const columns = [
  {
    title: '预览',
    dataIndex: 'preview',
    slotName: 'preview',
    width: 100
  },
  {
    title: '模板名称',
    dataIndex: 'name',
    width: 200
  },
  {
    title: '服装品类',
    dataIndex: 'category',
    slotName: 'category',
    width: 120
  },
  {
    title: '视频结构',
    dataIndex: 'structure',
    slotName: 'structure',
    width: 150
  },
  {
    title: '时长',
    dataIndex: 'duration',
    width: 80,
    render: ({ record }: { record: any }) => `${record.duration}s`
  },
  {
    title: '帧率',
    dataIndex: 'fps',
    width: 80,
    render: ({ record }: { record: any }) => `${record.fps} FPS`
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 模板列表数据
const templateList = ref([
  {
    id: 1,
    name: '运动服展示模板A',
    category: 'sports',
    description: '适用于运动服装的动态展示',
    duration: 30,
    fps: 30,
    structure: {
      segments: 3,
      transitions: 2,
      effects: 4
    },
    status: 'active',
    preview: 'https://via.placeholder.com/200x120',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '休闲服展示模板B',
    category: 'casual',
    description: '适用于休闲服装的优雅展示',
    duration: 45,
    fps: 24,
    structure: {
      segments: 4,
      transitions: 3,
      effects: 2
    },
    status: 'active',
    preview: 'https://via.placeholder.com/200x120',
    createTime: '2024-01-14 15:20:00'
  }
])

// 方法
const handleSearch = () => {
  loading.value = true
  // 模拟搜索
  setTimeout(() => {
    loading.value = false
    Message.success('搜索完成')
  }, 1000)
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    category: '',
    status: '',
    duration: ''
  })
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  handleSearch()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  handleSearch()
}

const previewTemplate = (record: any) => {
  Message.info(`预览模板: ${record.name}`)
}

const editTemplate = (record: any) => {
  editingTemplate.value = record
  Object.assign(templateForm, record)
  showCreateModal.value = true
}

const copyTemplate = (record: any) => {
  Message.success(`复制模板: ${record.name}`)
}

const configTemplate = (record: any) => {
  showConfigModal.value = true
}

const deleteTemplate = (record: any) => {
  Message.success(`删除模板: ${record.name}`)
}

const handleStatusChange = (record: any) => {
  Message.success(`${record.status === 'active' ? '启用' : '禁用'}模板: ${record.name}`)
}

const handleCategoryChange = (value: string) => {
  console.log('品类变更:', value)
  // 可以根据品类变更重置相关配置
}

const handleCreateTemplate = () => {
  Message.success(editingTemplate.value ? '模板更新成功' : '模板创建成功')
  showCreateModal.value = false
  handleCancelCreate()
}

const handleCancelCreate = () => {
  editingTemplate.value = null
  Object.assign(templateForm, {
    name: '',
    category: '',
    description: '',
    duration: 30,
    segments: 3,
    fps: 30,
    transitions: [],
    effects: [],
    preview: ''
  })
}

const handleUploadPreview = (option: any) => {
  // 模拟上传
  setTimeout(() => {
    templateForm.preview = 'https://via.placeholder.com/200x120'
    Message.success('预览图上传成功')
  }, 1000)
}

const addSegment = () => {
  configForm.segments.push({
    duration: 5,
    shotType: 'medium',
    motion: 'static'
  })
}

const handleSaveConfig = () => {
  Message.success('配置保存成功')
  showConfigModal.value = false
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    sports: 'blue',
    casual: 'green',
    formal: 'purple'
  }
  return colors[category] || 'gray'
}

const getCategoryText = (category: string) => {
  const texts: Record<string, string> = {
    sports: '运动服',
    casual: '休闲服',
    formal: '正装'
  }
  return texts[category] || category
}

// 生命周期
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.ai-video-template {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.stats-cards {
  margin-bottom: 20px;
}

.search-filters {
  margin-bottom: 20px;
}

.template-list {
  margin-bottom: 20px;
}

.template-preview {
  position: relative;
  width: 80px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.template-preview:hover .preview-overlay {
  opacity: 1;
}

.structure-info {
  font-size: 12px;
  line-height: 1.4;
}

.upload-preview {
  width: 200px;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-preview:hover {
  border-color: #1890ff;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.upload-placeholder {
  text-align: center;
  color: #999;
}

.segments-config {
  max-height: 400px;
  overflow-y: auto;
}

.segment-item {
  margin-bottom: 16px;
}

.add-segment-btn {
  width: 100%;
  margin-top: 16px;
}
</style>