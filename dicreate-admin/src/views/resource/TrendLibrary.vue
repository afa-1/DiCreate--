<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">趋势库管理</h1>
        <p class="text-gray-600 mt-1">管理服装趋势文章和时尚资讯内容</p>
      </div>
      <a-button type="primary" @click="showAddModal = true">
        <template #icon><icon-plus /></template>
        新增文章
      </a-button>
    </div>

    <!-- 筛选区域 -->
    <a-card class="mb-6">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input-search 
            v-model="searchKeyword" 
            placeholder="搜索文章标题、标签..."
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select 
            v-model="filterCategory" 
            placeholder="选择分类"
            allow-clear
            @change="handleFilter"
          >
            <a-option value="fashion-week">时装周</a-option>
            <a-option value="street-style">街头风格</a-option>
            <a-option value="color-trend">色彩趋势</a-option>
            <a-option value="fabric-trend">面料趋势</a-option>
            <a-option value="seasonal">季节趋势</a-option>
            <a-option value="accessories">配饰趋势</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select 
            v-model="filterSeason" 
            placeholder="选择季节"
            allow-clear
            @change="handleFilter"
          >
            <a-option value="spring">春季</a-option>
            <a-option value="summer">夏季</a-option>
            <a-option value="autumn">秋季</a-option>
            <a-option value="winter">冬季</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select 
            v-model="filterStatus" 
            placeholder="选择状态"
            allow-clear
            @change="handleFilter"
          >
            <a-option value="published">已发布</a-option>
            <a-option value="draft">草稿</a-option>
            <a-option value="archived">已归档</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button @click="resetFilters">重置筛选</a-button>
            <a-button type="primary" @click="exportData">导出数据</a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 文章列表 -->
    <a-card>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="article in filteredArticles" 
          :key="article.id"
          class="bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewArticleDetail(article)"
        >
          <div class="relative">
            <img 
              :src="article.coverImage" 
              :alt="article.title"
              class="w-full h-48 object-cover rounded-t-lg"
            />
            <div class="absolute top-2 right-2">
              <a-tag :color="getCategoryColor(article.category)">
                {{ getCategoryText(article.category) }}
              </a-tag>
            </div>
            <div class="absolute bottom-2 left-2">
              <a-tag :color="getStatusColor(article.status)">
                {{ getStatusText(article.status) }}
              </a-tag>
            </div>
          </div>
          
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">{{ article.title }}</h3>
              <a-dropdown>
                <a-button type="text" size="small" @click.stop>
                  <template #icon><icon-more /></template>
                </a-button>
                <template #content>
                  <a-doption @click="editArticle(article)">
                    <template #icon><icon-edit /></template>
                    编辑
                  </a-doption>
                  <a-doption @click="duplicateArticle(article)">
                    <template #icon><icon-copy /></template>
                    复制
                  </a-doption>
                  <a-doption 
                    v-if="article.status === 'draft'"
                    @click="publishArticle(article)"
                  >
                    <template #icon><icon-send /></template>
                    发布
                  </a-doption>
                  <a-doption 
                    v-if="article.status === 'published'"
                    @click="archiveArticle(article)"
                  >
                    <template #icon><icon-archive /></template>
                    归档
                  </a-doption>
                  <a-doption class="text-red-500" @click="deleteArticle(article)">
                    <template #icon><icon-delete /></template>
                    删除
                  </a-doption>
                </template>
              </a-dropdown>
            </div>
            
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ article.summary }}</p>
            
            <div class="space-y-2 text-xs text-gray-500">
              <div class="flex justify-between">
                <span>作者：{{ article.author }}</span>
                <span>{{ article.season }} {{ article.year }}</span>
              </div>
              <div class="flex justify-between">
                <span>发布：{{ article.publishDate }}</span>
                <span>阅读：{{ article.views }}</span>
              </div>
            </div>
            
            <div class="mt-3 flex flex-wrap gap-1">
              <a-tag 
                v-for="tag in article.tags.slice(0, 3)" 
                :key="tag"
                size="small"
                color="blue"
              >
                {{ tag }}
              </a-tag>
              <a-tag v-if="article.tags.length > 3" size="small" color="gray">
                +{{ article.tags.length - 3 }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="mt-6 flex justify-center">
        <a-pagination 
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          show-size-changer
          show-quick-jumper
          show-total
        />
      </div>
    </a-card>

    <!-- 新增/编辑文章弹窗 -->
    <a-modal
      v-model:visible="showAddModal"
      :title="editingArticle ? '编辑文章' : '新增文章'"
      width="900px"
      @ok="handleSaveArticle"
      @cancel="resetForm"
    >
      <a-form :model="articleForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="16">
            <a-form-item label="文章标题" required>
              <a-input v-model="articleForm.title" placeholder="请输入文章标题" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="文章状态" required>
              <a-select v-model="articleForm.status" placeholder="选择状态">
                <a-option value="draft">草稿</a-option>
                <a-option value="published">已发布</a-option>
                <a-option value="archived">已归档</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="文章分类" required>
              <a-select v-model="articleForm.category" placeholder="选择分类">
                <a-option value="fashion-week">时装周</a-option>
                <a-option value="street-style">街头风格</a-option>
                <a-option value="color-trend">色彩趋势</a-option>
                <a-option value="fabric-trend">面料趋势</a-option>
                <a-option value="seasonal">季节趋势</a-option>
                <a-option value="accessories">配饰趋势</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="适用季节" required>
              <a-select v-model="articleForm.season" placeholder="选择季节">
                <a-option value="spring">春季</a-option>
                <a-option value="summer">夏季</a-option>
                <a-option value="autumn">秋季</a-option>
                <a-option value="winter">冬季</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="年份" required>
              <a-input-number 
                v-model="articleForm.year" 
                :min="2020" 
                :max="2030" 
                placeholder="年份"
                class="w-full"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="作者" required>
              <a-input v-model="articleForm.author" placeholder="请输入作者姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="发布日期">
              <a-date-picker 
                v-model="articleForm.publishDate" 
                placeholder="选择发布日期"
                class="w-full"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="封面图片" required>
          <a-input v-model="articleForm.coverImage" placeholder="请输入封面图片URL" />
        </a-form-item>
        
        <a-form-item label="文章摘要" required>
          <a-textarea 
            v-model="articleForm.summary" 
            placeholder="请输入文章摘要"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="标签">
          <a-select 
            v-model="articleForm.tags" 
            multiple 
            placeholder="选择或输入标签"
            allow-clear
            allow-create
          >
            <a-option value="时尚">时尚</a-option>
            <a-option value="潮流">潮流</a-option>
            <a-option value="设计">设计</a-option>
            <a-option value="搭配">搭配</a-option>
            <a-option value="色彩">色彩</a-option>
            <a-option value="面料">面料</a-option>
            <a-option value="配饰">配饰</a-option>
            <a-option value="街拍">街拍</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="文章内容" required>
          <a-textarea 
            v-model="articleForm.content" 
            placeholder="请输入文章内容"
            :rows="8"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 文章详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      title="文章详情"
      width="800px"
      :footer="false"
    >
      <div v-if="selectedArticle" class="space-y-4">
        <div>
          <img 
            :src="selectedArticle.coverImage" 
            :alt="selectedArticle.title"
            class="w-full h-64 object-cover rounded-lg mb-4"
          />
          <h2 class="text-2xl font-bold mb-2">{{ selectedArticle.title }}</h2>
          <div class="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <span>作者：{{ selectedArticle.author }}</span>
            <span>发布：{{ selectedArticle.publishDate }}</span>
            <span>阅读：{{ selectedArticle.views }}</span>
            <a-tag :color="getCategoryColor(selectedArticle.category)">
              {{ getCategoryText(selectedArticle.category) }}
            </a-tag>
            <a-tag :color="getStatusColor(selectedArticle.status)">
              {{ getStatusText(selectedArticle.status) }}
            </a-tag>
          </div>
        </div>
        
        <div>
          <h3 class="font-medium mb-2">文章摘要：</h3>
          <p class="text-gray-600">{{ selectedArticle.summary }}</p>
        </div>
        
        <div>
          <h3 class="font-medium mb-2">标签：</h3>
          <div class="flex flex-wrap gap-2">
            <a-tag v-for="tag in selectedArticle.tags" :key="tag" color="blue">
              {{ tag }}
            </a-tag>
          </div>
        </div>
        
        <div>
          <h3 class="font-medium mb-2">文章内容：</h3>
          <div class="prose max-w-none">
            <p class="text-gray-600 whitespace-pre-line">{{ selectedArticle.content }}</p>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconMore, 
  IconEdit, 
  IconCopy, 
  IconDelete,
  IconSend,
  IconArchive
} from '@arco-design/web-vue/es/icon'

