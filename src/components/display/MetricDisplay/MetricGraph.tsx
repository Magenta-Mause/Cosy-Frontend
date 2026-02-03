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
import type { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { MetricValues } from "@/api/generated/model";
import type { GameServerMetricsWithUuid } from "@/stores/slices/gameServerMetrics";
import { MetricsType } from "@/types/metricsTyp";
import MetricDropDown from "./DropDown/MetricDropDown";

interface MetricGraphProps {
  className?: string;
  type: MetricsType;
  timeUnit: string;
  metrics: GameServerMetricsWithUuid[];
  loading?: boolean;
}

const chartConfig = {
  value: {
    label: "Metric",
    color: "blue",
  },
} satisfies ChartConfig;

const METRIC_KEY_MAP: Record<MetricsType, keyof MetricValues> = {
  CPU_PERCENT: "cpu_percent",
  MEMORY_PERCENT: "memory_percent",
  MEMORY_LIMIT: "memory_limit",
  MEMORY_USAGE: "memory_usage",
  BLOCK_READ: "block_read",
  BLOCK_WRITE: "block_write",
  NETWORK_INPUT: "network_input",
  NETWORK_OUTPUT: "network_output",
} as const;

const MetricGraph = (props: MetricGraphProps) => {
  const { t } = useTranslation();
  const [metricType, setMetricType] = useState<MetricsType>(props.type);
  const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);

  const convertBytes = (byte: number, base: number, sizes: string[]) => {
    if (byte === 0) return "0 Bytes";
    const i = Math.floor(Math.log(byte) / Math.log(base));
    return `${(byte / base ** i).toFixed(2)} ${sizes[i]}`;
  };

  const formateMetric = (value: number) => {
    if (metricType === MetricsType.CPU_PERCENT || metricType === MetricsType.MEMORY_PERCENT) {
      return `${(value).toFixed(2)}%`;
    } else if (metricType === MetricsType.MEMORY_USAGE || metricType === MetricsType.MEMORY_LIMIT) {
      return convertBytes(value, 1024, ["Bytes", "KiB", "MiB", "GiB", "TiB"]);
    }
    return convertBytes(value, 1000, ["Bytes", "KB", "MB", "GB", "TB"]);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (props.timeUnit === "day") {
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

  const formatTooltipTime = (_timeString: string, payload: Payload<ValueType, NameType>[]) => {
    if (!payload[0]) return "";
    const value = payload[0].payload as { time: number; value: number };
    const date = new Date(value.time);
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
        const value = metric.metric_values?.[METRIC_KEY_MAP[metricType]] ?? 0;
        const timeString = metric.time ?? "";
        return {
          time: timeString ? new Date(timeString).getTime() : 0,
          value,
        };
      })
      .filter((metric) => metric.time !== 0);

    setChartData(flattened);
  }, [props.metrics, metricType]);

  return (
    <Card
      className={`flex flex-col col-span-3 text-lg py-5 bg-button-secondary-default border-2 ${props.className}`}
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
              type="number"
              domain={["dataMin", "dataMax"]}
              tickCount={10}
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
                  formatter={(value) => {
                    return [formateMetric(value as number), ` ${t(`metrics.types.${metricType}`)}`];
                  }}
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
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MetricGraph;
