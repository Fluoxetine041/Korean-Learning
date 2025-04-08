/**
 * server/utils/role.decorator.ts
 * 角色裝飾器，用於標記需要特定角色的路由
 */

// 保存需要特定角色的路由映射
export const roleMap = new Map<string, string[]>()

/**
 * 角色裝飾器函數
 * 用於標記API端點需要的角色
 * @param roles 角色列表，例如 ['admin', 'moderator']
 * @returns 裝飾器函數
 */
export function Roles(...roles: string[]) {
  return function(target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
    // 路由路徑格式化
    const routePath = `/${target.constructor.name}/${propertyKey}`
    
    // 儲存路由和所需角色的對應關係
    roleMap.set(routePath, roles)
    
    // 輸出註冊的角色要求
    console.log(`已為路由 ${routePath} 註冊角色要求:`, roles)
  }
}

/**
 * 檢查用戶是否有某個角色
 * @param userRole 用戶角色
 * @param requiredRoles 需要的角色列表
 * @returns 是否有權限
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  // 如果沒有指定角色要求，允許所有用戶訪問
  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }
  
  // 如果用戶是 admin，有最高權限
  if (userRole === 'admin') {
    return true
  }
  
  // 檢查用戶角色是否在所需角色列表中
  return requiredRoles.includes(userRole)
}

/**
 * 根據請求路徑獲取所需的角色
 * @param path API路徑
 * @returns 所需的角色列表，如果沒有要求則返回空數組
 */
export function getRequiredRolesForPath(path: string): string[] {
  // 尋找與路徑匹配的角色要求
  for (const [routePath, roles] of roleMap.entries()) {
    if (path.includes(routePath)) {
      return roles
    }
  }
  
  // 找不到匹配的角色要求
  return []
} 