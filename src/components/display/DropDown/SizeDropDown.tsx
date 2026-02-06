import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MetricLayoutSize } from "@/api/generated/model";
import type { MetricLayoutUI } from "@/types/metricsTyp";

interface SizeDropDownProps {
  metric: MetricLayoutUI;
  handleWidthSelect: (size: MetricLayoutSize, uuid?: string) => void;
}

const SizeDropDown = (props: SizeDropDownProps) => {
  const { t } = useTranslation();
  const { metric, handleWidthSelect } = props;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full">
          {t(`cardWidth.${metric.size}`)}
          <ChevronDown className="-m-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-5 bg-primary-modal-background" align="end">
        <DropdownMenuGroup>
          {[MetricLayoutSize.SMALL, MetricLayoutSize.MEDIUM, MetricLayoutSize.LARGE].map((size) => (
            <DropdownMenuItem key={size} onSelect={() => handleWidthSelect(size, metric._uiUuid)}>
              {t(`cardWidth.${size}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SizeDropDown;
