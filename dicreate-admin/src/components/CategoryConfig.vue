<template>
  <div class="category-config">
    <div class="config-header mb-6">
      <h3 class="text-lg font-semibold text-gray-900">品类配置</h3>
      <p class="text-sm text-gray-600 mt-1">根据不同服装品类配置相应的参数和选项</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 品类选择 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow">
          <div class="px-4 py-3 border-b border-gray-200">
            <h4 class="font-medium text-gray-900">服装品类</h4>
          </div>
          
          <div class="p-4">
            <div class="space-y-2">
              <div
                v-for="category in categories"
                :key="category.key"
                @click="selectCategory(category.key)"
                :class="[
                  'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                  selectedCategory === category.key
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50'
                ]"
              >
                <div class="flex items-center space-x-3">
                  <div :class="[
                    'p-2 rounded-lg',
                    selectedCategory === category.key ? 'bg-blue-100' : 'bg-gray-100'
                  ]">
                    <component :is="category.icon" class="w-4 h-4" />
                  </div>
                  <span class="font-medium">{{ category.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 配置面板 -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-lg shadow">
          <div class="px-4 py-3 border-b border-gray-200">
            <h4 class="font-medium text-gray-900">{{ getCurrentCategoryLabel() }} 配置</h4>
          </div>
          
          <div class="p-6">
            <!-- 运动服配置 -->
            <div v-if="selectedCategory === 'sportswear'" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">运动类型</label>
                  <a-select v-model:value="config.sportswear.sportType" class="w-full" placeholder="选择运动类型">
                    <a-select-option value="running">跑步</a-select-option>
                    <a-select-option value="fitness">健身</a-select-option>
                    <a-select-option value="yoga">瑜伽</a-select-option>
                    <a-select-option value="basketball">篮球</a-select-option>
                    <a-select-option value="football">足球</a-select-option>
                    <a-select-option value="tennis">网球</a-select-option>
                  </a-select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">季节</label>
                  <a-select v-model:value="config.sportswear.season" class="w-full" placeholder="选择季节">
                    <a-select-option value="spring">春季</a-select-option>
                    <a-select-option value="summer">夏季</a-select-option>
                    <a-select-option value="autumn">秋季</a-select-option>
                    <a-select-option value="winter">冬季</a-select-option>
                  </a-select>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">面料特性</label>
                  <a-checkbox-group v-model:value="config.sportswear.fabricFeatures" class="grid grid-cols-2 gap-2">
                    <a-checkbox value="breathable">透气</a-checkbox>
                    <a-checkbox value="moisture-wicking">吸湿排汗</a-checkbox>
                    <a-checkbox value="quick-dry">快干</a-checkbox>
                    <a-checkbox value="stretch">弹性</a-checkbox>
                    <a-checkbox value="antibacterial">抗菌</a-checkbox>
                    <a-checkbox value="uv-protection">防紫外线</a-checkbox>
                  </a-checkbox-group>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">适用场景</label>
                  <a-checkbox-group v-model:value="config.sportswear.scenarios" class="grid grid-cols-2 gap-2">
                    <a-checkbox value="gym">健身房</a-checkbox>
                    <a-checkbox value="outdoor">户外</a-checkbox>
                    <a-checkbox value="indoor">室内</a-checkbox>
                    <a-checkbox value="competition">比赛</a-checkbox>
                    <a-checkbox value="training">训练</a-checkbox>
                    <a-checkbox value="casual">休闲</a-checkbox>
                  </a-checkbox-group>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">颜色偏好</label>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="color in sportswearColors"
                    :key="color.value"
                    @click="toggleColor('sportswear', color.value)"
                    :class="[
                      'w-8 h-8 rounded-full cursor-pointer border-2 transition-all',
                      config.sportswear.colors.includes(color.value)
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400'
                    ]"
                    :style="{ backgroundColor: color.hex }"
                    :title="color.name"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 休闲服配置 -->
            <div v-else-if="selectedCategory === 'casual'" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">风格类型</label>
                  <a-select v-model:value="config.casual.style" class="w-full" placeholder="选择风格类型">
                    <a-select-option value="street">街头</a-select-option>
                    <a-select-option value="minimalist">简约</a-select-option>
                    <a-select-option value="vintage">复古</a-select-option>
                    <a-select-option value="bohemian">波西米亚</a-select-option>
                    <a-select-option value="preppy">学院</a-select-option>
                    <a-select-option value="urban">都市</a-select-option>
                  </a-select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">年龄群体</label>
                  <a-select v-model:value="config.casual.ageGroup" class="w-full" placeholder="选择年龄群体">
                    <a-select-option value="teen">青少年 (13-19)</a-select-option>
                    <a-select-option value="young-adult">青年 (20-35)</a-select-option>
                    <a-select-option value="middle-age">中年 (36-50)</a-select-option>
                    <a-select-option value="senior">中老年 (50+)</a-select-option>
                  </a-select>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">穿着场合</label>
                  <a-checkbox-group v-model:value="config.casual.occasions" class="grid grid-cols-2 gap-2">
                    <a-checkbox value="daily">日常</a-checkbox>
                    <a-checkbox value="weekend">周末</a-checkbox>
                    <a-checkbox value="travel">旅行</a-checkbox>
                    <a-checkbox value="shopping">购物</a-checkbox>
                    <a-checkbox value="dating">约会</a-checkbox>
                    <a-checkbox value="party">聚会</a-checkbox>
                  </a-checkbox-group>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">舒适度要求</label>
                  <a-checkbox-group v-model:value="config.casual.comfort" class="grid grid-cols-2 gap-2">
                    <a-checkbox value="loose-fit">宽松</a-checkbox>
                    <a-checkbox value="soft-fabric">柔软面料</a-checkbox>
                    <a-checkbox value="breathable">透气</a-checkbox>
                    <a-checkbox value="wrinkle-free">免烫</a-checkbox>
                    <a-checkbox value="easy-care">易护理</a-checkbox>
                    <a-checkbox value="stretch">弹性</a-checkbox>
                  </a-checkbox-group>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">颜色偏好</label>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="color in casualColors"
                    :key="color.value"
                    @click="toggleColor('casual', color.value)"
                    :class="[
                      'w-8 h-8 rounded-full cursor-pointer border-2 transition-all',
                      config.casual.colors.includes(color.value)
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400'
                    ]"
                    :style="{ backgroundColor: color.hex }"
                    :title="color.name"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 正装配置 -->
            <div v-else-if="selectedCategory === 'formal'" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">正装类型</label>
                  <a-select v-model:value="config.formal.type" class="w-full" placeholder="选择正装类型">
                    <a-select-option value="business">商务</a-select-option>
                    <a-select-option value="formal-evening">正式晚装</a-select-option>
                    <a-select-option value="cocktail">鸡尾酒会</a-select-option>
                    <a-select-option value="black-tie">黑领结</a-select-option>
                    <a-select-option value="white-tie">白领结</a-select-option>
                    <a-select-option value="semi-formal">半正式</a-select-option>
                  </a-select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">职业类型</label>
                  <a-select v-model:value="config.formal.profession" class="w-full" placeholder="选择职业类型">
                    <a-select-option value="finance">金融</a-select-option>
                    <a-select-option value="law">法律</a-select-option>
                    <a-select-option value="consulting">咨询</a-select-option>
                    <a-select-option value="executive">高管</a-select-option>
                    <a-select-option value="sales">销售</a-select-option>
                    <a-select-option value="government">政府</a-select-option>
                  </a-select>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">场合要求</label>
                  <a-checkbox-group v-model:value="config.formal.occasions" class="grid grid-cols-2 gap-2">
                    <a-checkbox value="meeting">会议</a-checkbox>
                    <a-checkbox value="presentation">演讲</a-checkbox>
                    <a-checkbox value="interview">面试</a-checkbox>
                    <a-checkbox value="networking">社交</a-checkbox>
                    <a-checkbox value="ceremony">仪式</a-checkbox>
                    <a-checkbox value="dinner">正式晚餐</a-checkbox>
                  </a-checkbox-group>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">面料要求</label>
                  <a-checkbox-group v-model:value="config.formal.fabricRequirements" class="grid grid-cols-2 gap-2">
                    <a-checkbox value="wool">羊毛</a-checkbox>
                    <a-checkbox value="silk">丝绸</a-checkbox>
                    <a-checkbox value="cotton">棉质</a-checkbox>
                    <a-checkbox value="linen">亚麻</a-checkbox>
                    <a-checkbox value="cashmere">羊绒</a-checkbox>
                    <a-checkbox value="blend">混纺</a-checkbox>
                  </a-checkbox-group>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">颜色偏好</label>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="color in formalColors"
                    :key="color.value"
                    @click="toggleColor('formal', color.value)"
                    :class="[
                      'w-8 h-8 rounded-full cursor-pointer border-2 transition-all',
                      config.formal.colors.includes(color.value)
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400'
                    ]"
                    :style="{ backgroundColor: color.hex }"
                    :title="color.name"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 配饰配置 -->
            <div v-else-if="selectedCategory === 'accessories'" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">配饰类型</label>
                  <a-checkbox-group v-model:value="config.accessories.types" class="grid grid-cols-2 gap-2">
                    <a-checkbox value="bags">包包</a-checkbox>
                    <a-checkbox value="shoes">鞋子</a-checkbox>
                    <a-checkbox value="jewelry">首饰</a-checkbox>
                    <a-checkbox value="watches">手表</a-checkbox>
                    <a-checkbox value="belts">腰带</a-checkbox>
                    <a-checkbox value="scarves">围巾</a-checkbox>
                    <a-checkbox value="hats">帽子</a-checkbox>
                    <a-checkbox value="sunglasses">太阳镜</a-checkbox>
                  </a-checkbox-group>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">材质偏好</label>
                  <a-checkbox-group v-model:value="config.accessories.materials" class="grid grid-cols-2 gap-2">
                    <a-checkbox value="leather">皮革</a-checkbox>
                    <a-checkbox value="metal">金属</a-checkbox>
                    <a-checkbox value="fabric">布料</a-checkbox>
                    <a-checkbox value="plastic">塑料</a-checkbox>
                    <a-checkbox value="wood">木质</a-checkbox>
                    <a-checkbox value="ceramic">陶瓷</a-checkbox>
                  </a-checkbox-group>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">风格匹配</label>
                <a-checkbox-group v-model:value="config.accessories.styles" class="grid grid-cols-3 gap-2">
                  <a-checkbox value="classic">经典</a-checkbox>
                  <a-checkbox value="modern">现代</a-checkbox>
                  <a-checkbox value="vintage">复古</a-checkbox>
                  <a-checkbox value="luxury">奢华</a-checkbox>
                  <a-checkbox value="minimalist">简约</a-checkbox>
                  <a-checkbox value="bohemian">波西米亚</a-checkbox>
                </a-checkbox-group>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">颜色偏好</label>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="color in accessoryColors"
                    :key="color.value"
                    @click="toggleColor('accessories', color.value)"
                    :class="[
                      'w-8 h-8 rounded-full cursor-pointer border-2 transition-all',
                      config.accessories.colors.includes(color.value)
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400'
                    ]"
                    :style="{ backgroundColor: color.hex }"
                    :title="color.name"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 保存按钮 -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <a-button @click="resetConfig">重置</a-button>
              <a-button type="primary" @click="saveConfig">保存配置</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 品类列表
