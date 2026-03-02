import type { MetricLayoutSize } from "@/api/generated/model";

export const COL_SPAN_MAP: Record<MetricLayoutSize, string> = {
  SMALL: "col-span-1 min-[1300px]:col-span-2",
  MEDIUM: "col-span-1 min-[1300px]:col-span-3",
  LARGE: "col-span-1 min-[1300px]:col-span-6",
};