interface Article {
  id: string
  title: string
  summary: string
  content: string
  author: string
  category: 'fashion-week' | 'street-style' | 'color-trend' | 'fabric-trend' | 'seasonal' | 'accessories'
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  year: number
  coverImage: string
  tags: string[]
  status: 'published' | 'draft' | 'archived'
  publishDate: string
  views: number
  createdAt: string
  updatedAt: string
}

const showAddModal = ref(false)
const showDetailModal = ref(false)
const editingArticle = ref<Article | null>(null)
const selectedArticle = ref<Article | null>(null)
const searchKeyword = ref('')
const filterCategory = ref('')
const filterSeason = ref('')
const filterStatus = ref('')

const articleForm = reactive({
  title: '',
  summary: '',
  content: '',
  author: '',
  category: '' as 'fashion-week' | 'street-style' | 'color-trend' | 'fabric-trend' | 'seasonal' | 'accessories' | '',
  season: '' as 'spring' | 'summer' | 'autumn' | 'winter' | '',
  year: new Date().getFullYear(),
  coverImage: '',
  tags: [] as string[],
  status: 'draft' as 'published' | 'draft' | 'archived',
  publishDate: ''
})

const pagination = ref({
  current: 1,
  pageSize: 9,
  total: 0
})

// 模拟文章数据
const articles = ref<Article[]>([
  {
    id: '1',
    title: '2024春夏时装周色彩趋势解析',
    summary: '深入分析2024春夏时装周上的主流色彩趋势，从柔和的粉彩到大胆的霓虹色，探索设计师们如何运用色彩表达情感和理念。',
    content: '2024年春夏时装周刚刚落下帷幕，各大品牌展示了令人惊艳的色彩搭配。本季的色彩趋势呈现出多元化的特点，既有温柔的粉彩系列，也有充满活力的亮色调...',
    author: '时尚编辑部',
    category: 'color-trend',
    season: 'spring',
    year: 2024,
    coverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=400&fit=crop',
    tags: ['色彩', '时装周', '春夏', '趋势'],
    status: 'published',
    publishDate: '2024-01-15',
    views: 1250,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: '街头风格：都市青年的时尚表达',
    summary: '探索当代都市青年如何通过街头风格表达个性，从复古回潮到未来主义，街头时尚正在重新定义潮流文化。',
    content: '街头时尚不再是亚文化的专属，它已经成为主流时尚的重要组成部分。从纽约的布鲁克林到东京的原宿，年轻人们用自己独特的穿搭方式诠释着个性与态度...',
    author: '潮流观察员',
    category: 'street-style',
    season: 'summer',
    year: 2024,
    coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=400&fit=crop',
    tags: ['街头', '青年', '个性', '潮流'],
    status: 'published',
    publishDate: '2024-01-18',
    views: 980,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    title: '可持续面料：时尚产业的绿色革命',
    summary: '随着环保意识的提升，可持续面料正在改变时尚产业。从再生纤维到生物材料，探索时尚与环保的完美结合。',
    content: '时尚产业正在经历一场绿色革命。越来越多的品牌开始关注可持续发展，采用环保面料和生产工艺。再生聚酯纤维、有机棉、天丝等材料正在成为新宠...',
    author: '可持续时尚专家',
    category: 'fabric-trend',
    season: 'autumn',
    year: 2024,
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    tags: ['可持续', '环保', '面料', '创新'],
    status: 'draft',
    publishDate: '2024-01-20',
    views: 0,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: '4',
    title: '配饰的力量：小物件大时尚',
    summary: '配饰虽小，却能完全改变一套造型的风格。从经典的珍珠到前卫的金属元素，配饰正在成为时尚表达的重要工具。',
    content: '在时尚搭配中，配饰往往起到画龙点睛的作用。一条精致的项链、一只独特的手表、一个设计感十足的包包，都能让平凡的服装焕发出不同的魅力...',
    author: '配饰设计师',
    category: 'accessories',
    season: 'winter',
    year: 2024,
    coverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
    tags: ['配饰', '搭配', '设计', '时尚'],
    status: 'published',
    publishDate: '2024-01-22',
    views: 756,
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22'
  },
  {
    id: '5',
    title: '巴黎时装周亮点回顾',
    summary: '2024巴黎时装周精彩纷呈，各大奢侈品牌展示了令人惊艳的设计。从经典的优雅到前卫的实验，巴黎再次证明了其时尚之都的地位。',
    content: '巴黎时装周作为四大时装周之一，始终是全球时尚界的焦点。本季的巴黎时装周上，我们看到了传统与创新的完美融合，设计师们用自己的方式诠释着法式优雅...',
    author: '时装周记者',
    category: 'fashion-week',
    season: 'spring',
    year: 2024,
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop',
    tags: ['巴黎', '时装周', '奢侈品', '设计'],
    status: 'published',
    publishDate: '2024-01-25',
    views: 1580,
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25'
  },
  {
    id: '6',
    title: '冬季保暖与时尚的平衡艺术',
    summary: '寒冷的冬季如何在保暖的同时保持时尚？从羽绒服的时尚化到毛衣的多样化搭配，探索冬季时尚的无限可能。',
    content: '冬季时尚的最大挑战是如何在保暖和美观之间找到平衡。现代的冬季时尚已经远远超越了传统的厚重外套，设计师们通过创新的材料和剪裁技术...',
    author: '季节时尚顾问',
    category: 'seasonal',
    season: 'winter',
    year: 2024,
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    tags: ['冬季', '保暖', '时尚', '搭配'],
    status: 'archived',
    publishDate: '2024-01-28',
    views: 892,
    createdAt: '2024-01-28',
    updatedAt: '2024-01-28'
  }
])

