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
          <DropdownMenuItem onSelect={() => handleSelect(GetMetricsType.CPU_PERCENT)}>
            {t(`metrics.types.${GetMetricsType.CPU_PERCENT}`)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(GetMetricsType.MEMORY_PERCENT)}>
            {t(`metrics.types.${GetMetricsType.MEMORY_PERCENT}`)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(GetMetricsType.MEMORY_USAGE)}>
            {t(`metrics.types.${GetMetricsType.MEMORY_USAGE}`)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(GetMetricsType.MEMORY_LIMIT)}>
            {t(`metrics.types.${GetMetricsType.MEMORY_LIMIT}`)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(GetMetricsType.BLOCK_READ)}>
            {t(`metrics.types.${GetMetricsType.BLOCK_READ}`)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(GetMetricsType.BLOCK_WRITE)}>
            {t(`metrics.types.${GetMetricsType.BLOCK_WRITE}`)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(GetMetricsType.NETWORK_INPUT)}>
            {t(`metrics.types.${GetMetricsType.NETWORK_INPUT}`)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(GetMetricsType.NETWORK_OUTPUT)}>
            {t(`metrics.types.${GetMetricsType.NETWORK_OUTPUT}`)}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MetricDropDown;
