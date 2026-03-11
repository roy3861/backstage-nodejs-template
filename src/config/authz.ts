type AuthzRole = 'admin' | 'editor' | 'viewer';

function parseDefaultRole(value: string | undefined): AuthzRole {
  if (value === 'admin' || value === 'editor' || value === 'viewer') {
    return value;
  }
  return 'viewer';
}

export const authzConfig = {
  defaultRole: parseDefaultRole(process.env.AUTHZ_DEFAULT_ROLE),
  tenantHeader: process.env.AUTHZ_TENANT_HEADER || 'x-tenant-id',
};
