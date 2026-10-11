import axios from "axios";
import i18n from "i18next";

// Keys of the `apiErrors` translations. The upper-case ones mirror the backend's
// `ErrorCode` enum; NETWORK and TIMEOUT cover requests that never got a response.
const API_ERROR_KEYS = [
  "NETWORK",
  "TIMEOUT",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "PAYLOAD_TOO_LARGE",
  "UPSTREAM_ERROR",
  "INTERNAL_ERROR",
  "VALIDATION_FAILED",
  "INVALID_CREDENTIALS",
  "OLD_PASSWORD_INCORRECT",
  "INSUFFICIENT_PERMISSIONS",
  "USER_NOT_FOUND",
  "USERNAME_TAKEN",
  "INVITE_NOT_FOUND",
  "INVITE_USERNAME_TAKEN",
  "GAME_SERVER_NOT_FOUND",
  "SERVER_ALREADY_STARTING",
  "SERVER_NOT_STOPPED",
  "SERVER_RUNNING",
  "HOST_MOUNT_ADMIN_ONLY",
  "HARDWARE_QUOTA_EXCEEDED",
  "SERVER_RESOURCE_LIMIT_MISSING",
  "HARDWARE_LIMIT_REQUIRED",
  "ACCESS_GROUP_NOT_FOUND",
  "ACCESS_GROUP_NAME_TAKEN",
] as const;

export type ApiErrorKey = (typeof API_ERROR_KEYS)[number];

const isApiErrorKey = (value: unknown): value is ApiErrorKey =>
  typeof value === "string" && (API_ERROR_KEYS as readonly string[]).includes(value);

// Used when the response carries no (known) error code: an older backend, a newer
// code this build has no text for, or a response that never reached the envelope.
function keyFromStatus(status: number): ApiErrorKey | undefined {
  switch (status) {
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 413:
      return "PAYLOAD_TOO_LARGE";
    case 502:
    case 503:
    case 504:
      return "UPSTREAM_ERROR";
    default:
      return status >= 500 ? "INTERNAL_ERROR" : undefined;
  }
}

export function getApiErrorKey(error: unknown): ApiErrorKey | undefined {
  if (!axios.isAxiosError(error)) return undefined;

  if (!error.response) {
    if (axios.isCancel(error)) return undefined;
    return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT" ? "TIMEOUT" : "NETWORK";
  }

  const code = error.response.data?.error_code;
  return isApiErrorKey(code) ? code : keyFromStatus(error.response.status);
}

/**
 * The human-readable reason the backend put into `data` of a failed ApiResponse.
 * Always English. Validation errors arrive as a field -> message map; the first
 * entry is used.
 */
export function getApiErrorMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;

  const data = error.response?.data?.data;
  if (typeof data === "string") return data || undefined;
  if (data && typeof data === "object") {
    const first = Object.values(data)[0];
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
}

/** Translated explanation of why a request failed, if the failure is a known one. */
export function getApiErrorReason(error: unknown): string | undefined {
  const key = getApiErrorKey(error);
  return key ? i18n.t(`apiErrors.${key}`) : undefined;
}

/**
 * For errors shown inline, where there is no details box: `message` followed by the
 * translated reason, or by the backend's own text when the failure has no translation.
 */
export function withApiErrorReason(message: string, error: unknown): string {
  const reason = getApiErrorReason(error) ?? getApiErrorMessage(error);
  return reason ? `${message} ${reason}` : message;
}
