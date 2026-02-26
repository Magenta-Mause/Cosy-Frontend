import type { MetricLayoutSize } from "@/api/generated/model";

export const COL_SPAN_MAP: Record<MetricLayoutSize, string> = {
  SMALL: "col-span-1 lg:col-span-2",
  MEDIUM: "col-span-1 lg:col-span-3",
  LARGE: "col-span-1 lg:col-span-6",
};
