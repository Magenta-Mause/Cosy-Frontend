import * as z from "zod";

export const cpuLimitValidator = z.coerce.number().positive();
