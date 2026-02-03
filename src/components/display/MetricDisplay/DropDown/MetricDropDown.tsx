import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MetricsType } from "@/types/metricsTyp";

const DROPDOWN_OPTIONS: MetricsType[] = [
  MetricsType.CPU_PERCENT,
  MetricsType.MEMORY_PERCENT,
  MetricsType.MEMORY_USAGE,
  MetricsType.MEMORY_LIMIT,
  MetricsType.BLOCK_READ,
  MetricsType.BLOCK_WRITE,
  MetricsType.NETWORK_INPUT,
  MetricsType.NETWORK_OUTPUT,
];

const MetricDropDown = (props: {
  className?: string;
  metricType: MetricsType;
  setMetricType: (unit: MetricsType) => void;
}) => {
  const { t } = useTranslation();
  const [selectedLabel, setSelectedLabel] = useState<string>(
    t(`metrics.types.${props.metricType}`),
  );

  const handleSelect = (type: MetricsType) => {
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
          {DROPDOWN_OPTIONS.map((type) => (
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
