import { useContext, useMemo } from "react";
import type { UserEntityDtoRole as UserRole } from "@/api/generated/model";
import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider";

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

export const useRequireRoles = (allowedRoles: UserRole[]): boolean => {
  const auth = useContext(AuthContext);
  return useMemo(
    () =>
      requireRoles(
        { authorized: auth.authorized, role: auth.role, username: auth.username },
        allowedRoles,
      ),
    [auth.authorized, auth.role, auth.username, allowedRoles],
  );
};
