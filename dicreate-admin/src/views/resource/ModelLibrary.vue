<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">模特库管理</h1>
        <p class="text-gray-600 mt-1">管理各种不同人种、特点模特的基本信息和建模数据</p>
      </div>
      <a-button type="primary" @click="showAddModal = true">
        <template #icon><icon-plus /></template>
        新增模特
      </a-button>
    </div>

    <!-- 筛选区域 -->
    <a-card class="mb-6">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input-search 
            v-model="searchKeyword" 
            placeholder="搜索模特姓名、编号..."
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select 
            v-model="filterEthnicity" 
            placeholder="选择人种"
            allow-clear
            @change="handleFilter"
          >
            <a-option value="asian">亚洲人</a-option>
            <a-option value="caucasian">白人</a-option>
            <a-option value="african">非洲人</a-option>
            <a-option value="hispanic">拉丁裔</a-option>
            <a-option value="mixed">混血</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select 
            v-model="filterGender" 
            placeholder="选择性别"
            allow-clear
            @change="handleFilter"
          >
            <a-option value="female">女性</a-option>
            <a-option value="male">男性</a-option>
            <a-option value="non-binary">非二元性别</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select 
            v-model="filterBodyType" 
            placeholder="选择体型"
            allow-clear
            @change="handleFilter"
          >
            <a-option value="slim">纤瘦型</a-option>
            <a-option value="athletic">运动型</a-option>
            <a-option value="curvy">丰满型</a-option>
            <a-option value="plus-size">大码型</a-option>
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

    <!-- 模特列表 -->
    <a-card>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="model in filteredModels" 
          :key="model.id"
          class="bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewModelDetail(model)"
        >
          <div class="aspect-w-3 aspect-h-4 relative">
            <img 
              :src="model.avatar" 
              :alt="model.name"
              class="w-full h-64 object-cover rounded-t-lg"
            />
            <div class="absolute top-2 right-2">
              <a-tag :color="getEthnicityColor(model.ethnicity)">
                {{ getEthnicityText(model.ethnicity) }}
              </a-tag>
            </div>
            <div class="absolute bottom-2 left-2">
              <a-tag :color="model.gender === 'female' ? 'pink' : 'blue'">
                {{ getGenderText(model.gender) }}
              </a-tag>
            </div>
          </div>
          
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ model.name }}</h3>
              <a-dropdown>
                <a-button type="text" size="small" @click.stop>
                  <template #icon><icon-more /></template>
                </a-button>
                <template #content>
                  <a-doption @click="editModel(model)">
                    <template #icon><icon-edit /></template>
                    编辑
                  </a-doption>
                  <a-doption @click="duplicateModel(model)">
                    <template #icon><icon-copy /></template>
                    复制
                  </a-doption>
                  <a-doption class="text-red-500" @click="deleteModel(model)">
                    <template #icon><icon-delete /></template>
                    删除
                  </a-doption>
                </template>
              </a-dropdown>
            </div>
            
            <div class="space-y-1 text-sm text-gray-600">
              <div>编号：{{ model.modelId }}</div>
              <div>年龄：{{ model.age }}岁</div>
              <div>身高：{{ model.height }}cm</div>
              <div>体重：{{ model.weight }}kg</div>
              <div>体型：{{ getBodyTypeText(model.bodyType) }}</div>
            </div>
            
            <div class="mt-3 flex flex-wrap gap-1">
              <a-tag 
                v-for="skill in model.skills.slice(0, 3)" 
                :key="skill"
                size="small"
              >
                {{ skill }}
              </a-tag>
              <a-tag v-if="model.skills.length > 3" size="small" color="gray">
                +{{ model.skills.length - 3 }}
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

    <!-- 新增/编辑模特弹窗 -->
    <a-modal
      v-model:visible="showAddModal"
      :title="editingModel ? '编辑模特' : '新增模特'"
      width="800px"
      @ok="handleSaveModel"
      @cancel="resetForm"
    >
      <a-form :model="modelForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="模特姓名" required>
              <a-input v-model="modelForm.name" placeholder="请输入模特姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="模特编号" required>
              <a-input v-model="modelForm.modelId" placeholder="请输入模特编号" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="性别" required>
              <a-select v-model="modelForm.gender" placeholder="选择性别">
                <a-option value="female">女性</a-option>
                <a-option value="male">男性</a-option>
                <a-option value="non-binary">非二元性别</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="年龄" required>
              <a-input-number 
                v-model="modelForm.age" 
                :min="16" 
                :max="80" 
                placeholder="年龄"
                class="w-full"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="人种" required>
              <a-select v-model="modelForm.ethnicity" placeholder="选择人种">
                <a-option value="asian">亚洲人</a-option>
                <a-option value="caucasian">白人</a-option>
                <a-option value="african">非洲人</a-option>
                <a-option value="hispanic">拉丁裔</a-option>
                <a-option value="mixed">混血</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="身高(cm)" required>
              <a-input-number 
                v-model="modelForm.height" 
                :min="150" 
                :max="200" 
                placeholder="身高"
                class="w-full"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="体重(kg)" required>
              <a-input-number 
                v-model="modelForm.weight" 
                :min="40" 
                :max="120" 
                placeholder="体重"
                class="w-full"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="体型" required>
              <a-select v-model="modelForm.bodyType" placeholder="选择体型">
                <a-option value="slim">纤瘦型</a-option>
                <a-option value="athletic">运动型</a-option>
                <a-option value="curvy">丰满型</a-option>
                <a-option value="plus-size">大码型</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="头像图片" required>
              <a-input v-model="modelForm.avatar" placeholder="请输入图片URL" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系邮箱">
              <a-input v-model="modelForm.email" placeholder="请输入邮箱地址" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="专业技能">
          <a-select 
            v-model="modelForm.skills" 
            multiple 
            placeholder="选择专业技能"
            allow-clear
          >
            <a-option value="runway">T台走秀</a-option>
            <a-option value="commercial">商业拍摄</a-option>
            <a-option value="editorial">时尚杂志</a-option>
            <a-option value="fitness">健身模特</a-option>
            <a-option value="swimwear">泳装模特</a-option>
            <a-option value="lingerie">内衣模特</a-option>
            <a-option value="plus-size">大码模特</a-option>
            <a-option value="mature">成熟模特</a-option>
            <a-option value="child">儿童模特</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="个人简介">
          <a-textarea 
            v-model="modelForm.bio" 
            placeholder="请输入个人简介"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 模特详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      title="模特详情"
      width="600px"
      :footer="false"
    >
      <div v-if="selectedModel" class="space-y-4">
        <div class="flex items-start space-x-4">
          <img 
            :src="selectedModel.avatar" 
            :alt="selectedModel.name"
            class="w-32 h-40 object-cover rounded-lg"
          />
          <div class="flex-1">
            <h2 class="text-xl font-bold mb-2">{{ selectedModel.name }}</h2>
            <div class="space-y-1 text-sm">
              <div><span class="font-medium">编号：</span>{{ selectedModel.modelId }}</div>
              <div><span class="font-medium">性别：</span>{{ getGenderText(selectedModel.gender) }}</div>
              <div><span class="font-medium">年龄：</span>{{ selectedModel.age }}岁</div>
              <div><span class="font-medium">人种：</span>{{ getEthnicityText(selectedModel.ethnicity) }}</div>
              <div><span class="font-medium">身高：</span>{{ selectedModel.height }}cm</div>
              <div><span class="font-medium">体重：</span>{{ selectedModel.weight }}kg</div>
              <div><span class="font-medium">体型：</span>{{ getBodyTypeText(selectedModel.bodyType) }}</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="font-medium mb-2">专业技能：</h3>
          <div class="flex flex-wrap gap-2">
            <a-tag v-for="skill in selectedModel.skills" :key="skill">
              {{ skill }}
            </a-tag>
          </div>
        </div>
        
        <div v-if="selectedModel.bio">
          <h3 class="font-medium mb-2">个人简介：</h3>
          <p class="text-gray-600">{{ selectedModel.bio }}</p>
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
  IconDelete 
} from '@arco-design/web-vue/es/icon'

