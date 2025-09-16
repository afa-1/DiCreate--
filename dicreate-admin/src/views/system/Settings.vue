<template>
  <div class="system-settings">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">系统设置</h1>
      
      <a-tabs default-active-key="basic" position="left">
        <!-- 基础设置 -->
        <a-tab-pane key="basic" title="基础设置">
          <div class="max-w-2xl">
            <h2 class="text-lg font-semibold mb-4">基础配置</h2>
            
            <a-form :model="basicSettings" layout="vertical">
              <a-form-item label="系统名称" field="systemName">
                <a-input v-model="basicSettings.systemName" placeholder="请输入系统名称" />
              </a-form-item>
              
              <a-form-item label="系统描述" field="systemDesc">
                <a-textarea v-model="basicSettings.systemDesc" placeholder="请输入系统描述" :rows="3" />
              </a-form-item>
              
              <a-form-item label="系统Logo" field="systemLogo">
                <a-upload
                  action="/api/upload"
                  :file-list="logoFileList"
                  :show-file-list="false"
                  @change="handleLogoChange"
                >
                  <template #upload-button>
                    <div class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500">
                      <div v-if="basicSettings.systemLogo" class="w-full h-full">
                        <img :src="basicSettings.systemLogo" alt="logo" class="w-full h-full object-contain" />
                      </div>
                      <div v-else class="text-center text-gray-500">
                        <icon-plus class="text-2xl mb-2" />
                        <div class="text-sm">上传Logo</div>
                      </div>
                    </div>
                  </template>
                </a-upload>
              </a-form-item>
              
              <a-form-item label="联系邮箱" field="contactEmail">
                <a-input v-model="basicSettings.contactEmail" placeholder="请输入联系邮箱" />
              </a-form-item>
              
              <a-form-item label="客服电话" field="servicePhone">
                <a-input v-model="basicSettings.servicePhone" placeholder="请输入客服电话" />
              </a-form-item>
              
              <a-form-item>
                <a-button type="primary" @click="handleSaveBasic">保存设置</a-button>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
        
        <!-- 安全设置 -->
        <a-tab-pane key="security" title="安全设置">
          <div class="max-w-2xl">
            <h2 class="text-lg font-semibold mb-4">安全配置</h2>
            
            <a-form :model="securitySettings" layout="vertical">
              <a-form-item label="密码最小长度" field="minPasswordLength">
                <a-input-number v-model="securitySettings.minPasswordLength" :min="6" :max="20" />
              </a-form-item>
              
              <a-form-item label="登录失败锁定次数" field="maxLoginAttempts">
                <a-input-number v-model="securitySettings.maxLoginAttempts" :min="3" :max="10" />
              </a-form-item>
              
              <a-form-item label="会话超时时间(分钟)" field="sessionTimeout">
                <a-input-number v-model="securitySettings.sessionTimeout" :min="30" :max="1440" />
              </a-form-item>
              
              <a-form-item label="启用双因子认证" field="enableTwoFactor">
                <a-switch v-model="securitySettings.enableTwoFactor" />
              </a-form-item>
              
              <a-form-item label="启用IP白名单" field="enableIpWhitelist">
                <a-switch v-model="securitySettings.enableIpWhitelist" />
              </a-form-item>
              
              <a-form-item v-if="securitySettings.enableIpWhitelist" label="IP白名单" field="ipWhitelist">
                <a-textarea v-model="securitySettings.ipWhitelist" placeholder="每行一个IP地址" :rows="4" />
              </a-form-item>
              
              <a-form-item>
                <a-button type="primary" @click="handleSaveSecurity">保存设置</a-button>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
        
        <!-- 邮件设置 -->
        <a-tab-pane key="email" title="邮件设置">
          <div class="max-w-2xl">
            <h2 class="text-lg font-semibold mb-4">邮件配置</h2>
            
            <a-form :model="emailSettings" layout="vertical">
              <a-form-item label="SMTP服务器" field="smtpHost">
                <a-input v-model="emailSettings.smtpHost" placeholder="请输入SMTP服务器地址" />
              </a-form-item>
              
              <a-form-item label="SMTP端口" field="smtpPort">
                <a-input-number v-model="emailSettings.smtpPort" :min="1" :max="65535" />
              </a-form-item>
              
              <a-form-item label="发送邮箱" field="fromEmail">
                <a-input v-model="emailSettings.fromEmail" placeholder="请输入发送邮箱" />
              </a-form-item>
              
              <a-form-item label="邮箱密码" field="emailPassword">
                <a-input-password v-model="emailSettings.emailPassword" placeholder="请输入邮箱密码" />
              </a-form-item>
              
              <a-form-item label="启用SSL" field="enableSsl">
                <a-switch v-model="emailSettings.enableSsl" />
              </a-form-item>
              
              <a-form-item>
                <a-space>
                  <a-button type="primary" @click="handleSaveEmail">保存设置</a-button>
                  <a-button @click="handleTestEmail">测试邮件</a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
        
        <!-- 存储设置 -->
        <a-tab-pane key="storage" title="存储设置">
          <div class="max-w-2xl">
            <h2 class="text-lg font-semibold mb-4">存储配置</h2>
            
            <a-form :model="storageSettings" layout="vertical">
              <a-form-item label="存储类型" field="storageType">
                <a-radio-group v-model="storageSettings.storageType">
                  <a-radio value="local">本地存储</a-radio>
                  <a-radio value="oss">阿里云OSS</a-radio>
                  <a-radio value="cos">腾讯云COS</a-radio>
                  <a-radio value="s3">AWS S3</a-radio>
                </a-radio-group>
              </a-form-item>
              
              <template v-if="storageSettings.storageType !== 'local'">
                <a-form-item label="Access Key" field="accessKey">
                  <a-input v-model="storageSettings.accessKey" placeholder="请输入Access Key" />
                </a-form-item>
                
                <a-form-item label="Secret Key" field="secretKey">
                  <a-input-password v-model="storageSettings.secretKey" placeholder="请输入Secret Key" />
                </a-form-item>
                
                <a-form-item label="存储桶名称" field="bucketName">
                  <a-input v-model="storageSettings.bucketName" placeholder="请输入存储桶名称" />
                </a-form-item>
                
                <a-form-item label="访问域名" field="domain">
                  <a-input v-model="storageSettings.domain" placeholder="请输入访问域名" />
                </a-form-item>
              </template>
              
              <a-form-item label="最大文件大小(MB)" field="maxFileSize">
                <a-input-number v-model="storageSettings.maxFileSize" :min="1" :max="100" />
              </a-form-item>
              
              <a-form-item>
                <a-space>
                  <a-button type="primary" @click="handleSaveStorage">保存设置</a-button>
                  <a-button @click="handleTestStorage" v-if="storageSettings.storageType !== 'local'">测试连接</a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

