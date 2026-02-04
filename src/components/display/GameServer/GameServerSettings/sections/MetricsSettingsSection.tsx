import MetricDropDown from "@components/display/DropDown/MetricDropDown";
import SizeDropDown from "@components/display/DropDown/SizeDropDown";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { X } from "lucide-react";
import { useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { MetricsType } from "@/types/metricsTyp";

const METRIC_ORDER = [
  {
    uuid: "1",
    type: MetricsType.CPU_PERCENT,
    size: "col-span-6",
  },
  {
    uuid: "2",
    type: MetricsType.MEMORY_PERCENT,
    size: "col-span-2",
  },
  {
    uuid: "3",
    type: MetricsType.MEMORY_LIMIT,
    size: "col-span-2",
  },
  {
    uuid: "4",
    type: MetricsType.MEMORY_USAGE,
    size: "col-span-2",
  },
  {
    uuid: "5",
    type: MetricsType.NETWORK_INPUT,
    size: "col-span-3",
  },
  {
    uuid: "6",
    type: MetricsType.NETWORK_OUTPUT,
    size: "col-span-3",
  },
];

export default function MetricsSettingsSection() {
  const { t: tSetting } = useTranslationPrefix("components.GameServerSettings");
  const { t: tMetrics } = useTranslationPrefix("metrics");
  const [metrics, setMetrics] = useState(METRIC_ORDER);
  const [edit, setEdit] = useState<boolean | null>(false);

  const handleWidthSelect = (size: number, uuid: string) => {
    if (!edit) return;

    setMetrics((prev) =>
      prev.map((metric) =>
        metric.uuid === uuid ? { ...metric, size: `col-span-${size}` } : metric,
      ),
    );
  };

  const handleOnDelete = (uuid: string) => {
    if (!edit) return;

    setMetrics((prev) => prev.filter((metric) => metric.uuid !== uuid));
  };

  const handleOnAdd = () => {
    const newMetric = {
      uuid: (metrics.length + 1).toString(),
      type: MetricsType.CPU_PERCENT,
      size: "col-span-6",
    };

    setMetrics((prev) => [...prev, newMetric]);
  };

  const handleMetricTypeChange = (type: MetricsType) => {
    if (edit) {
      setMetrics((prev) => prev.map((m) => (edit ? { ...m, type: type as typeof m.type } : m)));
    }
  };

  const handleConfigure = () => {
    setEdit(!edit);
  };

  return (
    <>
      <h2>{tSetting("sections.metrics")}</h2>
      <div className="flex gap-2 mt-2">
        <Button onClick={handleOnAdd}>{tSetting("metrics.add")}</Button>
        <Button onClick={handleConfigure}>{tMetrics("configure")}</Button>
      </div>
      <div className="flex w-full pt-3">
        <Card className="w-full h-[65vh]">
          <CardContent className="grid grid-cols-6 gap-4 overflow-scroll p-6">
            {metrics.map((metric) => (
              <Card
                key={metric.uuid}
                className={`relative border border-primary-border rounded-md 
                w-full h-[16vh] justify-center ${metric.size}`}
              >
                <Button
                  variant={"destructive"}
                  className={`
                  flex justify-center items-center w-6 h-6 rounded-full 
                  absolute top-0 right-0 -mr-3 -mt-2 ${edit ? "opacity-100" : "opacity-0"}`}
                  onClick={() => handleOnDelete(metric.uuid)}
                >
                  <X />
                </Button>
                <div className="flex gap-2 items-center justify-center">
                  <div>
                    <span className="flex items-start text-lg">{tSetting("metrics.type")}</span>
                    <span className="flex items-start text-lg">{tSetting("metrics.width")}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <MetricDropDown
                      className="w-full"
                      disabled={!edit}
                      metricType={metric.type}
                      setMetricType={(type) => handleMetricTypeChange(type)}
                    />
                    <SizeDropDown
                      edit={edit}
                      metric={metric}
                      handleWidthSelect={handleWidthSelect}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