// 过滤后的文章列表
const filteredArticles = computed(() => {
  let result = articles.value

  if (searchKeyword.value) {
    result = result.filter(article => 
      article.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
  }

  if (filterCategory.value) {
    result = result.filter(article => article.category === filterCategory.value)
  }

  if (filterSeason.value) {
    result = result.filter(article => article.season === filterSeason.value)
  }

  if (filterStatus.value) {
    result = result.filter(article => article.status === filterStatus.value)
  }

  pagination.value.total = result.length
  return result
})

// 获取分类颜色
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    'fashion-week': 'red',
    'street-style': 'orange',
    'color-trend': 'green',
    'fabric-trend': 'blue',
    'seasonal': 'purple',
    'accessories': 'pink'
  }
  return colorMap[category] || 'gray'
}

// 获取分类文本
const getCategoryText = (category: string) => {
  const textMap: Record<string, string> = {
    'fashion-week': '时装周',
    'street-style': '街头风格',
    'color-trend': '色彩趋势',
    'fabric-trend': '面料趋势',
    'seasonal': '季节趋势',
    'accessories': '配饰趋势'
  }
  return textMap[category] || '未知'
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    published: 'green',
    draft: 'orange',
    archived: 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  }
  return textMap[status] || '未知'
}

// 搜索处理
const handleSearch = () => {
  pagination.value.current = 1
}