interface Model {
  id: string
  modelId: string
  name: string
  gender: 'female' | 'male' | 'non-binary'
  age: number
  ethnicity: 'asian' | 'caucasian' | 'african' | 'hispanic' | 'mixed'
  height: number
  weight: number
  bodyType: 'slim' | 'athletic' | 'curvy' | 'plus-size'
  avatar: string
  email?: string
  skills: string[]
  bio?: string
  createdAt: string
  updatedAt: string
}

const showAddModal = ref(false)
const showDetailModal = ref(false)
const editingModel = ref<Model | null>(null)
const selectedModel = ref<Model | null>(null)
const searchKeyword = ref('')
const filterEthnicity = ref('')
const filterGender = ref('')
const filterBodyType = ref('')

const modelForm = reactive({
  name: '',
  modelId: '',
  gender: '' as 'female' | 'male' | 'non-binary' | '',
  age: 25,
  ethnicity: '' as 'asian' | 'caucasian' | 'african' | 'hispanic' | 'mixed' | '',
  height: 170,
  weight: 55,
  bodyType: '' as 'slim' | 'athletic' | 'curvy' | 'plus-size' | '',
  avatar: '',
  email: '',
  skills: [] as string[],
  bio: ''
})

const pagination = ref({
  current: 1,
  pageSize: 12,
  total: 0
})