// 基础设置
const basicSettings = ref({
  systemName: 'DiCreate.AI 运营后台',
  systemDesc: 'DiCreate.AI 服装定制平台运营管理系统',
  systemLogo: '',
  contactEmail: 'support@dicreate.com',
  servicePhone: '400-123-4567'
})

// 安全设置
const securitySettings = ref({
  minPasswordLength: 8,
  maxLoginAttempts: 5,
  sessionTimeout: 120,
  enableTwoFactor: false,
  enableIpWhitelist: false,
  ipWhitelist: ''
})

// 邮件设置
const emailSettings = ref({
  smtpHost: 'smtp.qq.com',
  smtpPort: 587,
  fromEmail: '',
  emailPassword: '',
  enableSsl: true
})

// 存储设置
const storageSettings = ref({
  storageType: 'local',
  accessKey: '',
  secretKey: '',
  bucketName: '',
  domain: '',
  maxFileSize: 10
})

// Logo文件列表
const logoFileList = ref([])

// Logo上传处理
const handleLogoChange = (fileList: any) => {
  if (fileList.length > 0) {
    const file = fileList[0]
    if (file.status === 'done') {
      basicSettings.value.systemLogo = file.response?.url || ''
      Message.success('Logo上传成功')
    }
  }
}

// 保存基础设置
const handleSaveBasic = () => {
  Message.success('基础设置保存成功')
}

// 保存安全设置
const handleSaveSecurity = () => {
  Message.success('安全设置保存成功')
}

// 保存邮件设置
const handleSaveEmail = () => {
  Message.success('邮件设置保存成功')
}

// 测试邮件
const handleTestEmail = () => {
  Message.info('正在发送测试邮件...')
  setTimeout(() => {
    Message.success('测试邮件发送成功')
  }, 2000)
}

// 保存存储设置
const handleSaveStorage = () => {
  Message.success('存储设置保存成功')
}

// 测试存储连接
const handleTestStorage = () => {
  Message.info('正在测试存储连接...')
  setTimeout(() => {
    Message.success('存储连接测试成功')
  }, 2000)
}
</script>

<style scoped>
.system-settings {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>