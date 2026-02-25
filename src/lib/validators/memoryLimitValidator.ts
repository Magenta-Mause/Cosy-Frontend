import * as z from "zod";

export const MEMORY_LIMIT_MIN_ERROR = "Memory limit must be at least 6 MiB";

export const memoryLimitValidator = z
  .string()
  .min(1)
  .refine(
    (value) => {
      const match = value.match(/^(\d+(?:\.\d+)?)(MiB|GiB)$/);
      if (!match) return false;

      const [, numStr, unit] = match;
      const num = parseFloat(numStr);

      if (Number.isNaN(num)) return false;
      return !(unit === "MiB" && num < 6);
    },
    { message: MEMORY_LIMIT_MIN_ERROR },
  );

/**
 * Extracts the specific error message for memory limit values that are below the minimum threshold.
 * Returns the error message if the value is below 6 MiB, otherwise returns null.
 */
export const getMemoryLimitError = (value: string | null | undefined): string | null => {
  if (!value) return null;

  const match = value.match(/^(\d+(?:\.\d+)?)(MiB|GiB)$/);
  if (match) {
    const [, numStr, unit] = match;
    const num = parseFloat(numStr);
    if (unit === "MiB" && num < 6) {
      return MEMORY_LIMIT_MIN_ERROR;
    }
  }
  return null;
};
