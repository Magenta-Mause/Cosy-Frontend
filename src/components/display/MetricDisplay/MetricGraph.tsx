import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@components/ui/chart";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import type { GameServerMetricsWithUuid } from "@/stores/slices/gameServerMetrics";
import MetricDropDown from "./DropDown/MetricDropDown";

interface MetricGraphProps {
  className?: string;
  type: string;
  unit: string;
  metrics: GameServerMetricsWithUuid[];
}

const chartConfig = {
  value: {
    label: "Metric",
    color: "blue",
  },
} satisfies ChartConfig;

const MetricGraph = (props: MetricGraphProps) => {
  const { t } = useTranslation();
  const [metricType, setMetricType] = useState<string>(props.type);
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);

  const convertBytes = (byte: number, base: number, sizes: string[]) => {
    if (byte === 0) return "0 Bytes";
    const i = Math.floor(Math.log(byte) / Math.log(base));
    return `${(byte / base ** i).toFixed(2)} ${sizes[i]}`;
  };

  const formateMetric = (value: number) => {
    if (metricType === "cpu_percent" || metricType === "memory_percent") {
      return `${(value).toFixed(2)}%`;
    } else if (metricType === "memory_usage" || metricType === "memory_limit") {
      return convertBytes(value, 1024, ["Bytes", "KiB", "MiB", "GiB", "TiB"]);
    }
    return convertBytes(value, 1000, ["Bytes", "KB", "MB", "GB", "TB"]);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    if (props.unit === "day") {
      return date.toLocaleDateString(t("timerange.localTime"), {
        month: "2-digit",
        day: "2-digit",
      });
    }
    return date.toLocaleTimeString(t("timerange.localTime"), {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatTooltipTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString(t("timerange.localTime"), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!props.metrics?.length) return;

    const flattened = props.metrics
      .map((metric) => {
        const value = metric.metric_values?.[metricType as keyof typeof metric.metric_values] ?? 0;
        return {
          time: metric.time ?? "",
          value,
        };
      })
      .filter((metric) => metric.time !== "");

    setChartData(flattened);
  }, [props.metrics, metricType]);

  return (
    <Card
      className={
        `flex flex-col col-span-3 text-lg py-5 bg-button-secondary-default border-2 ${props.className}`}
    >
      <CardHeader>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>
              {t("metrics.metricTitle", { type: t(`metrics.types.${metricType}`) })}
            </CardTitle>
            <CardDescription>
              {t("metrics.metricDescription", { type: t(`metrics.types.${metricType}`) })}
            </CardDescription>
          </div>
          <MetricDropDown metricType={metricType} setMetricType={setMetricType} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={formatTime}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={formateMetric}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={formatTooltipTime}
                  formatter={(value) => [
                    formateMetric(value as number),
                    ` ${t(`metrics.types.${metricType}`)}`,
                  ]}
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              stroke="#3E8EDE"
              fill="#3E8EDE"
              fillOpacity={0.4}
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MetricGraph;
