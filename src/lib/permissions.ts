export type UserRole = 'SUPER_ADMIN' | 'ACCOUNT_ADMIN' | 'BUYER' | 'OPERATION';

export interface RolePermissions {
  // Page Access
  canAccessAdminPanel: boolean
  canAccessAnalytics: boolean
  canAccessAuditLogs: boolean
  canAccessUserManagement: boolean
  canAccessCompanyManagement: boolean
  canAccessProductManagement: boolean
  canAccessOrderManagement: boolean
  canAccessInventoryManagement: boolean
  canAccessSystemSettings: boolean
  canAccessReports: boolean

  // Data Operations
  canCreateProducts: boolean
  canEditProducts: boolean
  canDeleteProducts: boolean
  canCreateUsers: boolean
  canEditUsers: boolean
  canDeleteUsers: boolean
  canCreateOrders: boolean
  canEditOrders: boolean
  canCancelOrders: boolean
  canProcessPayments: boolean
  canManageInventory: boolean
  canViewAllCompanies: boolean
  canCreateCompanies: boolean
  canEditCompanies: boolean
  canDeleteCompanies: boolean
  canViewAnalytics: boolean
  canExportData: boolean
  canManageSettings: boolean
  canViewAuditLogs: boolean

  // Shopping & Orders
  canPlaceOrders: boolean
  canViewOwnOrders: boolean
  canViewAllOrders: boolean
  canAddToCart: boolean
  canCreateBulkOrders: boolean
  canApproveBulkOrders: boolean

  // Notifications
  canSendGlobalNotifications: boolean
  canViewNotifications: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    // Page Access
    canAccessAdminPanel: true,
    canAccessAnalytics: true,
    canAccessAuditLogs: true,
    canAccessUserManagement: true,
    canAccessCompanyManagement: true,
    canAccessProductManagement: true,
    canAccessOrderManagement: true,
    canAccessInventoryManagement: true,
    canAccessSystemSettings: true,
    canAccessReports: true,

    // Data Operations
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canCreateOrders: true,
    canEditOrders: true,
    canCancelOrders: true,
    canProcessPayments: true,
    canManageInventory: true,
    canViewAllCompanies: true,
    canCreateCompanies: true,
    canEditCompanies: true,
    canDeleteCompanies: true,
    canViewAnalytics: true,
    canExportData: true,
    canManageSettings: true,
    canViewAuditLogs: true,

    // Shopping & Orders
    canPlaceOrders: true,
    canViewOwnOrders: true,
    canViewAllOrders: true,
    canAddToCart: true,
    canCreateBulkOrders: true,
    canApproveBulkOrders: true,

