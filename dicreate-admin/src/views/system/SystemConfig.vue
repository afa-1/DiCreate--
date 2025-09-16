<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">系统配置</h1>
      <p class="text-gray-600 mt-1">管理系统基础参数和配置信息</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 配置分类 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">配置分类</h3>
          </div>
          <div class="p-0">
            <a-menu
              v-model:selected-keys="selectedCategory"
              mode="vertical"
              :style="{ border: 'none' }"
              @menu-item-click="handleCategoryChange"
            >
              <a-menu-item key="basic">
                <template #icon><icon-settings /></template>
                基础配置
              </a-menu-item>
              <a-menu-item key="email">
                <template #icon><icon-email /></template>
                邮件配置
              </a-menu-item>
              <a-menu-item key="sms">
                <template #icon><icon-phone /></template>
                短信配置
              </a-menu-item>
              <a-menu-item key="storage">
                <template #icon><icon-cloud /></template>
                存储配置
              </a-menu-item>
              <a-menu-item key="payment">
                <template #icon><icon-credit-card /></template>
                支付配置
              </a-menu-item>
              <a-menu-item key="security">
                <template #icon><icon-lock /></template>
                安全配置
              </a-menu-item>
            </a-menu>
          </div>
        </div>
      </div>

      <!-- 配置内容 -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">{{ getCategoryTitle() }}</h3>
            <a-button type="primary" @click="handleSave" :loading="saving">
              <template #icon><icon-save /></template>
              保存配置
            </a-button>
          </div>
          
          <div class="p-6">
            <!-- 基础配置 -->
            <div v-if="selectedCategory[0] === 'basic'">
              <a-form :model="configs.basic" layout="vertical">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="siteName" label="网站名称">
                      <a-input v-model="configs.basic.siteName" placeholder="请输入网站名称" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item field="siteUrl" label="网站地址">
                      <a-input v-model="configs.basic.siteUrl" placeholder="请输入网站地址" />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-form-item field="siteDescription" label="网站描述">
                  <a-textarea
                    v-model="configs.basic.siteDescription"
                    placeholder="请输入网站描述"
                    :rows="3"
                  />
                </a-form-item>
                
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="contactEmail" label="联系邮箱">
                      <a-input v-model="configs.basic.contactEmail" placeholder="请输入联系邮箱" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item field="contactPhone" label="联系电话">
                      <a-input v-model="configs.basic.contactPhone" placeholder="请输入联系电话" />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-form-item field="maintenanceMode" label="维护模式">
                  <a-switch v-model="configs.basic.maintenanceMode" />
                  <span class="ml-2 text-sm text-gray-600">开启后网站将显示维护页面</span>
                </a-form-item>
              </a-form>
            </div>

            <!-- 邮件配置 -->
            <div v-if="selectedCategory[0] === 'email'">
              <a-form :model="configs.email" layout="vertical">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="smtpHost" label="SMTP服务器">
                      <a-input v-model="configs.email.smtpHost" placeholder="请输入SMTP服务器地址" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item field="smtpPort" label="SMTP端口">
                      <a-input-number v-model="configs.email.smtpPort" placeholder="请输入端口号" />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="smtpUsername" label="用户名">
                      <a-input v-model="configs.email.smtpUsername" placeholder="请输入用户名" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item field="smtpPassword" label="密码">
                      <a-input-password v-model="configs.email.smtpPassword" placeholder="请输入密码" />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-form-item field="fromEmail" label="发件人邮箱">
                  <a-input v-model="configs.email.fromEmail" placeholder="请输入发件人邮箱" />
                </a-form-item>
                
                <a-form-item field="fromName" label="发件人名称">
                  <a-input v-model="configs.email.fromName" placeholder="请输入发件人名称" />
                </a-form-item>
                
                <a-form-item field="enableSsl" label="SSL加密">
                  <a-switch v-model="configs.email.enableSsl" />
                  <span class="ml-2 text-sm text-gray-600">启用SSL/TLS加密连接</span>
                </a-form-item>
                
                <a-form-item>
                  <a-button @click="testEmailConfig">
                    <template #icon><icon-send /></template>
                    测试邮件配置
                  </a-button>
                </a-form-item>
              </a-form>
            </div>

            <!-- 短信配置 -->
            <div v-if="selectedCategory[0] === 'sms'">
              <a-form :model="configs.sms" layout="vertical">
                <a-form-item field="provider" label="短信服务商">
                  <a-select v-model="configs.sms.provider" placeholder="请选择短信服务商">
                    <a-option value="aliyun">阿里云短信</a-option>
                    <a-option value="tencent">腾讯云短信</a-option>
                    <a-option value="huawei">华为云短信</a-option>
                  </a-select>
                </a-form-item>
                
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="accessKeyId" label="AccessKey ID">
                      <a-input v-model="configs.sms.accessKeyId" placeholder="请输入AccessKey ID" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item field="accessKeySecret" label="AccessKey Secret">
                      <a-input-password v-model="configs.sms.accessKeySecret" placeholder="请输入AccessKey Secret" />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-form-item field="signName" label="短信签名">
                  <a-input v-model="configs.sms.signName" placeholder="请输入短信签名" />
                </a-form-item>
                
                <a-form-item field="templateCode" label="模板代码">
                  <a-input v-model="configs.sms.templateCode" placeholder="请输入短信模板代码" />
                </a-form-item>
                
                <a-form-item>
                  <a-button @click="testSmsConfig">
                    <template #icon><icon-phone /></template>
                    测试短信配置
                  </a-button>
                </a-form-item>
              </a-form>
            </div>

            <!-- 存储配置 -->
            <div v-if="selectedCategory[0] === 'storage'">
              <a-form :model="configs.storage" layout="vertical">
                <a-form-item field="provider" label="存储服务商">
                  <a-select v-model="configs.storage.provider" placeholder="请选择存储服务商">
                    <a-option value="local">本地存储</a-option>
                    <a-option value="aliyun">阿里云OSS</a-option>
                    <a-option value="tencent">腾讯云COS</a-option>
                    <a-option value="qiniu">七牛云</a-option>
                  </a-select>
                </a-form-item>
                
                <div v-if="configs.storage.provider !== 'local'">
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <a-form-item field="accessKeyId" label="AccessKey ID">
                        <a-input v-model="configs.storage.accessKeyId" placeholder="请输入AccessKey ID" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item field="accessKeySecret" label="AccessKey Secret">
                        <a-input-password v-model="configs.storage.accessKeySecret" placeholder="请输入AccessKey Secret" />
                      </a-form-item>
                    </a-col>
                  </a-row>
                  
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <a-form-item field="bucket" label="存储桶名称">
                        <a-input v-model="configs.storage.bucket" placeholder="请输入存储桶名称" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item field="region" label="地域">
                        <a-input v-model="configs.storage.region" placeholder="请输入地域" />
                      </a-form-item>
                    </a-col>
                  </a-row>
                  
                  <a-form-item field="domain" label="自定义域名">
                    <a-input v-model="configs.storage.domain" placeholder="请输入自定义域名（可选）" />
                  </a-form-item>
                </div>
                
                <a-form-item field="maxFileSize" label="最大文件大小（MB）">
                  <a-input-number v-model="configs.storage.maxFileSize" :min="1" :max="100" />
                </a-form-item>
                
                <a-form-item>
                  <a-button @click="testStorageConfig">
                    <template #icon><icon-cloud /></template>
                    测试存储配置
                  </a-button>
                </a-form-item>
              </a-form>
            </div>

            <!-- 支付配置 -->
            <div v-if="selectedCategory[0] === 'payment'">
              <a-form :model="configs.payment" layout="vertical">
                <a-form-item field="enableAlipay" label="支付宝支付">
                  <a-switch v-model="configs.payment.enableAlipay" />
                  <span class="ml-2 text-sm text-gray-600">启用支付宝支付功能</span>
                </a-form-item>
                
                <div v-if="configs.payment.enableAlipay" class="ml-6 space-y-4">
                  <a-form-item field="alipayAppId" label="应用ID">
                    <a-input v-model="configs.payment.alipayAppId" placeholder="请输入支付宝应用ID" />
                  </a-form-item>
                  
                  <a-form-item field="alipayPrivateKey" label="应用私钥">
                    <a-textarea
                      v-model="configs.payment.alipayPrivateKey"
                      placeholder="请输入应用私钥"
                      :rows="3"
                    />
                  </a-form-item>
                  
                  <a-form-item field="alipayPublicKey" label="支付宝公钥">
                    <a-textarea
                      v-model="configs.payment.alipayPublicKey"
                      placeholder="请输入支付宝公钥"
                      :rows="3"
                    />
                  </a-form-item>
                </div>
                
                <a-form-item field="enableWechat" label="微信支付">
                  <a-switch v-model="configs.payment.enableWechat" />
                  <span class="ml-2 text-sm text-gray-600">启用微信支付功能</span>
                </a-form-item>
                
                <div v-if="configs.payment.enableWechat" class="ml-6 space-y-4">
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <a-form-item field="wechatAppId" label="应用ID">
                        <a-input v-model="configs.payment.wechatAppId" placeholder="请输入微信应用ID" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item field="wechatMchId" label="商户号">
                        <a-input v-model="configs.payment.wechatMchId" placeholder="请输入微信商户号" />
                      </a-form-item>
                    </a-col>
                  </a-row>
                  
                  <a-form-item field="wechatApiKey" label="API密钥">
                    <a-input-password v-model="configs.payment.wechatApiKey" placeholder="请输入API密钥" />
                  </a-form-item>
                </div>
              </a-form>
            </div>

            <!-- 安全配置 -->
            <div v-if="selectedCategory[0] === 'security'">
              <a-form :model="configs.security" layout="vertical">
                <a-form-item field="enableCaptcha" label="验证码">
                  <a-switch v-model="configs.security.enableCaptcha" />
                  <span class="ml-2 text-sm text-gray-600">启用登录验证码</span>
                </a-form-item>
                
                <a-form-item field="maxLoginAttempts" label="最大登录尝试次数">
                  <a-input-number v-model="configs.security.maxLoginAttempts" :min="3" :max="10" />
                </a-form-item>
                
                <a-form-item field="lockoutDuration" label="锁定时长（分钟）">
                  <a-input-number v-model="configs.security.lockoutDuration" :min="5" :max="60" />
                </a-form-item>
                
                <a-form-item field="sessionTimeout" label="会话超时（小时）">
                  <a-input-number v-model="configs.security.sessionTimeout" :min="1" :max="24" />
                </a-form-item>
                
                <a-form-item field="enableTwoFactor" label="双因子认证">
                  <a-switch v-model="configs.security.enableTwoFactor" />
                  <span class="ml-2 text-sm text-gray-600">启用双因子认证</span>
                </a-form-item>
                
                <a-form-item field="passwordPolicy" label="密码策略">
                  <div class="space-y-2">
                    <a-checkbox v-model="configs.security.passwordPolicy.requireUppercase">
                      必须包含大写字母
                    </a-checkbox>
                    <a-checkbox v-model="configs.security.passwordPolicy.requireLowercase">
                      必须包含小写字母
                    </a-checkbox>
                    <a-checkbox v-model="configs.security.passwordPolicy.requireNumbers">
                      必须包含数字
                    </a-checkbox>
                    <a-checkbox v-model="configs.security.passwordPolicy.requireSpecialChars">
                      必须包含特殊字符
                    </a-checkbox>
                  </div>
                </a-form-item>
                
                <a-form-item field="minPasswordLength" label="最小密码长度">
                  <a-input-number v-model="configs.security.minPasswordLength" :min="6" :max="20" />
                </a-form-item>
              </a-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconSettings,
  IconEmail,
  IconPhone,
  IconCloud,
  IconCreditCard,
  IconLock,
  IconSave,
  IconSend
} from '@arco-design/web-vue/es/icon'

