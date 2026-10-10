import axios from "axios";

export type ServerStartErrorKind = "quotaExceeded" | "missingResourceLimit" | "generic";

/**
 * The human-readable reason the backend put into `data` of a failed ApiResponse.
 * Validation errors arrive as a field -> message map; the first entry is used.
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

// The backend has no machine-readable error code yet, so the hardware quota
// rejections of `startService` are recognised by their message.
export function getServerStartErrorKind(error: unknown): ServerStartErrorKind {
  const message = getApiErrorMessage(error);
  if (!message?.startsWith("Hardware quota limit reached")) return "generic";
  if (message.includes("limit was reached")) return "quotaExceeded";
  if (message.includes("resource limit configured")) return "missingResourceLimit";
  return "generic";
}