const categories = ref([
  { key: 'sportswear', label: '运动服', icon: 'SportIcon' },
  { key: 'casual', label: '休闲服', icon: 'CasualIcon' },
  { key: 'formal', label: '正装', icon: 'FormalIcon' },
  { key: 'accessories', label: '配饰', icon: 'AccessoryIcon' }
])

// 当前选中的品类
const selectedCategory = ref('sportswear')

// 配置数据
const config = reactive({
  sportswear: {
    sportType: '',
    season: '',
    fabricFeatures: [] as string[],
    scenarios: [] as string[],
    colors: [] as string[]
  },
  casual: {
    style: '',
    ageGroup: '',
    occasions: [] as string[],
    comfort: [] as string[],
    colors: [] as string[]
  },
  formal: {
    type: '',
    profession: '',
    occasions: [] as string[],
    fabricRequirements: [] as string[],
    colors: [] as string[]
  },
  accessories: {
    types: [] as string[],
    materials: [] as string[],
    styles: [] as string[],
    colors: [] as string[]
  }
})

// 颜色选项
const sportswearColors = ref([
  { value: 'black', name: '黑色', hex: '#000000' },
  { value: 'white', name: '白色', hex: '#FFFFFF' },
  { value: 'red', name: '红色', hex: '#FF0000' },
  { value: 'blue', name: '蓝色', hex: '#0000FF' },
  { value: 'green', name: '绿色', hex: '#00FF00' },
  { value: 'yellow', name: '黄色', hex: '#FFFF00' },
  { value: 'orange', name: '橙色', hex: '#FFA500' },
  { value: 'purple', name: '紫色', hex: '#800080' },
  { value: 'gray', name: '灰色', hex: '#808080' },
  { value: 'navy', name: '海军蓝', hex: '#000080' }
])

