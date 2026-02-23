import * as z from "zod";

export const CPU_LIMIT_POSITIVE_ERROR = "CPU limit must be a positive number";

export const cpuLimitValidator = z.coerce.number().positive({
  message: CPU_LIMIT_POSITIVE_ERROR,
});

/**
 * Extracts the specific error message for CPU limit values that are invalid.
 * Returns the error message if the value is not a positive number, otherwise returns undefined.
 */
export const getCpuLimitError = (value: string | number | null | undefined): string | undefined => {
  if (value === null || value === undefined || value === "") return undefined;

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (Number.isNaN(num) || num <= 0) {
    return CPU_LIMIT_POSITIVE_ERROR;
  }

  return undefined;
};
