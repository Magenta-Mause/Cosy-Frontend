import { useContext, useMemo } from "react";
import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider";
import { UserEntityDtoRole, type UserEntityDtoRole as UserRole } from "@/api/generated/model";

export interface AuthState {
  authorized: boolean | null;
  role: UserRole | null;
  username: string | null;
}

export const requireAuth = (authState: AuthState): boolean => {
  return authState.authorized === true;
};

export const requireRoles = (authState: AuthState, allowedRoles: UserRole[]): boolean => {
  if (!requireAuth(authState)) return false;
  if (!authState.role) return false;
  return allowedRoles.includes(authState.role);
};

export const canAccessServer = (authState: AuthState, serverOwner: string | undefined): boolean => {
  if (!requireAuth(authState)) return false;

  // OWNER and ADMIN can access all servers
  if (authState.role === UserEntityDtoRole.OWNER || authState.role === UserEntityDtoRole.ADMIN) {
    return true;
  }

  // QUOTA_USER can only access their own servers
  if (authState.role === UserEntityDtoRole.QUOTA_USER) {
    return authState.username === serverOwner;
  }

  return false;
};

export const useRequireRoles = (allowedRoles: UserRole[]): boolean => {
  const auth = useContext(AuthContext);
  return useMemo(
    () => requireRoles({ authorized: auth.authorized, role: auth.role, username: auth.username }, allowedRoles),
    [auth.authorized, auth.role, auth.username, allowedRoles],
  );
};

export const useCanAccessServer = (serverOwner: string | undefined): boolean => {
  const auth = useContext(AuthContext);
  return useMemo(
    () => canAccessServer({ authorized: auth.authorized, role: auth.role, username: auth.username }, serverOwner),
    [auth.authorized, auth.role, auth.username, serverOwner],
  );
};