const casualColors = ref([
  { value: 'beige', name: '米色', hex: '#F5F5DC' },
  { value: 'khaki', name: '卡其色', hex: '#F0E68C' },
  { value: 'denim', name: '牛仔蓝', hex: '#1560BD' },
  { value: 'olive', name: '橄榄绿', hex: '#808000' },
  { value: 'burgundy', name: '酒红色', hex: '#800020' },
  { value: 'cream', name: '奶油色', hex: '#FFFDD0' },
  { value: 'brown', name: '棕色', hex: '#A52A2A' },
  { value: 'pink', name: '粉色', hex: '#FFC0CB' },
  { value: 'mint', name: '薄荷绿', hex: '#98FB98' },
  { value: 'coral', name: '珊瑚色', hex: '#FF7F50' }
])

const formalColors = ref([
  { value: 'charcoal', name: '炭灰色', hex: '#36454F' },
  { value: 'navy', name: '海军蓝', hex: '#000080' },
  { value: 'black', name: '黑色', hex: '#000000' },
  { value: 'white', name: '白色', hex: '#FFFFFF' },
  { value: 'gray', name: '灰色', hex: '#808080' },
  { value: 'burgundy', name: '酒红色', hex: '#800020' },
  { value: 'dark-blue', name: '深蓝色', hex: '#00008B' },
  { value: 'cream', name: '奶油色', hex: '#FFFDD0' }
])