const selectedCategory = ref(['basic'])
const saving = ref(false)

// 配置数据
const configs = reactive({
  basic: {
    siteName: 'DiCreate.AI后台管理系统',
    siteUrl: 'https://admin.dicreate.ai',
    siteDescription: 'AI驱动的服装设计与定制平台管理系统',
    contactEmail: 'admin@dicreate.ai',
    contactPhone: '400-123-4567',
    maintenanceMode: false
  },
  email: {
    smtpHost: 'smtp.exmail.qq.com',
    smtpPort: 465,
    smtpUsername: 'noreply@dicreate.ai',
    smtpPassword: '',
    fromEmail: 'noreply@dicreate.ai',
    fromName: 'DiCreate.AI',
    enableSsl: true
  },
  sms: {
    provider: 'aliyun',
    accessKeyId: '',
    accessKeySecret: '',
    signName: 'DiCreate',
    templateCode: 'SMS_123456789'
  },
  storage: {
    provider: 'aliyun',
    accessKeyId: '',
    accessKeySecret: '',
    bucket: 'dicreate-files',
    region: 'oss-cn-hangzhou',
    domain: '',
    maxFileSize: 10
  },
  payment: {
    enableAlipay: true,
    alipayAppId: '',
    alipayPrivateKey: '',
    alipayPublicKey: '',
    enableWechat: true,
    wechatAppId: '',
    wechatMchId: '',
    wechatApiKey: ''
  },
  security: {
    enableCaptcha: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    sessionTimeout: 8,
    enableTwoFactor: false,
    passwordPolicy: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    minPasswordLength: 8
  }
})

const getCategoryTitle = () => {
  const titleMap: Record<string, string> = {
    basic: '基础配置',
    email: '邮件配置',
    sms: '短信配置',
    storage: '存储配置',
    payment: '支付配置',
    security: '安全配置'
  }
  return titleMap[selectedCategory.value[0]] || '配置'
}

const handleCategoryChange = (key: string) => {
  selectedCategory.value = [key]
}

const handleSave = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('配置保存成功')
  } catch (error) {
    Message.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const testEmailConfig = async () => {
  try {
    // 模拟测试邮件配置
    await new Promise(resolve => setTimeout(resolve, 2000))
    Message.success('邮件配置测试成功')
  } catch (error) {
    Message.error('邮件配置测试失败')
  }
}

const testSmsConfig = async () => {
  try {
    // 模拟测试短信配置
    await new Promise(resolve => setTimeout(resolve, 2000))
    Message.success('短信配置测试成功')
  } catch (error) {
    Message.error('短信配置测试失败')
  }
}

const testStorageConfig = async () => {
  try {
    // 模拟测试存储配置
    await new Promise(resolve => setTimeout(resolve, 2000))
    Message.success('存储配置测试成功')
  } catch (error) {
    Message.error('存储配置测试失败')
  }
}
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
</style>