// 模拟模特数据
const models = ref<Model[]>([
  {
    id: '1',
    modelId: 'M001',
    name: 'Aria Chen',
    gender: 'female',
    age: 24,
    ethnicity: 'asian',
    height: 175,
    weight: 52,
    bodyType: 'slim',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face',
    email: 'aria.chen@example.com',
    skills: ['runway', 'commercial', 'editorial'],
    bio: '专业时装模特，擅长高端时尚拍摄和T台走秀，具有丰富的国际品牌合作经验。',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    modelId: 'M002',
    name: 'Marcus Johnson',
    gender: 'male',
    age: 28,
    ethnicity: 'african',
    height: 185,
    weight: 78,
    bodyType: 'athletic',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face',
    email: 'marcus.j@example.com',
    skills: ['fitness', 'commercial', 'swimwear'],
    bio: '健身模特和商业拍摄专家，拥有完美的身材比例和专业的镜头表现力。',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16'
  },
  {
    id: '3',
    modelId: 'M003',
    name: 'Isabella Rodriguez',
    gender: 'female',
    age: 26,
    ethnicity: 'hispanic',
    height: 168,
    weight: 58,
    bodyType: 'curvy',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face',
    email: 'isabella.r@example.com',
    skills: ['plus-size', 'commercial', 'lingerie'],
    bio: '身材丰满的专业模特，致力于推广身体积极性和多元化美学标准。',
    createdAt: '2024-01-17',
    updatedAt: '2024-01-17'
  },
  {
    id: '4',
    modelId: 'M004',
    name: 'Emma Thompson',
    gender: 'female',
    age: 22,
    ethnicity: 'caucasian',
    height: 178,
    weight: 55,
    bodyType: 'slim',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face',
    email: 'emma.t@example.com',
    skills: ['runway', 'editorial', 'commercial'],
    bio: '年轻有活力的时装模特，在欧洲时装周有丰富的走秀经验。',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18'
  },
  {
    id: '5',
    modelId: 'M005',
    name: 'Kenji Nakamura',
    gender: 'male',
    age: 30,
    ethnicity: 'asian',
    height: 180,
    weight: 70,
    bodyType: 'athletic',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face',
    email: 'kenji.n@example.com',
    skills: ['commercial', 'mature', 'editorial'],
    bio: '成熟稳重的商业模特，在亚洲市场有很高的知名度和影响力。',
    createdAt: '2024-01-19',
    updatedAt: '2024-01-19'
  },
  {
    id: '6',
    modelId: 'M006',
    name: 'Zara Ahmed',
    gender: 'female',
    age: 27,
    ethnicity: 'mixed',
    height: 172,
    weight: 60,
    bodyType: 'athletic',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face',
    email: 'zara.a@example.com',
    skills: ['fitness', 'swimwear', 'commercial'],
    bio: '混血模特，拥有独特的外貌特征，专长于运动和泳装类拍摄。',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  }
])