const accessoryColors = ref([
  { value: 'gold', name: '金色', hex: '#FFD700' },
  { value: 'silver', name: '银色', hex: '#C0C0C0' },
  { value: 'rose-gold', name: '玫瑰金', hex: '#E8B4B8' },
  { value: 'black', name: '黑色', hex: '#000000' },
  { value: 'brown', name: '棕色', hex: '#A52A2A' },
  { value: 'tan', name: '棕褐色', hex: '#D2B48C' },
  { value: 'white', name: '白色', hex: '#FFFFFF' },
  { value: 'red', name: '红色', hex: '#FF0000' },
  { value: 'blue', name: '蓝色', hex: '#0000FF' },
  { value: 'green', name: '绿色', hex: '#00FF00' }
])

// 方法
const selectCategory = (category: string) => {
  selectedCategory.value = category
}

const getCurrentCategoryLabel = () => {
  const category = categories.value.find(c => c.key === selectedCategory.value)
  return category ? category.label : ''
}

const toggleColor = (category: string, color: string) => {
  const colors = config[category as keyof typeof config].colors as string[]
  const index = colors.indexOf(color)
  if (index > -1) {
    colors.splice(index, 1)
  } else {
    colors.push(color)
  }
}

const saveConfig = () => {
  console.log('保存配置:', config)
  // 这里可以调用API保存配置
}

const resetConfig = () => {
  const currentCategory = selectedCategory.value as keyof typeof config
  if (currentCategory === 'sportswear') {
    config.sportswear = {
      sportType: '',
      season: '',
      fabricFeatures: [],
      scenarios: [],
      colors: []
    }
  } else if (currentCategory === 'casual') {
    config.casual = {
      style: '',
      ageGroup: '',
      occasions: [],
      comfort: [],
      colors: []
    }
  } else if (currentCategory === 'formal') {
    config.formal = {
      type: '',
      profession: '',
      occasions: [],
      fabricRequirements: [],
      colors: []
    }
  } else if (currentCategory === 'accessories') {
    config.accessories = {
      types: [],
      materials: [],
      styles: [],
      colors: []
    }
  }
}

// 暴露配置给父组件
defineExpose({
  getConfig: () => config,
  setConfig: (newConfig: any) => Object.assign(config, newConfig)
})
</script>

<style scoped>
.category-config {
  padding: 0;
}

.config-header {
  margin-bottom: 24px;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:col-span-1 {
    grid-column: span 1 / span 1;
  }
  
  .lg\:col-span-3 {
    grid-column: span 3 / span 3;
  }
  
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.gap-2 {
  gap: 0.5rem;
}

.gap-6 {
  gap: 1.5rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.flex-wrap {
  flex-wrap: wrap;
}
</style>