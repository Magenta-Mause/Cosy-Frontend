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
      if (unit === "MiB" && num < 6) return false;

      return true;
    },
    { message: MEMORY_LIMIT_MIN_ERROR },
  );