// 筛选处理
const handleFilter = () => {
  pagination.value.current = 1
}

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = ''
  filterCategory.value = ''
  filterSeason.value = ''
  filterStatus.value = ''
  pagination.value.current = 1
}

// 查看文章详情
const viewArticleDetail = (article: Article) => {
  selectedArticle.value = article
  showDetailModal.value = true
}

// 编辑文章
const editArticle = (article: Article) => {
  editingArticle.value = article
  Object.assign(articleForm, article)
  showAddModal.value = true
}

// 复制文章
const duplicateArticle = (article: Article) => {
  const newArticle = {
    ...article,
    id: Date.now().toString(),
    title: `${article.title} (副本)`,
    status: 'draft' as const,
    views: 0,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  }
  articles.value.push(newArticle)
  Message.success('文章复制成功')
}

// 发布文章
const publishArticle = (article: Article) => {
  const index = articles.value.findIndex(a => a.id === article.id)
  if (index > -1) {
    articles.value[index].status = 'published'
    articles.value[index].publishDate = new Date().toISOString().split('T')[0]
    articles.value[index].updatedAt = new Date().toISOString().split('T')[0]
    Message.success('文章发布成功')
  }
}

// 归档文章
const archiveArticle = (article: Article) => {
  const index = articles.value.findIndex(a => a.id === article.id)
  if (index > -1) {
    articles.value[index].status = 'archived'
    articles.value[index].updatedAt = new Date().toISOString().split('T')[0]
    Message.success('文章归档成功')
  }
}

