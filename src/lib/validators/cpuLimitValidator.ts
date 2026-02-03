import * as z from "zod";

export const CPU_LIMIT_MIN_ERROR = "CPU limit must be greater than 0";

export const cpuLimitValidator = z.coerce.number().positive();
