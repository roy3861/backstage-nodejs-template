import { NextFunction, Request, Response } from 'express';
import { Role } from './types';

type RequestWithUser = Request & {
  user?: {
    id?: string;
    role?: string;
    tenantId?: string;
  };
};

const rolePermissions: Record<Role, Set<string>> = {
  admin: new Set(['*']),
  editor: new Set(['read:any', 'write:any']),
  viewer: new Set(['read:any']),
};

export function canPerform(role: Role, permission: string): boolean {
  const permissions = rolePermissions[role];
  return permissions.has('*') || permissions.has(permission);
}

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    const role = req.user?.role as Role | undefined;
    if (!role || !allowedRoles.includes(role)) {
      res.status(403).json({
        error: { message: 'Forbidden' },
      });
      return;
    }

    next();
  };
}

export function enforcePermission(permission: string) {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    const role = (req.user?.role as Role | undefined) || 'viewer';
    if (!canPerform(role, permission)) {
      res.status(403).json({
        error: { message: 'Forbidden' },
      });
      return;
    }

    next();
  };
}

export function sameTenant(userTenantId: string | undefined, resourceTenantId: string | undefined): boolean {
  if (!resourceTenantId) {
    return true;
  }
  return !!userTenantId && userTenantId === resourceTenantId;
}
