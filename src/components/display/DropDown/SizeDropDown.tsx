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
import { type MetricLayout, MetricLayoutSize } from "@/api/generated/model";

interface SizeDropDownProps {
  metric: MetricLayout;
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
            <DropdownMenuItem key={size} onSelect={() => handleWidthSelect(size, metric.uuid)}>
              {t(`cardWidth.${size}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SizeDropDown;
