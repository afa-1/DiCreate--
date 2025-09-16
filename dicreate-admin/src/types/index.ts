// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin', // 超级管理员
  OPERATOR = 'operator', // 运营人员
  DESIGNER = 'designer', // 服装设计师
  SALES = 'sales' // 销售
}

// 用户信息接口
export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
  updatedAt: string
}

// 登录表单接口
export interface LoginForm {
  username: string
  password: string
}

// API响应接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页参数接口
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页响应接口
export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 商品状态枚举
export enum ProductStatus {
  DRAFT = 'draft', // 草稿
  PENDING = 'pending', // 待审核
  APPROVED = 'approved', // 已审核
  ONLINE = 'online', // 已上架
  OFFLINE = 'offline' // 已下架
}

// 商品接口
export interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  status: ProductStatus
  images: string[]
  skus: ProductSku[]
  createdAt: string
  updatedAt: string
}

// 商品SKU接口
export interface ProductSku {
  id: string
  productId: string
  name: string
  price: number
  stock: number
  attributes: Record<string, string>
}

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending', // 待处理
  CONFIRMED = 'confirmed', // 已确认
  PRODUCTION = 'production', // 生产中
  SHIPPED = 'shipped', // 已发货
  DELIVERED = 'delivered', // 已送达
  CANCELLED = 'cancelled' // 已取消
}

// 订单类型枚举
export enum OrderType {
  STANDARD = 'standard', // 标准订单
  CUSTOM = 'custom' // 定制订单
}

// 订单接口
export interface Order {
  id: string
  orderNo: string
  type: OrderType
  status: OrderStatus
  customerId: string
  customerName: string
  items: OrderItem[]
  totalAmount: number
  createdAt: string
  updatedAt: string
}

// 订单项接口
export interface OrderItem {
  id: string
  productId: string
  productName: string
  skuId: string
  quantity: number
  price: number
  amount: number
}

// 菜单项接口
export interface MenuItem {
  key: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
  roles?: UserRole[]
}