    // Notifications
    canSendGlobalNotifications: true,
    canViewNotifications: true,
  },

  ACCOUNT_ADMIN: {
    // Page Access
    canAccessAdminPanel: true,
    canAccessAnalytics: true,
    canAccessAuditLogs: false, // Only Super Admin
    canAccessUserManagement: true, // Only company users
    canAccessCompanyManagement: false, // Only own company
    canAccessProductManagement: true,
    canAccessOrderManagement: true, // Company orders only
    canAccessInventoryManagement: true,
    canAccessSystemSettings: false, // Limited settings only
    canAccessReports: true, // Company reports only

    // Data Operations
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: false, // Can't delete, only deactivate
    canCreateUsers: true, // Only for their company
    canEditUsers: true, // Only company users
    canDeleteUsers: false, // Can't delete, only deactivate
    canCreateOrders: true,
    canEditOrders: true, // Company orders only
    canCancelOrders: true,
    canProcessPayments: true,
    canManageInventory: true,
    canViewAllCompanies: false, // Only own company
    canCreateCompanies: false,
    canEditCompanies: true, // Only own company
    canDeleteCompanies: false,
    canViewAnalytics: true, // Company analytics only
    canExportData: true, // Company data only
    canManageSettings: false, // Limited settings
    canViewAuditLogs: false,

    // Shopping & Orders
    canPlaceOrders: true,
    canViewOwnOrders: true,
    canViewAllOrders: true, // Company orders only
    canAddToCart: true,
    canCreateBulkOrders: true,
    canApproveBulkOrders: true, // Company bulk orders only

    // Notifications
    canSendGlobalNotifications: false, // Company notifications only
    canViewNotifications: true,
  },

  OPERATION: {
    // Page Access
    canAccessAdminPanel: true, // Limited admin panel
    canAccessAnalytics: false,
    canAccessAuditLogs: false,
    canAccessUserManagement: false,
    canAccessCompanyManagement: false,
    canAccessProductManagement: true,
    canAccessOrderManagement: true,
    canAccessInventoryManagement: true,
    canAccessSystemSettings: false,
    canAccessReports: true, // Operational reports only

    // Data Operations
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canCreateOrders: false,
    canEditOrders: true, // Update order status
    canCancelOrders: false,
    canProcessPayments: false,
    canManageInventory: true,
    canViewAllCompanies: false,
    canCreateCompanies: false,
    canEditCompanies: false,
    canDeleteCompanies: false,
    canViewAnalytics: false,
    canExportData: true, // Operational data only
    canManageSettings: false,
    canViewAuditLogs: false,

    // Shopping & Orders
    canPlaceOrders: false,
    canViewOwnOrders: false,
    canViewAllOrders: true, // For processing
    canAddToCart: false,
    canCreateBulkOrders: false,
    canApproveBulkOrders: false,

    // Notifications
    canSendGlobalNotifications: false,
    canViewNotifications: true,
  },

  BUYER: {
    // Page Access
    canAccessAdminPanel: false,
    canAccessAnalytics: false,
    canAccessAuditLogs: false,
    canAccessUserManagement: false,
    canAccessCompanyManagement: false,
    canAccessProductManagement: false,
    canAccessOrderManagement: false, // Only own orders
    canAccessInventoryManagement: false,
    canAccessSystemSettings: false,
    canAccessReports: false,

    // Data Operations
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canCreateOrders: true,
    canEditOrders: false, // Can't edit after placing
    canCancelOrders: true, // Only own orders if pending
    canProcessPayments: false,
    canManageInventory: false,
    canViewAllCompanies: false,
    canCreateCompanies: false,
    canEditCompanies: false,
    canDeleteCompanies: false,
    canViewAnalytics: false,
    canExportData: false,
    canManageSettings: false,
    canViewAuditLogs: false,

    // Shopping & Orders
    canPlaceOrders: true,
    canViewOwnOrders: true,
    canViewAllOrders: false,
    canAddToCart: true,
    canCreateBulkOrders: true,
    canApproveBulkOrders: false,

    // Notifications
    canSendGlobalNotifications: false,
    canViewNotifications: true,
  }
}

export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[userRole][permission]
}

export function getUserPermissions(userRole: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[userRole]
}
export function canAccessPage(userRole: UserRole, page: string): boolean {
  const permissions = getUserPermissions(userRole)

  // Super Admin has access to everything
  if (userRole === 'SUPER_ADMIN') {
    return true
  }

  switch (page) {
    case '/admin':
    case '/admin/dashboard':
      return permissions.canAccessAdminPanel
    case '/admin/analytics':
      return permissions.canAccessAnalytics
    case '/admin/audit':
    case '/admin/system-logs':
      return permissions.canAccessAuditLogs
    case '/admin/users':
      return permissions.canAccessUserManagement
    case '/admin/companies':
      return permissions.canAccessCompanyManagement
    case '/admin/products':
      return permissions.canAccessProductManagement
    case '/admin/orders':
      return permissions.canAccessOrderManagement
    case '/admin/inventory':
      return permissions.canAccessInventoryManagement
    case '/admin/settings':
      return permissions.canAccessSystemSettings
    case '/admin/reports':
      return permissions.canAccessReports

    // Operations pages
    case '/operations':
    case '/operations/dashboard':
    case '/operations/orders':
    case '/operations/inventory':
    case '/operations/products':
    case '/operations/shipping':
    case '/operations/quality':
    case '/operations/reports':
      return userRole === 'OPERATION'

    // Company pages
    case '/company':
    case '/company/dashboard':
    case '/company/users':
    case '/company/analytics':
    case '/company/products':
    case '/company/orders':
    case '/company/reports':
      return userRole === 'ACCOUNT_ADMIN'

    // Shopping pages
    case '/products':
    case '/search':
    case '/cart':
    case '/checkout':
      return true // Public pages (with auth)
    case '/orders':
      return permissions.canViewOwnOrders
    case '/bulk-orders':
      return permissions.canCreateBulkOrders
    case '/wishlist':
      return userRole === 'BUYER' || userRole === 'ACCOUNT_ADMIN'
    case '/shop/dashboard':
      return userRole === 'BUYER'

    default:
      return true // Default allow for unknown pages
  }
}