export type Role = 'admin' | 'editor' | 'viewer';

export interface AuthenticatedUser {
  id: string;
  role: Role;
  tenantId?: string;
}

export interface AuthorizationContext {
  action: string;
  resource: string;
  resourceTenantId?: string;
}
