/**
 * Manual API functions for Cosy Instance Settings
 * These will be replaced by generated functions when running `bun gen:api`
 */

import { customInstance } from "./axiosInstance";
import type {
  CosyInstanceSettingsDto,
  McRouterConfigurationDto,
  McRouterConfigurationUpdateDto,
  McRouterStatusDto,
  UserEntityDto,
  UserRestrictionsUpdateDto,
} from "./generated/model";

// Get cosy instance settings
export const getCosyInstanceSettings = () => {
  return customInstance<CosyInstanceSettingsDto>({
    url: "/cosy-settings",
    method: "GET",
  });
};

// Update cosy instance settings
export const updateCosyInstanceSettings = (data: Partial<CosyInstanceSettingsDto>) => {
  return customInstance<CosyInstanceSettingsDto>({
    url: "/cosy-settings",
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    data,
  });
};

// Get MC-Router configuration (public to any authenticated user)
export const getMcRouterConfiguration = () => {
  return customInstance<McRouterConfigurationDto>({
    url: "/cosy-settings/mc-router",
    method: "GET",
  });
};

// Update MC-Router configuration
export const updateMcRouterConfiguration = (
  data: McRouterConfigurationUpdateDto,
  force: boolean = false,
) => {
  return customInstance<McRouterConfigurationDto>({
    url: `/cosy-settings/mc-router?force=${force}`,
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    data,
  });
};

// Get MC-Router status
export const getMcRouterStatus = () => {
  return customInstance<McRouterStatusDto>({
    url: "/cosy-settings/mc-router/status",
    method: "GET",
  });
};

// Start MC-Router
export const startMcRouter = () => {
  return customInstance<McRouterStatusDto>({
    url: "/cosy-settings/mc-router/start",
    method: "POST",
  });
};

// Stop MC-Router
export const stopMcRouter = (force: boolean = false) => {
  return customInstance<McRouterStatusDto>({
    url: `/cosy-settings/mc-router/stop?force=${force}`,
    method: "POST",
  });
};

// Update user restrictions
export const updateUserRestrictions = (uuid: string, data: UserRestrictionsUpdateDto) => {
  return customInstance<UserEntityDto>({
    url: `/user-entity/${uuid}/restrictions`,
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    data,
  });
};
