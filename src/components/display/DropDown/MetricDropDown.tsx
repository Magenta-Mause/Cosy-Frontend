import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MetricLayoutMetricType } from "@/api/generated/model";
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
  disabled?: boolean;
  metricType?: MetricLayoutMetricType | MetricsType;
  setMetricType: (unit: MetricsType) => void;
}) => {
  const { t } = useTranslation();

  const handleSelect = (type: MetricsType) => {
    props.setMetricType(type);
  };

  return (
    <DropdownMenu open={props.disabled ? false : undefined}>
      <DropdownMenuTrigger asChild>
        <Button className={`${props.className}`} disabled={props.disabled}>
          <span className="truncate max-w-3 md:max-w-10 lg:max-w-50">
            {t(`metrics.types.${props.metricType}`)}
          </span>
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