// 删除文章
const deleteArticle = (article: Article) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除文章 "${article.title}" 吗？`,
    onOk: () => {
      const index = articles.value.findIndex(a => a.id === article.id)
      if (index > -1) {
        articles.value.splice(index, 1)
        Message.success('删除成功')
      }
    }
  })
}

// 保存文章
const handleSaveArticle = () => {
  if (!articleForm.title || !articleForm.summary || !articleForm.content || !articleForm.author || !articleForm.category || !articleForm.season) {
    Message.warning('请填写必填字段')
    return
  }

  if (editingArticle.value) {
    // 编辑模式
    const index = articles.value.findIndex(a => a.id === editingArticle.value!.id)
    if (index > -1) {
      articles.value[index] = {
        ...articles.value[index],
        ...articleForm,
        category: articleForm.category as 'fashion-week' | 'street-style' | 'color-trend' | 'fabric-trend' | 'seasonal' | 'accessories',
        season: articleForm.season as 'spring' | 'summer' | 'autumn' | 'winter',
        updatedAt: new Date().toISOString().split('T')[0]
      }
      Message.success('文章更新成功')
    }
  } else {
    // 新增模式
    const newArticle: Article = {
      id: Date.now().toString(),
      ...articleForm,
      category: articleForm.category as 'fashion-week' | 'street-style' | 'color-trend' | 'fabric-trend' | 'seasonal' | 'accessories',
      season: articleForm.season as 'spring' | 'summer' | 'autumn' | 'winter',
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    articles.value.push(newArticle)
    Message.success('文章添加成功')
  }

  showAddModal.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  editingArticle.value = null
  Object.assign(articleForm, {
    title: '',
    summary: '',
    content: '',
    author: '',
    category: '',
    season: '',
    year: new Date().getFullYear(),
    coverImage: '',
    tags: [],
    status: 'draft',
    publishDate: ''
  })
}

// 导出数据
const exportData = () => {
  Message.info('导出功能开发中...')
}

onMounted(() => {
  pagination.value.total = articles.value.length
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 1rem;
  line-height: 1.6;
}
</style>