// 过滤后的模特列表
const filteredModels = computed(() => {
  let result = models.value

  if (searchKeyword.value) {
    result = result.filter(model => 
      model.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      model.modelId.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (filterEthnicity.value) {
    result = result.filter(model => model.ethnicity === filterEthnicity.value)
  }

  if (filterGender.value) {
    result = result.filter(model => model.gender === filterGender.value)
  }

  if (filterBodyType.value) {
    result = result.filter(model => model.bodyType === filterBodyType.value)
  }

  pagination.value.total = result.length
  return result
})

// 获取人种颜色
const getEthnicityColor = (ethnicity: string) => {
  const colorMap: Record<string, string> = {
    asian: 'orange',
    caucasian: 'blue',
    african: 'purple',
    hispanic: 'green',
    mixed: 'red'
  }
  return colorMap[ethnicity] || 'gray'
}

// 获取人种文本
const getEthnicityText = (ethnicity: string) => {
  const textMap: Record<string, string> = {
    asian: '亚洲人',
    caucasian: '白人',
    african: '非洲人',
    hispanic: '拉丁裔',
    mixed: '混血'
  }
  return textMap[ethnicity] || '未知'
}

// 获取性别文本
const getGenderText = (gender: string) => {
  const textMap: Record<string, string> = {
    female: '女性',
    male: '男性',
    'non-binary': '非二元性别'
  }
  return textMap[gender] || '未知'
}

// 获取体型文本
const getBodyTypeText = (bodyType: string) => {
  const textMap: Record<string, string> = {
    slim: '纤瘦型',
    athletic: '运动型',
    curvy: '丰满型',
    'plus-size': '大码型'
  }
  return textMap[bodyType] || '未知'
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
  filterEthnicity.value = ''
  filterGender.value = ''
  filterBodyType.value = ''
  pagination.value.current = 1
}

// 查看模特详情
const viewModelDetail = (model: Model) => {
  selectedModel.value = model
  showDetailModal.value = true
}

// 编辑模特
const editModel = (model: Model) => {
  editingModel.value = model
  Object.assign(modelForm, model)
  showAddModal.value = true
}

// 复制模特
const duplicateModel = (model: Model) => {
  const newModel = {
    ...model,
    id: Date.now().toString(),
    modelId: `M${String(models.value.length + 1).padStart(3, '0')}`,
    name: `${model.name} (副本)`,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  }
  models.value.push(newModel)
  Message.success('模特复制成功')
}

// 删除模特
const deleteModel = (model: Model) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除模特 "${model.name}" 吗？`,
    onOk: () => {
      const index = models.value.findIndex(m => m.id === model.id)
      if (index > -1) {
        models.value.splice(index, 1)
        Message.success('删除成功')
      }
    }
  })
}

// 保存模特
const handleSaveModel = () => {
  if (!modelForm.name || !modelForm.modelId || !modelForm.gender || !modelForm.ethnicity || !modelForm.bodyType) {
    Message.warning('请填写必填字段')
    return
  }

  if (editingModel.value) {
    // 编辑模式
    const index = models.value.findIndex(m => m.id === editingModel.value!.id)
    if (index > -1) {
      models.value[index] = {
        ...models.value[index],
        ...modelForm,
        gender: modelForm.gender as 'female' | 'male' | 'non-binary',
        ethnicity: modelForm.ethnicity as 'asian' | 'caucasian' | 'african' | 'hispanic' | 'mixed',
        bodyType: modelForm.bodyType as 'slim' | 'athletic' | 'curvy' | 'plus-size',
        updatedAt: new Date().toISOString().split('T')[0]
      }
      Message.success('模特信息更新成功')
    }
  } else {
    // 新增模式
    const newModel: Model = {
      id: Date.now().toString(),
      ...modelForm,
      gender: modelForm.gender as 'female' | 'male' | 'non-binary',
      ethnicity: modelForm.ethnicity as 'asian' | 'caucasian' | 'african' | 'hispanic' | 'mixed',
      bodyType: modelForm.bodyType as 'slim' | 'athletic' | 'curvy' | 'plus-size',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    models.value.push(newModel)
    Message.success('模特添加成功')
  }

  showAddModal.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  editingModel.value = null
  Object.assign(modelForm, {
    name: '',
    modelId: '',
    gender: '',
    age: 25,
    ethnicity: '',
    height: 170,
    weight: 55,
    bodyType: '',
    avatar: '',
    email: '',
    skills: [],
    bio: ''
  })
}

// 导出数据
const exportData = () => {
  Message.info('导出功能开发中...')
}

onMounted(() => {
  pagination.value.total = models.value.length
})
</script>

<style scoped>
.aspect-w-3 {
  position: relative;
  padding-bottom: calc(4 / 3 * 100%);
}

.aspect-w-3 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>