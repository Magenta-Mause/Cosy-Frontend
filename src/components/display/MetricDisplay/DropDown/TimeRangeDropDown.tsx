import DatePicker from "@components/display/DatePicker/DatePicker";
import { format } from "date-fns";
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

interface TimeRangeProps {
  className?: string;
  onChange: (value: { timeUnit: string; startTime: number; endTime?: number }) => void;
}

const TimeRangeDropDown = (props: TimeRangeProps) => {
  const { t } = useTranslation();
  const [selectedLabel, setSelectedLabel] = useState<string>(t("timerange.button"));
  const [openCustom, setOpenCustom] = useState<boolean>(false);

  const timeAgo = (value: number, unit: string): Date => {
    const ms =
      unit === "min"
        ? value * 60 * 1000
        : unit === "hour"
          ? value * 60 * 60 * 1000
          : value * 24 * 60 * 60 * 1000;

    return new Date(Date.now() - ms);
  };

  const handleSelect = (time: number, unit: "min" | "hour" | "day") => {
    setSelectedLabel(t(`timerange.${unit}`, { time: time }));
    props.onChange({ timeUnit: unit, startTime: timeAgo(time, unit) });
  };

  const handleCustomRange = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
    setSelectedLabel(`${format(startDate, "LLL dd, y")} - ${format(endDate, "LLL dd, y")}`);
    console.log(startDate.getTime(), endDate.getTime());
    props.onChange({ timeUnit: "day", startTime: startDate.getTime(), endTime: endDate.getTime() });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={`${props.className}`}>
            {selectedLabel}
            <ChevronDown className="-m-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-30 bg-primary-modal-background" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setOpenCustom(true)}>
              {t("timerange.custom")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSelect(15, "min")}>
              {t("timerange.min", { time: 15 })}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSelect(30, "min")}>
              {t("timerange.min", { time: 30 })}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSelect(1, "hour")}>
              {t("timerange.hour", { time: 1 })}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSelect(6, "hour")}>
              {t("timerange.hour", { time: 6 })}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSelect(12, "hour")}>
              {t("timerange.hour", { time: 12 })}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSelect(1, "day")}>
              {t("timerange.day", { time: 1 })}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSelect(7, "day")}>
              {t("timerange.day", { time: 7 })}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSelect(30, "day")}>
              {t("timerange.day", { time: 30 })}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DatePicker
        open={openCustom}
        onOpenChange={setOpenCustom}
        onRangeChange={handleCustomRange}
      />
    </>
  );
};

export default TimeRangeDropDown;
