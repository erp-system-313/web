export interface Role {
  id: number;
  name: string;
  description?: string;
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  module: string;
  action: string;
  description?: string;
}

export interface RoleWithPermissions extends Role {
  permissionIds: number[];
}
