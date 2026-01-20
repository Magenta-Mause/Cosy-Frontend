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

const MetricDropDown = (props: {
  className?: string;
  metricType: string;
  setMetricType: (unit: string) => void;
}) => {
  const { t } = useTranslation();
  const [selectedLabel, setSelectedLabel] = useState<string>(
    t(`metrics.types.${props.metricType}`),
  );

  const handleSelect = (type: string) => {
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
      <DropdownMenuContent className="w-30 bg-primary-modal-background" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => handleSelect("cpu_percent")}
          >
            {t("metrics.types.cpu_percent")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleSelect("memory_percent")}
          >
            {t("metrics.types.memory_percent")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleSelect("memory_usage")}
          >
            {t("metrics.types.memory_usage")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleSelect("memory_limit")}
          >
            {t("metrics.types.memory_limit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleSelect("block_read")}
          >
            {t("metrics.types.block_read")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleSelect("block_write")}
          >
            {t("metrics.types.block_write")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleSelect("network_input")}
          >
            {t("metrics.types.network_input")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleSelect("network_output")}
          >
            {t("metrics.types.network_output")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MetricDropDown;
