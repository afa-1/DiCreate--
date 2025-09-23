// RBAC权限管理相关类型定义

// 用户类型枚举
export enum UserType {
  PLATFORM = 'platform', // 平台用户（后台管理）
  CHANNEL = 'channel' // 渠道商用户（官网平台）
}

// 平台用户角色（后台管理系统）
export enum PlatformRole {
  SUPER_ADMIN = 'super_admin', // 超级管理员
  ADMIN = 'admin', // 管理员
  OPERATOR = 'operator', // 运营人员
  DESIGNER = 'designer', // 服装设计师
  SALES = 'sales', // 销售人员
  SERVICE = 'service' // 客服专员
}

// 渠道商角色（官网平台）
export enum ChannelRole {
  CHANNEL_ADMIN = 'channel_admin', // 渠道商管理员
  CHANNEL_USER = 'channel_user', // 渠道商普通用户
  CHANNEL_VIEWER = 'channel_viewer' // 渠道商查看者
}

// 权限类型
export enum PermissionType {
  MENU = 'menu', // 菜单权限
  BUTTON = 'button', // 按钮权限
  API = 'api', // 接口权限
  DATA = 'data' // 数据权限
}

// 权限接口
export interface Permission {
  id: string
  code: string // 权限代码，如 user:view, user:edit
  name: string // 权限名称
  type: PermissionType
  module: string // 所属模块
  description?: string
  parentId?: string // 父权限ID
  sort: number // 排序
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// 角色接口
export interface Role {
  id: string
  name: string // 角色名称
  code: string // 角色代码
  type: UserType // 角色类型（平台/渠道商）
  description?: string
  permissions: string[] // 权限ID列表
  userCount: number // 用户数量
  isSystem: boolean // 是否系统角色
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// 扩展的用户接口
export interface RbacUser {
  id: string
  username: string
  email: string
  phone?: string
  realName?: string
  avatar?: string
  type: UserType // 用户类型
  roles: string[] // 角色ID列表
  permissions: string[] // 直接分配的权限ID列表
  status: 'active' | 'inactive' | 'locked'
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  
  // 渠道商用户特有字段
  channelId?: string // 渠道商ID
  channelName?: string // 渠道商名称
  
  // 平台用户特有字段
  department?: string // 部门
  position?: string // 职位
}

// 渠道商接口
export interface Channel {
  id: string
  name: string // 渠道商名称
  code: string // 渠道商代码
  contactPerson: string // 联系人
  contactPhone: string // 联系电话
  contactEmail: string // 联系邮箱
  address?: string // 地址
  businessLicense?: string // 营业执照
  status: 'active' | 'inactive' | 'pending' // 状态：激活/停用/待审核
  userCount: number // 用户数量
  createdAt: string
  updatedAt: string
}

// 权限模块定义
export interface PermissionModule {
  key: string
  name: string
  description?: string
  permissions: Permission[]
}

// 用户权限查询参数
export interface UserPermissionQuery {
  userId: string
  resource?: string // 资源标识
  action?: string // 操作类型
}

// 权限检查结果
export interface PermissionCheckResult {
  hasPermission: boolean
  permissions: string[]
  roles: string[]
}

// 角色权限分配接口
export interface RolePermissionAssignment {
  roleId: string
  permissionIds: string[]
}

// 用户角色分配接口
export interface UserRoleAssignment {
  userId: string
  roleIds: string[]
}