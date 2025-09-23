import { UserRole } from '@/types'
import type { MenuItem } from '@/types'

// 菜单配置
export const menuConfig: MenuItem[] = [
  {
    key: 'dashboard',
    title: '工作台',
    icon: 'icon-dashboard',
    path: '/dashboard',
    roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER, UserRole.SALES]
  },
  {
    key: 'product',
    title: '商品管理',
    icon: 'icon-apps',
    roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER],
    children: [
      {
        key: 'product-list',
        title: '商品列表',
        path: '/product/list',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
      },
      {
        key: 'product-create',
        title: '新增商品',
        path: '/product/create',
        roles: [UserRole.ADMIN, UserRole.OPERATOR]
      },
      {
        key: 'product-category',
        title: '商品分类',
        path: '/product/category',
        roles: [UserRole.ADMIN, UserRole.OPERATOR]
      },
      {
        key: 'product-component',
        title: '服装部件',
        path: '/product/component',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
      }
    ]
  },
  {
    key: 'order',
    title: '订单管理',
    icon: 'icon-file-text',
    roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SALES],
    children: [
      {
        key: 'order-list',
        title: '订单列表',
        path: '/order/list',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SALES]
      },
      {
        key: 'order-audit',
        title: '订单审核',
        path: '/order/audit',
        roles: [UserRole.ADMIN, UserRole.OPERATOR]
      },
      {
        key: 'order-custom',
        title: '定制订单',
        path: '/order/custom',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SALES]
      }
    ]
  },
  {
    key: 'user',
    title: '用户管理',
    icon: 'icon-user',
    roles: [UserRole.ADMIN, UserRole.OPERATOR],
    children: [
      {
        key: 'user-channel',
        title: '渠道商管理',
        path: '/user/channel',
        roles: [UserRole.ADMIN, UserRole.OPERATOR]
      },
      {
        key: 'user-platform',
        title: '平台用户',
        path: '/user/platform',
        roles: [UserRole.ADMIN, UserRole.OPERATOR]
      },
      {
        key: 'user-role',
        title: '角色权限',
        path: '/user/role',
        roles: [UserRole.ADMIN, UserRole.OPERATOR]
      }
    ]
  },
  {
    key: 'resource',
    title: '资源库管理',
    icon: 'icon-folder',
    roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER],
    children: [
      {
        key: 'resource-fabric',
        title: '面料库',
        path: '/resource/fabric',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
      },
      {
        key: 'resource-case',
        title: '案例库',
        path: '/resource/case',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
      },
      {
        key: 'resource-model',
        title: '模特库',
        path: '/resource/model',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
      },
      {
        key: 'resource-trend',
        title: '趋势库',
        path: '/resource/trend',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.DESIGNER]
      }
    ]
  },
  {
    key: 'ai-design',
    title: 'AI设计管理',
    icon: 'icon-robot',
    roles: [UserRole.ADMIN, UserRole.DESIGNER],
    children: [
      {
        key: 'ai-template',
        title: '设计模板',
        path: '/ai-design/template',
        roles: [UserRole.ADMIN, UserRole.DESIGNER]
      },
      {
        key: 'ai-scheme',
        title: '方案审核',
        path: '/ai-design/scheme',
        roles: [UserRole.ADMIN, UserRole.DESIGNER]
      },
      {
        key: 'ai-model',
        title: '3D模型管理',
        path: '/ai-design/model',
        roles: [UserRole.ADMIN, UserRole.DESIGNER]
      }
    ]
  },
  {
    key: 'system',
    title: '系统管理',
    icon: 'icon-settings',
    roles: [UserRole.ADMIN, UserRole.OPERATOR],
    children: [
      {
        key: 'system-config',
        title: '系统配置',
        path: '/system/config',
        roles: [UserRole.ADMIN, UserRole.OPERATOR]
      },
      {
        key: 'system-log',
        title: '操作日志',
        path: '/system/log',
        roles: [UserRole.ADMIN, UserRole.OPERATOR]
      }
    ]
  }
]

// 根据用户角色过滤菜单
export const filterMenuByRole = (menus: MenuItem[], userRole: UserRole): MenuItem[] => {
  return menus.filter(menu => {
    // 检查当前菜单项是否包含用户角色
    if (!menu.roles?.includes(userRole)) {
      return false
    }
    
    // 如果有子菜单，递归过滤子菜单
    if (menu.children) {
      menu.children = filterMenuByRole(menu.children, userRole)
      // 如果过滤后子菜单为空，则不显示父菜单
      return menu.children.length > 0
    }
    
    return true
  })
}

// 获取用户可访问的菜单
export const getUserMenus = (userRole: UserRole): MenuItem[] => {
  return filterMenuByRole(JSON.parse(JSON.stringify(menuConfig)), userRole)
}