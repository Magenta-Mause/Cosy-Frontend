import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GetMetricsType } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const METRIC_TYPES: GetMetricsType[] = [
  GetMetricsType.CPU_PERCENT,
  GetMetricsType.MEMORY_PERCENT,
  GetMetricsType.MEMORY_USAGE,
  GetMetricsType.MEMORY_LIMIT,
  GetMetricsType.BLOCK_READ,
  GetMetricsType.BLOCK_WRITE,
  GetMetricsType.NETWORK_INPUT,
  GetMetricsType.NETWORK_OUTPUT,
];

const MetricDropDown = (props: {
  className?: string;
  metricType: GetMetricsType;
  setMetricType: (unit: GetMetricsType) => void;
}) => {
  const { t } = useTranslation();
  const [selectedLabel, setSelectedLabel] = useState<string>(
    t(`metrics.types.${props.metricType}`),
  );

  const handleSelect = (type: GetMetricsType) => {
    setSelectedLabel(t(`metrics.types.${type}`));
    props.setMetricType(type);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={`${props.className}`}>
          {selectedLabel}
          <ChevronDown className="-m-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-30 bg-primary-modal-background" align="end">
        <DropdownMenuGroup>
          {METRIC_TYPES.map((type) => (
            <DropdownMenuItem key={type} onSelect={() => handleSelect(type)}>
              {t(`metrics.types.${type}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MetricDropDown;
